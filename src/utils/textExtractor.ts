
/**
 * Text Extraction Utility for finding hardcoded strings in React components
 * This tool helps identify strings that need to be added to the translation system
 */

// Patterns to identify hardcoded text strings
const TEXT_PATTERNS = {
  // JSX text content: <div>Hello World</div>
  jsxText: />([^<>{}\n]+)</g,
  
  // String literals in quotes - fixed the regex pattern
  quotedStrings: /(['"`])([^'"`\n\\]|\\.)*?\1/g,
  
  // Template literals
  templateLiterals: /`([^`\n\\]|\\.)*`/g,
  
  // Common hardcoded patterns
  buttonText: /<button[^>]*>([^<]+)<\/button>/gi,
  titleText: /title\s*=\s*["']([^"']+)["']/gi,
  placeholderText: /placeholder\s*=\s*["']([^"']+)["']/gi,
  ariaLabel: /aria-label\s*=\s*["']([^"']+)["']/gi,
};

// Common patterns that should be ignored
const IGNORE_PATTERNS = [
  /^[0-9]+$/, // Pure numbers
  /^[a-zA-Z]$/, // Single letters
  /^[^a-zA-Z0-9]*$/, // Only special characters
  /^(className|id|key|ref|style)$/, // React props
  /^(px|rem|em|vh|vw|%)$/, // CSS units
  /^(true|false|null|undefined)$/, // JavaScript literals
  /^(console\.|import |export |from |const |let |var )/, // Code keywords
  /^(onClick|onSubmit|onChange|onFocus|onBlur)/, // Event handlers
  /^[A-Z][a-zA-Z]*$/, // Component names (PascalCase)
  /^\$\{/, // Template literal variables
  /^\/[^\/].*\/$/, // Regex patterns
];

interface ExtractedText {
  text: string;
  line: number;
  context: string;
  file: string;
  category: 'jsx' | 'attribute' | 'string' | 'template';
}

/**
 * Extract hardcoded text from a file content
 */
export function extractHardcodedText(
  fileContent: string, 
  fileName: string
): ExtractedText[] {
  const lines = fileContent.split('\n');
  const extractedTexts: ExtractedText[] = [];

  lines.forEach((line, lineIndex) => {
    // Skip lines that are comments or imports
    if (line.trim().startsWith('//') || 
        line.trim().startsWith('/*') || 
        line.trim().startsWith('*') ||
        line.includes('import ') ||
        line.includes('console.')) {
      return;
    }

    // Extract JSX text content
    const jsxMatches = line.matchAll(TEXT_PATTERNS.jsxText);
    for (const match of jsxMatches) {
      const text = match[1].trim();
      if (shouldIncludeText(text)) {
        extractedTexts.push({
          text,
          line: lineIndex + 1,
          context: line.trim(),
          file: fileName,
          category: 'jsx'
        });
      }
    }

    // Extract quoted strings
    const stringMatches = line.matchAll(TEXT_PATTERNS.quotedStrings);
    for (const match of stringMatches) {
      const text = match[2];
      if (shouldIncludeText(text) && !isTranslationCall(line)) {
        extractedTexts.push({
          text,
          line: lineIndex + 1,
          context: line.trim(),
          file: fileName,
          category: 'string'
        });
      }
    }

    // Extract button text
    const buttonMatches = line.matchAll(TEXT_PATTERNS.buttonText);
    for (const match of buttonMatches) {
      const text = match[1].trim();
      if (shouldIncludeText(text)) {
        extractedTexts.push({
          text,
          line: lineIndex + 1,
          context: line.trim(),
          file: fileName,
          category: 'jsx'
        });
      }
    }

    // Extract attributes
    ['title', 'placeholder', 'aria-label'].forEach(attr => {
      const attrRegex = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'gi');
      const attrMatches = line.matchAll(attrRegex);
      for (const match of attrMatches) {
        const text = match[1];
        if (shouldIncludeText(text)) {
          extractedTexts.push({
            text,
            line: lineIndex + 1,
            context: line.trim(),
            file: fileName,
            category: 'attribute'
          });
        }
      }
    });
  });

  return extractedTexts;
}

/**
 * Check if text should be included in extraction
 */
function shouldIncludeText(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  // Check against ignore patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(text)) return false;
  
  // Skip very short common words
  if (['ok', 'no', 'id', 'px', 'em'].includes(text.toLowerCase())) return false;
  
  return true;
}

/**
 * Check if line contains a translation function call
 */
function isTranslationCall(line: string): boolean {
  return line.includes('t(') || line.includes('t("') || line.includes("t('");
}

/**
 * Generate a translation key from text
 */
export function generateTranslationKey(text: string, category?: string): string {
  // Clean the text
  let key = text
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .split(' ')
    .filter(word => word.length > 0)
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Add category prefix if provided
  if (category) {
    key = `${category}${key.charAt(0).toUpperCase() + key.slice(1)}`;
  }

  return key;
}

/**
 * Analyze component file for missing translations
 */
export interface ComponentAnalysis {
  file: string;
  totalHardcodedStrings: number;
  extractedTexts: ExtractedText[];
  suggestedKeys: Array<{
    original: string;
    suggestedKey: string;
    line: number;
    context: string;
  }>;
}

export function analyzeComponentFile(
  fileContent: string, 
  fileName: string
): ComponentAnalysis {
  const extractedTexts = extractHardcodedText(fileContent, fileName);
  
  const suggestedKeys = extractedTexts.map(extracted => ({
    original: extracted.text,
    suggestedKey: generateTranslationKey(extracted.text),
    line: extracted.line,
    context: extracted.context
  }));

  return {
    file: fileName,
    totalHardcodedStrings: extractedTexts.length,
    extractedTexts,
    suggestedKeys
  };
}

/**
 * Priority components that need immediate attention
 */
export const PRIORITY_COMPONENTS = [
  'src/components/layout/NewLandingPage.tsx',
  'src/components/home/AuthDialog.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Practice.tsx',
  'src/pages/Settings.tsx',
  'src/components/layout/NewLayout.tsx',
  'src/pages/PronunciationPractice.tsx',
  'src/pages/VoiceChat.tsx',
] as const;

/**
 * Extract all missing translation keys from priority components
 */
export function extractMissingKeysFromComponents(componentAnalyses: ComponentAnalysis[]): string[] {
  const allKeys = new Set<string>();
  
  componentAnalyses.forEach(analysis => {
    analysis.suggestedKeys.forEach(suggestion => {
      allKeys.add(suggestion.suggestedKey);
    });
  });
  
  return Array.from(allKeys).sort();
}
