'use client'

// Client Component — handles the Edit and Delete actions on an event card.
// Kept as a separate leaf component so the parent EventCard (and the whole
// dashboard page) can stay a Server Component.

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, Pencil, Trash2 } from 'lucide-react'

import { deleteEvent } from '@/lib/actions/events'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

interface EventCardActionsProps {
  eventId: string
  eventName: string
}

export function EventCardActions({ eventId, eventName }: EventCardActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEvent(eventId)
      if (result.success) {
        toast.success('Event deleted.')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      {/* Edit button */}
      <Button
        variant="ghost"
        size="icon-sm"
        render={<Link href={`/dashboard/events/${eventId}/edit`} />}
        aria-label={`Edit ${eventName}`}
      >
        <Pencil className="size-3.5" />
      </Button>

      {/* Delete button + confirmation dialog */}
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${eventName}`}
              disabled={isPending}
            />
          }
        >
          {isPending
            ? <Loader2 className="size-3.5 animate-spin" />
            : <Trash2 className="size-3.5 text-red-500" />}
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogTitle>Delete &ldquo;{eventName}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the event and all its venues. This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
