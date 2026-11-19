import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to pt-BR when no locale is stored', () => {
    const service = TestBed.inject(I18nService);
    expect(service.locale()).toBe('pt-BR');
    expect(service.t('nav.customers')).toBe('Clientes');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('switches translations, persists the locale and updates the html lang', () => {
    const service = TestBed.inject(I18nService);
    service.setLocale('en-US');

    expect(service.t('nav.customers')).toBe('Customers');
    expect(localStorage.getItem('app-locale')).toBe('en-US');
    expect(document.documentElement.lang).toBe('en-US');
  });

  it('interpolates named parameters', () => {
    const service = TestBed.inject(I18nService);
    service.setLocale('en-US');

    expect(service.t('customers.pageOf', { page: 2, total: 5 })).toBe('Page 2 of 5');
  });
});
