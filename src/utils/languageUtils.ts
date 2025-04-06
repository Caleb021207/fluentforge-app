export const getLanguagePair = (language: string) => {
  if (language === "english") {
    return { practice: "Spanish", native: "English" };
  } else if (language === "spanish") {
    return { practice: "English", native: "Spanish" };
  } else if (language === "portuguese") {
    return { practice: "English", native: "Portuguese" };
  } else if (language === "korean") {
    return { practice: "English", native: "Korean" };
  } else if (language === "arabic") {
    return { practice: "English", native: "Arabic" };
  } else if (language === "mandarin") {
    return { practice: "English", native: "Mandarin" };
  } else if (language === "vietnamese") {
    return { practice: "English", native: "Vietnamese" };
  } else if (language === "french") {
    return { practice: "English", native: "French" };
  } else if (language === "japanese") {
    return { practice: "English", native: "Japanese" };
  } else if (language === "russian") {
    return { practice: "English", native: "Russian" };
  } else if (language === "ukrainian") {
    return { practice: "English", native: "Ukrainian" };
  } else if (language === "hindi") {
    return { practice: "English", native: "Hindi" };
  } else if (language === "indonesian") {
    return { practice: "English", native: "Indonesian" };
  } else if (language === "turkish") {
    return { practice: "English", native: "Turkish" };
  } else if (language === "polish") {
    return { practice: "English", native: "Polish" };
  }
  return { practice: "English", native: "Your Language" };
};

export const getAgentIdForLanguage = (language: string) => {
  if (language === "english") {
    return "TKbzB6cLYZbldUphidg3"; // Example ID for English
  } else if (language === "japanese") {
    return "6XJZ89nBQfO8bsuaJGsL"; // Example ID for Japanese
  } else if (language === "indonesian") {
    return "n0xawTpIZ6Zojiox0KZ5"; // Real ID for Indonesian
  }
  // Default to English agent
  return "TKbzB6cLYZbldUphidg3";
};
