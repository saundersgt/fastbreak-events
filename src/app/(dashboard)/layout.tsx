// Dashboard layout — Server Component.
//
// Every page inside app/(dashboard)/ automatically gets this layout
// wrapped around it. That includes:
//   /dashboard
//   /dashboard/events/new
//   /dashboard/events/[id]/edit
//
// This is where shared chrome (navbar, background) lives so each
// page.tsx can focus purely on its own content.

import { Navbar } from '@/components/navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {children}
    </div>
  )
}
