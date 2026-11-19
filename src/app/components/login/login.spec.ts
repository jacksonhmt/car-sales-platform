import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('does not submit when fields are empty', () => {
    component.onSubmit();

    expect(component.form.invalid).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('shows an error for invalid credentials', () => {
    component.form.setValue({ username: 'jacksonhmt', password: 'wrong' });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Usuário ou senha inválidos.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('navigates to the dashboard for valid credentials', () => {
    component.form.setValue({ username: 'jacksonhmt', password: 'car123' });

    component.onSubmit();

    expect(component.errorMessage()).toBe('');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});

describe('Login return URL', () => {
  async function submitValidLoginWithReturnUrl(returnUrl: string | null) {
    localStorage.clear();
    const queryParams = returnUrl === null ? {} : { returnUrl };
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.form.setValue({ username: 'jacksonhmt', password: 'car123' });
    fixture.componentInstance.onSubmit();
    return navigateSpy;
  }

  it('returns to the page the user tried to open', async () => {
    const navigateSpy = await submitValidLoginWithReturnUrl('/customers/1/edit');

    expect(navigateSpy).toHaveBeenCalledWith('/customers/1/edit');
  });

  it('ignores external return URLs', async () => {
    const navigateSpy = await submitValidLoginWithReturnUrl('//evil.example');

    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });
});
