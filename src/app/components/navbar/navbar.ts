import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeMode, ThemeService } from '../../services/theme.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly theme = inject(ThemeService);
  protected readonly themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: 'bi-sun-fill' },
    { value: 'dark', label: 'Dark', icon: 'bi-moon-stars-fill' },
    { value: 'auto', label: 'Auto', icon: 'bi-circle-half' },
  ];
  protected readonly currentTheme = computed(
    () => this.themeOptions.find((option) => option.value === this.theme.mode()) ?? this.themeOptions[2],
  );
}
