
import { supabase } from "@/integrations/supabase/client";

/**
 * Track TTS usage in the database
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
    
    // Log the API call to the tracking table with voice_practice as the call type
    const { data, error } = await supabase.from('api_calls_tracking').insert({
      user_id: user.id,
      call_type: 'voice_practice',
      language: language,
      text_length: textLength
    });
    
    if (error) {
      console.error("Error inserting tracking record:", error);
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
