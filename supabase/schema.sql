-- ============================================================
-- FASTBREAK EVENTS — DATABASE SCHEMA
-- Paste this entire file into Supabase SQL Editor and click
-- "Run" to create all tables, relationships, and RLS policies.
-- ============================================================


-- ============================================================
-- 1. PROFILES
-- Mirrors Supabase's built-in auth.users table.
-- Automatically creates a profile when a user signs up
-- via the trigger at the bottom of this file.
-- ============================================================

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by email
CREATE INDEX profiles_email_idx ON public.profiles(email);


-- ============================================================
-- 2. EVENTS
-- Core table. Each event belongs to one user (user_id).
-- ============================================================

CREATE TABLE public.events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  sport_type   TEXT NOT NULL,
  event_date   TIMESTAMPTZ NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index so queries like "all events for this user" are fast
CREATE INDEX events_user_id_idx ON public.events(user_id);
-- Index for sorting/filtering by date
CREATE INDEX events_event_date_idx ON public.events(event_date);


-- ============================================================
-- 3. VENUES
-- Each venue belongs to one event.
-- An event can have one venue (or none).
-- ============================================================

CREATE TABLE public.venues (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  address   TEXT,
  capacity  INTEGER CHECK (capacity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast venue lookups by event
CREATE INDEX venues_event_id_idx ON public.venues(event_id);


-- ============================================================
-- 4. AUTO-UPDATE updated_at TIMESTAMPS
-- This function + triggers keep updated_at current whenever
-- a row is modified — no need to handle it in app code.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 5. AUTO-CREATE PROFILE ON SIGN UP
-- When a new user registers via Supabase Auth, this trigger
-- automatically inserts a row into public.profiles so your
-- app always has a profile to work with.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- RLS is disabled by default — enable it on each table,
-- then define who can do what. Without a matching policy,
-- ALL access is denied.
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues   ENABLE ROW LEVEL SECURITY;


-- ---- PROFILES policies ----

-- Users can read their own profile only
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile only
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ---- EVENTS policies ----

-- Users can read their own events only
CREATE POLICY "events: select own"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create events (user_id is set to their own id)
CREATE POLICY "events: insert own"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own events only
CREATE POLICY "events: update own"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own events only
CREATE POLICY "events: delete own"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);


-- ---- VENUES policies ----
-- Venues don't have a direct user_id, so we check ownership
-- by joining through the parent events table.

-- Users can read venues that belong to their events
CREATE POLICY "venues: select own"
  ON public.venues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = venues.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Users can create venues for their own events
CREATE POLICY "venues: insert own"
  ON public.venues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = venues.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Users can update venues that belong to their events
CREATE POLICY "venues: update own"
  ON public.venues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = venues.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Users can delete venues that belong to their events
CREATE POLICY "venues: delete own"
  ON public.venues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = venues.event_id
      AND events.user_id = auth.uid()
    )
  );
