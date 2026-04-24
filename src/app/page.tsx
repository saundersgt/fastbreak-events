import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Fastbreak Events
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-md">
        The easiest way to organize and manage your sports events.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/signup">Get started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  )
}
