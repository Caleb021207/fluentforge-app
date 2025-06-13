-- Fix the school district assignment that didn't work in the previous migration
UPDATE public.schools 
SET district_id = 'b8f3e7d2-9c4a-4b5e-8f2d-1a7c9e5b3d8f',
    updated_at = now()
WHERE name = 'Palavox High School';