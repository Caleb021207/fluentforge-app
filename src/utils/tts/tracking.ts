
import { supabase } from "@/integrations/supabase/client";
import { recordApiCall, recordSessionUsage } from "@/utils/serverWrites";

/**
 * Track TTS usage in the database
 * This tracks ALL TTS usage to voice_minutes_used_current_month
 * (unlimited voice practice, custom realtime, pronunciation practice, etc.)
 * @param language The language being spoken
 * @param textLength The length of the text being spoken
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
    
    // Track API call server-side (api_calls_tracking is service-role only)
    await recordApiCall({ api_type: 'tts', service: 'azure_tts', endpoint: 'text-to-speech' });
    
    // Calculate minutes used (rough estimate: 150 characters per minute of speech)
    const estimatedMinutes = Math.ceil(textLength / 150);
    
    console.log(`Estimated TTS minutes: ${estimatedMinutes} for ${textLength} characters`);
    
    // Usage counters are incremented server-side only.
    await recordSessionUsage({ session_type: 'voice_practice', minutes_used: estimatedMinutes });
    const rpcError = null;
    
    if (rpcError) {
      console.error("Error updating voice practice usage limits:", rpcError);
      return;
    }
    
    console.log(`✅ TTS usage tracked successfully: ${estimatedMinutes} minute(s) added to voice practice for user ${user.id}`);
    
  } catch (error) {
    console.error("Error tracking TTS usage:", error);
  }
}
