/**
 * Maps language codes to ElevenLabs agent IDs
 */
export const getAgentIdForLanguage = (language: string): string => {
  switch (language) {
    case "english":
      return "pn7jvpZrGTsgJn9nVDFn"; // English agent ID
    case "spanish":
      return "WiiY9JsnREKUJiZ7P1Ps"; // Spanish agent ID
    case "mandarin":
      return "zcMenjbRPiwKQOKzI3vj"; // Mandarin agent ID
    case "arabic":
      return "eevEYBJJxmdzcYt9wd9z"; // Arabic agent ID
    case "french":
      return "vZAvPMjaHNLw9aHg2xrH"; // French agent ID
    case "japanese":
      return "pViLJpVDvXIBEL7BXbam"; // Japanese agent ID
    case "russian":
      return "rlHSjx9Y19IqjWTspVRq"; // Russian agent ID
    case "ukrainian":
      return "eu1E63tLoKFYPB28lWks"; // Ukrainian agent ID
    default:
      return "pn7jvpZrGTsgJn9nVDFn"; // Default English agent ID
  }
};
