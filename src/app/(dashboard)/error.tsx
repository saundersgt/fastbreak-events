'use client'

// Error boundary for the (dashboard) route group.
//
// Next.js requires error boundaries to be Client Components
// because they use the React error boundary lifecycle.
//
// This file catches any unhandled errors thrown during rendering
// or data fetching inside (dashboard)/ pages. The `reset` function
// re-runs the failed segment, which is often enough to recover
// from transient issues (e.g. a network blip).

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to the browser console so it's visible during development.
    // In production you'd send this to an error tracking service.
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-border bg-card py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </span>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={reset} variant="outline" size="sm">
            <RefreshCw className="size-3.5" />
            Try again
          </Button>
          <Button render={<Link href="/dashboard" />} size="sm">
            Go to dashboard
          </Button>
        </div>
      </div>
    </main>
  )
}
