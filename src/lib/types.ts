// ============================================================
// FASTBREAK EVENTS — TypeScript Types
// These match the database schema exactly so TypeScript can
// catch mistakes before they reach the database.
// ============================================================

// ---- Profile -----------------------------------------------
// Matches the public.profiles table.
// The id is a UUID that links 1-to-1 with auth.users.
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ---- Event -------------------------------------------------
// Matches the public.events table.
// user_id links back to profiles.id (and auth.users.id).
export interface Event {
  id: string
  user_id: string
  name: string
  sport_type: string
  event_date: string      // ISO 8601 date string, e.g. "2025-08-15T18:00:00Z"
  description: string | null
  created_at: string
  updated_at: string
}

// ---- Venue -------------------------------------------------
// Matches the public.venues table.
// event_id links back to events.id.
export interface Venue {
  id: string
  event_id: string
  name: string
  address: string | null
  capacity: number | null
  created_at: string
  updated_at: string
}

// ============================================================
// DERIVED / COMPOSITE TYPES
// Useful shapes you'll need when querying joined data.
// ============================================================

// An event with its venue already attached (from a join query)
export interface EventWithVenue extends Event {
  venues: Venue | null
}

// An event with all its venues (from a select('*, venues(*)') query)
export interface EventWithVenues extends Event {
  venues: Venue[]
}

// A full profile with all its events (useful for dashboard)
export interface ProfileWithEvents extends Profile {
  events: Event[]
}

// ============================================================
// FORM INPUT TYPES
// Omit auto-generated fields so forms only ask for what
// the user actually needs to fill in.
// ============================================================

export type CreateEventInput = Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export type UpdateEventInput = Partial<CreateEventInput>

export type CreateVenueInput = Omit<Venue, 'id' | 'created_at' | 'updated_at'>

export type UpdateVenueInput = Partial<CreateVenueInput>

export type UpdateProfileInput = Partial<Pick<Profile, 'full_name' | 'avatar_url'>>
