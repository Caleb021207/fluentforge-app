
-- Get the most recently created district code
SELECT code, target_name, created_at 
FROM public.access_codes 
WHERE code_type = 'district' 
ORDER BY created_at DESC 
LIMIT 1;
