
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

    // Create user profile using the correct table name
    const { error: profileError } = await supabase.from("profiles").insert({
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
        certification_type: "speaking",
        score: 42, // B1 level score (33-49% range)
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      },
      {
        certification_type: "listening",
        score: 41, // B1 level score (33-49% range)
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      }
    ];

    const { error: certError } = await supabase
      .from("certification_attempts")
      .insert(certifications);

    if (certError) throw certError;

    // Create some student language metrics instead of lesson progress
    const languageMetrics = [];
    
    // Create some sample language metrics over the past 30 days
    for (let i = 0; i < 15; i++) {
      languageMetrics.push({
        user_id: userId,
        grammar_accuracy: Math.random() * 0.3 + 0.6, // 60-90% accuracy
        conversation_complexity: Math.random() * 0.4 + 0.5, // 50-90% complexity
        pronunciation_accuracy: Math.random() * 0.2 + 0.7, // 70-90% pronunciation
        message_count: Math.floor(Math.random() * 10) + 5, // 5-15 messages
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * (30 - i * 2)).toISOString(),
      });
    }

    const { error: metricsError } = await supabase
      .from("student_language_metrics")
      .insert(languageMetrics);

    if (metricsError) throw metricsError;

    return { success: true, userId };
  } catch (error) {
    console.error("Error creating example profile:", error);
    return { success: false, error };
  }
};

// This function is kept for reference but is no longer used in the UI
// We've replaced it with a manual form to add certification scores
export const addExampleCertificationScores = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Must be logged in to add certification scores');
    }

    const userId = user.id;
    
    if (!userId) {
      return { success: false, error: "User ID not found" };
    }

    // Create certification scores for each certification type
    const certifications = [
      {
        certification_type: "reading",
        score: 40, // B1 level score
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      },
      {
        certification_type: "writing",
        score: 38, // B1 level score
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
      },
      {
        certification_type: "speaking",
        score: 42, // B1 level score
        level: "B1",
        user_id: userId,
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
      },
      {
        certification_type: "listening",
        score: 41, // B1 level score
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
