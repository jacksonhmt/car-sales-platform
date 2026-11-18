import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CustomerService } from './customer.service';
import { Customer } from '../models/customer';

describe('CustomerService UUID requests', () => {
  it('uses the API UUID unchanged for retrieval, update and deletion', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const service = TestBed.inject(CustomerService);
    const http = TestBed.inject(HttpTestingController);
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const customer: Customer = {
      id,
      fullName: 'Maria da Silva',
      cpf: '529.982.247-25',
      email: 'maria@example.com',
      phoneNumber: '(11) 99999-9999',
      birthDate: '1990-05-20'
    };

    service.getCustomerById(id).subscribe();
    const get = http.expectOne(`/api/v1/customers/${id}`);
    expect(get.request.method).toBe('GET');
    get.flush({ success: true, message: 'Retrieved', data: customer });

    service.updateCustomer(id, customer).subscribe();
    const update = http.expectOne(`/api/v1/customers/${id}`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(customer);
    update.flush({ success: true, message: 'Updated', data: customer });

    service.deleteCustomer(id).subscribe();
    const deletion = http.expectOne(`/api/v1/customers/${id}`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush({ success: true, message: 'Deleted', data: null });
    http.verify();
  });
});
