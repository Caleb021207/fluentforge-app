
/**
 * Maps language codes to ElevenLabs agent IDs
 */
export const getAgentIdForLanguage = (language: string): string => {
  switch (language.toLowerCase()) {
    case "english":
      return "AOv9JDhkEdMmiU61vHg9"; // Spanish tutor for English speakers
    case "spanish":
      return "LGA4iRGgLlVbWPluqq23"; // English tutor for Spanish speakers
    case "portuguese":
      return "WuaaV0Pu1tinWfjSk9CY"; // Portuguese tutor
    case "korean":
      return "gLUyjMusYz1pumoMfoQv"; // Korean tutor for English learners
    case "arabic":
      return "RFO6KG9COLQqxnxRzI0L"; // Arabic tutor for English learners
    case "mandarin":
      return "MRQcwp0aUbQnbcLE0fjf"; // English tutor for Mandarin speakers
    case "vietnamese":
      return "pc9rZRG8F2WnPEdV77yG"; // English tutor for Vietnamese speakers
    case "french":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for French speakers
    case "japanese":
      return "M2MhVrSMkj3Y6j5uaQE9"; // English tutor for Japanese speakers
    case "russian":
      return "rlHSjx9Y19IqjWTspVRq"; // English tutor for Russian speakers
    case "ukrainian":
      return "eu1E63tLoKFYPB28lWks"; // English tutor for Ukrainian speakers
    case "hindi":
      return "KZaHLSD2sG8AptT09Feu"; // English tutor for Hindi speakers
    default:
      return "AOv9JDhkEdMmiU61vHg9"; // Default to Spanish tutor for English speakers
  };
};
