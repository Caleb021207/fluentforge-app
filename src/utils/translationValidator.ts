
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
