import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================
// PUBLIC ROUTES
// Any route that starts with one of these prefixes is
// accessible without being logged in. Everything else
// is considered protected.
// ============================================================
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/',               // home/landing page
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

// ============================================================
// MIDDLEWARE
// Runs on every request before the page renders.
// Two jobs:
//   1. Refresh the Supabase session (keeps the user logged in)
//   2. Redirect unauthenticated users away from protected routes
// ============================================================
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: always use getUser() here, never getSession().
  // getSession() reads from the cookie and can be spoofed.
  // getUser() validates the token with Supabase's servers.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // If the user is NOT logged in and is trying to reach a
  // protected route — redirect them to the login page.
  if (!user && !isPublicRoute(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    // Preserve where they were trying to go so we can
    // redirect them back after a successful login.
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If the user IS logged in and tries to visit login/signup,
  // redirect them to the dashboard instead.
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     * - _next/static  (JS/CSS bundles)
     * - _next/image   (image optimisation)
     * - static files  (favicon, images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
}
