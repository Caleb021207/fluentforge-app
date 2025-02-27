
-- Create speaking_assessments table
create table if not exists public.speaking_assessments (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null,
  pronunciation_score integer not null,
  fluency_score integer not null,
  grammar_score integer not null,
  vocabulary_score integer not null,
  comprehension_score integer not null,
  listening_score integer,
  feedback text not null,
  conversation_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for speaking_assessments
alter table public.speaking_assessments enable row level security;

create policy "Users can view own speaking assessments"
  on public.speaking_assessments for select
  using (
    exists (
      select 1 from public.certification_attempts
      where certification_attempts.id = speaking_assessments.attempt_id
      and certification_attempts.user_id = auth.uid()
    )
  );

create policy "Users can insert own speaking assessments"
  on public.speaking_assessments for insert
  with check (
    exists (
      select 1 from public.certification_attempts
      where certification_attempts.id = attempt_id
      and certification_attempts.user_id = auth.uid()
    )
  );

-- Create writing_assessments table
create table if not exists public.writing_assessments (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null,
  score integer not null,
  feedback text not null,
  grammar_score integer not null,
  vocabulary_score integer not null,
  coherence_score integer not null,
  task_completion_score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies for writing_assessments
alter table public.writing_assessments enable row level security;

create policy "Users can view own writing assessments"
  on public.writing_assessments for select
  using (
    exists (
      select 1 from public.certification_attempts
      where certification_attempts.id = writing_assessments.attempt_id
      and certification_attempts.user_id = auth.uid()
    )
  );

create policy "Users can insert own writing assessments"
  on public.writing_assessments for insert
  with check (
    exists (
      select 1 from public.certification_attempts
      where certification_attempts.id = attempt_id
      and certification_attempts.user_id = auth.uid()
    )
  );

