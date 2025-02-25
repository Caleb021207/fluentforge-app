
import { supabase } from "@/integrations/supabase/client";

// Function to seed example profile data for demonstration purposes
export const seedExampleProfile = async () => {
  // Check if the user exists
  const { data: existingUser } = await supabase.auth.signInWithPassword({
    email: "Example@gmail.com",
    password: "123456"
  });

  if (!existingUser?.user) {
    console.error("Example user not found. Please ensure the user is created first.");
    return;
  }

  const userId = existingUser.user.id;

  // Create user profile if it doesn't exist
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        display_name: "Example User",
        learning_goal: "I want to become fluent in Spanish for my job.",
        target_level: "B2",
        target_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
        avatar_url: null
      });
  }

  // Create lesson_progress table if it doesn't exist
  const { error: tableError } = await supabase.rpc('create_lesson_progress_table', {});
  if (tableError) {
    console.error("Error creating lesson_progress table:", tableError);
  }

  // Clear any existing lesson progress data
  await supabase
    .from('lesson_progress')
    .delete()
    .eq('user_id', userId);

  // Generate lesson progress data
  // All beginner lessons completed
  const beginnerLessons = [
    { level: 'beginner', lesson_id: 1, progress: 100, completed: true },
    { level: 'beginner', lesson_id: 2, progress: 100, completed: true },
    { level: 'beginner', lesson_id: 3, progress: 100, completed: true },
    { level: 'beginner', lesson_id: 4, progress: 100, completed: true },
    { level: 'beginner', lesson_id: 5, progress: 100, completed: true },
    { level: 'beginner', lesson_id: 6, progress: 100, completed: true }
  ];

  // Half of intermediate lessons completed
  const intermediateLessons = [
    { level: 'intermediate', lesson_id: 1, progress: 100, completed: true },
    { level: 'intermediate', lesson_id: 2, progress: 100, completed: true },
    { level: 'intermediate', lesson_id: 3, progress: 40, completed: false },
    { level: 'intermediate', lesson_id: 4, progress: 0, completed: false }
  ];

  // Advanced lessons not started
  const advancedLessons = [
    { level: 'advanced', lesson_id: 1, progress: 0, completed: false },
    { level: 'advanced', lesson_id: 2, progress: 0, completed: false },
    { level: 'advanced', lesson_id: 3, progress: 0, completed: false },
    { level: 'advanced', lesson_id: 4, progress: 0, completed: false }
  ];

  const lessonProgress = [...beginnerLessons, ...intermediateLessons, ...advancedLessons].map(lesson => ({
    id: crypto.randomUUID(),
    user_id: userId,
    level: lesson.level,
    lesson_id: lesson.lesson_id,
    progress: lesson.progress,
    completed: lesson.completed,
    last_accessed: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    xp_earned: lesson.progress === 100 ? [50, 75, 80, 85][Math.floor(Math.random() * 4)] : 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  // Insert lesson progress data
  for (let i = 0; i < lessonProgress.length; i += 10) {
    const batch = lessonProgress.slice(i, i + 10);
    await supabase.from('lesson_progress').insert(batch);
  }

  console.log(`Successfully added progress for ${lessonProgress.length} lessons for example user.`);

  // Clear any existing certification attempts for clean data
  await supabase
    .from('certification_attempts')
    .delete()
    .eq('user_id', userId);

  // Generate certification attempt data
  const certificationTypes = ['reading', 'writing', 'speaking', 'listening'];
  const levels = ['A1', 'A2', 'B1'];
  const attempts = [];
  
  // Create exactly one attempt for each level and type
  // The first date is 6 months ago, and each subsequent test is one month later
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6); // Start 6 months ago
  
  let attemptCount = 0;
  
  for (const level of levels) {
    for (const type of certificationTypes) {
      // Calculate date (each attempt is one month apart)
      const attemptDate = new Date(startDate);
      attemptDate.setMonth(attemptDate.getMonth() + attemptCount);
      
      // Calculate score based on level
      let score = 0;
      switch (level) {
        case 'A1': 
          score = 55 + Math.floor(Math.random() * 10); // 55-64%
          break;
        case 'A2': 
          score = 65 + Math.floor(Math.random() * 10); // 65-74%
          break;
        case 'B1': 
          score = 75 + Math.floor(Math.random() * 15); // 75-89%
          break;
      }
      
      attempts.push({
        id: crypto.randomUUID(),
        user_id: userId,
        certification_type: type,
        level,
        score,
        completed_at: attemptDate.toISOString(),
        created_at: attemptDate.toISOString()
      });
      
      attemptCount++;
    }
  }

  // Insert all certification attempts
  for (let i = 0; i < attempts.length; i += 10) {
    const batch = attempts.slice(i, i + 10);
    await supabase.from('certification_attempts').insert(batch);
  }

  console.log(`Successfully added ${attempts.length} certification attempts for example user.`);
  
  return {
    userId,
    attemptsAdded: attempts.length,
    lessonsAdded: lessonProgress.length
  };
};
