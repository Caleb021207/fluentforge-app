
export type TranslationRecord = Record<string, string>;

export type TranslationModule = 
  | "common"
  | "auth"
  | "dashboard"
  | "practice"
  | "voice-chat"
  | "premium-voice"
  | "pro-voice"
  | "ui-elements"
  | "settings"
  | "lessons"
  | "certifications"
  | "errors"
  | "profile";

export type LanguageTranslations = {
  [key: string]: TranslationRecord | Record<TranslationModule, TranslationRecord>;
};
