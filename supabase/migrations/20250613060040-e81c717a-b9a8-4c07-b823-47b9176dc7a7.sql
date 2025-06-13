
-- Generate the first district admin access code
SELECT public.generate_access_code(
  'district'::public.code_type,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Palavox District',
  NULL,
  NULL
) AS first_district_code;
