
import { supabase } from "@/integrations/supabase/client";

interface TranslationGeneratorOptions {
  sourceLanguage: string;
  targetLanguage: string;
  translations: Record<string, string>;
}

interface TranslationResult {
  success: boolean;
  translations?: Record<string, string>;
  error?: string;
}

/**
 * Uses AI to generate translations from a source language to a target language
 */
export async function generateTranslationsWithAI({
  sourceLanguage,
  targetLanguage,
  translations
}: TranslationGeneratorOptions): Promise<TranslationResult> {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-translations', {
      body: {
        sourceLanguage,
        targetLanguage,
        translations
      }
    });

    if (error) {
      console.error("Error generating translations:", error);
      return { 
        success: false, 
        error: error.message || "Failed to generate translations" 
      };
    }

    return data as TranslationResult;
  } catch (error) {
    console.error("Error in translation generation:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred while generating translations" 
    };
  }
}

/**
 * Helper function to format translations into TypeScript code
 */
export function formatTranslationsAsTypeScript(translations: Record<string, string>): string {
  const lines = Object.entries(translations).map(([key, value]) => {
    // Escape any quotes in the value
    const escapedValue = value.replace(/"/g, '\\"');
    return `  ${key}: "${escapedValue}",`;
  });

  return `
import { TranslationRecord } from "../types";

const translations: TranslationRecord = {
${lines.join('\n')}
};

export default translations;
`;
}
