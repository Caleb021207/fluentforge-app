
-- Create a function to set a user as admin
create or replace function public.create_admin_procedure()
returns void
language plpgsql
security definer
as $$
begin
  -- Check if is_admin column exists, if not add it
  begin
    alter table public.user_profiles add column if not exists is_admin boolean default false;
  exception when others then
    raise notice 'Error adding is_admin column: %', sqlerrm;
  end;
  
  -- Create the procedure to set a user as admin
  create or replace function public.set_user_as_admin(user_id uuid)
  returns boolean
  language plpgsql
  security definer
  as $inner$
  begin
    -- Use an upsert pattern to handle both insert and update cases
    insert into public.user_profiles (id, is_admin)
    values (user_id, true)
    on conflict (id) 
    do update set is_admin = true;
    
    return true;
  exception
    when others then
      return false;
  end;
  $inner$;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.create_admin_procedure to authenticated;
grant execute on function public.set_user_as_admin to authenticated;
