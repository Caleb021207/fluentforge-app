
import { TRANSLATION_REQUIRED_LANGUAGES } from "@/utils/languageConstants";
import { useLocalization } from "@/context/LocalizationContext";
import { useToast } from "@/hooks/use-toast";
import { TranslationType } from "./types";
import { extractStringFromTranslation } from "./translationUtils";
import { verifyHindiTranslation, verifyFarsiTranslation, verifyBengaliTranslation, verifyTagalogTranslation } from "./languageVerifiers";
import { getTranslation, useTranslationService } from "./useTranslationService";

export const useTranslationHandler = () => {
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();
  const { requestTranslation } = useTranslationService();

  /**
   * Check if a translation is needed for the current language
   */
  const needsTranslation = (language: string): boolean => {
    return TRANSLATION_REQUIRED_LANGUAGES.includes(language.toLowerCase());
  };

  return {
    getTranslation: (content: string, targetLanguage: string) => getTranslation(content, targetLanguage),
    verifyHindiTranslation,
    verifyFarsiTranslation,
    verifyBengaliTranslation,
    verifyTagalogTranslation,
    needsTranslation,
    extractStringFromTranslation
  };
};

export type { TranslationType };
export { extractStringFromTranslation };
