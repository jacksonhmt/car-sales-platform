import { Component, inject } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import { ThemeMode, ThemeService } from '../../services/theme.service';
import { Locale, TranslationKey } from '../../i18n';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18nService);

  protected readonly themeOptions: { value: ThemeMode; labelKey: TranslationKey }[] = [
    { value: 'light', labelKey: 'theme.light' },
    { value: 'dark', labelKey: 'theme.dark' },
    { value: 'auto', labelKey: 'theme.auto' },
  ];

  protected readonly languageOptions: { value: Locale; labelKey: TranslationKey }[] = [
    { value: 'pt-BR', labelKey: 'language.pt-BR' },
    { value: 'en-US', labelKey: 'language.en-US' },
  ];

  onThemeChange(event: Event): void {
    this.theme.setMode((event.target as HTMLSelectElement).value as ThemeMode);
  }

  onLanguageChange(event: Event): void {
    this.i18n.setLocale((event.target as HTMLSelectElement).value as Locale);
  }
}
