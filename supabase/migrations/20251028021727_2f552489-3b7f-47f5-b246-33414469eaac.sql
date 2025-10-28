-- Phase 1: Create profile_public_data table for non-sensitive data
CREATE TABLE IF NOT EXISTS public.profile_public_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  school_id uuid REFERENCES public.schools(id),
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on profile_public_data
ALTER TABLE public.profile_public_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone authenticated can read public profile data (no PII)
CREATE POLICY "Anyone authenticated can view public profile data"
ON public.profile_public_data
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Users can update their own public data
CREATE POLICY "Users can update their own public profile data"
ON public.profile_public_data
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Service role can insert (for trigger)
CREATE POLICY "Service can manage public profile data"
ON public.profile_public_data
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create trigger function to sync profiles → profile_public_data
CREATE OR REPLACE FUNCTION public.sync_profile_public_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_public_data (user_id, display_name, avatar_url, school_id, role)
  VALUES (NEW.id, NEW.display_name, NEW.avatar_url, NEW.school_id, NEW.role)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    school_id = EXCLUDED.school_id,
    role = EXCLUDED.role,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS sync_profile_public_data_trigger ON public.profiles;
CREATE TRIGGER sync_profile_public_data_trigger
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_public_data();

-- Backfill existing profiles into profile_public_data
INSERT INTO public.profile_public_data (user_id, display_name, avatar_url, school_id, role)
SELECT id, display_name, avatar_url, school_id, role
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_public_data_user_id ON public.profile_public_data(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_public_data_school_id ON public.profile_public_data(school_id);
CREATE INDEX IF NOT EXISTS idx_profile_public_data_role ON public.profile_public_data(role);