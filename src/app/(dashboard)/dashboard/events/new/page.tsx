'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EventForm } from '@/components/events/event-form'

export default function CreateEventPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>
      <EventForm mode="create" />
    </main>
  )
}
