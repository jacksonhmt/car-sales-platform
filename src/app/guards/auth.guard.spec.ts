import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard, guestGuard } from './auth.guard';

describe('route guards', () => {
  const route = {} as ActivatedRouteSnapshot;
  const stateFor = (url: string) => ({ url }) as RouterStateSnapshot;
  let router: Router;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService);
  });

  it('authGuard redirects to login with the requested URL when there is no session', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(route, stateFor('/customers/1/edit')));

    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fcustomers%2F1%2Fedit');
  });

  it('authGuard allows navigation with a valid session', () => {
    auth.login('jacksonhmt', 'car123');

    const result = TestBed.runInInjectionContext(() => authGuard(route, stateFor('/dashboard')));

    expect(result).toBe(true);
  });

  it('guestGuard redirects logged-in users away from login', () => {
    auth.login('jacksonhmt', 'car123');

    const result = TestBed.runInInjectionContext(() => guestGuard(route, stateFor('/login')));

    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });
});
