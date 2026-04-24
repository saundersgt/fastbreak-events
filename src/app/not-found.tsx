// Custom 404 page.
//
// Shown when:
//   - A URL doesn't match any route
//   - notFound() is called explicitly (e.g. in the edit page
//     when an event doesn't exist or belongs to another user)
//
// This is a Server Component — no 'use client' needed.

import Link from 'next/link'
import { Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Frown className="size-7 text-muted-foreground" />
        </span>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have
            permission to view it.
          </p>
        </div>

        <Button render={<Link href="/dashboard" />}>
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}
