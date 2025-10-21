-- Create user_progression table to track XP, levels, and streaks
CREATE TABLE IF NOT EXISTS public.user_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  certifications_completed INTEGER NOT NULL DEFAULT 0,
  voice_sessions_completed INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table for achievement definitions
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL, -- 'lessons_completed', 'streak_days', 'certification_score', 'voice_sessions', etc.
  requirement_value INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'lessons', 'streaks', 'certifications', 'voice', 'special'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table to track unlocked achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create daily_quests table for daily challenges
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_type TEXT NOT NULL, -- 'complete_lessons', 'voice_practice_minutes', 'earn_xp', etc.
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_type, quest_date)
);

-- Enable RLS on all tables
ALTER TABLE public.user_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progression
CREATE POLICY "Users can view their own progression"
ON public.user_progression FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progression"
ON public.user_progression FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progression"
ON public.user_progression FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view student progression in their classes"
ON public.user_progression FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM student_enrollments se
    JOIN classes c ON c.id = se.class_id
    WHERE se.student_id = user_progression.user_id
    AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Admins can view progression in their school"
ON public.user_progression FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles admin_profile, profiles user_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.role = 'admin'
    AND user_profile.id = user_progression.user_id
    AND user_profile.school_id = admin_profile.school_id
  )
);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view student achievements in their classes"
ON public.user_achievements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM student_enrollments se
    JOIN classes c ON c.id = se.class_id
    WHERE se.student_id = user_achievements.user_id
    AND c.teacher_id = auth.uid()
  )
);

-- RLS Policies for daily_quests
CREATE POLICY "Users can view their own quests"
ON public.daily_quests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests"
ON public.daily_quests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage quests"
ON public.daily_quests FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Seed initial achievements
INSERT INTO public.achievements (name, description, icon, xp_reward, requirement_type, requirement_value, category) VALUES
('First Steps', 'Complete your first lesson', '🎓', 50, 'lessons_completed', 1, 'lessons'),
('Getting Started', 'Complete 5 lessons', '📚', 100, 'lessons_completed', 5, 'lessons'),
('Dedicated Learner', 'Complete 10 lessons', '🌟', 200, 'lessons_completed', 10, 'lessons'),
('Master Student', 'Complete 25 lessons', '👑', 500, 'lessons_completed', 25, 'lessons'),
('Scholar', 'Complete 50 lessons', '🏆', 1000, 'lessons_completed', 50, 'lessons'),

('Day One', 'Start your learning streak', '🔥', 25, 'streak_days', 1, 'streaks'),
('On Fire', 'Maintain a 3-day streak', '🔥', 100, 'streak_days', 3, 'streaks'),
('Committed', 'Maintain a 7-day streak', '🔥', 250, 'streak_days', 7, 'streaks'),
('Unstoppable', 'Maintain a 30-day streak', '🔥', 1000, 'streak_days', 30, 'streaks'),
('Legendary', 'Maintain a 100-day streak', '🔥', 5000, 'streak_days', 100, 'streaks'),

('First Certification', 'Complete your first certification exam', '🎖️', 200, 'certifications_completed', 1, 'certifications'),
('Certified', 'Complete 3 certification exams', '🏅', 500, 'certifications_completed', 3, 'certifications'),
('Expert', 'Score 90+ on a certification', '⭐', 300, 'certification_score', 90, 'certifications'),

('Voice Beginner', 'Complete your first voice session', '🎤', 50, 'voice_sessions', 1, 'voice'),
('Conversationalist', 'Complete 10 voice sessions', '💬', 200, 'voice_sessions', 10, 'voice'),
('Fluent Speaker', 'Complete 50 voice sessions', '🗣️', 1000, 'voice_sessions', 50, 'voice'),

('Welcome', 'Create your account', '👋', 10, 'special', 1, 'special'),
('Profile Complete', 'Fill out your profile', '✅', 25, 'special', 1, 'special'),
('First Goal', 'Set your learning goal', '🎯', 25, 'special', 1, 'special')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progression_user_id ON public.user_progression(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progression_total_xp ON public.user_progression(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_progression_streak ON public.user_progression(current_streak_days DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date ON public.daily_quests(user_id, quest_date);
CREATE INDEX IF NOT EXISTS idx_daily_quests_date ON public.daily_quests(quest_date);