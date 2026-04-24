'use client'

// Tiny Client Component just for the sign-out button.
// Kept separate from Navbar so the parent can stay a Server Component.

import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

export function NavbarSignOut() {
  const [isPending, setIsPending] = useState(false)

  async function handleSignOut() {
    setIsPending(true)
    await signOut()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleSignOut}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <LogOut className="size-3.5" />
      )}
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  )
}
