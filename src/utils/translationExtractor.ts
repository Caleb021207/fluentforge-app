
import fs from 'fs';
import path from 'path';

interface HardcodedString {
  file: string;
  line: number;
  content: string;
  context: string;
}

interface ExtractionReport {
  totalFiles: number;
  filesWithHardcodedStrings: number;
  totalHardcodedStrings: number;
  stringsByCategory: Record<string, HardcodedString[]>;
  recommendations: string[];
}

/**
 * Extracts hardcoded strings from React components
 * Looks for patterns like:
 * - "hardcoded text" or 'hardcoded text' in JSX
 * - placeholder="hardcoded"
 * - title="hardcoded"
 * - aria-label="hardcoded"
 * But excludes:
 * - t("translation.key")
 * - className strings
 * - import statements
 * - console.log statements
 */
export class TranslationExtractor {
  private srcPath: string;
  private exclusionPatterns: RegExp[];
  
  constructor(srcPath: string = './src') {
    this.srcPath = srcPath;
    this.exclusionPatterns = [
      /t\(["`'].*["`']\)/, // t() calls
      /className=["`'].*["`']/, // className props
      /import.*from/, // import statements
      /console\.(log|error|warn)/, // console statements
      /\/\/.*/, // comments
      /\/\*.*\*\//, // block comments
      /\w+\.\w+/, // object.property (likely not user-facing)
      /^[\d\s\-\+\*\/\(\)]+$/, // mathematical expressions
      /^[A-Z_]+$/, // constants
      /^[\w\-\.\/]+\.(js|ts|tsx|css|scss|json)$/, // file paths
      /^#[0-9a-fA-F]{3,6}$/, // hex colors
      /^rgb\(.*\)$/, // rgb colors
      /^url\(.*\)$/, // URLs
      /^data:.*/, // data URLs
      /^https?:\/\//, // HTTP URLs
      /^\w+Icon$/, // Icon component names
      /^[a-z]+(-[a-z]+)*$/, // kebab-case (likely CSS classes)
    ];
  }
  
  /**
   * Scans all TypeScript/React files for hardcoded strings
   */
  public extractHardcodedStrings(): ExtractionReport {
    const results: HardcodedString[] = [];
    const allFiles = this.getAllFiles(this.srcPath, ['.tsx', '.ts']);
    
    for (const filePath of allFiles) {
      const fileResults = this.scanFile(filePath);
      results.push(...fileResults);
    }
    
    return this.generateReport(results, allFiles.length);
  }
  
  private getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
          files.push(...this.getAllFiles(itemPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(itemPath);
      }
    }
    
    return files;
  }
  
  private scanFile(filePath: string): HardcodedString[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const results: HardcodedString[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hardcodedStrings = this.extractStringsFromLine(line, i + 1, filePath);
      results.push(...hardcodedStrings);
    }
    
    return results;
  }
  
  private extractStringsFromLine(line: string, lineNumber: number, filePath: string): HardcodedString[] {
    const results: HardcodedString[] = [];
    
    // Regex to match strings in quotes (but not in t() calls)
    const stringPatterns = [
      /"([^"\\]|\\.)+"/g, // Double quoted strings
      /'([^'\\]|\\.)+'/g, // Single quoted strings
      /`([^`\\]|\\.)+`/g, // Template literals
    ];
    
    for (const pattern of stringPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const fullMatch = match[0];
        const stringContent = fullMatch.slice(1, -1); // Remove quotes
        
        // Skip if it matches any exclusion pattern
        if (this.shouldExcludeString(stringContent, line)) {
          continue;
        }
        
        // Only include strings that look like user-facing text
        if (this.isUserFacingString(stringContent)) {
          results.push({
            file: filePath,
            line: lineNumber,
            content: stringContent,
            context: line.trim()
          });
        }
      }
    }
    
    return results;
  }
  
  private shouldExcludeString(content: string, fullLine: string): boolean {
    // Check if the string or its context matches exclusion patterns
    return this.exclusionPatterns.some(pattern => 
      pattern.test(content) || pattern.test(fullLine)
    );
  }
  
  private isUserFacingString(content: string): boolean {
    // Criteria for user-facing strings
    const minLength = 3;
    const hasLetters = /[a-zA-Z]/.test(content);
    const hasSpaces = /\s/.test(content);
    const isNotEmpty = content.trim().length >= minLength;
    const isNotJustSymbols = !/^[\s\-_\.\/\\#@$%^&*()+=\[\]{}|;:,<>?~`]+$/.test(content);
    
    // Likely user-facing if it contains letters and is reasonably long
    return isNotEmpty && hasLetters && isNotJustSymbols && (hasSpaces || content.length > 8);
  }
  
  private generateReport(results: HardcodedString[], totalFiles: number): ExtractionReport {
    const stringsByCategory: Record<string, HardcodedString[]> = {
      'Components': [],
      'Pages': [],
      'Utils': [],
      'Hooks': [],
      'Other': []
    };
    
    // Categorize strings by file path
    for (const result of results) {
      if (result.file.includes('/components/')) {
        stringsByCategory['Components'].push(result);
      } else if (result.file.includes('/pages/')) {
        stringsByCategory['Pages'].push(result);
      } else if (result.file.includes('/utils/')) {
        stringsByCategory['Utils'].push(result);
      } else if (result.file.includes('/hooks/')) {
        stringsByCategory['Hooks'].push(result);
      } else {
        stringsByCategory['Other'].push(result);
      }
    }
    
    const filesWithStrings = new Set(results.map(r => r.file)).size;
    
    const recommendations = this.generateRecommendations(stringsByCategory);
    
    return {
      totalFiles,
      filesWithHardcodedStrings: filesWithStrings,
      totalHardcodedStrings: results.length,
      stringsByCategory,
      recommendations
    };
  }
  
  private generateRecommendations(stringsByCategory: Record<string, HardcodedString[]>): string[] {
    const recommendations: string[] = [];
    
    Object.entries(stringsByCategory).forEach(([category, strings]) => {
      if (strings.length > 0) {
        recommendations.push(`${category}: ${strings.length} hardcoded strings found`);
        
        // Show top 3 files with most hardcoded strings in each category
        const fileGroups = strings.reduce((acc, str) => {
          acc[str.file] = (acc[str.file] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const topFiles = Object.entries(fileGroups)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3);
        
        topFiles.forEach(([file, count]) => {
          recommendations.push(`  - ${file}: ${count} strings`);
        });
      }
    });
    
    return recommendations;
  }
  
  /**
   * Generates translation keys from hardcoded strings
   */
  public generateTranslationKeys(strings: HardcodedString[]): Record<string, string> {
    const keys: Record<string, string> = {};
    
    strings.forEach((str, index) => {
      const key = this.generateKeyFromString(str.content, index);
      keys[key] = str.content;
    });
    
    return keys;
  }
  
  private generateKeyFromString(content: string, fallbackIndex: number): string {
    // Convert content to camelCase key
    let key = content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    // Ensure key is not empty and not too long
    if (!key || key.length < 2) {
      key = `hardcodedString${fallbackIndex}`;
    } else if (key.length > 50) {
      key = key.substring(0, 47) + '...';
    }
    
    return key;
  }
}

// CLI usage
if (require.main === module) {
  const extractor = new TranslationExtractor();
  const report = extractor.extractHardcodedStrings();
  
  console.log('=== Translation Extraction Report ===');
  console.log(`Total files scanned: ${report.totalFiles}`);
  console.log(`Files with hardcoded strings: ${report.filesWithHardcodedStrings}`);
  console.log(`Total hardcoded strings: ${report.totalHardcodedStrings}`);
  console.log('\n=== By Category ===');
  
  Object.entries(report.stringsByCategory).forEach(([category, strings]) => {
    if (strings.length > 0) {
      console.log(`\n${category}: ${strings.length} strings`);
      strings.slice(0, 5).forEach(str => {
        console.log(`  ${str.file}:${str.line} - "${str.content}"`);
      });
      if (strings.length > 5) {
        console.log(`  ... and ${strings.length - 5} more`);
      }
    }
  });
  
  console.log('\n=== Recommendations ===');
  report.recommendations.forEach(rec => console.log(rec));
}

export default TranslationExtractor;
