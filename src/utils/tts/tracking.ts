
import { supabase } from "@/integrations/supabase/client";

/**
 * Track TTS usage in the database using the new usage tracking system
 */
export async function trackTTSUsage(language: string, textLength: number): Promise<void> {
  try {
    console.log(`Tracking TTS usage for ${language} with text length ${textLength}...`);
    
    const { data: userResponse, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting user for tracking:", userError);
      return;
    }
    
    const user = userResponse.user;
    if (!user) {
      console.log("No user found for tracking");
      return;
    }

    console.log(`Tracking voice practice for user ${user.id}`);
    
    // Track in new usage_tracking table
    const { error: trackingError } = await supabase.from('usage_tracking').insert({
      student_id: user.id,
      session_type: 'voice_practice',
      messages_count: 1,
      minutes_used: Math.ceil(textLength / 150) // Estimate 1 minute per 150 characters
    });
    
    if (trackingError) {
      console.error("Error inserting usage tracking:", trackingError);
    }
    
    // Also track in legacy API calls table for backward compatibility
    const { error } = await supabase.from('api_calls_tracking').insert({
      user_id: user.id,
      service: 'tts',
      endpoint: 'voice_practice'
    });
    
    if (error) {
      console.error("Error inserting API tracking record:", error);
      return;
    }
    
    console.log("Voice practice usage tracked successfully");
    
    // Force recalculation of metrics
    try {
      const { error: recalcError } = await supabase.rpc('recalculate_student_metrics', {
        target_student_id: user.id
      });
      
      if (recalcError) {
        console.error("Error recalculating metrics:", recalcError);
      } else {
        console.log("Student metrics recalculated successfully");
      }
    } catch (recalcErr) {
      console.error("Exception in recalculating metrics:", recalcErr);
    }
    
  } catch (error) {
    console.error("Error tracking TTS usage:", error);
  }
}
