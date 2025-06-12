
-- Create the transcripts storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('transcripts', 'transcripts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can upload their own transcripts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own transcripts" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to transcripts" ON storage.objects;

-- Create storage policies for the transcripts bucket
CREATE POLICY "Users can upload their own transcripts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'transcripts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own transcripts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'transcripts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public read access to transcripts" ON storage.objects
FOR SELECT USING (bucket_id = 'transcripts');

-- Drop existing policies for transcript_analyses if they exist
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.transcript_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.transcript_analyses;

-- Create RLS policies for transcript_analyses
CREATE POLICY "Users can view their own analyses" ON public.transcript_analyses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON public.transcript_analyses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" ON public.transcript_analyses
FOR UPDATE USING (auth.uid() = user_id);

-- Drop existing policies for other tables if they exist
DROP POLICY IF EXISTS "Users can view their own milestones" ON public.progress_milestones;
DROP POLICY IF EXISTS "Users can insert their own milestones" ON public.progress_milestones;
DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.study_recommendations;
DROP POLICY IF EXISTS "Users can insert their own recommendations" ON public.study_recommendations;
DROP POLICY IF EXISTS "Users can update their own recommendations" ON public.study_recommendations;

-- Create policies for progress milestones
CREATE POLICY "Users can view their own milestones" ON public.progress_milestones
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones" ON public.progress_milestones
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for study recommendations
CREATE POLICY "Users can view their own recommendations" ON public.study_recommendations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations" ON public.study_recommendations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON public.study_recommendations
FOR UPDATE USING (auth.uid() = user_id);
