
/**
 * Translation Audit System
 * Comprehensive tool for auditing and managing translations across the entire application
 */

import { MASTER_TRANSLATION_KEYS, validateLanguageTranslations, TRANSLATION_CATEGORIES } from "./translationValidator";
import { analyzeComponentFile, PRIORITY_COMPONENTS, ComponentAnalysis } from "./textExtractor";

export interface AuditReport {
  summary: {
    totalComponents: number;
    totalHardcodedStrings: number;
    totalSuggestedKeys: number;
    priorityComponentsAudited: number;
  };
  componentAnalyses: ComponentAnalysis[];
  missingFromMaster: string[];
  recommendedNewKeys: string[];
  languageCompleteness: Record<string, {
    percentage: number;
    missingCount: number;
    criticalMissing: string[];
  }>;
}

/**
 * Hardcoded strings found in components that need translation keys
 */
export const IDENTIFIED_HARDCODED_STRINGS = {
  // Landing Page
  landingPage: [
    "Swipe up to get started",
    "Get Started", 
    "Sign In",
    "Sign Up"
  ],
  
  // Auth Dialog  
  authDialog: [
    "Sign in to continue",
    "Create account to get started", 
    "Email",
    "Password",
    "Access Passcode",
    "Incorrect passcode",
    "Retrying",
    "Don't have an account?",
    "Already have an account?"
  ],
  
  // Profile Page
  profile: [
    "Authentication Required",
    "Please sign in to view your profile",
    "Autenticación Requerida", // Hardcoded Spanish
    "Por favor inicia sesión para ver tu perfil", // Hardcoded Spanish  
    "Mi Perfil", // Hardcoded Spanish
    "My Profile",
    "Student", "Teacher", "Administrator", "District Admin",
    "Estudiante", "Profesor", "Administrador", "Distrito", // Hardcoded Spanish
    "Role Not Assigned",
    "Please use an access code to assign your role in the system"
  ],
  
  // Practice Interface
  practice: [
    "Correct Grammar",
    "Clear Conversation", 
    "Authentication required",
    "Please login to access this feature"
  ],
  
  // Settings
  settings: [
    "Configure parental controls and safety settings"
  ],
  
  // Navigation  
  navigation: [
    "Text Practice",
    "Unlimited Voice Practice", 
    "My Classes",
    "My Class"
  ]
};

/**
 * Convert identified hardcoded strings to suggested translation keys
 */
export function generateSuggestedTranslationKeys(): Record<string, string[]> {
  const suggestions: Record<string, string[]> = {};
  
  Object.entries(IDENTIFIED_HARDCODED_STRINGS).forEach(([category, strings]) => {
    suggestions[category] = strings.map(str => {
      // Convert string to camelCase key
      return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map((word, index) => 
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');
    });
  });
  
  return suggestions;
}

/**
 * Get all missing translation keys that need to be added to MASTER_TRANSLATION_KEYS
 */
export function getMissingMasterKeys(): string[] {
  const suggested = generateSuggestedTranslationKeys();
  const allSuggested = Object.values(suggested).flat();
  const currentKeys = new Set(MASTER_TRANSLATION_KEYS);
  
  return allSuggested.filter(key => !currentKeys.has(key as any));
}

/**
 * Critical missing keys that are commonly used across components
 */
export const CRITICAL_MISSING_KEYS = [
  "getStarted",
  "swipeUpToGetStarted", 
  "signInToContinue",
  "createAccountToGetStarted",
  "email",
  "password", 
  "accessPasscode",
  "incorrectPasscode",
  "retrying",
  "authenticationRequired",
  "pleaseSignInToViewProfile",
  "myProfile",
  "roleNotAssigned", 
  "pleaseUseAccessCode",
  "correctGrammar",
  "clearConversation",
  "authRequired",
  "pleaseLoginToAccessThisFeature",
  "parentalControlsDescription",
  "textPractice",
  "myClasses",
  "myClass"
];

/**
 * Audit translation completeness for critical UI elements
 */
export function auditCriticalTranslations(): {
  language: string;
  missingCritical: string[];
  criticalCompleteness: number;
}[] {
  const results: {
    language: string;
    missingCritical: string[];
    criticalCompleteness: number;
  }[] = [];
  
  // Available languages from constants
  const languages = ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'mandarin', 'japanese', 'korean', 'arabic', 'hindi', 'vietnamese', 'ukrainian', 'indonesian', 'farsi', 'urdu'];
  
  languages.forEach(lang => {
    const validation = validateLanguageTranslations(lang);
    const missingCritical = CRITICAL_MISSING_KEYS.filter(key => 
      validation.missingKeys.includes(key)
    );
    
    const criticalCompleteness = Math.round(
      ((CRITICAL_MISSING_KEYS.length - missingCritical.length) / CRITICAL_MISSING_KEYS.length) * 100
    );
    
    results.push({
      language: lang,
      missingCritical,
      criticalCompleteness
    });
  });
  
  return results.sort((a, b) => b.criticalCompleteness - a.criticalCompleteness);
}

/**
 * Generate priority action items for translation completion
 */
export interface TranslationActionItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  description: string;
  keysCount: number;
  affectedLanguages: string[];
}

export function generateActionItems(): TranslationActionItem[] {
  const criticalAudit = auditCriticalTranslations();
  const missingFromMaster = getMissingMasterKeys();
  
  const actionItems: TranslationActionItem[] = [];
  
  // Critical: Add missing keys to master list
  if (missingFromMaster.length > 0) {
    actionItems.push({
      priority: 'critical',
      action: 'Add missing keys to MASTER_TRANSLATION_KEYS',
      description: 'Found hardcoded strings that need translation keys',
      keysCount: missingFromMaster.length,
      affectedLanguages: ['all']
    });
  }
  
  // High: Complete critical translations for incomplete languages
  const incompleteLanguages = criticalAudit.filter(lang => lang.criticalCompleteness < 100);
  if (incompleteLanguages.length > 0) {
    actionItems.push({
      priority: 'high', 
      action: 'Complete critical translations',
      description: 'Add translations for critical UI elements',
      keysCount: CRITICAL_MISSING_KEYS.length,
      affectedLanguages: incompleteLanguages.map(lang => lang.language)
    });
  }
  
  // Medium: Replace hardcoded strings in components
  actionItems.push({
    priority: 'medium',
    action: 'Replace hardcoded strings in components',
    description: 'Update components to use translation functions',
    keysCount: Object.values(IDENTIFIED_HARDCODED_STRINGS).flat().length,
    affectedLanguages: ['component-updates']
  });
  
  return actionItems.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Get next steps for implementation
 */
export function getImplementationSteps(): string[] {
  const actionItems = generateActionItems();
  const steps: string[] = [];
  
  actionItems.forEach((item, index) => {
    steps.push(`${index + 1}. [${item.priority.toUpperCase()}] ${item.action}`);
    steps.push(`   - ${item.description}`);
    steps.push(`   - Affects: ${item.affectedLanguages.join(', ')}`);
    steps.push(`   - Keys: ${item.keysCount}`);
  });
  
  return steps;
}
