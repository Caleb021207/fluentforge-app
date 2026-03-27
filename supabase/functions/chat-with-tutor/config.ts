
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

export async function filterProhibitedContent(input: string): Promise<{ filtered: boolean; reason: string }> {
  const prohibitedPatterns = [
    /\b(hack|crack|steal|illegal|bomb|terrorist|kill|murder)\b/i,
  ];
  
  for (const pattern of prohibitedPatterns) {
    if (pattern.test(input)) {
      return { 
        filtered: true, 
        reason: `Contains prohibited content matching pattern: ${pattern}` 
      };
    }
  }
  
  return { filtered: false, reason: "" };
}
