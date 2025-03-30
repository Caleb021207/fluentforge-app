
import { supabase } from '@/integrations/supabase/client';
import { Classroom } from '@/types/supabase';

export async function fetchUserClassrooms(userId: string): Promise<Classroom[]> {
  try {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', userId);

    if (error) {
      console.error('Error fetching teacher classrooms:', error);
      return [];
    }

    return data as Classroom[];
  } catch (error) {
    console.error('Error in fetchUserClassrooms:', error);
    return [];
  }
}

export async function createClassroom(name: string, userId: string): Promise<Classroom | null> {
  try {
    // Generate a class code using our database function
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_unique_class_code');

    if (codeError) {
      console.error('Error generating class code:', codeError);
      return null;
    }

    const classCode = codeData;

    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        name,
        class_code: classCode,
        teacher_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating classroom:', error);
      return null;
    }

    return data as Classroom;
  } catch (error) {
    console.error('Error in createClassroom:', error);
    return null;
  }
}

export async function deleteClassroom(classroomId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', classroomId);

    if (error) {
      console.error('Error deleting classroom:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteClassroom:', error);
    return false;
  }
}

export async function resetClassCode(classroomId: string): Promise<string | null> {
  try {
    // Generate a new class code
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_unique_class_code');

    if (codeError) {
      console.error('Error generating class code:', codeError);
      return null;
    }

    const newClassCode = codeData;

    // Update the classroom with the new code
    const { data, error } = await supabase
      .from('classrooms')
      .update({ class_code: newClassCode })
      .eq('id', classroomId)
      .select()
      .single();

    if (error) {
      console.error('Error resetting class code:', error);
      return null;
    }

    return newClassCode;
  } catch (error) {
    console.error('Error in resetClassCode:', error);
    return null;
  }
}
