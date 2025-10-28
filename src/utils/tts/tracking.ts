
import { supabase } from "@/integrations/supabase/client";

/**
 * Track TTS usage in the database - updates both API tracking and usage limits
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
    
    // Track API call for monitoring purposes
    const { error: apiError } = await supabase.from('api_calls_tracking').insert({
      user_id: user.id,
      service: 'tts',
      endpoint: 'voice_practice'
    });
    
    if (apiError) {
      console.error("Error inserting API tracking record:", apiError);
    }
    
    // Calculate minutes used (rough estimate: 150 words per minute, average 5 chars per word)
    const estimatedWords = textLength / 5;
    const minutesUsed = Math.max(0.1, estimatedWords / 150); // Minimum 0.1 minutes (6 seconds)
    
    console.log(`Estimated TTS minutes: ${minutesUsed.toFixed(2)} for ${textLength} characters`);
    
    // Update TTS usage limits
    const { data: currentLimits } = await supabase
      .from('student_usage_limits')
      .select('tts_minutes_used_current_month')
      .eq('student_id', user.id)
      .single();
    
    const newUsage = (currentLimits?.tts_minutes_used_current_month || 0) + minutesUsed;
    
    const { error: updateError } = await supabase
      .from('student_usage_limits')
      .update({
        tts_minutes_used_current_month: newUsage,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', user.id);
    
    if (updateError) {
      console.error("Error updating TTS usage limits:", updateError);
      return;
    }
    
    console.log(`TTS usage tracked successfully: ${minutesUsed.toFixed(2)} minutes added (total: ${newUsage.toFixed(2)})`);
    
  } catch (error) {
    console.error("Error tracking TTS usage:", error);
  }
}
