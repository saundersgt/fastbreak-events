import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// ============================================================
// EMAIL CONFIRMATION ROUTE
//
// Supabase sends users a confirmation email when they sign up
// (if email confirmation is enabled in your Supabase project).
// The link in that email looks like:
//
//   https://yourapp.com/confirm?token_hash=abc123&type=signup
//
// This route handler receives that request, verifies the
// token with Supabase, and either:
//   - Redirects to /dashboard on success
//   - Redirects to /login?error=... on failure
//
// It also handles other OTP-based email flows:
//   - type=email_change  → user confirmed a new email address
//   - type=recovery      → user clicked a password reset link
//   - type=invite        → user accepted a team invite
// ============================================================

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Both token_hash and type are required — if either is
  // missing the link is malformed or tampered with.
  if (!token_hash || !type) {
    return NextResponse.redirect(
      `${origin}/login?error=missing_confirmation_params`
    )
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (error) {
    console.error('[confirm] OTP verification failed:', error.message)

    // Common reasons this fails:
    //   - Link was already used (one-time use only)
    //   - Link expired (default: 24 hours)
    //   - Token was tampered with
    return NextResponse.redirect(
      `${origin}/login?error=confirmation_failed`
    )
  }

  // Verification succeeded — send the user where they need to go.
  // For signup confirmations this is /dashboard.
  // For password resets we'd pass next=/reset-password.
  return NextResponse.redirect(`${origin}${next}`)
}
