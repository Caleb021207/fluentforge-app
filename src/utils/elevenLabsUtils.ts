
import { useConversation } from '@11labs/react';

// Configuration for the ElevenLabs agents
export const SPANISH_TUTOR_AGENT_ID = 'AOv9JDhkEdMmiU61vHg9'; // Spanish tutor for English speakers
export const ENGLISH_TUTOR_AGENT_ID = 'LGA4iRGgLlVbWPluqq23'; // English tutor for Spanish speakers
export const PORTUGUESE_TUTOR_AGENT_ID = 'WuaaV0Pu1tinWfjSk9CY'; // Portuguese tutor
export const KOREAN_TUTOR_AGENT_ID = 'gLUyjMusYz1pumoMfoQv'; // Korean tutor for English learners
// Note: We would need to add an Arabic tutor agent ID when available

/**
 * Gets the appropriate agent ID based on the user's language
 * @param language The user's current language (english, spanish, portuguese, korean, arabic)
 * @returns The appropriate agent ID for the user's language
 */
export const getAgentIdForLanguage = (language: string): string => {
  // If the user is Korean, use their specific tutor
  if (language === "korean") {
    console.log("Using Korean tutor:", KOREAN_TUTOR_AGENT_ID);
    return KOREAN_TUTOR_AGENT_ID;
  }
  // If the user is Portuguese, use their specific tutor
  if (language === "portuguese") {
    console.log("Using Portuguese tutor:", PORTUGUESE_TUTOR_AGENT_ID);
    return PORTUGUESE_TUTOR_AGENT_ID;
  }
  // For Spanish speakers, use the English tutor
  if (language === "spanish") {
    console.log("Using English tutor for Spanish speaker:", ENGLISH_TUTOR_AGENT_ID);
    return ENGLISH_TUTOR_AGENT_ID;
  }
  // For Arabic speakers, temporarily use the English tutor
  if (language === "arabic") {
    console.log("Using English tutor for Arabic speaker (temporary):", ENGLISH_TUTOR_AGENT_ID);
    return ENGLISH_TUTOR_AGENT_ID;
  }
  // For English speakers, use the Spanish tutor
  console.log("Using Spanish tutor for English speaker:", SPANISH_TUTOR_AGENT_ID);
  return SPANISH_TUTOR_AGENT_ID;
};
