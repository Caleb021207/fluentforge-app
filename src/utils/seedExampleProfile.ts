
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

  // Clear any existing certification attempts for clean data
  await supabase
    .from('certification_attempts')
    .delete()
    .eq('user_id', userId);

  // Generate certification attempt data
  const startDate = new Date('2023-07-01');
  const certificationTypes = ['reading', 'writing', 'speaking', 'listening'];
  const levels = ['A1', 'A2', 'B1'];
  
  let counter = 0;
  const attempts = [];

  // Create 5 attempts for each level and type (total 60 attempts)
  for (const level of levels) {
    for (const type of certificationTypes) {
      // For each level and type, create 5 attempts with increasing scores
      for (let i = 0; i < 5; i++) {
        // Calculate base score depending on level
        let baseScore = 0;
        switch (level) {
          case 'A1': baseScore = 40; break;
          case 'A2': baseScore = 60; break;
          case 'B1': baseScore = 75; break;
        }
        
        // Add progress within level (0-15% improvement)
        const progressScore = baseScore + (i * 3);
        
        // Calculate date (each attempt is 2-3 weeks apart)
        const attemptDate = new Date(startDate);
        attemptDate.setDate(attemptDate.getDate() + (counter * 16) + Math.floor(Math.random() * 5));
        
        attempts.push({
          id: crypto.randomUUID(),
          user_id: userId,
          certification_type: type,
          level,
          score: Math.min(progressScore, 99), // Cap at 99
          completed_at: attemptDate.toISOString(),
          created_at: attemptDate.toISOString()
        });
        
        counter++;
      }
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
    attemptsAdded: attempts.length
  };
};
