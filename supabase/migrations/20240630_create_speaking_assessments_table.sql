
-- Create speaking_assessments table
create table if not exists public.speaking_assessments (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid references public.certification_attempts(id) on delete cascade,
  pronunciation_score integer not null,
  fluency_score integer not null,
  grammar_score integer not null,
  vocabulary_score integer not null,
  comprehension_score integer not null,
  feedback text,
  conversation_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies for speaking_assessments
alter table public.speaking_assessments enable row level security;

-- Policy to allow users to view their own speaking assessments through the attempt_id join
create policy "Users can view own speaking assessments"
  on public.speaking_assessments
  for select using (
    exists (
      select 1 from public.certification_attempts
      where 
        public.certification_attempts.id = public.speaking_assessments.attempt_id
        and public.certification_attempts.user_id = auth.uid()
    )
  );

-- Policy to allow users to insert their own speaking assessments
create policy "Users can insert own speaking assessments"
  on public.speaking_assessments
  for insert with check (
    exists (
      select 1 from public.certification_attempts
      where 
        public.certification_attempts.id = public.speaking_assessments.attempt_id
        and public.certification_attempts.user_id = auth.uid()
    )
  );
