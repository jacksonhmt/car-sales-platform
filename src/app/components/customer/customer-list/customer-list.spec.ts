import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CustomerService } from '../../../services/customer.service';
import { CustomerList } from './customer-list';

describe('CustomerList', () => {
  const customerId = (index: number) => `00000000-0000-4000-8000-${index.toString(16).padStart(12, '0')}`;
  let fixture: ComponentFixture<CustomerList>;
  let service: { getCustomers: ReturnType<typeof vi.fn>; deleteCustomer: ReturnType<typeof vi.fn> };
  let urlSpy: ReturnType<typeof vi.spyOn>;

  const page = {
    success: true,
    message: 'ok',
    data: {
      content: [{ id: customerId(1), fullName: 'Maria da Silva', email: 'maria@example.com', phoneNumber: '11999999999', birthDate: '1990-05-20' }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1
    }
  };

  beforeEach(async () => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    });
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

  it('shows the name, unavailable CPF, email and formatted phone of each customer', () => {
    const cells: HTMLTableCellElement[] = Array.from(fixture.nativeElement.querySelectorAll('tbody tr td'));
    expect(cells[0].textContent?.trim()).toBe('Maria da Silva');
    expect(cells[1].textContent?.trim()).toBe('Unavailable');
    expect(cells[2].textContent?.trim()).toBe('maria@example.com');
    expect(cells[3].textContent?.trim()).toBe('(11) 99999-9999');
  });

  it('masks CPF values in either API format and does not expose malformed values', () => {
    const customer = page.data.content[0];
    fixture.componentInstance.customers.set([
      { ...customer, id: customerId(1), cpf: '12345678909' },
      { ...customer, id: customerId(2), cpf: '123.456.789-09' },
      { ...customer, id: customerId(3), cpf: '123456789' }
    ]);
    fixture.detectChanges();

    const rows: HTMLTableRowElement[] = Array.from(fixture.nativeElement.querySelectorAll('tbody .customer-row'));
    expect(rows.map((row) => row.cells[1].textContent?.trim()))
      .toEqual(['123.***.***-09', '123.***.***-09', 'Unavailable']);
    expect(fixture.nativeElement.querySelector('tbody').innerHTML).not.toContain('123456789');
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

  it('opens a confirmation dialog and deletes only after confirmation', () => {
    fixture.componentInstance.openDeleteModal(page.data.content[0]);
    fixture.detectChanges();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog[aria-labelledby="deleteModalTitle"]');
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('Maria da Silva');
    expect(service.deleteCustomer).not.toHaveBeenCalled();

    dialog.querySelector<HTMLButtonElement>('.btn-solid.theme-danger')!.click();
    fixture.detectChanges();
    expect(service.deleteCustomer).toHaveBeenCalledWith(customerId(1));
    expect(service.getCustomers).toHaveBeenCalledTimes(2);
    expect(dialog.open).toBe(false);
    expect(fixture.componentInstance.successMessage()).toBe('Deleted.');
  });

  it('cancels the deletion without sending a request', () => {
    fixture.componentInstance.openDeleteModal(page.data.content[0]);
    fixture.detectChanges();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog[aria-labelledby="deleteModalTitle"]');
    dialog.querySelector<HTMLButtonElement>('.btn-outline.theme-secondary')!.click();
    fixture.detectChanges();

    expect(dialog.open).toBe(false);
    expect(service.deleteCustomer).not.toHaveBeenCalled();
    expect(fixture.componentInstance.customerToDelete()).toBeNull();
  });

  it('prevents duplicate submissions and closing while deletion is pending', () => {
    const pending = new Subject<{ success: boolean; message: string }>();
    service.deleteCustomer.mockReturnValue(pending);
    fixture.componentInstance.openDeleteModal(page.data.content[0]);
    fixture.detectChanges();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog[aria-labelledby="deleteModalTitle"]');
    const button = dialog.querySelector<HTMLButtonElement>('.btn-solid.theme-danger')!;
    button.click();
    fixture.detectChanges();
    button.click();
    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);

    expect(service.deleteCustomer).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(true);
    pending.next({ success: true, message: 'Deleted.' });
    fixture.detectChanges();
    expect(dialog.open).toBe(false);
  });

  it('keeps the dialog open and displays deletion errors for retry', () => {
    service.deleteCustomer.mockReturnValueOnce(throwError(() => ({ error: { message: 'Deletion failed.' } })))
      .mockReturnValueOnce(of({ success: false, message: 'Cannot delete.' }))
      .mockReturnValueOnce(of({ success: true, message: 'Deleted.' }));
    fixture.componentInstance.openDeleteModal(page.data.content[0]);
    fixture.detectChanges();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog[aria-labelledby="deleteModalTitle"]');
    const button = dialog.querySelector<HTMLButtonElement>('.btn-solid.theme-danger')!;
    button.click();
    fixture.detectChanges();
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('Deletion failed.');
    expect(service.getCustomers).toHaveBeenCalledTimes(1);
    button.click();
    fixture.detectChanges();
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('Cannot delete.');
    button.click();
    fixture.detectChanges();
    expect(dialog.open).toBe(false);
    expect(service.getCustomers).toHaveBeenCalledTimes(2);
  });

  it('keeps customer actions available next to the name on small screens', () => {
    const actions: HTMLElement = fixture.nativeElement.querySelector('.customer-row .mobile-actions');
    const links = actions.querySelectorAll('a');
    expect(links[0].getAttribute('href')).toBe(`/customers/${customerId(1)}`);
    expect(links[1].getAttribute('href')).toBe(`/customers/${customerId(1)}/edit`);

    actions.querySelector('button')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.customerToDelete()?.id).toBe(customerId(1));
    expect(service.deleteCustomer).not.toHaveBeenCalled();
  });

  it('searches all pages by name and CPF and restores the list when cleared', () => {
    const customers = Array.from({ length: 105 }, (_, index) => ({
      ...page.data.content[0],
      id: customerId(index + 1),
      fullName: index === 104 ? 'João da Silva' : 'Other customer',
      cpf: index === 104 ? '12345678909' : '98765432100'
    }));
    service.getCustomers.mockImplementation((pageNumber: number, size: number) => of({
      success: true,
      message: 'ok',
      data: {
        content: customers.slice(pageNumber * size, (pageNumber + 1) * size),
        page: pageNumber,
        size,
        totalElements: customers.length,
        totalPages: Math.ceil(customers.length / size)
      }
    }));
    fixture.componentInstance.goToPage(2);
    fixture.detectChanges();

    const name: HTMLInputElement = fixture.nativeElement.querySelector('#customer-name-filter');
    const cpf: HTMLInputElement = fixture.nativeElement.querySelector('#customer-cpf-filter');
    name.value = '  JOAO  ';
    cpf.value = '12345678909';
    cpf.dispatchEvent(new Event('input'));
    expect(cpf.value).toBe('123.456.789-09');
    name.closest('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(service.getCustomers).toHaveBeenCalledWith(1, 100);
    expect(fixture.componentInstance.page()).toBe(0);
    expect(fixture.componentInstance.customers().map((customer) => customer.fullName)).toEqual(['João da Silva']);
    expect(fixture.componentInstance.totalElements()).toBe(1);

    fixture.nativeElement.querySelector('.filter-actions button[type="button"]').click();
    fixture.detectChanges();
    expect(name.value).toBe('');
    expect(cpf.value).toBe('');
    expect(fixture.componentInstance.totalElements()).toBe(105);
    expect(service.getCustomers).toHaveBeenLastCalledWith(0, 10);
  });

  it('requires 3 to 150 characters in the name filter before searching', () => {
    const name: HTMLInputElement = fixture.nativeElement.querySelector('#customer-name-filter');
    const form = name.closest('form')!;
    const submit = (value: string) => {
      name.value = value;
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();
    };
    service.getCustomers.mockClear();

    for (const invalid of ['', 'ab', '  ab  ', 'a'.repeat(151)]) {
      submit(invalid);
      expect(fixture.nativeElement.textContent).toContain('Enter a name between 3 and 150 characters.');
      expect(name.getAttribute('aria-invalid')).toBe('true');
      expect(service.getCustomers).not.toHaveBeenCalled();
    }

    submit('abc');
    expect(service.getCustomers).toHaveBeenCalledWith(0, 100);
    expect(name.getAttribute('aria-invalid')).toBeNull();
    service.getCustomers.mockClear();
    submit('a'.repeat(150));
    expect(service.getCustomers).toHaveBeenCalledWith(0, 100);

    submit('ab');
    fixture.nativeElement.querySelector('.filter-actions button[type="button"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Enter a name between 3 and 150 characters.');
    expect(name.value).toBe('');
  });

  it('combines partial CPF and name filters with sorting and pagination', () => {
    const customers = Array.from({ length: 25 }, (_, index) => ({
      ...page.data.content[0],
      id: customerId(index + 1),
      fullName: `Maria ${25 - index}`,
      cpf: index < 21 ? '123.456.789-09' : '98765432100'
    }));
    service.getCustomers.mockReturnValue(of({
      success: true,
      message: 'ok',
      data: { content: customers, page: 0, size: 100, totalElements: 25, totalPages: 1 }
    }));
    fixture.componentInstance.searchCustomers('maria', '456');
    fixture.detectChanges();
    fixture.componentInstance.toggleNameSort();
    fixture.detectChanges();

    expect(fixture.componentInstance.totalElements()).toBe(21);
    expect(fixture.componentInstance.customers()[0].fullName).toBe('Maria 5');
    expect(fixture.componentInstance.totalPages()).toBe(3);
    fixture.componentInstance.goToPage(2);
    fixture.detectChanges();
    expect(fixture.componentInstance.customers().map((customer) => customer.fullName)).toEqual(['Maria 25']);
  });

  it('shows no matches and does not display partial results if filtering fails', () => {
    service.getCustomers.mockReturnValue(of(page));
    fixture.componentInstance.searchCustomers('does not exist', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No customers match your filters.');

    service.getCustomers.mockImplementation((pageNumber: number) => pageNumber === 0
      ? of({ ...page, data: { ...page.data, totalPages: 2 } })
      : throwError(() => new Error('Second page failed')));
    fixture.componentInstance.searchCustomers('Maria', '');
    fixture.detectChanges();
    expect(fixture.componentInstance.customers()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Second page failed');
    expect(fixture.nativeElement.textContent).toContain('Unable to load customers.');
  });

  it('cancels a pending search when filters are cleared', () => {
    const pending = new Subject<typeof page>();
    service.getCustomers.mockReturnValueOnce(pending).mockReturnValue(of(page));
    fixture.componentInstance.searchCustomers('Maria', '');
    fixture.detectChanges();
    fixture.componentInstance.clearFilters();
    fixture.detectChanges();
    pending.next({ ...page, data: { ...page.data, content: [] } });

    expect(fixture.componentInstance.customers()[0].fullName).toBe('Maria da Silva');
    expect(fixture.componentInstance.hasFilters()).toBe(false);
  });

  it('sorts all API pages by name and paginates the sorted results', () => {
    const customers = Array.from({ length: 105 }, (_, index) => ({
      ...page.data.content[0],
      id: customerId(index + 1),
      fullName: `Customer ${105 - index}`
    }));
    service.getCustomers.mockImplementation((pageNumber: number, size: number) => of({
      success: true,
      message: 'ok',
      data: {
        content: customers.slice(pageNumber * size, (pageNumber + 1) * size),
        page: pageNumber,
        size,
        totalElements: customers.length,
        totalPages: Math.ceil(customers.length / size)
      }
    }));

    const sortButton: HTMLButtonElement = fixture.nativeElement.querySelector('.name-sort');
    sortButton.click();
    fixture.detectChanges();

    expect(service.getCustomers).toHaveBeenCalledWith(0, 100);
    expect(service.getCustomers).toHaveBeenCalledWith(1, 100);
    expect(fixture.componentInstance.customers().map((customer) => customer.fullName))
      .toEqual(Array.from({ length: 10 }, (_, index) => `Customer ${index + 1}`));
    expect(fixture.nativeElement.querySelector('th').getAttribute('aria-sort')).toBe('ascending');

    fixture.componentInstance.goToPage(1);
    fixture.detectChanges();
    expect(fixture.componentInstance.customers()[0].fullName).toBe('Customer 11');
    expect(service.getCustomers).toHaveBeenCalledTimes(3);

    sortButton.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.page()).toBe(0);
    expect(fixture.componentInstance.customers()[0].fullName).toBe('Customer 105');
    expect(fixture.nativeElement.querySelector('th').getAttribute('aria-sort')).toBe('descending');
  });

  it('uses UUIDs to consistently order customers with equal names', () => {
    service.getCustomers.mockReturnValue(of({
      success: true,
      message: 'ok',
      data: {
        ...page.data,
        content: [
          { ...page.data.content[0], id: customerId(2) },
          { ...page.data.content[0], id: customerId(1) }
        ],
        totalElements: 2
      }
    }));
    fixture.componentInstance.toggleNameSort();
    fixture.detectChanges();
    expect(fixture.componentInstance.customers().map((customer) => customer.id)).toEqual([customerId(1), customerId(2)]);
  });

  it('shows an error instead of partial results when an API page fails', () => {
    service.getCustomers.mockClear();
    service.getCustomers.mockImplementation((pageNumber: number) => pageNumber === 0
      ? of({ ...page, data: { ...page.data, totalPages: 2 } })
      : throwError(() => new Error('Second page failed')));

    fixture.nativeElement.querySelector('.name-sort').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.customers()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Second page failed');
    expect(fixture.nativeElement.textContent).toContain('Unable to load customers.');
    fixture.detectChanges();
    expect(service.getCustomers).toHaveBeenCalledTimes(2);

    service.getCustomers.mockReturnValue(of(page));
    fixture.nativeElement.querySelector('.name-sort').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.customers()[0].fullName).toBe('Maria da Silva');
    expect(fixture.nativeElement.textContent).not.toContain('Second page failed');
  });

  it('reloads all sorted customers after deleting one', () => {
    fixture.nativeElement.querySelector('.name-sort').click();
    fixture.detectChanges();
    service.getCustomers.mockClear();
    fixture.componentInstance.openDeleteModal(page.data.content[0]);
    fixture.componentInstance.confirmDelete();

    expect(service.getCustomers).toHaveBeenCalledWith(0, 100);
  });

  it('ignores a cancelled request when switching to sorted results', () => {
    const pending = new Subject<typeof page>();
    service.getCustomers.mockReturnValueOnce(pending).mockReturnValue(of(page));
    fixture.componentInstance.goToPage(1);
    fixture.detectChanges();
    fixture.componentInstance.toggleNameSort();
    fixture.detectChanges();
    pending.next({ ...page, data: { ...page.data, content: [] } });

    expect(fixture.componentInstance.customers()[0].fullName).toBe('Maria da Silva');
  });

  it('updates server pagination to fit the available height when the window changes', () => {
    fixture.componentInstance.goToPage(2);
    fixture.detectChanges();

    const row: HTMLElement = fixture.nativeElement.querySelector('.customer-row');
    const body: HTMLElement = fixture.nativeElement.querySelector('tbody');
    const pagination: HTMLElement = fixture.nativeElement.querySelector('[data-pagination]');
    const bodyTop = window.innerHeight - 230;
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, bodyTop, 400, 40));
    vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, bodyTop, 400, 100));
    vi.spyOn(pagination, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, bodyTop + 100, 400, 40));

    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(fixture.componentInstance.pageSize()).toBe(4);
    expect(fixture.componentInstance.page()).toBe(5);
    expect(service.getCustomers).toHaveBeenLastCalledWith(5, 4);
  });

  it('repaginates locally sorted customers when the available height changes', () => {
    const customers = Array.from({ length: 20 }, (_, index) => ({
      ...page.data.content[0], id: customerId(index + 1), fullName: `Customer ${index + 1}`
    }));
    service.getCustomers.mockReturnValue(of({
      success: true,
      message: 'ok',
      data: { content: customers, page: 0, size: 100, totalElements: 20, totalPages: 1 }
    }));
    fixture.componentInstance.toggleNameSort();
    fixture.detectChanges();

    const row: HTMLElement = fixture.nativeElement.querySelector('.customer-row');
    const body: HTMLElement = fixture.nativeElement.querySelector('tbody');
    const pagination: HTMLElement = fixture.nativeElement.querySelector('[data-pagination]');
    const bodyTop = window.innerHeight - 230;
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, bodyTop, 400, 40));
    vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, bodyTop, 400, 100));
    vi.spyOn(pagination, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, bodyTop + 100, 400, 40));
    service.getCustomers.mockClear();

    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(fixture.componentInstance.pageSize()).toBe(4);
    expect(fixture.componentInstance.customers()).toHaveLength(4);
    expect(fixture.componentInstance.totalPages()).toBe(5);
    expect(service.getCustomers).not.toHaveBeenCalled();
  });
});
