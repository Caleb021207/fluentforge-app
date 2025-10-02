-- First, ensure Palavox School District exists and get its ID
DO $$
DECLARE
  palavox_district_id UUID;
  palavox_high_school_id UUID;
  test_teacher_class_id UUID;
BEGIN
  -- Get or create Palavox School District
  SELECT id INTO palavox_district_id 
  FROM school_districts 
  WHERE name = 'Palavox School District';
  
  IF palavox_district_id IS NULL THEN
    INSERT INTO school_districts (name, code, created_at, updated_at)
    VALUES ('Palavox School District', 'PSD001', now(), now())
    RETURNING id INTO palavox_district_id;
  END IF;

  -- Create or update Palavox High School
  SELECT id INTO palavox_high_school_id
  FROM schools
  WHERE name = 'Palavox High School';
  
  IF palavox_high_school_id IS NULL THEN
    INSERT INTO schools (name, district_id, created_at, updated_at)
    VALUES ('Palavox High School', palavox_district_id, now(), now())
    RETURNING id INTO palavox_high_school_id;
  ELSE
    UPDATE schools 
    SET district_id = palavox_district_id, updated_at = now()
    WHERE id = palavox_high_school_id;
  END IF;

  -- Update caleb@palavox.org to be district admin
  UPDATE profiles
  SET role = 'district',
      school_id = NULL,
      updated_at = now()
  WHERE email = 'caleb@palavox.org';
  
  -- Ensure district_users entry for caleb@palavox.org
  INSERT INTO district_users (user_id, district_id, role, created_at, updated_at)
  SELECT id, palavox_district_id, 'admin', now(), now()
  FROM profiles
  WHERE email = 'caleb@palavox.org'
  ON CONFLICT (user_id, district_id) 
  DO UPDATE SET role = 'admin', updated_at = now();

  -- Update calebjawo@gmail.com to be school admin at Palavox High School
  UPDATE profiles
  SET role = 'admin',
      school_id = palavox_high_school_id,
      updated_at = now()
  WHERE email = 'calebjawo@gmail.com';

  -- Update testaccount@palavox.org to be teacher at Palavox High School
  UPDATE profiles
  SET role = 'teacher',
      school_id = palavox_high_school_id,
      updated_at = now()
  WHERE email = 'testaccount@palavox.org';

  -- Create a class for testaccount teacher
  INSERT INTO classes (
    name, 
    teacher_id, 
    school_id, 
    class_code, 
    academic_year,
    created_at,
    updated_at
  )
  SELECT 
    'Test Class - English', 
    p.id, 
    palavox_high_school_id, 
    'TC-ENG-001',
    EXTRACT(YEAR FROM now())::text || '-' || (EXTRACT(YEAR FROM now()) + 1)::text,
    now(),
    now()
  FROM profiles p
  WHERE p.email = 'testaccount@palavox.org'
  ON CONFLICT DO NOTHING
  RETURNING id INTO test_teacher_class_id;
  
  -- If class already exists, get its ID
  IF test_teacher_class_id IS NULL THEN
    SELECT c.id INTO test_teacher_class_id
    FROM classes c
    JOIN profiles p ON p.id = c.teacher_id
    WHERE p.email = 'testaccount@palavox.org'
    LIMIT 1;
  END IF;

  -- Update all other accounts to be students at Palavox High School
  UPDATE profiles
  SET role = 'student',
      school_id = palavox_high_school_id,
      updated_at = now()
  WHERE email IN (
    'calebtheace@gmail.com',
    'mr.suit008@gmail.com',
    'sales@palavox.org',
    'info@palavox.org'
  );

  -- Enroll all students in testaccount's class
  INSERT INTO student_enrollments (student_id, class_id, enrollment_date, status)
  SELECT 
    p.id,
    test_teacher_class_id,
    now(),
    'active'
  FROM profiles p
  WHERE p.email IN (
    'calebtheace@gmail.com',
    'mr.suit008@gmail.com',
    'sales@palavox.org',
    'info@palavox.org'
  )
  ON CONFLICT (student_id, class_id) DO NOTHING;

END $$;