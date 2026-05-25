-- ====================================================================
-- VAMKOR CRM: Supabase User Onboarding Triggers & Functions
-- Run this in your Supabase SQL Editor to automate profile & subscription setup
-- ====================================================================

-- 1. Create trigger function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Determine role (default to ADMIN for direct signups)
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'ADMIN');

  -- Insert profile record
  INSERT INTO public.profiles (
    id,
    agency_id,
    role,
    username,
    company_name,
    contact_number,
    status
  ) VALUES (
    new.id,
    new.id, -- default agency ID matches user's ID for admins/direct signups
    user_role,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'company_name', 'Vamkor Client'),
    COALESCE(new.raw_user_meta_data->>'contact_number', ''),
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    username = EXCLUDED.username,
    company_name = EXCLUDED.company_name,
    contact_number = EXCLUDED.contact_number;

  -- Create a free tier subscription/wallet ONLY for ADMIN/SUPER_ADMIN level users (agencies)
  -- Managers and Agents created inside an agency inherit their admin's billing,
  -- so they do not need their own subscription rows.
  IF user_role IN ('ADMIN', 'SUPER_ADMIN') THEN
    INSERT INTO public.subscriptions (
      agency_id,
      plan,
      status,
      wallet_balance
    ) VALUES (
      new.id,
      'Free',
      'active',
      0.00
    )
    ON CONFLICT (agency_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the function to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
