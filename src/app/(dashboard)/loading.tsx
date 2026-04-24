// Layout-level loading skeleton for the (dashboard) route group.
//
// Next.js shows this file automatically (via Suspense) while any
// page inside (dashboard)/ is fetching — including /dashboard,
// /dashboard/events/new, and /dashboard/events/[id]/edit.
//
// It renders the navbar shell + a content placeholder so the page
// doesn't feel blank during navigation.

import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLayoutLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Filters row */}
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-36" />
      </div>

      {/* Card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl ring-1 ring-foreground/10 bg-card p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
