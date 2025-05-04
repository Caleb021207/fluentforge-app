import { useState, useEffect, useCallback } from "react";
import { CacheType } from "@/types/cache";
import { useLocalization } from "@/hooks/useLocalization";
import { getLanguagePair } from "@/utils/languageUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TRANSLATION_REQUIRED_LANGUAGES } from "@/utils/languageConstants";

export const useTranslationHandler = () => {
  const { currentLanguage, t } = useLocalization();
  const { toast } = useToast();

  /**
   * Gets translation for a message using the Supabase edge function
   */
  const getTranslation = async (content: string, targetLanguage: string): Promise<string> => {
    if (!content || content.trim() === "") {
      return "";
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { 
          message: content,
          userLanguage: targetLanguage,
          requestType: 'translation'
        }
      });

      if (error) {
        console.error('Translation error:', error);
        toast({
          title: t("translationError"),
          description: t("failedToGetTranslation"),
          variant: "destructive",
        });
        return "";
      }

      return data?.translation || "";
    } catch (error) {
      console.error('Failed to get translation:', error);
      return "";
    }
  };

  /**
   * Special case for Hindi translations to ensure they use Devanagari script
   */
  const verifyHindiTranslation = async (translation: string, originalContent: string, userLanguage: string): Promise<string> => {
    if (userLanguage !== 'hindi') return translation;
    
    // Check if the translation contains Devanagari script (used in Hindi)
    const containsDevanagari = /[\u0900-\u097F]/.test(translation);
    
    if (!containsDevanagari && userLanguage === 'hindi') {
      console.log('Getting proper Hindi translation with Devanagari script');
      return await getTranslation(originalContent, 'hindi');
    }
    
    return translation;
  };
  
  /**
   * Special case for Farsi translations to ensure they use proper Farsi script
   */
  const verifyFarsiTranslation = async (translation: string, originalContent: string, userLanguage: string): Promise<string> => {
    if (userLanguage !== 'farsi') return translation;
    
    // Check if the translation contains Arabic script (used in Farsi)
    const containsFarsi = /[\u0600-\u06FF]/.test(translation);
    
    if (!containsFarsi && userLanguage === 'farsi') {
      console.log('Getting proper Farsi translation with Persian script');
      return await getTranslation(originalContent, 'farsi');
    }
    
    return translation;
  };

  /**
   * Special case for Bengali translations to ensure they use proper Bengali script
   */
  const verifyBengaliTranslation = async (translation: string, originalContent: string, userLanguage: string): Promise<string> => {
    if (userLanguage !== 'bengali') return translation;
    
    // Check if the translation contains Bengali script
    const containsBengali = /[\u0980-\u09FF]/.test(translation);
    
    if (!containsBengali && userLanguage === 'bengali') {
      console.log('Getting proper Bengali translation with Bengali script');
      return await getTranslation(originalContent, 'bengali');
    }
    
    return translation;
  };

  /**
   * Check if a translation is needed for the current language
   */
  const needsTranslation = (language: string): boolean => {
    return TRANSLATION_REQUIRED_LANGUAGES.includes(language.toLowerCase());
  };

  return {
    getTranslation,
    verifyHindiTranslation,
    verifyFarsiTranslation,
    verifyBengaliTranslation,
    needsTranslation
  };
};
