
import { TranslationRecord } from "@/translations/types";
import { CORE_TRANSLATION_SCHEMA } from "./coreTranslationSchema";

// List of all 37 supported languages
export const ALL_SUPPORTED_LANGUAGES = [
  'english', 'spanish', 'portuguese', 'french', 'german', 'italian', 'russian', 'arabic', 'japanese', 'korean',
  'mandarin', 'hindi', 'vietnamese', 'ukrainian', 'indonesian', 'farsi', 'bengali', 'tagalog', 'pashto', 'swahili',
  'turkish', 'dutch', 'polish', 'czech', 'greek', 'hebrew', 'thai', 'burmese', 'amharic', 'somali',
  'urdu', 'nepali', 'mongolian', 'karen', 'cantonese', 'tigrinya', 'oromo'
] as const;

export const MASTER_TRANSLATION_KEYS = Object.keys(CORE_TRANSLATION_SCHEMA);

// Validation function for all languages
export function validateAllLanguageTranslations() {
  const results: Record<string, { isComplete: boolean; missingKeys: string[]; completionPercentage: number }> = {};
  
  ALL_SUPPORTED_LANGUAGES.forEach(lang => {
    try {
      // Dynamic import would be used in real scenario
      // For now, we'll check what's available
      results[lang] = {
        isComplete: false,
        missingKeys: MASTER_TRANSLATION_KEYS,
        completionPercentage: 0
      };
    } catch (error) {
      console.error(`Failed to validate ${lang} translations:`, error);
      results[lang] = {
        isComplete: false,
        missingKeys: MASTER_TRANSLATION_KEYS,
        completionPercentage: 0
      };
    }
  });
  
  return results;
}

// Generate missing translation template
export function generateMissingTranslationTemplate(missingKeys: string[]): string {
  return missingKeys.map(key => `  "${key}": "",`).join('\n');
}

export function logTranslationStatus() {
  console.log('=== TRANSLATION STATUS REPORT ===');
  console.log(`Total supported languages: ${ALL_SUPPORTED_LANGUAGES.length}`);
  console.log(`Total core translation keys: ${MASTER_TRANSLATION_KEYS.length}`);
  
  const validationResults = validateAllLanguageTranslations();
  const completedLanguages = Object.entries(validationResults)
    .filter(([_, result]) => result.isComplete)
    .map(([lang]) => lang);
    
  console.log(`Completed languages: ${completedLanguages.length}/${ALL_SUPPORTED_LANGUAGES.length}`);
  console.log(`Completed: ${completedLanguages.join(', ')}`);
  
  const incompleteLanguages = Object.entries(validationResults)
    .filter(([_, result]) => !result.isComplete)
    .map(([lang, result]) => ({ lang, ...result }));
    
  if (incompleteLanguages.length > 0) {
    console.log('\n=== INCOMPLETE LANGUAGES ===');
    incompleteLanguages.forEach(({ lang, completionPercentage, missingKeys }) => {
      console.log(`${lang}: ${completionPercentage}% complete (${missingKeys.length} missing keys)`);
    });
  }
}
