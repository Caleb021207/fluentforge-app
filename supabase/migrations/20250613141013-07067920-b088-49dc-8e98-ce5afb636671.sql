-- Update Palavox High School using its exact ID (avoiding name matching issues)
UPDATE public.schools 
SET district_id = 'b8f3e7d2-9c4a-4b5e-8f2d-1a7c9e5b3d8f',
    updated_at = now()
WHERE id = '1d0d9925-e0b7-40f8-8402-c57d0ad14400';