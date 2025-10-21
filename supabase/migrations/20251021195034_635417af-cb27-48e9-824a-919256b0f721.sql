-- Create class_members table for leaderboard functionality
CREATE TABLE IF NOT EXISTS public.class_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(class_id, user_id)
);

-- Enable RLS
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view class members in their classes"
ON public.class_members FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM classes c 
    WHERE c.id = class_members.class_id 
    AND c.teacher_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM class_members cm
    WHERE cm.class_id = class_members.class_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage class members"
ON public.class_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM classes c 
    WHERE c.id = class_members.class_id 
    AND c.teacher_id = auth.uid()
  )
);