
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { eagerTranslations, loadLanguage, SUPPORTED_LANGUAGES } from "@/translations/loader";
import type { TranslationRecord } from "@/translations/types";
import { DEFAULT_LANGUAGE, AVAILABLE_LANGUAGES } from "@/translations/constants";
import {
  resolveInitialLanguage,
  UI_LANGUAGE_STORAGE_KEY,
  UI_LANGUAGE_SOURCE_STORAGE_KEY,
  UI_LANGUAGE_EXPIRY_STORAGE_KEY,
  type UiLanguageSource,
} from "@/translations/uiLanguage";
import { getNativeLanguageDisplayName } from "@/utils/languageUtils";
import { appStorage } from "@/utils/security/storage";
import { supabase } from "@/integrations/supabase/client";

// Create context
type LocalizationContextType = {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  getNativeLanguageName: (language: string) => string;
};

const LocalizationContext = createContext<LocalizationContextType>({
  currentLanguage: DEFAULT_LANGUAGE,
  setCurrentLanguage: () => {},
  t: () => "",
  getNativeLanguageName: () => "",
});

// Teacher-facing classroom management stays English (the dashboard is only
// authored in English); student-facing pages always honor the learner's L1.
const isClassroomRoute = (path: string): boolean => {
  return path.startsWith("/teacher");
};

// ---------------------------------------------------------------------------
// Persistence. The language preference persists indefinitely. The legacy
// secureStorage wrapper wrote a 7-day `nativeLanguage_expires` sidecar that
// silently reverted learners to English; appStorage no longer honors it, and
// we remove any stale sidecar so nothing else ever can.
// ---------------------------------------------------------------------------

const readStoredLanguage = (): { language: string | null; source: string | null } => {
  appStorage.remove(UI_LANGUAGE_EXPIRY_STORAGE_KEY);
  return {
    language: appStorage.get(UI_LANGUAGE_STORAGE_KEY),
    source: appStorage.get(UI_LANGUAGE_SOURCE_STORAGE_KEY),
  };
};

const persistLanguage = (language: string, source: UiLanguageSource): void => {
  appStorage.set(UI_LANGUAGE_STORAGE_KEY, language);
  appStorage.set(UI_LANGUAGE_SOURCE_STORAGE_KEY, source);
};

const resolveBootLanguage = (): string => {
  const stored = readStoredLanguage();
  return resolveInitialLanguage({
    storedLanguage: stored.language,
    storedSource: stored.source,
    browserLanguages: typeof navigator !== "undefined" ? navigator.languages : undefined,
    supported: SUPPORTED_LANGUAGES,
  }).language;
};

// Provider component
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguageState] = useState(resolveBootLanguage);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  // Translations are loaded on demand. English is always present as a fallback;
  // other languages are merged in once their chunk finishes loading.
  const [translations, setTranslations] = useState<Record<string, TranslationRecord>>(
    eagerTranslations,
  );
  // Missing-key dedupe for console warnings. A ref, not state: t() runs
  // during render, and setState from a render path risks render loops.
  const missingKeysRef = useRef<Set<string>>(new Set());
  const userIdRef = useRef<string | null>(null);
  const currentLanguageRef = useRef(currentLanguage);
  currentLanguageRef.current = currentLanguage;

  // Update path when it changes
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', updatePath);

    return () => {
      window.removeEventListener('popstate', updatePath);
    };
  }, []);

  // Server-authoritative L1: once a session exists, read
  // profiles.native_language and adopt it — unless the learner explicitly
  // chose a language on this device (stored source "user"), which wins here
  // and was synced back to the profile when it was chosen.
  useEffect(() => {
    let cancelled = false;
    const adoptedForUser = new Set<string>();

    const adoptProfileLanguage = async (userId: string) => {
      if (adoptedForUser.has(userId)) return;
      adoptedForUser.add(userId);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("native_language")
          .eq("id", userId)
          .maybeSingle();
        if (cancelled || error || !data?.native_language) return;

        const stored = readStoredLanguage();
        const resolved = resolveInitialLanguage({
          profileLanguage: data.native_language,
          storedLanguage: stored.language,
          storedSource: stored.source,
          browserLanguages: navigator.languages,
          supported: SUPPORTED_LANGUAGES,
        });
        if (resolved.source === "profile") {
          persistLanguage(resolved.language, "profile");
          if (resolved.language !== currentLanguageRef.current) {
            setCurrentLanguageState(resolved.language);
          }
        }
      } catch (err) {
        console.warn("Could not adopt profile language", err);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      userIdRef.current = session?.user?.id ?? null;
      if (session?.user) {
        const userId = session.user.id;
        // Deferred with setTimeout: Supabase advises against issuing its own
        // calls synchronously inside the onAuthStateChange callback.
        setTimeout(() => {
          if (!cancelled) void adoptProfileLanguage(userId);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session?.user) return;
      userIdRef.current = session.user.id;
      void adoptProfileLanguage(session.user.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Load the active language's translation chunk if we don't have it yet.
  useEffect(() => {
    if (translations[currentLanguage]) return;

    let cancelled = false;
    loadLanguage(currentLanguage).then((loaded) => {
      if (!cancelled && loaded) {
        setTranslations((prev) => ({ ...prev, [currentLanguage]: loaded }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentLanguage, translations]);

  // Explicit language change (landing page, Settings, header switcher).
  // Persists indefinitely as a device-level choice and — for signed-in
  // learners — syncs profiles.native_language (fire-and-forget; it is a
  // self-owned column).
  const setCurrentLanguage = (lang: string): void => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Ignoring unsupported UI language "${lang}"`);
      return;
    }
    setCurrentLanguageState(lang);
    persistLanguage(lang, "user");

    const userId = userIdRef.current;
    if (userId) {
      supabase
        .from("profiles")
        .update({ native_language: lang })
        .eq("id", userId)
        .then(({ error }) => {
          if (error) {
            console.warn("Could not sync native_language to profile", error);
          }
        });
    }
  };

  // Enhanced translation function with proper interpolation support
  const t = (key: string, replacements?: Record<string, string>): string => {
    try {
      // Check if translations exist
      if (!translations) {
        console.error("No translations available");
        return key;
      }

      // Always use English translations for classroom routes
      const isClassroom = isClassroomRoute(currentPath);
      const languageToUse = isClassroom ? DEFAULT_LANGUAGE : currentLanguage;

      // Check if selected language exists
      const selectedTranslations = translations[languageToUse];
      const defaultTranslations = translations[DEFAULT_LANGUAGE];

      if (!selectedTranslations) {
        console.error(`No translations for language: ${languageToUse}`);
        return String(defaultTranslations?.[key]) || key;
      }

      // Get translation for selected language or fallback to default
      let translationValue: string = "";

      // Handle nested objects in translations (e.g., suggestedTopics.introductions)
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        const parentObject = selectedTranslations[parentKey];

        if (parentObject && typeof parentObject === 'object' && !Array.isArray(parentObject)) {
          const nestedValue = (parentObject as Record<string, any>)[childKey];
          translationValue = typeof nestedValue === 'string' ? nestedValue : String(key);
        }
      } else {
        const value = selectedTranslations[key];
        translationValue = typeof value === 'string' ? value :
                           (value !== undefined ? String(value) : "");
      }

      // Fallback to default language if not found or not a string
      if (translationValue === "" && defaultTranslations) {
        if (key.includes('.')) {
          const [parentKey, childKey] = key.split('.');
          const parentObject = defaultTranslations[parentKey];

          if (parentObject && typeof parentObject === 'object' && !Array.isArray(parentObject)) {
            const nestedValue = (parentObject as Record<string, any>)[childKey];
            translationValue = typeof nestedValue === 'string' ? nestedValue : String(key);
          }
        } else {
          const value = defaultTranslations[key];
          translationValue = typeof value === 'string' ? value :
                             (value !== undefined ? String(value) : key);
        }

        if (translationValue !== key) {
          if (!missingKeysRef.current.has(key)) {
            console.warn(`Missing translation for key "${key}" in language "${languageToUse}"`);
            missingKeysRef.current.add(key);
          }
        }
      }

      // If translation is missing in both languages, return the key
      if (translationValue === "") {
        if (!missingKeysRef.current.has(key)) {
          console.error(`Translation key not found: "${key}" in any language`);
          missingKeysRef.current.add(key);
        }
        return key;
      }

      // Enhanced replacement logic with proper interpolation support
      if (replacements && translationValue) {
        let result = translationValue;
        Object.entries(replacements).forEach(([placeholder, replaceValue]) => {
          // Support {{placeholder}} format (primary)
          const regex = new RegExp(`{{${placeholder}}}`, 'g');
          result = result.replace(regex, replaceValue);

          // Also support {placeholder} format (fallback)
          const simpleRegex = new RegExp(`{${placeholder}}`, 'g');
          result = result.replace(simpleRegex, replaceValue);
        });
        return result;
      }

      return translationValue;
    } catch (error) {
      console.error("Translation error:", error);
      return key;
    }
  };

  // Get native language name
  const getNativeLanguageName = (language: string): string => {
    return getNativeLanguageDisplayName(language);
  };

  return (
    <LocalizationContext.Provider value={{
      currentLanguage,
      setCurrentLanguage,
      t,
      getNativeLanguageName
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook for using the localization context
export const useLocalization = () => {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }

  return context;
};

// Re-export from translations module for easy access
export { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE };
