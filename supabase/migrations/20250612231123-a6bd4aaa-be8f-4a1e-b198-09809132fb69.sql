
-- Create table for storing uploaded transcripts and analysis results
CREATE TABLE public.transcript_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_status TEXT NOT NULL DEFAULT 'pending',
  
  -- Extracted scores and metrics
  overall_score NUMERIC,
  cefr_level TEXT,
  reading_score NUMERIC,
  writing_score NUMERIC,
  speaking_score NUMERIC,
  listening_score NUMERIC,
  
  -- AI analysis results
  strengths TEXT[],
  weaknesses TEXT[],
  recommendations TEXT[],
  detailed_feedback TEXT,
  progress_insights TEXT,
  
  -- Metadata
  test_date DATE,
  test_provider TEXT,
  raw_extracted_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking progress over time
CREATE TABLE public.progress_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transcript_id UUID REFERENCES public.transcript_analyses(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL, -- 'score_improvement', 'level_advancement', 'skill_breakthrough'
  previous_value NUMERIC,
  current_value NUMERIC,
  improvement_percentage NUMERIC,
  achievement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI-generated study recommendations
CREATE TABLE public.study_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transcript_id UUID REFERENCES public.transcript_analyses(id) ON DELETE CASCADE,
  skill_area TEXT NOT NULL, -- 'reading', 'writing', 'speaking', 'listening', 'grammar', 'vocabulary'
  priority_level INTEGER NOT NULL DEFAULT 3, -- 1-5 scale
  recommendation_text TEXT NOT NULL,
  estimated_time_investment TEXT,
  difficulty_level TEXT,
  resources JSONB, -- Links, exercises, materials
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'skipped'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transcript_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transcript_analyses
CREATE POLICY "Users can view their own transcript analyses" 
  ON public.transcript_analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transcript analyses" 
  ON public.transcript_analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcript analyses" 
  ON public.transcript_analyses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transcript analyses" 
  ON public.transcript_analyses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for progress_milestones
CREATE POLICY "Users can view their own progress milestones" 
  ON public.progress_milestones 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress milestones" 
  ON public.progress_milestones 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for study_recommendations
CREATE POLICY "Users can view their own study recommendations" 
  ON public.study_recommendations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study recommendations" 
  ON public.study_recommendations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study recommendations" 
  ON public.study_recommendations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage bucket for transcript files
INSERT INTO storage.buckets (id, name, public) VALUES ('transcripts', 'transcripts', false);

-- Create storage policies
CREATE POLICY "Users can upload their own transcripts" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own transcripts" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own transcripts" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own transcripts" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'transcripts' AND auth.uid()::text = (storage.foldername(name))[1]);
