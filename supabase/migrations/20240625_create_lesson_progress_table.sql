
-- Create the function to set up lesson progress table
create or replace function public.create_lesson_progress_table()
returns void
language plpgsql
security definer
as $$
begin
  -- Create lesson_progress table if it doesn't exist
  create table if not exists public.lesson_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    level text not null,
    lesson_id integer not null,
    progress integer not null default 0,
    completed boolean not null default false,
    last_accessed timestamp with time zone,
    xp_earned integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Set up RLS policies for lesson_progress
  alter table public.lesson_progress enable row level security;
  
  -- Drop any existing policies
  drop policy if exists "Users can view own lesson progress" on public.lesson_progress;
  drop policy if exists "Users can update own lesson progress" on public.lesson_progress;
  drop policy if exists "Users can insert own lesson progress" on public.lesson_progress;
  
  -- Create new policies
  create policy "Users can view own lesson progress"
    on public.lesson_progress for select
    using ( auth.uid() = user_id );

  create policy "Users can update own lesson progress"
    on public.lesson_progress for update
    using ( auth.uid() = user_id );

  create policy "Users can insert own lesson progress"
    on public.lesson_progress for insert
    with check ( auth.uid() = user_id );
    
  -- Create flashcards table if it doesn't exist
  create table if not exists public.flashcards (
    id uuid primary key default gen_random_uuid(),
    term text not null,
    definition text not null,
    example text,
    level text not null,
    category text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  
  -- Create user_flashcard_progress table to track user progress with flashcards
  create table if not exists public.user_flashcard_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    flashcard_id uuid not null references public.flashcards(id),
    familiarity_level integer not null default 0, -- 0: New, 1: Learning, 2: Reviewing, 3: Known
    next_review_date timestamp with time zone,
    review_count integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  
  -- Set up RLS policies for flashcards table (public read access)
  alter table public.flashcards enable row level security;
  
  drop policy if exists "Public read access for flashcards" on public.flashcards;
  
  create policy "Public read access for flashcards"
    on public.flashcards for select
    to authenticated
    using (true);
    
  -- Set up RLS policies for user_flashcard_progress
  alter table public.user_flashcard_progress enable row level security;
  
  drop policy if exists "Users can view own flashcard progress" on public.user_flashcard_progress;
  drop policy if exists "Users can update own flashcard progress" on public.user_flashcard_progress;
  drop policy if exists "Users can insert own flashcard progress" on public.user_flashcard_progress;
  
  create policy "Users can view own flashcard progress"
    on public.user_flashcard_progress for select
    using (auth.uid() = user_id);
    
  create policy "Users can update own flashcard progress"
    on public.user_flashcard_progress for update
    using (auth.uid() = user_id);
    
  create policy "Users can insert own flashcard progress"
    on public.user_flashcard_progress for insert
    with check (auth.uid() = user_id);
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.create_lesson_progress_table to authenticated;

-- Initial execution of the function
select create_lesson_progress_table();

