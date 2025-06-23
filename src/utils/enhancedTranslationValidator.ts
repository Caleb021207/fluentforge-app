
import { TranslationRecord } from "@/translations/types";
import { auditAllLanguages, getMostCommonMissingKeys, getAuditSummary } from "./languageAuditSystem";

export interface TranslationIssue {
  type: 'missing_key' | 'empty_value' | 'mixed_language' | 'inconsistent_format';
  key: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface LanguageHealthReport {
  language: string;
  overallScore: number;
  issues: TranslationIssue[];
  recommendations: string[];
}

// Critical keys that must be translated for basic functionality
const CRITICAL_KEYS = [
  'home', 'practice', 'textPractice', 'signIn', 'getStarted', 'send', 
  'loading', 'error', 'startConversationIn', 'practiceGuide'
];

// Keys that commonly have mixed language issues
const MIXED_LANGUAGE_PRONE_KEYS = [
  'practiceGuideItem1', 'practiceGuideItem2', 'practiceGuideItem3', 'practiceGuideItem4',
  'practiceTip1', 'practiceTip2', 'practiceTip3', 'practiceTip4', 'practiceTip5'
];

// Detect potential mixed language issues
function detectMixedLanguageIssues(translations: TranslationRecord, language: string): TranslationIssue[] {
  const issues: TranslationIssue[] = [];
  
  MIXED_LANGUAGE_PRONE_KEYS.forEach(key => {
    const value = translations[key];
    if (value) {
      // Check for English text in non-English languages
      if (language !== 'english' && /^[A-Za-z\s.,!?'-]+$/.test(value)) {
        // Simple heuristic: if it's all Latin characters, might be English
        const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const hasEnglishWords = englishWords.some(word => value.toLowerCase().includes(word));
        
        if (hasEnglishWords) {
          issues.push({
            type: 'mixed_language',
            key,
            description: `Potential English text in ${language} translation: "${value.substring(0, 50)}..."`,
            severity: 'high'
          });
        }
      }
    }
  });
  
  return issues;
}

// Generate health report for a language
export function generateLanguageHealthReport(languageCode: string): LanguageHealthReport {
  try {
    const translations = require(`@/translations/${languageCode}`).default as TranslationRecord;
    const issues: TranslationIssue[] = [];
    const recommendations: string[] = [];
    
    // Check for missing critical keys
    CRITICAL_KEYS.forEach(key => {
      if (!translations[key] || translations[key].trim() === '') {
        issues.push({
          type: 'missing_key',
          key,
          description: `Critical key "${key}" is missing or empty`,
          severity: 'critical'
        });
      }
    });
    
    // Check for empty values
    Object.entries(translations).forEach(([key, value]) => {
      if (!value || value.trim() === '') {
        issues.push({
          type: 'empty_value',
          key,
          description: `Key "${key}" has empty value`,
          severity: 'medium'
        });
      }
    });
    
    // Check for mixed language issues
    const mixedLanguageIssues = detectMixedLanguageIssues(translations, languageCode);
    issues.push(...mixedLanguageIssues);
    
    // Generate recommendations
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    
    if (criticalIssues > 0) {
      recommendations.push(`Fix ${criticalIssues} critical translation issues immediately`);
    }
    
    if (highIssues > 0) {
      recommendations.push(`Address ${highIssues} mixed language issues`);
    }
    
    if (issues.length === 0) {
      recommendations.push('Translation quality is good - maintain current standards');
    } else {
      recommendations.push('Implement validation system to prevent future regressions');
    }
    
    // Calculate overall score
    const totalIssues = issues.length;
    const criticalWeight = criticalIssues * 10;
    const highWeight = highIssues * 5;
    const mediumWeight = issues.filter(i => i.severity === 'medium').length * 2;
    const totalWeight = criticalWeight + highWeight + mediumWeight;
    const overallScore = Math.max(0, 100 - totalWeight);
    
    return {
      language: languageCode,
      overallScore,
      issues,
      recommendations
    };
  } catch (error) {
    console.error(`Failed to generate health report for ${languageCode}:`, error);
    return {
      language: languageCode,
      overallScore: 0,
      issues: [{
        type: 'missing_key',
        key: 'file_error',
        description: 'Failed to load translation file',
        severity: 'critical'
      }],
      recommendations: ['Fix translation file loading error']
    };
  }
}

// Generate system-wide translation report
export function generateSystemTranslationReport() {
  const summary = getAuditSummary();
  const commonMissingKeys = getMostCommonMissingKeys();
  const healthReports = summary.results.map(r => generateLanguageHealthReport(r.language));
  
  const criticalIssues = healthReports.reduce((sum, report) => 
    sum + report.issues.filter(i => i.severity === 'critical').length, 0
  );
  
  const systemScore = Math.round(healthReports.reduce((sum, report) => sum + report.overallScore, 0) / healthReports.length);
  
  return {
    summary,
    systemScore,
    criticalIssues,
    commonMissingKeys: commonMissingKeys.slice(0, 10), // Top 10 most common
    healthReports: healthReports.sort((a, b) => b.overallScore - a.overallScore),
    recommendations: [
      `Fix ${criticalIssues} critical issues across all languages`,
      'Standardize translation keys to prevent mixed language text',
      'Implement automated validation system',
      'Prioritize languages with high usage but low completion scores'
    ]
  };
}

// Log comprehensive translation status
export function logTranslationSystemStatus() {
  const report = generateSystemTranslationReport();
  
  console.log('=== COMPREHENSIVE TRANSLATION SYSTEM REPORT ===');
  console.log(`System Score: ${report.systemScore}/100`);
  console.log(`Total Languages: ${report.summary.totalLanguages}`);
  console.log(`Fully Integrated: ${report.summary.fullyIntegrated}`);
  console.log(`Highly Integrated: ${report.summary.highlyIntegrated}`);
  console.log(`Minimally Integrated: ${report.summary.minimallyIntegrated}`);
  console.log(`Critical Issues: ${report.criticalIssues}`);
  
  console.log('\n=== TOP LANGUAGE SCORES ===');
  report.healthReports.slice(0, 10).forEach(report => {
    console.log(`${report.language}: ${report.overallScore}/100 (${report.issues.length} issues)`);
  });
  
  console.log('\n=== MOST COMMON MISSING KEYS ===');
  report.commonMissingKeys.forEach(item => {
    console.log(`${item.key}: missing in ${item.count}/${report.summary.totalLanguages} languages (${item.percentage}%)`);
  });
  
  return report;
}
