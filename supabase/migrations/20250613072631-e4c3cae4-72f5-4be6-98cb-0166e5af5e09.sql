
-- Update the class record to link it to the teacher (sales@palavox.org user)
UPDATE public.classes 
SET teacher_id = '501f2a80-0b20-467f-b714-d78b0c668303'
WHERE id = '028f1516-4a33-43ad-b03e-11b29b115906';

-- Ensure we have a proper subject for this class
INSERT INTO public.subjects (id, name, code, department) 
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'English Language Learning', 'ELL', 'Languages')
ON CONFLICT (id) DO NOTHING;

-- Update the class to have a proper subject
UPDATE public.classes 
SET subject_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE id = '028f1516-4a33-43ad-b03e-11b29b115906' AND subject_id IS NULL;
