import { Injectable, signal } from '@angular/core';
import { TRANSLATIONS, type Locale, type TranslationKey } from '../i18n';

const STORAGE_KEY = 'app-locale';
const DEFAULT_LOCALE: Locale = 'pt-BR';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<Locale>(this.readStoredLocale());

  constructor() {
    this.applyLocale();
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
    localStorage.setItem(STORAGE_KEY, locale);
    this.applyLocale();
  }

  // Reads the locale signal, so templates and computed values update when the language changes.
  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const template = TRANSLATIONS[this.locale()][key];
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      params && name in params ? String(params[name]) : match
    );
  }

  private applyLocale(): void {
    document.documentElement.lang = this.locale();
    document.title = this.t('app.title');
  }

  private readStoredLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'pt-BR' || stored === 'en-US' ? stored : DEFAULT_LOCALE;
  }
}
