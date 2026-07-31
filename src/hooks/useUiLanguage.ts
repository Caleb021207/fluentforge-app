import { useMemo } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from "@/translations/constants";
import { SUPPORTED_LANGUAGES } from "@/translations/loader";

export interface UiLanguageOption {
  /** Pack code, e.g. "farsi". */
  code: string;
  /** Endonym shown to the learner, e.g. "فارسی". */
  nativeName: string;
  /** English name (derived from the code) for secondary display. */
  englishName: string;
}

const englishNameFor = (code: string): string => {
  // Pack codes are lowercased English language names ("spanish", "haitian").
  return code.charAt(0).toUpperCase() + code.slice(1);
};

/**
 * UI-language selection for the post-login switchers (Settings section and
 * the header globe menu). Options are every pack that is both listed in
 * AVAILABLE_LANGUAGES and actually loadable, English first, then sorted by
 * native name so learners scan a stable list.
 *
 * setUiLanguage delegates to LocalizationContext.setCurrentLanguage, which
 * persists the choice indefinitely on this device and syncs
 * profiles.native_language for signed-in learners.
 */
export function useUiLanguage() {
  const { currentLanguage, setCurrentLanguage } = useLocalization();

  const options = useMemo<UiLanguageOption[]>(() => {
    return Object.entries(AVAILABLE_LANGUAGES)
      .filter(([code]) => SUPPORTED_LANGUAGES.includes(code))
      .map(([code, nativeName]) => ({
        code,
        nativeName,
        englishName: englishNameFor(code),
      }))
      .sort((a, b) => {
        if (a.code === DEFAULT_LANGUAGE) return -1;
        if (b.code === DEFAULT_LANGUAGE) return 1;
        return a.nativeName.localeCompare(b.nativeName);
      });
  }, []);

  return {
    currentLanguage,
    setUiLanguage: setCurrentLanguage,
    options,
  };
}
