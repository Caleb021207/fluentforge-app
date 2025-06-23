
import { TRANSLATION_SCHEMA, validateTranslations, type TranslationValidationResult } from "./translationSchema";
import { TranslationRecord } from "@/translations/types";
import englishTranslations from "@/translations/english";
import farsiTranslations from "@/translations/farsi";
import pashtoTranslations from "@/translations/pashto";

export interface LanguageValidationReport {
  language: string;
  validation: TranslationValidationResult;
  criticalMissing: string[];
}

export interface LanguageCompletenessReport {
  language: string;
  displayName: string;
  completionPercentage: number;
  missingKeys: number;
  foundKeys: number;
  totalKeys: number;
}

const CRITICAL_KEYS = [
  "welcome",
  "home",
  "practice",
  "loading",
  "error",
  "welcomeToLanguageLearning",
  "yourPersonalAICompanion",
  "getStarted",
  "signIn",
  "createAccount",
  "textPractice",
  "unlimitedVoicePractice",
  "startSpeaking",
  "microphoneAccessRequired",
  "speechRecognitionNotSupported"
];

export const MASTER_TRANSLATION_KEYS = Object.keys(TRANSLATION_SCHEMA);

export const TRANSLATION_CATEGORIES = [
  "general-core",
  "ui-elements", 
  "auth",
  "navigation",
  "practice",
  "certificates",
  "progress",
  "profile",
  "voice-chat",
  "premium-voice",
  "language-frameworks",
  "languages",
  "settings"
];

export function validateAllLanguages(): LanguageValidationReport[] {
  const languages = {
    "English": englishTranslations,
    "Farsi": farsiTranslations,
    "Pashto": pashtoTranslations
  };

  return Object.entries(languages).map(([language, translations]) => {
    const validation = validateTranslations(translations);
    const criticalMissing = validation.missingKeys.filter(key => CRITICAL_KEYS.includes(key));
    
    return {
      language,
      validation,
      criticalMissing
    };
  });
}

export function validateAllLanguageTranslations(): Record<string, TranslationValidationResult> {
  const languages = {
    "english": englishTranslations,
    "farsi": farsiTranslations,
    "pashto": pashtoTranslations
  };

  const results: Record<string, TranslationValidationResult> = {};
  
  Object.entries(languages).forEach(([language, translations]) => {
    results[language] = validateTranslations(translations);
  });

  return results;
}

export function validateLanguageTranslations(languageCode: string): TranslationValidationResult {
  const languages = {
    "english": englishTranslations,
    "farsi": farsiTranslations,
    "pashto": pashtoTranslations
  };

  const translations = languages[languageCode as keyof typeof languages];
  if (!translations) {
    return {
      isComplete: false,
      missingKeys: MASTER_TRANSLATION_KEYS,
      totalKeys: MASTER_TRANSLATION_KEYS.length,
      foundKeys: 0,
      completionPercentage: 0
    };
  }

  return validateTranslations(translations);
}

export function getLanguagesByCompleteness(): LanguageCompletenessReport[] {
  const languages = {
    "english": { translations: englishTranslations, displayName: "English" },
    "farsi": { translations: farsiTranslations, displayName: "Farsi (Persian)" },
    "pashto": { translations: pashtoTranslations, displayName: "Pashto" }
  };

  const reports = Object.entries(languages).map(([language, { translations, displayName }]) => {
    const validation = validateTranslations(translations);
    
    return {
      language,
      displayName,
      completionPercentage: validation.completionPercentage,
      missingKeys: validation.missingKeys.length,
      foundKeys: validation.foundKeys,
      totalKeys: validation.totalKeys
    };
  });

  return reports.sort((a, b) => b.completionPercentage - a.completionPercentage);
}

export function logTranslationReport(): void {
  const reports = validateAllLanguages();
  
  console.log("=== Translation Validation Report ===");
  
  reports.forEach(report => {
    console.log(`\n${report.language}:`);
    console.log(`  Completion: ${report.validation.completionPercentage}%`);
    console.log(`  Found: ${report.validation.foundKeys}/${report.validation.totalKeys} keys`);
    
    if (report.criticalMissing.length > 0) {
      console.log(`  Critical missing: ${report.criticalMissing.join(", ")}`);
    }
    
    if (report.validation.missingKeys.length > 0 && report.validation.missingKeys.length <= 10) {
      console.log(`  Missing keys: ${report.validation.missingKeys.join(", ")}`);
    } else if (report.validation.missingKeys.length > 10) {
      console.log(`  Missing ${report.validation.missingKeys.length} keys (too many to list)`);
    }
  });
}

// Auto-run validation in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(logTranslationReport, 1000);
}
