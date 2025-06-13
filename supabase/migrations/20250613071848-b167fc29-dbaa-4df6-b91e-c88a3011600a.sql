
-- Update the class record to link it to the teacher
UPDATE public.classes 
SET teacher_id = '501f2a80-0b20-467f-b714-d78b0c668303'
WHERE id = 'e36f55b9-8d35-4e41-b8b4-4f7c46bac123';

-- Also ensure we have a proper subject for this class
INSERT INTO public.subjects (id, name, code, department) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'English as Second Language', 'ESL', 'Languages')
ON CONFLICT (id) DO NOTHING;

-- Update the class to have a proper subject
UPDATE public.classes 
SET subject_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE id = 'e36f55b9-8d35-4e41-b8b4-4f7c46bac123' AND subject_id IS NULL;
