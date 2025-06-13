
-- Add unique constraint to district_users table to support ON CONFLICT
ALTER TABLE public.district_users 
ADD CONSTRAINT district_users_user_district_unique 
UNIQUE (user_id, district_id);
