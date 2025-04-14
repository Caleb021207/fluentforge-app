export type TranslationRecord = Record<string, string>;

export type TranslationKeys = Record<keyof typeof import('./english').default, string>;

export type LanguageTranslations = {
  [key: string]: TranslationRecord;
};

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
