-- =============================================
-- Phase 2: Student Profiling System - Database Schema
-- =============================================

-- 1. Student Learning Profiles (core profiling data)
CREATE TABLE IF NOT EXISTS public.student_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Teacher controls
  profiling_enabled BOOLEAN DEFAULT false,
  enabled_by UUID REFERENCES auth.users(id),
  enabled_at TIMESTAMPTZ,
  
  -- Core profile data
  estimated_actfl_level TEXT,
  estimated_cefr_level TEXT,
  primary_struggles JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  vocabulary_gaps TEXT[] DEFAULT '{}',
  grammar_weaknesses JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  academic_year TEXT NOT NULL DEFAULT (EXTRACT(YEAR FROM now())::TEXT || '-' || (EXTRACT(YEAR FROM now()) + 1)::TEXT),
  
  UNIQUE(student_id, academic_year)
);

-- 2. Rolling Conversation Memory (limited to 10 most recent)
CREATE TABLE IF NOT EXISTS public.student_conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  conversation_summary TEXT,
  grammar_issues_found JSONB DEFAULT '[]'::jsonb,
  vocabulary_used TEXT[] DEFAULT '{}',
  topic TEXT,
  cefr_level_demonstrated TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Parental Consent Records
CREATE TABLE IF NOT EXISTS public.parental_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'profiling', 'data_collection', 'ai_analysis'
  consented BOOLEAN DEFAULT false,
  recorded_by UUID REFERENCES auth.users(id),
  consent_date TIMESTAMPTZ,
  academic_year TEXT NOT NULL DEFAULT (EXTRACT(YEAR FROM now())::TEXT || '-' || (EXTRACT(YEAR FROM now()) + 1)::TEXT),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(student_id, consent_type, academic_year)
);

-- =============================================
-- Trigger to maintain rolling 10 conversations per student
-- =============================================
CREATE OR REPLACE FUNCTION public.maintain_conversation_limit()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.student_conversation_memory
  WHERE id IN (
    SELECT id FROM public.student_conversation_memory
    WHERE student_id = NEW.student_id
    ORDER BY created_at DESC
    OFFSET 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for rolling conversation limit
DROP TRIGGER IF EXISTS maintain_conversation_limit_trigger ON public.student_conversation_memory;
CREATE TRIGGER maintain_conversation_limit_trigger
  AFTER INSERT ON public.student_conversation_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.maintain_conversation_limit();

-- =============================================
-- RLS Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.student_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_consent_records ENABLE ROW LEVEL SECURITY;

-- Student Learning Profiles Policies
CREATE POLICY "Students can view their own profile"
  ON public.student_learning_profiles
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view profiles of students in their classes"
  ON public.student_learning_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      JOIN public.classes c ON c.id = se.class_id
      WHERE se.student_id = student_learning_profiles.student_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage profiles of students in their classes"
  ON public.student_learning_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      JOIN public.classes c ON c.id = se.class_id
      WHERE se.student_id = student_learning_profiles.student_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "School admins can view all profiles in their school"
  ON public.student_learning_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = (
        SELECT school_id FROM public.profiles WHERE id = student_learning_profiles.student_id
      )
    )
  );

-- Student Conversation Memory Policies
CREATE POLICY "Students can view their own conversation memory"
  ON public.student_conversation_memory
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view conversation memory of their students"
  ON public.student_conversation_memory
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      JOIN public.classes c ON c.id = se.class_id
      WHERE se.student_id = student_conversation_memory.student_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert conversation memory"
  ON public.student_conversation_memory
  FOR INSERT
  WITH CHECK (true);

-- Parental Consent Records Policies
CREATE POLICY "Students can view their own consent records"
  ON public.parental_consent_records
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage consent for students in their classes"
  ON public.parental_consent_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      JOIN public.classes c ON c.id = se.class_id
      WHERE se.student_id = parental_consent_records.student_id
      AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage all consent records in their school"
  ON public.parental_consent_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = (
        SELECT school_id FROM public.profiles WHERE id = parental_consent_records.student_id
      )
    )
  );

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_student_learning_profiles_student_id 
  ON public.student_learning_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_learning_profiles_academic_year 
  ON public.student_learning_profiles(academic_year);
CREATE INDEX IF NOT EXISTS idx_student_conversation_memory_student_id 
  ON public.student_conversation_memory(student_id);
CREATE INDEX IF NOT EXISTS idx_student_conversation_memory_created_at 
  ON public.student_conversation_memory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parental_consent_records_student_id 
  ON public.parental_consent_records(student_id);