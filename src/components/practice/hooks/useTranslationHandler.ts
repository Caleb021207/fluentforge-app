
import { useTranslationHandler as useRefactoredTranslationHandler } from "./translation";
import type { TranslationType } from "./translation/types";

// This is a wrapper around the refactored useTranslationHandler to maintain compatibility
export const useTranslationHandler = () => {
  return useRefactoredTranslationHandler();
};

export type { TranslationType };
