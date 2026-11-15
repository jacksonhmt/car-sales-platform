import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the total number of registered customers', () => {
    fixture.detectChanges();
    httpMock.expectOne(req => req.url === '/api/v1/customers').flush({
      success: true,
      message: 'Clientes consultados com sucesso.',
      data: { content: [], page: 0, size: 1, totalElements: 7, totalPages: 7 },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.display-5')?.textContent).toContain('7');
  });
});
