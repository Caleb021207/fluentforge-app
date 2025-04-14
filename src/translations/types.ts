
export type TranslationRecord = Record<string, string>;

export type TranslationKeys = Record<keyof typeof import('./english').default, string>;

export type LanguageTranslations = {
  [key: string]: TranslationRecord;
};
