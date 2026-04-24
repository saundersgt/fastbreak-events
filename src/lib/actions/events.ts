'use server'

import { createClient } from '@/lib/supabase/server'
import { actionWrapper } from '@/lib/actions/helpers'
import type { Event, EventWithVenues } from '@/lib/types'

// ---- getEvents ---------------------------------------------
// Fetches the current user's events from Supabase, including
// their associated venues. Supports optional name search and
// sport type filter passed via URL search params.
export async function getEvents(searchParams: {
  search?: string
  sport?: string
}) {
  return actionWrapper(async (): Promise<EventWithVenues[]> => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Start building the query — always filter by the current user
    // and eager-load all venues for each event in one round-trip.
    let query = supabase
      .from('events')
      .select('*, venues(*)')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })

    // Optional: case-insensitive name search
    if (searchParams.search) {
      query = query.ilike('name', `%${searchParams.search}%`)
    }

    // Optional: exact sport_type filter
    if (searchParams.sport) {
      query = query.eq('sport_type', searchParams.sport)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    return (data ?? []) as EventWithVenues[]
  })
}

// ---- createEvent -------------------------------------------
// Creates an event and its venues in two sequential inserts.
// Venues are linked to the event via event_id.
export async function createEvent(input: {
  name: string
  sport_type: string
  event_date: string
  description?: string
  venues: { name: string; address?: string }[]
}) {
  return actionWrapper(async (): Promise<Event> => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Insert the event record
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        name: input.name,
        sport_type: input.sport_type,
        event_date: input.event_date,
        description: input.description ?? null,
        user_id: user.id,
      })
      .select()
      .single()

    if (eventError) throw new Error(eventError.message)

    // 2. Insert venue records linked to this event (if any were added)
    if (input.venues.length > 0) {
      const { error: venueError } = await supabase
        .from('venues')
        .insert(
          input.venues.map((v) => ({
            event_id: event.id,
            name: v.name,
            address: v.address ?? null,
            capacity: null,
          }))
        )
      if (venueError) throw new Error(venueError.message)
    }

    return event as Event
  })
}

// ---- getEvent ----------------------------------------------
// Fetches a single event with its venues. Throws if the event
// doesn't exist or doesn't belong to the current user —
// the caller should call notFound() on failure.
export async function getEvent(id: string) {
  return actionWrapper(async (): Promise<EventWithVenues> => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('events')
      .select('*, venues(*)')
      .eq('id', id)
      .eq('user_id', user.id)   // ownership check — RLS + explicit filter
      .single()

    if (error || !data) throw new Error('Event not found')

    return data as EventWithVenues
  })
}

// ---- updateEvent -------------------------------------------
// Updates an event's fields and reconciles its venue list:
//   - Venues with an id that still exist → updated in place
//   - Venues without an id (new rows) → inserted
//   - Venues that were removed from the list → deleted by id
// Ownership is verified by the getEvent-style .eq('user_id') filter.
export async function updateEvent(
  id: string,
  input: {
    name: string
    sport_type: string
    event_date: string
    description?: string
    venues: { id?: string; name: string; address?: string }[]
  }
) {
  return actionWrapper(async (): Promise<Event> => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Update the event — the .eq('user_id') is the ownership check
    const { data: event, error: eventError } = await supabase
      .from('events')
      .update({
        name: input.name,
        sport_type: input.sport_type,
        event_date: input.event_date,
        description: input.description ?? null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (eventError || !event) throw new Error(eventError?.message ?? 'Event not found')

    // 2. Reconcile venues
    const incomingIds = input.venues
      .filter((v) => v.id)
      .map((v) => v.id as string)

    // 2a. Delete venues that were removed from the form
    const { error: deleteError } = await supabase
      .from('venues')
      .delete()
      .eq('event_id', id)
      .not('id', 'in', incomingIds.length > 0 ? `(${incomingIds.join(',')})` : '(null)')

    if (deleteError) throw new Error(deleteError.message)

    // 2b. Upsert venues — insert new ones, update existing ones
    if (input.venues.length > 0) {
      const { error: upsertError } = await supabase
        .from('venues')
        .upsert(
          input.venues.map((v) => ({
            ...(v.id ? { id: v.id } : {}),
            event_id: id,
            name: v.name,
            address: v.address ?? null,
            capacity: null,
          })),
          { onConflict: 'id' }
        )
      if (upsertError) throw new Error(upsertError.message)
    }

    return event as Event
  })
}

// ---- deleteEvent -------------------------------------------
// Deletes an event owned by the current user.
// Venues are removed automatically by the ON DELETE CASCADE
// foreign key constraint in the database schema.
export async function deleteEvent(id: string) {
  return actionWrapper(async (): Promise<void> => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // The .eq('user_id') is the ownership check — RLS also enforces this,
    // but being explicit here gives a clear, testable security boundary.
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)
  })
}
