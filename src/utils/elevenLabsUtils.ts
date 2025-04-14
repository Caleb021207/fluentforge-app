
/**
 * Returns the appropriate ElevenLabs Agent ID based on user language settings
 * @param userLanguage The user's current UI language
 * @returns The appropriate ElevenLabs Agent ID
 */
export const getAgentIdForLanguage = (userLanguage: string): string => {
  // Default agent ID for English speakers learning Spanish
  const defaultEnglishAgent = "language-tutor-es";
  
  // Get target language from localStorage for English speakers
  if (userLanguage === "english") {
    const targetLanguage = localStorage.getItem("targetLanguage");
    
    if (targetLanguage === "french") {
      return "language-tutor-fr"; // French tutor for English speakers
    }
    
    return defaultEnglishAgent; // Default to Spanish tutor
  }
  
  // Agent IDs for non-English speakers learning English
  const agentMap: Record<string, string> = {
    'spanish': "language-tutor-en-es",
    'portuguese': "language-tutor-en-pt",
    'french': "language-tutor-en-fr",
    'japanese': "language-tutor-en-ja",
    'korean': "language-tutor-en-ko", 
    'mandarin': "language-tutor-en-zh",
    'russian': "language-tutor-en-ru",
    'arabic': "language-tutor-en-ar",
    'hindi': "language-tutor-en-hi",
    'vietnamese': "language-tutor-en-vi",
    'ukrainian': "language-tutor-en-uk",
    'indonesian': "language-tutor-en-id"
  };
  
  return agentMap[userLanguage.toLowerCase()] || "language-tutor-en-es";
};
