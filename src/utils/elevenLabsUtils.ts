
/**
 * Maps language codes to ElevenLabs agent IDs
 */
export const getAgentIdForLanguage = (language: string): string => {
  switch (language.toLowerCase()) {
    case "english":
      return "femZJQOmwbvFjGG46OO0"; // English tutor
    case "spanish":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for Spanish speakers
    case "portuguese":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for Portuguese speakers
    case "korean":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for Korean speakers
    case "arabic":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for Arabic speakers
    case "mandarin":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for Mandarin speakers
    case "vietnamese":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for Vietnamese speakers
    case "french":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for French speakers
    case "japanese":
      return "pViLJpVDvXIBEL7BXbam"; // English tutor for Japanese speakers
    case "russian":
      return "rlHSjx9Y19IqjWTspVRq"; // English tutor for Russian speakers
    case "ukrainian":
      return "eu1E63tLoKFYPB28lWks"; // English tutor for Ukrainian speakers
    case "hindi":
      return "femZJQOmwbvFjGG46OO0"; // English tutor for Hindi speakers
    default:
      return "femZJQOmwbvFjGG46OO0"; // Default English tutor
  }
};
