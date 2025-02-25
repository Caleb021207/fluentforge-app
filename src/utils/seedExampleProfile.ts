
import { supabase } from "@/integrations/supabase/client";

export const createExampleProfile = async () => {
  try {
    // Create new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "example@gmail.com",
      password: "123456",
    });

    if (authError) throw authError;
    const userId = authData.user?.id;

    if (!userId) {
      throw new Error("Failed to create user");
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: userId,
      display_name: "Example User",
      learning_goal: "Travel to Spain",
      target_level: "B2",
      target_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), // 1 year from now
      avatar_url: null,
    });

    if (profileError) throw profileError;

    // Create certification attempts consistently at A2 level
    // Note: A2 level scores typically range between 17-32% according to scoreUtils.ts
    const certifications = [
      {
        certification_type: "reading",
        score: 30, // A2 level score
        level: "A2",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      },
      {
        certification_type: "writing",
        score: 25, // A2 level score
        level: "A2",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
      },
      {
        certification_type: "speaking_listening",
        score: 28, // A2 level score
        level: "A2",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      }
    ];

    const { error: certError } = await supabase
      .from("certification_attempts")
      .insert(certifications);

    if (certError) throw certError;

    // Create lesson progress data - let's assume the user has made progress appropriate for A2 level
    // We'll create progress for lessons in A1 and A2 levels
    const lessonProgressEntries = [];
    
    // Completed A1 lessons
    for (let i = 1; i <= 10; i++) {
      lessonProgressEntries.push({
        user_id: userId,
        level: "A1",
        lesson_id: i,
        progress: 100,
        completed: true,
        last_accessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * (45 - i * 2)).toISOString(),
        xp_earned: Math.floor(Math.random() * 50) + 50, // 50-100 XP per lesson
      });
    }
    
    // Partially completed A2 lessons
    for (let i = 1; i <= 8; i++) {
      lessonProgressEntries.push({
        user_id: userId,
        level: "A2",
        lesson_id: i,
        progress: i <= 5 ? 100 : Math.floor(Math.random() * 60) + 20, // First 5 lessons complete, others in progress
        completed: i <= 5,
        last_accessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * (25 - i * 2)).toISOString(),
        xp_earned: i <= 5 ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30), // 50-100 XP for completed lessons, lower for incomplete
      });
    }

    const { error: progressError } = await supabase
      .from("lesson_progress")
      .insert(lessonProgressEntries);

    if (progressError) throw progressError;

    return { success: true, userId };
  } catch (error) {
    console.error("Error creating example profile:", error);
    return { success: false, error };
  }
};
