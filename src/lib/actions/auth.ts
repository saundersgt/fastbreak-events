'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { actionWrapper } from '@/lib/actions/helpers'

// The URL to send the user to after Google OAuth completes.
// In development this is localhost; in production it will be
// your Vercel domain (set via NEXT_PUBLIC_SITE_URL env var).
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

// ---- signIn ------------------------------------------------
// Signs in with email + password.
// Returns ActionResult<void> — no data needed on success,
// the redirect handles navigation.
export async function signIn(email: string, password: string) {
  return actionWrapper(async () => {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(error.message)

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  })
}

// ---- signUp ------------------------------------------------
// Creates a new account with email, password, and full name.
export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  return actionWrapper(async () => {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${getBaseUrl()}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  })
}

// ---- signInWithGoogle --------------------------------------
// Kicks off the Google OAuth flow.
// Supabase returns a URL — we redirect the user there.
// Google authenticates them, then redirects back to
// /auth/callback, which exchanges the code for a session.
export async function signInWithGoogle() {
  return actionWrapper(async () => {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getBaseUrl()}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw new Error(error.message)
    if (!data.url) throw new Error('No redirect URL returned from Google')

    // Redirect the browser to Google's login page
    redirect(data.url)
  })
}

// ---- signOut -----------------------------------------------
// Signs out and sends the user back to the home page.
export async function signOut() {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    revalidatePath('/', 'layout')
    redirect('/')
  })
}
