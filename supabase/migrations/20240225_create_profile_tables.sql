
-- Create the function to set up profile tables
create or replace function public.create_profile_tables()
returns void
language plpgsql
security definer
as $$
begin
  -- Create user_profiles table if it doesn't exist
  create table if not exists public.user_profiles (
    id uuid primary key,
    display_name text,
    learning_goal text,
    target_level text,
    target_date text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Create certification_attempts table if it doesn't exist
  create table if not exists public.certification_attempts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid,
    certification_type text not null,
    level text not null,
    score integer not null,
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Create lesson_progress table if it doesn't exist
  create table if not exists public.lesson_progress (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null,
    level text not null,
    lesson_id integer not null,
    progress integer not null,
    completed boolean not null default false,
    last_accessed timestamp with time zone,
    xp_earned integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Set up RLS policies for user_profiles
  alter table public.user_profiles enable row level security;
  
  drop policy if exists "Users can view own profile" on public.user_profiles;
  create policy "Users can view own profile"
    on public.user_profiles for select
    using ( auth.uid() = id );

  drop policy if exists "Users can update own profile" on public.user_profiles;
  create policy "Users can update own profile"
    on public.user_profiles for update
    using ( auth.uid() = id );

  drop policy if exists "Users can insert own profile" on public.user_profiles;
  create policy "Users can insert own profile"
    on public.user_profiles for insert
    with check ( auth.uid() = id );

  -- Add admin policy for user_profiles (for demo purposes, add proper role check in production)
  drop policy if exists "Admin users can view all profiles" on public.user_profiles;
  create policy "Admin users can view all profiles"
    on public.user_profiles for select
    -- In production, use a proper role check instead of this email pattern
    using ( auth.jwt() -> 'email' like '%admin%' );

  -- Set up RLS policies for certification_attempts
  alter table public.certification_attempts enable row level security;
  
  drop policy if exists "Users can view own attempts" on public.certification_attempts;
  create policy "Users can view own attempts"
    on public.certification_attempts for select
    using ( auth.uid() = user_id );

  drop policy if exists "Users can insert own attempts" on public.certification_attempts;
  create policy "Users can insert own attempts"
    on public.certification_attempts for insert
    with check ( auth.uid() = user_id );
    
  -- Add admin policy for certification_attempts
  drop policy if exists "Admin users can view all certification attempts" on public.certification_attempts;
  create policy "Admin users can view all certification attempts"
    on public.certification_attempts for select
    -- In production, use a proper role check instead of this email pattern
    using ( auth.jwt() -> 'email' like '%admin%' );

  -- Set up RLS policies for lesson_progress
  alter table public.lesson_progress enable row level security;
  
  drop policy if exists "Users can view own lesson progress" on public.lesson_progress;
  create policy "Users can view own lesson progress"
    on public.lesson_progress for select
    using ( auth.uid() = user_id );

  drop policy if exists "Users can insert own lesson progress" on public.lesson_progress;
  create policy "Users can insert own lesson progress"
    on public.lesson_progress for insert
    with check ( auth.uid() = user_id );
    
  drop policy if exists "Users can update own lesson progress" on public.lesson_progress;
  create policy "Users can update own lesson progress"
    on public.lesson_progress for update
    using ( auth.uid() = user_id );

  -- Add admin policy for lesson_progress
  drop policy if exists "Admin users can view all lesson progress" on public.lesson_progress;
  create policy "Admin users can view all lesson progress"
    on public.lesson_progress for select
    -- In production, use a proper role check instead of this email pattern
    using ( auth.jwt() -> 'email' like '%admin%' );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.create_profile_tables to authenticated;

-- Initial execution of the function
select create_profile_tables();
