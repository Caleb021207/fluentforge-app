
export type TranslationType = string | Record<string, unknown>;

/**
 * Interface for the suggested response categories
 */
export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}
