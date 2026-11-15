import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let systemDark: boolean;

  beforeEach(() => {
    localStorage.clear();
    systemDark = false;
    window.matchMedia = vi.fn().mockImplementation(() => ({
      get matches() {
        return systemDark;
      },
      addEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  it('should follow the system preference in auto mode', () => {
    systemDark = true;
    TestBed.inject(ThemeService);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('should apply and persist an explicit mode regardless of the system preference', () => {
    systemDark = true;
    const service = TestBed.inject(ThemeService);
    service.setMode('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    expect(localStorage.getItem('theme-mode')).toBe('light');
  });
});
