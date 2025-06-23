import { TranslationRecord } from "@/translations/types";
import { validateLanguageCompleteness, REQUIRED_TRANSLATION_KEYS } from "./standardTranslationTemplate";

// Only the 21 well-supported languages
export const ALL_LANGUAGES = [
  'english', 'spanish', 'portuguese', 'french', 'german', 'italian', 'russian', 'arabic', 
  'japanese', 'korean', 'mandarin', 'hindi', 'vietnamese', 'ukrainian', 'indonesian', 
  'farsi', 'bengali', 'tagalog', 'turkish', 'polish', 'thai'
] as const;

export interface LanguageAuditResult {
  language: string;
  displayName: string;
  completionPercentage: number;
  missingKeys: string[];
  isComplete: boolean;
  tier: 'Fully Integrated' | 'Highly Integrated' | 'Minimally Integrated';
  modules: string[];
}

// Categorize languages by integration level
function getLanguageTier(language: string, completionPercentage: number): {
  tier: 'Fully Integrated' | 'Highly Integrated' | 'Minimally Integrated';
  modules: string[];
} {
  if (language === 'english') {
    return { tier: 'Fully Integrated', modules: ['Core', 'Practice', 'Voice Chat', 'Premium Voice', 'UI Elements', 'Navigation'] };
  }
  
  if (completionPercentage >= 80) {
    return { tier: 'Highly Integrated', modules: ['Core', 'Practice', 'Voice Chat', 'UI Elements'] };
  }
  
  if (completionPercentage >= 50) {
    return { tier: 'Highly Integrated', modules: ['Core', 'Practice', 'Basic Voice'] };
  }
  
  return { tier: 'Minimally Integrated', modules: ['Core Only'] };
}

// Audit a single language
function auditLanguage(languageCode: string): LanguageAuditResult {
  try {
    const translations = require(`@/translations/${languageCode}`).default as TranslationRecord;
    const validation = validateLanguageCompleteness(translations);
    const { tier, modules } = getLanguageTier(languageCode, validation.completionPercentage);
    
    return {
      language: languageCode,
      displayName: languageCode.charAt(0).toUpperCase() + languageCode.slice(1),
      completionPercentage: validation.completionPercentage,
      missingKeys: validation.missingKeys,
      isComplete: validation.isComplete,
      tier,
      modules
    };
  } catch (error) {
    console.error(`Failed to audit ${languageCode}:`, error);
    return {
      language: languageCode,
      displayName: languageCode.charAt(0).toUpperCase() + languageCode.slice(1),
      completionPercentage: 0,
      missingKeys: REQUIRED_TRANSLATION_KEYS,
      isComplete: false,
      tier: 'Minimally Integrated',
      modules: ['Error Loading']
    };
  }
}

// Audit all languages
export function auditAllLanguages(): LanguageAuditResult[] {
  return ALL_LANGUAGES.map(auditLanguage).sort((a, b) => b.completionPercentage - a.completionPercentage);
}

// Get summary statistics
export function getAuditSummary() {
  const results = auditAllLanguages();
  const fullyIntegrated = results.filter(r => r.tier === 'Fully Integrated').length;
  const highlyIntegrated = results.filter(r => r.tier === 'Highly Integrated').length;
  const minimallyIntegrated = results.filter(r => r.tier === 'Minimally Integrated').length;
  
  return {
    totalLanguages: results.length,
    fullyIntegrated,
    highlyIntegrated,
    minimallyIntegrated,
    averageCompletion: Math.round(results.reduce((sum, r) => sum + r.completionPercentage, 0) / results.length),
    results
  };
}

// Get most common missing keys across all languages
export function getMostCommonMissingKeys(): { key: string; count: number; percentage: number }[] {
  const results = auditAllLanguages();
  const keyCount: Record<string, number> = {};
  
  results.forEach(result => {
    result.missingKeys.forEach(key => {
      keyCount[key] = (keyCount[key] || 0) + 1;
    });
  });
  
  return Object.entries(keyCount)
    .map(([key, count]) => ({
      key,
      count,
      percentage: Math.round((count / results.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}
