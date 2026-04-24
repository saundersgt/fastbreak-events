'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/actions/helpers'

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function signIn(email: string, password: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, data: null, error: error.message }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(email: string, password: string, fullName: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getBaseUrl()}/confirm`,
    },
  })
  if (error) return { success: false, data: null, error: error.message }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle(): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getBaseUrl()}/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  if (error) return { success: false, data: null, error: error.message }
  if (!data.url) return { success: false, data: null, error: 'No redirect URL returned from Google' }
  redirect(data.url)
}

export async function signOut(): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, data: null, error: error.message }
  revalidatePath('/', 'layout')
  redirect('/')
}
