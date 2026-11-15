import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer';
import { ApiResponse, PaginatedResponse } from '../models/api-response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  createCustomer(customer: Customer): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.apiUrl, customer, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US'
      }
    });
  }

  getCustomers(page: number = 0, size: number = 20): Observable<ApiResponse<PaginatedResponse<Customer>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ApiResponse<PaginatedResponse<Customer>>>(this.apiUrl, {
      params,
      headers: {
        'Accept-Language': 'en-US'
      }
    });
  }

  getCustomerById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.apiUrl}/${id}`, {
      headers: {
        'Accept-Language': 'en-US'
      }
    });
  }

  updateCustomer(id: number, customer: Customer): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.apiUrl}/${id}`, customer, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US'
      }
    });
  }

  deleteCustomer(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, {
      headers: {
        'Accept-Language': 'en-US'
      }
    });
  }
}

