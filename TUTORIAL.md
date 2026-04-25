# Building the Fastbreak Event Dashboard — A Beginner's Guide

This guide walks you through building a full-stack sports event management app from scratch. By the end you will have a working app deployed to the internet where users can sign up, log in, and create, edit, delete, and search sports events.

No prior experience is assumed. Every step is explained.

---

## What We Are Building

A web app where:
- Users can create an account and log in
- Logged-in users see a dashboard of their sports events
- Users can create, edit, and delete events
- Each event has a name, sport type, date, description, and one or more venues
- Users can search events by name and filter by sport type

---

## The Tools We Use and Why

| Tool | What it is | Why we use it |
|------|-----------|---------------|
| **Next.js** | A framework for building web apps with React | Handles both the frontend (what users see) and backend (server logic) in one project |
| **TypeScript** | JavaScript with types | Catches bugs before they happen by being strict about what kind of data is allowed |
| **Supabase** | A hosted database + authentication service | Gives us a database and user login system without building one from scratch |
| **Tailwind CSS** | A styling library | Lets us style the app using class names directly in our code |
| **shadcn/ui** | A library of pre-built UI components | Gives us buttons, cards, inputs etc. that already look good |
| **Vercel** | A hosting platform | Deploys our app to the internet automatically when we push code to GitHub |
| **GitHub** | Code storage and version control | Stores our code and connects to Vercel for automatic deployments |

---

## Part 1 — Environment Setup

This part gets your computer ready to build the app. You only need to do this once.

### Step 1 — Install VS Code

VS Code is a free code editor. It is what you will use to write all your code.

1. Go to https://code.visualstudio.com
2. Click the download button for your operating system (Mac or Windows)
3. Open the downloaded file and follow the installation steps
4. Open VS Code when done

### Step 2 — Install Node.js

Node.js lets your computer run JavaScript outside of a browser. Next.js requires it.

1. Go to https://nodejs.org
2. Click the **LTS** version download (LTS means "Long Term Support" — the stable version)
3. Open the downloaded file and follow the installation steps
4. Verify it installed correctly:
   - Open VS Code
   - Open the Terminal: go to **View → Terminal** in the menu bar
   - Type this and press Enter:
     ```
     node --version
     ```
   - You should see something like `v20.11.0` — any version number means it worked

### Step 3 — Install Git

Git is a tool that tracks changes to your code and lets you push code to GitHub.

1. Go to https://git-scm.com/downloads
2. Download and install for your operating system
3. Verify it installed:
   ```
   git --version
   ```
   You should see something like `git version 2.43.0`

### Step 4 — Create a GitHub Account

GitHub stores your code online.

1. Go to https://github.com
2. Click **Sign up** and create a free account
3. Verify your email address

### Step 5 — Create a Vercel Account

Vercel hosts your app on the internet.

1. Go to https://vercel.com
2. Click **Sign up**
3. Choose **Continue with GitHub** — this links your Vercel and GitHub accounts together, which is required for automatic deployments

### Step 6 — Create a Supabase Account

Supabase provides your database and user authentication.

1. Go to https://supabase.com
2. Click **Start your project**
3. Sign up with GitHub for convenience

---

## Part 2 — Project Setup

Now we create the actual project on your computer.

### Step 1 — Create the Next.js App

Open your VS Code terminal and run:

```bash
npx create-next-app@latest fastbreak-events
```

You will be asked several questions. Answer them exactly like this:

```
Would you like to use TypeScript? › Yes
Would you like to use ESLint? › Yes
Would you like to use Tailwind CSS? › Yes
Would you like your code inside a `src/` directory? › Yes
Would you like to use App Router? › Yes
Would you like to use Turbopack for next dev? › No
Would you like to customize the import alias? › No
```

This creates a folder called `fastbreak-events` with a starter Next.js project inside it.

### Step 2 — Open the Project in VS Code

```bash
cd fastbreak-events
code .
```

This moves into your project folder and opens it in VS Code.

### Step 3 — Install Dependencies

Dependencies are extra packages of code that our app needs. Run these commands one at a time in the terminal:

```bash
npm install @supabase/supabase-js @supabase/ssr
```
> Supabase's JavaScript library for talking to our database and handling auth.

```bash
npm install react-hook-form @hookform/resolvers zod
```
> react-hook-form manages our forms. zod validates form data. @hookform/resolvers connects the two.

```bash
npm install sonner
```
> Sonner shows toast notifications (the small pop-up messages that say "Event created!" etc.)

```bash
npm install lucide-react
```
> A library of icons we use throughout the app.

```bash
npx shadcn@latest init
```
> Sets up shadcn/ui. When asked, choose **Default** style and **Slate** as the base color.

Then add the specific shadcn components we need:

```bash
npx shadcn@latest add button card input label badge skeleton alert-dialog
```

### Step 4 — Push to GitHub

First, create a new repository on GitHub:
1. Go to https://github.com/new
2. Name it `fastbreak-events`
3. Leave it **Public**
4. Do NOT check "Add a README" — we already have one
5. Click **Create repository**

Then connect your local project to GitHub. GitHub will show you the exact commands — copy and run them. They look like this:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/fastbreak-events.git
git push -u origin main
```

### Step 5 — Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click **Add New → Project**
3. Find your `fastbreak-events` repo and click **Import**
4. Leave all settings as default and click **Deploy**

Vercel will deploy your app. From now on, every time you push code to GitHub, Vercel automatically redeploys.

---

## Part 3 — Supabase Setup

### Step 1 — Create a New Project

1. Go to https://supabase.com/dashboard
2. Click **New project**
3. Give it a name: `fastbreak-events`
4. Choose a strong database password (save it somewhere safe)
5. Choose the region closest to you
6. Click **Create new project** and wait about 2 minutes for it to set up

### Step 2 — Create the Database Tables

Our app needs two tables:
- `events` — stores each sports event
- `venues` — stores the venues for each event (an event can have multiple venues)

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Create the events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  description TEXT
);

-- Create the venues table
-- Each venue belongs to one event via event_id
CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  capacity INTEGER
);
```

**What this means:**
- `UUID` is a unique ID automatically generated for each row
- `REFERENCES auth.users(id)` means every event must belong to a real user
- `ON DELETE CASCADE` means if a user is deleted, their events are deleted too. If an event is deleted, its venues are deleted too.

### Step 3 — Enable Row Level Security (RLS)

RLS means users can only see and edit their own data — not anyone else's. This is critical for security.

Run this SQL:

```sql
-- Enable RLS on both tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Events policies: users can only see/create/edit/delete their own events
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- Venues policies: users can manage venues for their own events
CREATE POLICY "Users can view venues for their events"
  ON venues FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ));

CREATE POLICY "Users can create venues for their events"
  ON venues FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ));

CREATE POLICY "Users can update venues for their events"
  ON venues FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete venues for their events"
  ON venues FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM events WHERE events.id = venues.event_id AND events.user_id = auth.uid()
  ));
```

### Step 4 — Get Your API Keys

1. In Supabase, go to **Project Settings → API**
2. Copy the **Project URL** — it looks like `https://abcdefgh.supabase.co`
3. Copy the **anon public** key — a long string of characters

### Step 5 — Add Environment Variables

Environment variables are secret configuration values that your app needs but that should never be put in your code (because your code is public on GitHub).

**In Vercel:**
1. Go to your project → **Settings → Environment Variables**
2. Add these three:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel production URL (e.g. `https://fastbreak-events.vercel.app`) |

**On your local machine:**
Create a file called `.env.local` in the root of your project (VS Code) and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `.env.local` is already in `.gitignore` so it will never be pushed to GitHub.

### Step 6 — Enable Email Auth

1. In Supabase go to **Authentication → Providers → Email**
2. Make sure **Enable Email provider** is on
3. Turn **OFF** "Confirm email" (this makes testing easier — users can log in immediately after signing up)

---

## Part 4 — Build the App

Now we write the actual code. We will go file by file, explaining what each one does.

### Understanding the Folder Structure

```
src/
  app/                    ← Pages and routes
    (auth)/               ← Auth pages (login, signup)
    (dashboard)/          ← Protected pages (require login)
    layout.tsx            ← Root layout wrapping every page
    page.tsx              ← Home page (redirects to dashboard)
  components/
    ui/                   ← shadcn components
    events/               ← Our custom event components
    navbar.tsx            ← Top navigation bar
  lib/
    actions/              ← Server actions (database calls)
    supabase/             ← Supabase client setup
    types.ts              ← TypeScript type definitions
    utils.ts              ← Utility functions
  middleware.ts           ← Runs on every request (auth guard)
```

> **What is a route group?** The folders `(auth)` and `(dashboard)` have parentheses — this is a Next.js feature called a "route group." The parentheses mean the folder name does NOT appear in the URL. So `(auth)/login/page.tsx` maps to `/login`, not `/auth/login`.

---

### File 1 — `src/lib/utils.ts`

This is a small utility file that comes with shadcn. It combines CSS class names intelligently.

```typescript
import { clsx, type ClassValue } from 'clsx'
import { tailwind-merge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

> **What this does:** `cn('text-red-500', condition && 'font-bold')` safely combines class names, ignoring falsy values and resolving Tailwind conflicts.

---

### File 2 — `src/lib/types.ts`

TypeScript types describe the shape of our data. Think of them as a contract — if a piece of data says it's an `Event`, TypeScript guarantees it has all the right fields.

```typescript
export type Event = {
  id: string
  created_at: string
  user_id: string
  name: string
  sport_type: string
  event_date: string
  description: string | null
}

export type Venue = {
  id: string
  created_at: string
  event_id: string
  name: string
  address: string | null
  capacity: number | null
}

// An event with its venues included
export type EventWithVenues = Event & {
  venues: Venue[]
}
```

---

### File 3 — `src/lib/supabase/server.ts`

This creates a Supabase client for use on the server. The server client can read cookies, which is how it knows which user is logged in.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

> **Why cookies?** When a user logs in, Supabase stores a session token in the browser's cookies. On the server, we read that cookie to know who is making the request.

---

### File 4 — `src/lib/supabase/client.ts`

This creates a Supabase client for use in the browser (client components).

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

### File 5 — `src/lib/actions/helpers.ts`

This is a generic wrapper for all our server actions. Instead of writing try/catch in every action, we write it once here.

Every action returns the same shape:
- **Success:** `{ success: true, data: <result>, error: null }`
- **Failure:** `{ success: false, data: null, error: "what went wrong" }`

```typescript
export type ActionResult<T = void> =
  | { success: true;  data: T;    error: null }
  | { success: false; data: null; error: string }

export async function actionWrapper<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data, error: null }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.'
    console.error('[actionWrapper]', err)
    return { success: false, data: null, error: message }
  }
}
```

> **Why is this useful?** Every component that calls an action always knows how to handle the result — check `result.success`, use `result.data` if true, show `result.error` if false. Consistent and predictable.

---

### File 6 — `src/middleware.ts`

Middleware runs on every single request before the page loads. We use it to:
1. Keep the user's Supabase session fresh
2. Redirect unauthenticated users to the login page
3. Redirect logged-in users away from login/signup

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup', '/callback', '/confirm', '/']

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (!user && !isPublicRoute(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)'],
}
```

---

### File 7 — `src/lib/actions/auth.ts`

Server actions for authentication. These run on the server, never in the browser.

```typescript
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
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) return { success: false, data: null, error: error.message }
  if (!data.url) return { success: false, data: null, error: 'No redirect URL returned' }
  redirect(data.url)
}

export async function signOut(): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, data: null, error: error.message }
  revalidatePath('/', 'layout')
  redirect('/')
}
```

> **What is `'use server'`?** This directive at the top of the file tells Next.js that all functions in this file run on the server only. They can access databases, environment variables, and secrets safely.

> **What is `redirect()`?** After a successful login or signup, we call `redirect('/dashboard')` to send the user to the dashboard. Next.js handles the navigation.

> **What is `revalidatePath()`?** After changing data, we call this to tell Next.js to re-fetch any cached data for that path, so the UI shows fresh data.

---

### File 8 — `src/app/(auth)/callback/route.ts`

This handles the Google OAuth callback. After Google authenticates the user, it redirects them back to this URL with a code. We exchange that code for a session.

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

---

### File 9 — `src/app/(auth)/confirm/route.ts`

Handles email confirmation links. When Supabase sends a confirmation email, the link points here.

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_confirmation_params`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
```

---

### File 10 — `src/app/(auth)/signup/page.tsx`

The signup page. This is a client component because it uses form state and event handlers.

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { signUp, signInWithGoogle } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(values: SignupFormValues) {
    setIsEmailLoading(true)
    const result = await signUp(values.email, values.password, values.full_name)
    if (result?.error) {
      toast.error(result.error)
      setIsEmailLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    const result = await signInWithGoogle()
    if (result?.error) {
      toast.error(result.error)
      setIsGoogleLoading(false)
    }
  }

  const isLoading = isEmailLoading || isGoogleLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Start managing your sports events today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={handleGoogleSignIn}>
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue with Google
          </Button>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" placeholder="Your name" disabled={isLoading} {...register('full_name')} />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" disabled={isLoading} {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" disabled={isLoading} {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input id="confirm_password" type="password" disabled={isLoading} {...register('confirm_password')} />
              {errors.confirm_password && <p className="text-sm text-red-500">{errors.confirm_password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isEmailLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</> : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

---

### File 11 — `src/app/(auth)/login/page.tsx`

The login page — same pattern as signup but simpler.

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { signIn, signInWithGoogle } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setIsEmailLoading(true)
    const result = await signIn(values.email, values.password)
    if (result?.error) {
      toast.error(result.error)
      setIsEmailLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    const result = await signInWithGoogle()
    if (result?.error) {
      toast.error(result.error)
      setIsGoogleLoading(false)
    }
  }

  const isLoading = isEmailLoading || isGoogleLoading

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your Fastbreak Events account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={handleGoogleSignIn}>
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue with Google
          </Button>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" disabled={isLoading} {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" disabled={isLoading} {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isEmailLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium underline">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

---

### File 12 — `src/lib/actions/events.ts`

All database operations for events. These are server actions — they run on the server and access the database directly.

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { actionWrapper } from '@/lib/actions/helpers'
import type { Event, EventWithVenues } from '@/lib/types'

// Fetch all events for the logged-in user
export async function getEvents(searchParams: { search?: string; sport?: string }) {
  return actionWrapper(async (): Promise<EventWithVenues[]> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let query = supabase
      .from('events')
      .select('*, venues(*)')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })

    if (searchParams.search) {
      query = query.ilike('name', `%${searchParams.search}%`)
    }
    if (searchParams.sport) {
      query = query.eq('sport_type', searchParams.sport)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []) as EventWithVenues[]
  })
}

// Create a new event with venues
export async function createEvent(input: {
  name: string
  sport_type: string
  event_date: string
  description?: string
  venues: { name: string; address?: string }[]
}) {
  return actionWrapper(async (): Promise<Event> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        name: input.name,
        sport_type: input.sport_type,
        event_date: input.event_date,
        description: input.description ?? null,
        user_id: user.id,
      })
      .select()
      .single()

    if (eventError) throw new Error(eventError.message)

    if (input.venues.length > 0) {
      const { error: venueError } = await supabase
        .from('venues')
        .insert(input.venues.map((v) => ({
          event_id: event.id,
          name: v.name,
          address: v.address ?? null,
          capacity: null,
        })))
      if (venueError) throw new Error(venueError.message)
    }

    return event as Event
  })
}

// Fetch a single event by ID
export async function getEvent(id: string) {
  return actionWrapper(async (): Promise<EventWithVenues> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('events')
      .select('*, venues(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) throw new Error('Event not found')
    return data as EventWithVenues
  })
}

// Update an existing event and reconcile its venues
export async function updateEvent(id: string, input: {
  name: string
  sport_type: string
  event_date: string
  description?: string
  venues: { id?: string; name: string; address?: string }[]
}) {
  return actionWrapper(async (): Promise<Event> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: event, error: eventError } = await supabase
      .from('events')
      .update({
        name: input.name,
        sport_type: input.sport_type,
        event_date: input.event_date,
        description: input.description ?? null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (eventError || !event) throw new Error(eventError?.message ?? 'Event not found')

    const incomingIds = input.venues.filter((v) => v.id).map((v) => v.id as string)

    await supabase
      .from('venues')
      .delete()
      .eq('event_id', id)
      .not('id', 'in', incomingIds.length > 0 ? `(${incomingIds.join(',')})` : '(null)')

    if (input.venues.length > 0) {
      await supabase.from('venues').upsert(
        input.venues.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          event_id: id,
          name: v.name,
          address: v.address ?? null,
          capacity: null,
        })),
        { onConflict: 'id' }
      )
    }

    return event as Event
  })
}

// Delete an event (venues are deleted automatically by ON DELETE CASCADE)
export async function deleteEvent(id: string) {
  return actionWrapper(async (): Promise<void> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)
  })
}
```

---

### File 13 — `src/app/(dashboard)/dashboard/page.tsx`

The main dashboard page. This is a **server component** — it fetches data directly on the server before sending HTML to the browser.

```typescript
import Link from 'next/link'
import { CalendarIcon, MapPinIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getEvents } from '@/lib/actions/events'
import { FiltersBar } from './_components/filters-bar'
import { EventCardActions } from './_components/event-card-actions'
import type { EventWithVenues } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function EventCard({ event }: { event: EventWithVenues }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <Badge variant="secondary" className="w-fit capitalize">{event.sport_type}</Badge>
        <EventCardActions eventId={event.id} eventName={event.name} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="size-3.5" />
          {formatDate(event.event_date)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPinIcon className="size-3.5" />
          {event.venues.length === 0 ? 'No venues' : `${event.venues.length} venue${event.venues.length === 1 ? '' : 's'}`}
        </span>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sport?: string }>
}) {
  const { search, sport } = await searchParams
  const result = await getEvents({ search, sport })
  const events = result.success ? result.data : []

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Events</h2>
          <p className="text-muted-foreground mt-1">Manage and track your sports events.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">Create Event</Link>
        </Button>
      </div>

      <FiltersBar defaultSearch={search} defaultSport={sport} />

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">No events yet. Create your first event to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  )
}
```

> **Server vs Client components:** This page is a server component (no `'use client'` at the top). It can `await` data directly. The `FiltersBar` and `EventCardActions` inside it are client components because they need interactivity (typing in a search box, clicking buttons).

---

## Part 5 — Deploy and Test

### Step 1 — Commit and Push Your Code

Every time you finish a piece of work, save it to GitHub:

```bash
git add .
git commit -m "Describe what you built"
git push
```

Vercel automatically picks up the push and deploys within a minute or two.

### Step 2 — Check the Deployment

1. Go to https://vercel.com/dashboard
2. Click your project
3. Watch the deployment — a green checkmark means it succeeded
4. If it fails, click on the deployment to see the error logs

### Step 3 — Test the App

Work through this checklist on your deployed URL:

- [ ] Sign up with a new email address
- [ ] Log in with that email and password
- [ ] Create an event with at least one venue
- [ ] Edit that event
- [ ] Create a second event with a different sport type
- [ ] Search for events by name
- [ ] Filter events by sport type
- [ ] Delete an event
- [ ] Log out
- [ ] Confirm you are redirected to the login page

---

## Common Problems and Fixes

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| "Invalid login credentials" | Email not confirmed, or wrong password | Check Supabase → Auth → Users. Turn off email confirmation for testing. |
| "Email rate limit exceeded" | Too many signup attempts | Wait 1 hour, or use Google sign-in instead |
| Page not found on a route | File is in the wrong folder | Check that the file path matches the URL you expect |
| Events not showing on dashboard | RLS policy blocking access | Make sure events were created while logged in as that user |
| Build fails on Vercel | TypeScript error in your code | Read the error in Vercel logs, fix the specific line it points to |

---

## Key Concepts Summary

| Concept | What it means |
|---------|--------------|
| **Server Component** | A React component that runs on the server. Can fetch data directly. Cannot use hooks or event listeners. |
| **Client Component** | A React component that runs in the browser. Can use `useState`, `useEffect`, and event handlers. Must have `'use client'` at the top. |
| **Server Action** | A function marked `'use server'` that runs on the server. Called from client components. Used for database writes. |
| **RLS** | Row Level Security. Database rules that ensure users can only access their own data. |
| **Middleware** | Code that runs before every page load. Used here to check if the user is logged in. |
| **Environment Variables** | Secret configuration values stored outside your code. Never commit these to GitHub. |
