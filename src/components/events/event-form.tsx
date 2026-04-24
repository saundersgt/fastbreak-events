'use client'

// Shared form for both Create Event and Edit Event pages.
// The `mode` prop controls:
//   - 'create': empty defaults, calls createEvent, shows "Create Event" button
//   - 'edit':   pre-filled defaults, calls updateEvent, shows "Save Changes" button
//
// Venues in edit mode carry an optional `id` field so updateEvent
// knows which rows already exist in the database versus new ones.

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { createEvent, updateEvent } from '@/lib/actions/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ---- Constants ---------------------------------------------

export const SPORT_OPTIONS = [
  'Soccer',
  'Basketball',
  'Tennis',
  'Football',
  'Baseball',
  'Hockey',
  'Other',
]

// Matches the Input component's visual appearance for native elements
export const nativeFieldClass =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50'

// ---- Zod schema --------------------------------------------
// Venues carry an optional `id` — present when editing an
// existing venue row, absent for newly added venues.

export const venueSchema = z.object({
  id:      z.string().optional(),
  name:    z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
})

export const eventFormSchema = z.object({
  name:        z.string().min(1, 'Event name is required'),
  sport_type:  z.string().min(1, 'Please select a sport'),
  event_date:  z.string().min(1, 'Date & time is required'),
  description: z.string().optional(),
  venues:      z.array(venueSchema),
})

export type EventFormValues = z.infer<typeof eventFormSchema>

// ---- Props -------------------------------------------------

type CreateMode = {
  mode: 'create'
}

type EditMode = {
  mode: 'edit'
  eventId: string
  defaultValues: EventFormValues
}

type EventFormProps = CreateMode | EditMode

// ---- Component ---------------------------------------------

export function EventForm(props: EventFormProps) {
  const router = useRouter()
  // useTransition gives us isPending automatically — no manual setState needed.
  // React marks the router.push navigation as a transition so the UI stays
  // interactive (the form doesn't freeze) while the server action runs.
  const [isPending, startTransition] = useTransition()

  const isEdit = props.mode === 'edit'

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: isEdit
      ? props.defaultValues
      : {
          name:        '',
          sport_type:  '',
          event_date:  '',
          description: '',
          venues:      [],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'venues',
  })

  function onSubmit(values: EventFormValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateEvent(props.eventId, values)
        : await createEvent(values)

      if (result.success) {
        toast.success(isEdit ? 'Event updated!' : 'Event created!')
        router.push('/dashboard')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      {/* ---- Event details ---- */}
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Event' : 'Create Event'}</CardTitle>
          <CardDescription>
            {isEdit
              ? 'Update the details for this event.'
              : 'Fill in the details for your new sports event.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">

          {/* Event Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              placeholder="e.g. Summer Basketball League"
              disabled={isPending}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Sport Type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sport_type">Sport</Label>
            <select
              id="sport_type"
              disabled={isPending}
              className={cn(nativeFieldClass, 'bg-background')}
              {...register('sport_type')}
            >
              <option value="">Select a sport…</option>
              {SPORT_OPTIONS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            {errors.sport_type && (
              <p className="text-sm text-red-500">{errors.sport_type.message}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event_date">Date & Time</Label>
            <input
              id="event_date"
              type="datetime-local"
              disabled={isPending}
              className={cn(nativeFieldClass, 'bg-background')}
              {...register('event_date')}
            />
            {errors.event_date && (
              <p className="text-sm text-red-500">{errors.event_date.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">
              Description{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <textarea
              id="description"
              placeholder="Any additional details about the event…"
              rows={3}
              disabled={isPending}
              className={cn(nativeFieldClass, 'h-auto resize-y bg-background')}
              {...register('description')}
            />
          </div>

        </CardContent>
      </Card>

      {/* ---- Venues ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Venues</CardTitle>
          <CardDescription>
            Add one or more venues where the event will take place.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No venues added yet. Click &ldquo;Add Venue&rdquo; below.
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Venue {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => remove(index)}
                  aria-label={`Remove venue ${index + 1}`}
                >
                  <Trash2 className="size-4 text-red-500" />
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`venues.${index}.name`}>Venue Name</Label>
                <Input
                  id={`venues.${index}.name`}
                  placeholder="e.g. Community Sports Center"
                  disabled={isPending}
                  {...register(`venues.${index}.name`)}
                />
                {errors.venues?.[index]?.name && (
                  <p className="text-sm text-red-500">
                    {errors.venues[index].name?.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`venues.${index}.address`}>
                  Address{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id={`venues.${index}.address`}
                  placeholder="e.g. 123 Main St, Springfield"
                  disabled={isPending}
                  {...register(`venues.${index}.address`)}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => append({ name: '', address: '' })}
            className="w-fit"
          >
            <Plus className="size-4" />
            Add Venue
          </Button>

        </CardContent>
      </Card>

      {/* ---- Submit ---- */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          render={<Link href="/dashboard" />}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {isEdit ? 'Saving…' : 'Creating…'}
            </>
          ) : (
            isEdit ? 'Save Changes' : 'Create Event'
          )}
        </Button>
      </div>

    </form>
  )
}
