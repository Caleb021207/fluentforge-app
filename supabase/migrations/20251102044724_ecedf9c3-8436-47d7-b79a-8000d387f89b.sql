-- Update existing users' limits to match their account tier
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT p.id, p.account_tier 
    FROM public.profiles p
    WHERE p.account_tier IS NOT NULL
  LOOP
    -- Reinitialize limits based on current tier
    PERFORM public.initialize_student_usage_limits_with_tier(
      user_record.id, 
      user_record.account_tier
    );
  END LOOP;
END $$;