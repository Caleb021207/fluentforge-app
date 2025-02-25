
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

    // Create certification attempts at B1 level (scores in the 33-49% range for B1)
    const certifications = [
      {
        certification_type: "reading",
        score: 40, // B1 level score (33-49% range)
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      },
      {
        certification_type: "writing",
        score: 38, // B1 level score (33-49% range)
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
      },
      {
        certification_type: "speaking_listening",
        score: 42, // B1 level score (33-49% range)
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      }
    ];

    const { error: certError } = await supabase
      .from("certification_attempts")
      .insert(certifications);

    if (certError) throw certError;

    // Create lesson progress data - let's add more progress appropriate for B1 level
    // We'll create progress for lessons in A1, A2 and B1 levels
    const lessonProgressEntries = [];
    
    // Completed A1 lessons
    for (let i = 1; i <= 10; i++) {
      lessonProgressEntries.push({
        user_id: userId,
        level: "A1",
        lesson_id: i,
        progress: 100,
        completed: true,
        last_accessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * (90 - i * 2)).toISOString(),
        xp_earned: Math.floor(Math.random() * 50) + 50, // 50-100 XP per lesson
      });
    }
    
    // Completed A2 lessons
    for (let i = 1; i <= 10; i++) {
      lessonProgressEntries.push({
        user_id: userId,
        level: "A2",
        lesson_id: i,
        progress: 100,
        completed: true,
        last_accessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * (60 - i * 2)).toISOString(),
        xp_earned: Math.floor(Math.random() * 50) + 50, // 50-100 XP per lesson
      });
    }
    
    // Partially completed B1 lessons
    for (let i = 1; i <= 10; i++) {
      lessonProgressEntries.push({
        user_id: userId,
        level: "B1",
        lesson_id: i,
        progress: i <= 5 ? 100 : Math.floor(Math.random() * 60) + 20, // First 5 lessons complete, others in progress
        completed: i <= 5,
        last_accessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * (30 - i * 2)).toISOString(),
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

// Function to add B1 level certification scores to existing user
export const addExampleCertificationScores = async () => {
  try {
    // Find the example user first
    const { data: userData, error: userError } = await supabase.auth
      .signInWithPassword({
        email: "example@gmail.com", 
        password: "123456"
      });

    if (userError) {
      console.error("Could not find example user:", userError);
      return { success: false, error: "Could not find example user. Please create an example profile first." };
    }

    const userId = userData.user?.id;
    
    if (!userId) {
      return { success: false, error: "User ID not found" };
    }

    // Clear any existing certification attempts for this user
    const { error: deleteError } = await supabase
      .from("certification_attempts")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting existing certification attempts:", deleteError);
      // Continue despite error - we'll just add new attempts
    }

    // Create B1 level scores for each certification type (33-49% range for B1)
    const certifications = [
      // B1 level Reading certification - score in the middle of B1 range (33-49%)
      {
        certification_type: "reading",
        score: 40, // B1 level score
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      },
      
      // B1 level Writing certification - score in the middle of B1 range (33-49%)
      {
        certification_type: "writing",
        score: 38, // B1 level score
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
      },
      
      // B1 level Speaking/Listening certification - score in the middle of B1 range (33-49%)
      {
        certification_type: "speaking_listening",
        score: 42, // B1 level score
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      }
    ];

    const { error: certError } = await supabase
      .from("certification_attempts")
      .insert(certifications);

    if (certError) throw certError;

    return { success: true, userId };
  } catch (error) {
    console.error("Error adding certification scores:", error);
    return { success: false, error };
  }
};
