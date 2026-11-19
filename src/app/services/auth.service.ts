import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

// Temporary hardcoded credentials until the backend authentication is ready.
const VALID_USERNAME = 'jacksonhmt';
const VALID_PASSWORD = 'car123';

const STORAGE_KEY = 'auth-session';
const SESSION_DURATION_MS = 60 * 60 * 1000;

interface AuthSession {
  username: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly loggedIn = signal(this.hasValidSession());

  readonly isAuthenticated = this.loggedIn.asReadonly();

  constructor() {
    // Another tab changed the session: a removed session logs this tab out too.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === null) {
        this.loggedIn.set(false);
        this.router.navigate(['/login']);
      } else {
        this.loggedIn.set(this.hasValidSession());
      }
    };
    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }

  login(username: string, password: string): boolean {
    if (username.trim() !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return false;
    }

    const session: AuthSession = {
      username: VALID_USERNAME,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.loggedIn.set(true);
    return true;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }

  hasValidSession(): boolean {
    const session = this.readSession();
    if (!session) return false;

    if (session.expiresAt <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      this.loggedIn.set(false);
      return false;
    }
    return true;
  }

  private readSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as Partial<AuthSession>;
      return typeof session.expiresAt === 'number' && typeof session.username === 'string'
        ? (session as AuthSession)
        : null;
    } catch {
      return null;
    }
  }
}
