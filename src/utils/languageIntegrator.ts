
/**
 * Language Integration System
 * Complete one-message language integration tool
 */

import { MASTER_TRANSLATION_KEYS, validateLanguageTranslations } from "./translationValidator";
import { AVAILABLE_LANGUAGES } from "@/translations/constants";

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

export interface BatchTranslationTemplate {
  language: string;
  missingTranslations: Record<string, string>;
  moduleStructure: {
    [moduleName: string]: string[];
  };
}

// Critical UI keys that must be translated for basic functionality
const CRITICAL_UI_KEYS = [
  // Navigation
  "home", "practice", "progress", "certificates", "profile", "settings",
  "textPractice", "unlimitedVoicePractice", "classes",
  
  // Authentication
  "signIn", "signUp", "createAccount", "login", "logout",
  "email", "password", "accessPasscode",
  
  // Core UI
  "loading", "error", "success", "save", "cancel", "submit",
  "yes", "no", "ok", "next", "previous", "back",
  
  // Practice
  "startConversationIn", "practiceYourLanguage", "chatWithAI",
  "correctGrammar", "clearConversation",
  
  // Profile
  "myProfile", "student", "teacher", "administrator",
  "authenticationRequired", "pleaseSignInToViewProfile",
  
  // Classroom
  "myClasses", "joinClass", "createClass", "generateCode",
  "className", "students", "teacher"
] as const;

/**
 * Generates a complete language integration report
 */
export function generateLanguageIntegrationReport(languageCode: string): LanguageIntegrationReport {
  const validation = validateLanguageTranslations(languageCode);
  const displayName = AVAILABLE_LANGUAGES[languageCode] || languageCode;
  
  // Identify critical missing keys
  const criticalMissing = CRITICAL_UI_KEYS.filter(key => 
    validation.missingKeys.includes(key as string)
  );
  
  return {
    language: languageCode,
    displayName,
    isComplete: validation.isComplete,
    missingKeys: validation.missingKeys,
    totalKeys: validation.totalKeys,
    foundKeys: validation.foundKeys,
    completionPercentage: validation.completionPercentage,
    criticalMissing,
    estimatedTranslations: validation.missingKeys.length
  };
}

/**
 * Creates a batch translation template for a language
 */
export function createBatchTranslationTemplate(languageCode: string): BatchTranslationTemplate {
  const report = generateLanguageIntegrationReport(languageCode);
  
  // Organize missing keys by module
  const moduleStructure: Record<string, string[]> = {
    "general-core": [],
    "ui-elements": [],
    "auth": [],
    "navigation": [],
    "practice": [],
    "classroom": [],
    "certificates": [],
    "progress": [],
    "profile": [],
    "voice-chat": [],
    "premium-voice": [],
    "language-frameworks": [],
    "languages": [],
    "settings": [],
    "accuracy": [],
    "landing-auth": [],
    "ferpa": [],
    "safety": [],
    "data-privacy": [],
    "language-selection": []
  };
  
  // Categorize missing keys by likely module
  report.missingKeys.forEach(key => {
    if (key.includes("auth") || key.includes("signIn") || key.includes("login") || key.includes("password")) {
      moduleStructure.auth.push(key);
    } else if (key.includes("practice") || key.includes("chat") || key.includes("conversation")) {
      moduleStructure.practice.push(key);
    } else if (key.includes("class") || key.includes("student") || key.includes("teacher")) {
      moduleStructure.classroom.push(key);
    } else if (key.includes("certificate") || key.includes("test") || key.includes("score")) {
      moduleStructure.certificates.push(key);
    } else if (key.includes("progress") || key.includes("level") || key.includes("achievement")) {
      moduleStructure.progress.push(key);
    } else if (key.includes("profile") || key.includes("user") || key.includes("personal")) {
      moduleStructure.profile.push(key);
    } else if (key.includes("voice") || key.includes("audio") || key.includes("speech")) {
      moduleStructure["voice-chat"].push(key);
    } else if (key.includes("navigation") || key.includes("menu") || key.includes("home")) {
      moduleStructure.navigation.push(key);
    } else if (key.includes("setting") || key.includes("config") || key.includes("preference")) {
      moduleStructure.settings.push(key);
    } else if (key.includes("language") && !key.includes("languages.")) {
      moduleStructure["language-selection"].push(key);
    } else if (key.startsWith("languages.")) {
      moduleStructure.languages.push(key);
    } else if (key.includes("accuracy") || key.includes("grammar") || key.includes("vocabulary")) {
      moduleStructure.accuracy.push(key);
    } else {
      // Default to ui-elements for common UI terms
      if (["loading", "error", "success", "save", "cancel", "submit", "yes", "no", "ok", "next", "previous", "back"].includes(key)) {
        moduleStructure["ui-elements"].push(key);
      } else {
        moduleStructure["general-core"].push(key);
      }
    }
  });
  
  // Create placeholder translations (will need actual translation service)
  const missingTranslations: Record<string, string> = {};
  report.missingKeys.forEach(key => {
    missingTranslations[key] = `[${key.toUpperCase()}]`; // Placeholder
  });
  
  return {
    language: languageCode,
    missingTranslations,
    moduleStructure
  };
}

/**
 * Generates a complete language integration file structure
 */
export function generateLanguageFileStructure(languageCode: string): {
  indexFile: string;
  moduleFiles: Record<string, string>;
} {
  const template = createBatchTranslationTemplate(languageCode);
  const languageName = languageCode.charAt(0).toUpperCase() + languageCode.slice(1);
  
  // Generate module files
  const moduleFiles: Record<string, string> = {};
  
  Object.entries(template.moduleStructure).forEach(([moduleName, keys]) => {
    if (keys.length > 0) {
      const moduleTranslations = keys.map(key => {
        const placeholder = template.missingTranslations[key] || `[${key.toUpperCase()}]`;
        return `  ${key}: "${placeholder}",`;
      }).join('\n');
      
      moduleFiles[`${moduleName}.ts`] = `import { TranslationRecord } from "../types";

const ${moduleName.replace(/-/g, '')}Translations: TranslationRecord = {
${moduleTranslations}
};

export default ${moduleName.replace(/-/g, '')}Translations;`;
    }
  });
  
  // Generate index file
  const imports = Object.keys(moduleFiles).map(fileName => {
    const moduleName = fileName.replace('.ts', '');
    const importName = moduleName.replace(/-/g, '');
    return `import ${importName}Translations from "./${moduleName}";`;
  }).join('\n');
  
  const exports = Object.keys(moduleFiles).map(fileName => {
    const importName = fileName.replace('.ts', '').replace(/-/g, '');
    return `  ...${importName}Translations,`;
  }).join('\n');
  
  const indexFile = `import { TranslationRecord } from "../types";
${imports}

const ${languageName.toLowerCase()}Translations: TranslationRecord = {
${exports}
};

export default ${languageName.toLowerCase()}Translations;`;
  
  return {
    indexFile,
    moduleFiles
  };
}

/**
 * Validates if a language is ready for production use
 */
export function validateLanguageReadiness(languageCode: string): {
  isReady: boolean;
  criticalIssues: string[];
  recommendations: string[];
} {
  const report = generateLanguageIntegrationReport(languageCode);
  const criticalIssues: string[] = [];
  const recommendations: string[] = [];
  
  // Check critical missing keys
  if (report.criticalMissing.length > 0) {
    criticalIssues.push(`Missing ${report.criticalMissing.length} critical UI keys: ${report.criticalMissing.slice(0, 5).join(', ')}${report.criticalMissing.length > 5 ? '...' : ''}`);
  }
  
  // Check completion percentage
  if (report.completionPercentage < 90) {
    criticalIssues.push(`Translation completion is only ${report.completionPercentage}% (needs 90%+ for production)`);
  }
  
  // Check total missing translations
  if (report.missingKeys.length > 50) {
    recommendations.push(`Consider completing translations in batches - ${report.missingKeys.length} keys remaining`);
  }
  
  if (report.completionPercentage < 100) {
    recommendations.push("Complete all translations for best user experience");
  }
  
  const isReady = criticalIssues.length === 0 && report.completionPercentage >= 90;
  
  return {
    isReady,
    criticalIssues,
    recommendations
  };
}

/**
 * Gets all languages sorted by readiness for integration
 */
export function getLanguageIntegrationStatus(): LanguageIntegrationReport[] {
  return Object.keys(AVAILABLE_LANGUAGES)
    .map(generateLanguageIntegrationReport)
    .sort((a, b) => b.completionPercentage - a.completionPercentage);
}
