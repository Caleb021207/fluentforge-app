
-- Create vocabulary_progress table
create table if not exists public.vocabulary_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  unit_id integer not null,
  lesson_id integer not null,
  matched_pairs text[] not null,
  score integer not null,
  attempts integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for vocabulary_progress
alter table public.vocabulary_progress enable row level security;

-- Users can view their own progress
create policy "Users can view own vocabulary progress"
  on public.vocabulary_progress for select
  using (auth.uid() = user_id);

-- Users can insert their own progress
create policy "Users can insert own vocabulary progress"
  on public.vocabulary_progress for insert
  with check (auth.uid() = user_id);

-- Users can update their own progress
create policy "Users can update own vocabulary progress"
  on public.vocabulary_progress for update
  using (auth.uid() = user_id);

-- Create a unique constraint to ensure only one progress entry per user per lesson
create unique index if not exists vocabulary_progress_user_lesson_idx
  on public.vocabulary_progress (user_id, unit_id, lesson_id);
