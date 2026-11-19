import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Navbar } from './navbar';
import { environment } from '../../../environments/environment';
import { Customer } from '../../models/customer';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let httpMock: HttpTestingController;

  const customers: Customer[] = [
    { id: '1', fullName: 'Ana Silva', cpf: '123.456.789-00', email: 'ana@example.com', phoneNumber: '', birthDate: '', address: { city: 'Curitiba', state: 'PR', zipCode: '', street: '', number: '', neighborhood: '' } },
    { id: '2', fullName: 'Bruno Costa', cpf: '987.654.321-00', email: 'bruno@example.com', phoneNumber: '', birthDate: '' },
  ];

  const typeInSearch = (value: string) => {
    const input = fixture.nativeElement.querySelector('#navbar-search-input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not request customers before three characters', () => {
    typeInSearch('an');

    httpMock.verify();
  });

  it('should search customers by name', () => {
    typeInSearch('ana');
    httpMock.expectOne((request) => request.url === environment.apiBaseUrl).flush({
      success: true,
      data: { content: customers, page: 0, size: 100, totalElements: 2, totalPages: 1 },
    });
    fixture.detectChanges();

    const results = fixture.nativeElement.querySelectorAll('#navbar-search-results a') as NodeListOf<HTMLElement>;
    expect(results.length).toBe(1);
    expect(results[0].textContent).toContain('Ana Silva');
    expect(results[0].textContent).toContain('Curitiba - PR');
  });

  it('should search customers by unformatted CPF', () => {
    typeInSearch('98765');
    httpMock.expectOne((request) => request.url === environment.apiBaseUrl).flush({
      success: true,
      data: { content: customers, page: 0, size: 100, totalElements: 2, totalPages: 1 },
    });
    fixture.detectChanges();

    const results = fixture.nativeElement.querySelectorAll('#navbar-search-results a') as NodeListOf<HTMLElement>;
    expect(results.length).toBe(1);
    expect(results[0].textContent).toContain('Bruno Costa');
  });
});
