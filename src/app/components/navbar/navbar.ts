import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeMode, ThemeService } from '../../services/theme.service';
import { I18nService } from '../../services/i18n.service';
import { TranslationKey } from '../../i18n';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  protected readonly themeOptions: { value: ThemeMode; labelKey: TranslationKey; icon: string }[] = [
    { value: 'light', labelKey: 'theme.light', icon: 'bi-sun-fill' },
    { value: 'dark', labelKey: 'theme.dark', icon: 'bi-moon-stars-fill' },
    { value: 'auto', labelKey: 'theme.auto', icon: 'bi-circle-half' },
  ];
  protected readonly currentTheme = computed(
    () => this.themeOptions.find((option) => option.value === this.theme.mode()) ?? this.themeOptions[2],
  );
}
