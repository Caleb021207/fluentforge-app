-- Quick Fix: Make profiles.role read-only and add documentation

-- Step 1: Create trigger function to prevent role updates
CREATE OR REPLACE FUNCTION public.prevent_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow setting role on INSERT only
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Direct updates to profiles.role are not allowed. Use user_roles table instead.'
      USING HINT = 'To change user roles, insert/delete from the user_roles table.',
            ERRCODE = 'integrity_constraint_violation';
  END IF;
  RETURN NEW;
END;
$$;

-- Step 2: Create trigger to enforce role immutability
DROP TRIGGER IF EXISTS enforce_role_immutability ON public.profiles;
CREATE TRIGGER enforce_role_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_update();

-- Step 3: Add database comment for documentation
COMMENT ON COLUMN public.profiles.role IS 
  'DISPLAY ONLY - Do not use for authorization. This field is synchronized from user_roles table for frontend display purposes. All access control decisions MUST use has_role() function with user_roles table. This column is READ-ONLY after initial insert.';