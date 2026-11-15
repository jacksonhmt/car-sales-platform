import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'theme-mode';
const DARK_QUERY = '(prefers-color-scheme: dark)';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.readStoredMode());

  private readonly media: MediaQueryList | null =
    typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
  private systemDark = this.media?.matches ?? false;

  constructor() {
    this.media?.addEventListener('change', (event) => {
      this.systemDark = event.matches;
      this.applyTheme();
    });
    this.applyTheme();
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    this.applyTheme();
  }

  private applyTheme(): void {
    const mode = this.mode();
    const resolved = mode === 'auto' ? (this.systemDark ? 'dark' : 'light') : mode;
    document.documentElement.setAttribute('data-bs-theme', resolved);
  }

  private readStoredMode(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto';
  }
}
