
// Translation types for the internationalization system
export type TranslationRecord = Record<string, string | Record<string, unknown>>;

// Language translations type
export type LanguageTranslations = {
  [key: string]: TranslationRecord;
};

// Language codes supported by the application
export type LanguageCode = 
  | "english" | "spanish" | "portuguese" | "french" | "german" | "italian"
  | "russian" | "ukrainian" | "polish" | "romanian" | "turkish"
  | "mandarin" | "cantonese" | "japanese" | "korean" | "thai" | "vietnamese"
  | "indonesian" | "hindi" | "marathi" | "gujarati" | "punjabi" | "bengali"
  | "nepali" | "sinhala" | "arabic" | "farsi" | "urdu" | "pashto"
  | "amharic" | "tigrinya" | "somali" | "swahili" | "yoruba" | "igbo"
  | "burmese" | "karen" | "tagalog" | "malayalam" | "haitian";

// Translation validation result interface
export interface TranslationValidationResult {
  isComplete: boolean;
  missingKeys: string[];
  totalKeys: number;
  foundKeys: number;
  completionPercentage: number;
}

// Translation category definitions
export interface TranslationCategory {
  [categoryName: string]: readonly string[];
}

// Language integration report interface
export interface LanguageIntegrationReport {
  language: string;
  displayName: string;
  isComplete: boolean;
  missingKeys: string[];
  totalKeys: number;
  foundKeys: number;
  completionPercentage: number;
  criticalMissing: string[];
  estimatedTranslations: number;
}
