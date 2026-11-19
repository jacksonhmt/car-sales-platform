import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { I18nService } from '../services/i18n.service';
import { localeInterceptor } from './locale.interceptor';

describe('localeInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([localeInterceptor])), provideHttpClientTesting()],
    });
  });

  it('sends the current locale in the Accept-Language header', () => {
    TestBed.inject(I18nService).setLocale('en-US');
    TestBed.inject(HttpClient).get('/api/customers').subscribe();

    const request = TestBed.inject(HttpTestingController).expectOne('/api/customers');
    expect(request.request.headers.get('Accept-Language')).toBe('en-US');
    request.flush({});
  });
});
