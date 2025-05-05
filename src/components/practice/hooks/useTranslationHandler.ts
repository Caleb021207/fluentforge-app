
import { useTranslationHandler as useRefactoredTranslationHandler } from "./translation";

export type { TranslationType } from "./translation";

// This is a wrapper around the refactored useTranslationHandler to maintain compatibility
export const useTranslationHandler = () => {
  return useRefactoredTranslationHandler();
};
