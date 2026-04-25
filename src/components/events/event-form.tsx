'use client'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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

const nativeFieldClass =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50'

// ---- Zod schema --------------------------------------------

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

type CreateMode = { mode: 'create' }
type EditMode = {
  mode: 'edit'
  eventId: string
  defaultValues: EventFormValues
}
type EventFormProps = CreateMode | EditMode

// ---- Component ---------------------------------------------

export function EventForm(props: EventFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = props.mode === 'edit'

  const form = useForm<EventFormValues>({
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
    control: form.control,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* ---- Event details ---- */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">{isEdit ? 'Edit Event' : 'Create Event'}</CardTitle>
            <CardDescription className="text-white/40">
              {isEdit
                ? 'Update the details for this event.'
                : 'Fill in the details for your new sports event.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">

            {/* Event Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Summer Basketball League"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sport Type */}
            <FormField
              control={form.control}
              name="sport_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport</FormLabel>
                  <FormControl>
                    <select
                      disabled={isPending}
                      className={cn(nativeFieldClass, 'bg-background')}
                      {...field}
                    >
                      <option value="">Select a sport…</option>
                      {SPORT_OPTIONS.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time */}
            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <input
                      type="datetime-local"
                      disabled={isPending}
                      className={cn(nativeFieldClass, 'bg-background')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{' '}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Any additional details about the event…"
                      rows={3}
                      disabled={isPending}
                      className={cn(nativeFieldClass, 'h-auto resize-y bg-background')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
        </Card>

        {/* ---- Venues ---- */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Venues</CardTitle>
            <CardDescription className="text-white/40">
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
                className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/60">
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

                <FormField
                  control={form.control}
                  name={`venues.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Community Sports Center"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`venues.${index}.address`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address{' '}
                        <span className="text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 123 Main St, Springfield"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
    </Form>
  )
}
