import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'auth-session';
const ONE_HOUR_MS = 60 * 60 * 1000;

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects invalid credentials', () => {
    expect(service.login('jacksonhmt', 'wrong')).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('stores a session that lasts one hour', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000);

    expect(service.login(' jacksonhmt ', 'car123')).toBe(true);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).expiresAt).toBe(1_000_000 + ONE_HOUR_MS);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('treats the session as expired after one hour and removes it', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
    service.login('jacksonhmt', 'car123');

    now.mockReturnValue(1_000_000 + ONE_HOUR_MS);

    expect(service.hasValidSession()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('clears the session on logout and redirects to login', () => {
    service.login('jacksonhmt', 'car123');

    service.logout();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('logs out when another tab removes the session', () => {
    service.login('jacksonhmt', 'car123');

    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: null }));

    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
