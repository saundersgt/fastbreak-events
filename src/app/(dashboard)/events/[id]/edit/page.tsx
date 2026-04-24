// SERVER COMPONENT — fetches existing event data before rendering the form.
//
// Why Server Component here?
//   - We need to load the event from the database before showing anything.
//   - Server Components can await data directly — no useEffect, no loading state.
//   - The event data is passed as props into EventForm (a Client Component).
//
// Security:
//   - getEvent() filters by both event id AND user_id, so one user can never
//     load or edit another user's event — even if they guess the URL.
//   - If the event doesn't exist or belongs to someone else, notFound() is
//     called which renders a 404 page.

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getEvent } from '@/lib/actions/events'
import { EventForm } from '@/components/events/event-form'

// Next.js 15+: params is a Promise — must be awaited before accessing values.
export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const result = await getEvent(id)

  // If the event doesn't exist or belongs to a different user, show 404.
  if (!result.success) {
    notFound()
  }

  const event = result.data

  // Convert the ISO date string from Supabase (e.g. "2025-08-15T18:00:00+00:00")
  // to the "YYYY-MM-DDTHH:mm" format that <input type="datetime-local"> expects.
  const localDatetime = event.event_date
    ? new Date(event.event_date).toISOString().slice(0, 16)
    : ''

  // Shape the fetched data into the form's default values.
  // Venues include their database `id` so updateEvent can tell
  // which ones already exist vs. which are newly added.
  const defaultValues = {
    name:        event.name,
    sport_type:  event.sport_type,
    event_date:  localDatetime,
    description: event.description ?? '',
    venues: event.venues.map((v) => ({
      id:      v.id,
      name:    v.name,
      address: v.address ?? '',
    })),
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>
      <EventForm
        mode="edit"
        eventId={event.id}
        defaultValues={defaultValues}
      />
    </main>
  )
}
