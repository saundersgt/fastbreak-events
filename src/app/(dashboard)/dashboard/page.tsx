// ============================================================
// SERVER COMPONENT vs CLIENT COMPONENT — what this file is
//
// SERVER COMPONENT (this file):
//   - Runs ONLY on the server. Never ships to the browser.
//   - Can be async and await data directly (no useEffect needed).
//   - Has access to server resources: databases, env secrets, fs.
//   - Cannot use React hooks (useState, useEffect, etc.).
//   - Cannot attach browser event listeners (onClick, onChange).
//   - Produces HTML — faster first paint, better SEO.
//   - The DEFAULT for every file in the App Router.
//
// CLIENT COMPONENT (FiltersBar below, marked 'use client'):
//   - Runs in the browser (after hydration).
//   - Can use hooks: useState, useEffect, useRouter, etc.
//   - Can respond to user events: clicks, typing, etc.
//   - Ships JavaScript to the browser — use sparingly.
//   - Marked with the 'use client' directive at the top of the file.
//
// PATTERN: Keep pages as Server Components for data fetching.
// Push interactivity down into small Client Component leaves.
// ============================================================

import Link from 'next/link'
import { CalendarIcon, MapPinIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { getEvents } from '@/lib/actions/events'
import { FiltersBar } from './_components/filters-bar'
import { EventCardActions } from './_components/event-card-actions'
import type { EventWithVenues } from '@/lib/types'

// ---- Helpers -----------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---- EventCard ---------------------------------------------

function EventCard({ event }: { event: EventWithVenues }) {
  const venueCount = event.venues.length
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <Badge variant="secondary" className="w-fit capitalize">
          {event.sport_type}
        </Badge>
        {/* CardAction is auto-positioned to the top-right of the header */}
        <CardAction>
          <EventCardActions eventId={event.id} eventName={event.name} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="size-3.5 shrink-0" />
          {formatDate(event.event_date)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPinIcon className="size-3.5 shrink-0" />
          {venueCount === 0
            ? 'No venues'
            : `${venueCount} venue${venueCount === 1 ? '' : 's'}`}
        </span>
      </CardContent>
    </Card>
  )
}

// ---- EmptyState --------------------------------------------

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-500 text-sm">
          No events match your search. Try adjusting your filters.
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="text-slate-500 text-sm">
        No events yet. Create your first event to get started.
      </p>
      <Button render={<Link href="/dashboard/events/new" />} className="mt-4">
        Create your first event
      </Button>
    </div>
  )
}

// ---- Page --------------------------------------------------
// searchParams is a Promise in Next.js 15+ — must be awaited.

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sport?: string }>
}) {
  // Await searchParams before reading its values (Next.js 15+ requirement)
  const { search, sport } = await searchParams

  // Fetch events server-side — no API route needed, runs in Node.js
  const result = await getEvents({ search, sport })

  const events = result.success ? result.data : []
  const hasFilters = Boolean(search || sport)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section header */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Events</h2>
          <p className="text-muted-foreground mt-1">Manage and track your sports events.</p>
        </div>
        <Button render={<Link href="/dashboard/events/new" />}>
          Create Event
        </Button>
      </div>

      {/* Search + sport filter */}
      <FiltersBar defaultSearch={search} defaultSport={sport} />

      {/* Error state */}
      {!result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-6">
          Failed to load events: {result.error}
        </div>
      )}

      {/* Event grid or empty state */}
      {events.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  )
}
