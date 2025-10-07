-- Enable real-time updates for student enrollments
ALTER TABLE public.student_enrollments REPLICA IDENTITY FULL;

-- Add table to realtime publication if not already added
DO $$
BEGIN
  -- Check if table is already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'student_enrollments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_enrollments;
  END IF;
END $$;