
// CIPA/FERPA compliance utilities

// CIPA/FERPA Compliance Content Filters
const cipaFilteredTerms = [
  // Inappropriate language filter
  "profanity", "obscene", "explicit", "curse", "swear",
  
  // Violence-related terms
  "violence", "violent", "weapon", "gun", "rifle", "pistol", "knife", 
  "kill", "murder", "assault", "attack", "fight", "harm", "blood",
  
  // Substance-related terms
  "drug", "narcotic", "marijuana", "cocaine", "heroin", "substance", 
  "alcohol", "beer", "wine", "liquor", "tobacco", "cigarette", "vape",
  
  // Adult content indicators
  "adult", "mature", "nsfw", "pornography", "explicit", "nude", "naked",
  "sexual", "sex", "inappropriate", "dating", "gambling",
  
  // Discriminatory terms
  "hate", "discriminatory", "slur", "racist", "sexist", 
  "bigot", "discrimination", "offensive", "prejudice"
];

// Filter content for CIPA compliance
export function filterCipaProhibitedContent(text: string): string {
  if (!text) return "";
  
  let filteredText = text;
  cipaFilteredTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(term.length));
  });
  
  return filteredText;
}

// Check if content violates CIPA guidelines
export function containsProhibitedContent(text: string): boolean {
  if (!text) return false;
  
  return cipaFilteredTerms.some(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );
}

// Log access for FERPA compliance
export function logEducationalDataAccess(userId: string, dataType: string, purpose: string) {
  // In a production environment, this would write to a database
  console.log(`FERPA Access Log: User ${userId} accessed ${dataType} for ${purpose} at ${new Date().toISOString()}`);
}

// CIPA/FERPA compliance instructions for the tutor model
export function getCipaFerpaInstructions(): string {
  return `
  IMPORTANT COMPLIANCE REQUIREMENTS:
  1. Never request or store personal identifying information (names, addresses, phone numbers, etc).
  2. Never use inappropriate language, discuss adult topics, or provide content unsuitable for K-12 students.
  3. All explanations must be appropriate for educational contexts and classroom settings.
  4. Stay focused on language learning without sharing non-educational content.
  `;
}
