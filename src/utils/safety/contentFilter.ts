/**
 * Content filtering utilities for CIPA compliance
 */

// List of terms to filter in child-safety mode
const filteredTerms: string[] = [
  // Basic inappropriate language filter - common profanity
  "fuck", "shit", "ass", "bitch", "bastard", "damn", "cunt", "dick", "cock", "pussy", 
  "whore", "slut", "asshole", "motherfucker", "bullshit", "crap", "piss",
  
  // Sexual terms
  "sexual", "sex", "porn", "pornography", "nude", "naked", "explicit", 
  "masturbate", "masturbation", "orgasm", "intercourse", "erotic", "erection",
  
  // Violence-related terms
  "violence", "violent", "weapon", "gun", "rifle", "pistol", "knife", 
  "kill", "murder", "assault", "attack", "fight", "harm", "blood",
  
  // Substance-related terms
  "drug", "narcotic", "marijuana", "cocaine", "heroin", "substance", 
  "alcohol", "beer", "wine", "liquor", "tobacco", "cigarette", "vape",
  
  // Adult content indicators
  "adult", "mature", "nsfw", "pornography", "inappropriate", "dating", "gambling",
  
  // Discriminatory terms
  "hate", "discriminatory", "slur", "racist", "sexist", 
  "bigot", "discrimination", "offensive", "prejudice",
  
  // Self-harm related
  "suicide", "self-harm", "cutting", "depression",
  
  // Bullying related
  "bully", "harassment", "intimidation", "threat",
  
  // Additional CIPA-specific concerns
  "private", "personal", "identity", "address", "phone",
  "hacking", "hack", "password", "illegal", "restricted"
];

// Spanish words that might trigger false positives
const spanishSafeWords = [
  "alguna", "algunas", "algún", "ningun", "ninguna", "laguna", 
  "pecuniary", "cunning", "scunthorpe", "assumption", "associate"
];

// Safe common words that might contain filtered terms
const commonSafeWords = [
  "assumption", "class", "associate", "assignment", "assassin", "assembly",
  "passage", "passion", "passing", "assemble", "assert", "assess",
  "assist", "passenger", "passive", "passport", "password"
];

/**
 * Checks if content is safe based on the user's safety mode setting
 */
export const isSafeContent = (content: string): boolean => {
  if (!content) return true;
  
  const safetyMode = localStorage.getItem("safetyMode") || "standard";
  
  // In strict mode (for users under 13), apply more aggressive filtering
  if (safetyMode === "strict") {
    return !containsFilteredTerms(content);
  }
  
  // In standard mode, only filter extremely inappropriate content
  // This is a simplified implementation - in production, you would use more sophisticated checks
  const highRiskTerms = filteredTerms.filter(term => 
    // Only check for the most inappropriate terms in standard mode
    ["fuck", "porn", "sex", "nude", "kill", "drug"].includes(term)
  );
  return !containsFilteredTerms(content, highRiskTerms);
};

/**
 * Helper function to check if content contains any filtered terms using proper word boundary matching
 * to avoid false positives
 */
const containsFilteredTerms = (content: string, terms = filteredTerms): boolean => {
  if (!content) return false;
  
  const contentLower = content.toLowerCase();
  
  // First check if content contains any safe words that we should ignore
  for (const safeWord of [...spanishSafeWords, ...commonSafeWords]) {
    if (contentLower.includes(safeWord)) {
      // If content contains a safe word, don't flag it as unsafe
      // This is a basic check - more sophisticated systems would use NLP
      if (contentLower.trim() === safeWord) {
        return false;
      }
    }
  }
  
  return terms.some(term => {
    // Use word boundary regex to match only whole words
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    return regex.test(contentLower);
  });
};

/**
 * Filters content based on safety settings
 * Returns the original content if safe, or a filtered version if not
 */
export const filterContent = (content: string): string => {
  if (!content) return "";
  if (isSafeContent(content)) {
    return content;
  }
  
  // Check for safe words first
  for (const safeWord of [...spanishSafeWords, ...commonSafeWords]) {
    // If this is just a safe word by itself, return it unchanged
    if (content.toLowerCase().trim() === safeWord) {
      return content;
    }
  }
  
  // Replace filtered terms with asterisks, using proper word boundary matching
  let filteredContent = content;
  
  filteredTerms.forEach(term => {
    // Use word boundary regex for replacement to only match whole words
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    filteredContent = filteredContent.replace(regex, '*'.repeat(term.length));
  });
  
  return filteredContent;
};

/**
 * Advanced contextual safety check for special words in Spanish and other languages
 * This helps prevent false positives in language learning contexts
 */
export const isLanguageLearningContent = (content: string, language: string = "spanish"): boolean => {
  if (!content) return false;
  
  // Spanish-specific context markers that indicate this is educational content
  const spanishContextMarkers = [
    "traducir", "significa", "cómo se dice", "en español", "la palabra", 
    "el verbo", "la frase", "vocabulario", "gramática", "conjugación"
  ];
  
  if (language === "spanish") {
    return spanishContextMarkers.some(marker => 
      content.toLowerCase().includes(marker)
    );
  }
  
  // Default to false for other languages (can be expanded)
  return false;
};
