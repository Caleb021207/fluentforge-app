
export type TranslationRecord = Record<string, string>;

export type TranslationKeys = Record<keyof typeof import('./english').default, string>;
