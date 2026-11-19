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

  protected readonly themeOptions: { value: ThemeMode; labelKey: TranslationKey; icon: string }[] = [
    { value: 'light', labelKey: 'theme.light', icon: 'bi-sun-fill' },
    { value: 'dark', labelKey: 'theme.dark', icon: 'bi-moon-stars-fill' },
    { value: 'auto', labelKey: 'theme.auto', icon: 'bi-circle-half' },
  ];

  protected readonly languageOptions: { value: Locale; labelKey: TranslationKey; icon: string }[] = [
    { value: 'pt-BR', labelKey: 'language.pt-BR', icon: 'bi-globe2' },
    { value: 'en-US', labelKey: 'language.en-US', icon: 'bi-globe2' },
  ];

  onThemeChange(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }

  onLanguageChange(locale: Locale): void {
    this.i18n.setLocale(locale);
  }
}
