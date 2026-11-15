import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CustomerService } from '../../../services/customer.service';
import { CustomerList } from './customer-list';

describe('CustomerList', () => {
  let fixture: ComponentFixture<CustomerList>;
  let service: { getCustomers: ReturnType<typeof vi.fn>; deleteCustomer: ReturnType<typeof vi.fn> };
  let urlSpy: ReturnType<typeof vi.spyOn>;

  const page = {
    success: true,
    message: 'ok',
    data: {
      content: [{ id: 1, fullName: 'Maria da Silva', email: 'maria@example.com', phoneNumber: '11999999999', birthDate: '1990-05-20' }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1
    }
  };

  beforeEach(async () => {
    service = {
      getCustomers: vi.fn().mockReturnValue(of(page)),
      deleteCustomer: vi.fn().mockReturnValue(of({ success: true, message: 'Deleted.' }))
    };

    await TestBed.configureTestingModule({
      imports: [CustomerList],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CustomerService, useValue: service }
      ]
    }).compileComponents();

    // The table only loads on the list route, so pretend the user is on /customers.
    urlSpy = vi.spyOn(TestBed.inject(Router), 'url', 'get').mockReturnValue('/customers');

    fixture = TestBed.createComponent(CustomerList);
    fixture.detectChanges();
  });

  it('should show only the name and formatted phone of each customer', () => {
    const cells: HTMLTableCellElement[] = Array.from(fixture.nativeElement.querySelectorAll('tbody tr td'));
    expect(cells[0].textContent?.trim()).toBe('Maria da Silva');
    expect(cells[1].textContent?.trim()).toBe('(11) 99999-9999');
  });

  it('should open the modal for a child route without reloading the table', () => {
    // The test DOM does not implement the native dialog modal API.
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.showModal = showModal;

    urlSpy.mockReturnValue('/customers/new');
    const modalFixture = TestBed.createComponent(CustomerList);
    modalFixture.detectChanges();

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(modalFixture.nativeElement.querySelector('dialog').hasAttribute('open')).toBe(true);
    expect(service.getCustomers).toHaveBeenCalledTimes(1);
  });

  it('should delete a customer after confirmation and reload the list', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.deleteCustomer(page.data.content[0]);

    expect(service.deleteCustomer).toHaveBeenCalledWith(1);
    expect(service.getCustomers).toHaveBeenCalledTimes(2);
  });
});
