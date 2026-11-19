import type { enUS } from './locales/en-US';

export type Locale = 'pt-BR' | 'en-US';

// en-US is the source of truth: its keys define every valid translation key.
export type TranslationKey = keyof typeof enUS;

export type TranslationDictionary = Record<TranslationKey, string>;
