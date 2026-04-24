// Navbar — Server Component.
//
// Fetching the user here (on the server) means no loading flash:
// the navbar renders with the email already filled in before
// any HTML reaches the browser.
//
// The sign-out button is extracted into a tiny Client Component
// because it needs an onClick / form action — Server Components
// can't attach event handlers.

import Link from 'next/link'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NavbarSignOut } from './navbar-sign-out'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* Logo / app name */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          <span className="hidden sm:inline">Fastbreak Events</span>
        </Link>

        {/* Right side: user email + sign out */}
        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-48">
              {user.email}
            </span>
          )}
          <NavbarSignOut />
        </div>

      </div>
    </header>
  )
}
