'use client'

// ============================================================
// CLIENT COMPONENT
//
// This file is a Client Component because it needs:
//   - useRouter  — to push new URL params without a full reload
//   - useSearchParams — to read the current URL params
//   - onChange handlers — to react to typing and selecting
//
// The parent page (page.tsx) is a Server Component. It passes
// the current search/sport values down as props so this
// component can pre-fill the inputs on the initial render.
// After that, every change updates the URL, which causes the
// Server Component to re-fetch from the database.
// ============================================================

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'

const SPORT_OPTIONS = [
  'Basketball',
  'Soccer',
  'Baseball',
  'Football',
  'Volleyball',
  'Tennis',
  'Hockey',
  'Swimming',
  'Track & Field',
  'Other',
]

interface FiltersBarProps {
  defaultSearch?: string
  defaultSport?: string
}

export function FiltersBar({ defaultSearch, defaultSport }: FiltersBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // useRef stores the timer ID across renders without causing re-renders itself
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build a new URL preserving existing params, then overwrite one key.
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 when filters change (useful once pagination is added)
      params.delete('page')
      router.push(`/dashboard?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Debounced handler for the search input.
  // Waits 350ms after the user stops typing before pushing the URL update.
  // Each new keystroke clears the previous timer and starts fresh.
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        updateParam('search', value)
      }, 350)
    },
    [updateParam]
  )

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <Input
        type="search"
        placeholder="Search events..."
        defaultValue={defaultSearch}
        onChange={handleSearchChange}
        className="max-w-xs"
      />
      <select
        defaultValue={defaultSport ?? ''}
        onChange={(e) => updateParam('sport', e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 w-44"
      >
        <option value="">All sports</option>
        {SPORT_OPTIONS.map((sport) => (
          <option key={sport} value={sport}>
            {sport}
          </option>
        ))}
      </select>
    </div>
  )
}
