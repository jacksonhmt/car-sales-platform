import { enUS } from './locales/en-US';
import { ptBR } from './locales/pt-BR';
import type { Locale, TranslationDictionary } from './i18n.types';

export const TRANSLATIONS: Record<Locale, TranslationDictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

export type { Locale, TranslationDictionary, TranslationKey } from './i18n.types';
