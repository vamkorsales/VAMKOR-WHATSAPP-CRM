-- ====================================================================
-- VAMKOR CRM: Supabase RLS Policy Fixes & Security Matrix
-- Run this in your Supabase SQL Editor (https://supabase.com dashboard)
-- ====================================================================

-- 1. Create a SECURITY DEFINER helper function to fetch agency_id.
-- This function runs with owner privileges, bypassing RLS. This is the 
-- official recommended pattern to prevent "infinite recursion" in policies.
CREATE OR REPLACE FUNCTION public.get_user_agency(user_id UUID)
RETURNS UUID AS $$
  SELECT agency_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Drop existing problematic recursive policies on profiles
DROP POLICY IF EXISTS "Allow select for same agency" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Allow update for same agency" ON public.profiles;

-- 3. Configure clean RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for same agency members" ON public.profiles
    FOR SELECT TO authenticated 
    USING (public.get_user_agency(id) = public.get_user_agency(auth.uid()));

CREATE POLICY "Enable insert access for authenticated users during signup" ON public.profiles
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for own profile" ON public.profiles
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id);

-- 4. Configure RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for same agency settings" ON public.settings;
DROP POLICY IF EXISTS "Allow upsert for same agency settings" ON public.settings;

CREATE POLICY "Enable read for agency members" ON public.settings
    FOR SELECT TO authenticated 
    USING (agency_id = public.get_user_agency(auth.uid()));

CREATE POLICY "Enable write for agency members" ON public.settings
    FOR ALL TO authenticated 
    USING (agency_id = public.get_user_agency(auth.uid()))
    WITH CHECK (agency_id = public.get_user_agency(auth.uid()));

-- 5. Configure RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for same agency customers" ON public.customers;

CREATE POLICY "Enable read for agency customers" ON public.customers
    FOR SELECT TO authenticated 
    USING (agency_id = public.get_user_agency(auth.uid()));

CREATE POLICY "Enable write for agency customers" ON public.customers
    FOR ALL TO authenticated 
    USING (agency_id = public.get_user_agency(auth.uid()))
    WITH CHECK (agency_id = public.get_user_agency(auth.uid()));

-- 6. Configure RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for same agency messages" ON public.messages;

CREATE POLICY "Enable read for agency messages" ON public.messages
    FOR SELECT TO authenticated 
    USING (agency_id = public.get_user_agency(auth.uid()));

CREATE POLICY "Enable write for agency messages" ON public.messages
    FOR ALL TO authenticated 
    USING (agency_id = public.get_user_agency(auth.uid()))
    WITH CHECK (agency_id = public.get_user_agency(auth.uid()));

-- 7. Configure RLS on templates table
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for same agency templates" ON public.templates;

CREATE POLICY "Enable read for agency templates" ON public.templates
    FOR SELECT TO authenticated 
    USING (agency_id = public.get_user_agency(auth.uid()));

CREATE POLICY "Enable write for agency templates" ON public.templates
    FOR ALL TO authenticated 
    USING (agency_id = public.get_user_agency(auth.uid()))
    WITH CHECK (agency_id = public.get_user_agency(auth.uid()));
