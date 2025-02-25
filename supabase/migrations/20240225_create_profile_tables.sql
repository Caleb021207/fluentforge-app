
-- Create the function to set up profile tables
create or replace function public.create_profile_tables()
returns void
language plpgsql
security definer
as $$
begin
  -- Create user_profiles table if it doesn't exist
  create table if not exists public.user_profiles (
    id uuid primary key references auth.users(id),
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
    user_id uuid references auth.users(id),
    certification_type text not null,
    level text not null,
    score integer not null,
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
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
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.create_profile_tables to authenticated;

-- Initial execution of the function
select create_profile_tables();
