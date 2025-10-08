
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

    console.log(`Tracking TTS API call for user ${user.id}`);
    
    // Track API call (usage_tracking is managed by voice conversation hook)
    // Only track the API call here for monitoring purposes
    const { error } = await supabase.from('api_calls_tracking').insert({
      user_id: user.id,
      service: 'tts',
      endpoint: 'voice_practice'
    });
    
    if (error) {
      console.error("Error inserting API tracking record:", error);
      return;
    }
    
    console.log("TTS API call tracked successfully");
    
  } catch (error) {
    console.error("Error tracking TTS usage:", error);
  }
}
