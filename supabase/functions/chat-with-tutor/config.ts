
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function filterProhibitedContent(input: string): Promise<{ filtered: boolean; reason: string }> {
  // Simple prohibited content check
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
