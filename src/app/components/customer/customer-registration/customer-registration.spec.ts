import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CustomerRegistration } from './customer-registration';
import { CustomerService } from '../../../services/customer.service';
import { CustomerFeedbackService } from '../../../services/customer-feedback.service';
import { CustomerModalFooterService } from '../../../services/customer-modal-footer.service';

describe('CustomerRegistration', () => {
  const customerId = '20da0bd9-f75b-4c62-9da2-b363b196a549';
  let component: CustomerRegistration;
  let fixture: ComponentFixture<CustomerRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRegistration],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function fillValidForm(): void {
    component['patchCustomer']({
      fullName: 'Maria da Silva',
      cpf: '52998224725',
      email: 'maria@example.com',
      phoneNumber: '11999999999',
      birthDate: '1990-05-20'
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format CPF and phone numbers as the user types', () => {
    component.customerForm.controls['cpf'].setValue('52998224725');
    component.applyMask('cpf');
    expect(component.customerForm.controls['cpf'].value).toBe('529.982.247-25');

    component.customerForm.controls['phoneNumber'].setValue('11999999999');
    component.applyMask('phoneNumber');
    expect(component.customerForm.controls['phoneNumber'].value).toBe('(11) 99999-9999');

    component.customerForm.controls['additionalPhone'].setValue('1133334444');
    component.applyMask('additionalPhone');
    expect(component.customerForm.controls['additionalPhone'].value).toBe('(11) 3333-4444');

    component.customerForm.controls['zipCode'].setValue('01310100');
    component.applyMask('zipCode');
    expect(component.customerForm.controls['zipCode'].value).toBe('01310-100');
  });

  it('should require address fields and enforce their size limits only when the address is included', () => {
    expect(component.customerForm.controls['street'].valid).toBe(true);

    component.toggleAddress();
    expect(component.customerForm.controls['street'].hasError('required')).toBe(true);

    component.customerForm.controls['state'].setValue('XX');
    expect(component.customerForm.controls['state'].hasError('pattern')).toBe(true);

    component.customerForm.controls['street'].setValue('a'.repeat(151));
    expect(component.customerForm.controls['street'].hasError('maxlength')).toBe(true);
  });

  it('should dismiss the error alert after 5 seconds', () => {
    vi.useFakeTimers();
    try {
      component.onSubmit();
      expect(component.errorMessage).toBeTruthy();

      vi.advanceTimersByTime(4999);
      expect(component.errorMessage).toBeTruthy();

      vi.advanceTimersByTime(1);
      expect(component.errorMessage).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('should lock the CPF when editing and still send it on save', () => {
    const update = vi
      .spyOn(TestBed.inject(CustomerService), 'updateCustomer')
      .mockReturnValue(of({ success: true, message: 'Saved' }));
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.customerId = customerId;
    component['patchCustomer']({
      fullName: 'Maria da Silva',
      cpf: '52998224725',
      email: 'maria@example.com',
      phoneNumber: '11999999999',
      birthDate: '1990-05-20'
    });

    expect(component.customerForm.controls['cpf'].disabled).toBe(true);
    expect(component.customerForm.controls['cpf'].value).toBe('529.982.247-25');

    component.onSubmit();
    expect(update.mock.calls[0][0]).toBe(customerId);
    expect(update.mock.calls[0][1].cpf).toBe('529.982.247-25');
  });

  it('should show API field errors and keep the user on the form', () => {
    vi.useFakeTimers();
    try {
      vi.spyOn(TestBed.inject(CustomerService), 'createCustomer').mockReturnValue(throwError(() => ({
        error: {
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          errors: [
            { field: 'cpf', message: 'CPF is invalid' },
            { field: 'address.zipCode', message: 'ZIP code is invalid' },
            { field: null, message: 'Malformed JSON' }
          ]
        }
      })));
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      fillValidForm();

      component.onSubmit();

      expect(navigate).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Validation failed');
      expect(component.apiErrors.map(err => err.field)).toEqual(['cpf', 'address.zipCode']);
      expect(component.getFieldError('cpf')).toBe('CPF is invalid');
      expect(component.getFieldError('zipCode')).toBe('ZIP code is invalid');

      vi.advanceTimersByTime(5000);
      expect(component.errorMessage).toBe('Validation failed');
    } finally {
      vi.useRealTimers();
    }
  });

  it('should show the API message when a successful response reports failure', () => {
    vi.spyOn(TestBed.inject(CustomerService), 'createCustomer')
      .mockReturnValue(of({ success: false, message: 'Customer already exists', errors: [] }));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fillValidForm();

    component.onSubmit();

    expect(navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Customer already exists');
  });

  it('loads and updates a customer using the UUID from the route', () => {
    vi.spyOn(TestBed.inject(ActivatedRoute).snapshot.paramMap, 'get').mockReturnValue(customerId);
    const service = TestBed.inject(CustomerService);
    const getCustomer = vi.spyOn(service, 'getCustomerById').mockReturnValue(of({
      success: true,
      message: 'Retrieved',
      data: {
        id: customerId,
        fullName: 'Maria da Silva',
        cpf: '52998224725',
        email: 'maria@example.com',
        phoneNumber: '11999999999',
        birthDate: '1990-05-20'
      }
    }));
    const updateCustomer = vi.spyOn(service, 'updateCustomer').mockReturnValue(of({ success: true, message: 'Saved' }));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const editFixture = TestBed.createComponent(CustomerRegistration);
    editFixture.detectChanges();

    expect(getCustomer).toHaveBeenCalledWith(customerId);
    expect(editFixture.componentInstance.customerId).toBe(customerId);
    editFixture.componentInstance.onSubmit();
    expect(updateCustomer).toHaveBeenCalledWith(customerId, expect.objectContaining({ cpf: '529.982.247-25' }));
    expect(navigate).toHaveBeenCalledWith(['/customers']);
    expect(TestBed.inject(CustomerFeedbackService).pendingSuccessMessage()).toBe('Saved');
  });

  it('should disable the form and register the footer template in read-only mode', () => {
    Object.assign(component, { isReadOnly: true });
    component.customerId = customerId;
    component['patchCustomer']({
      fullName: 'Maria da Silva',
      cpf: '52998224725',
      email: 'maria@example.com',
      phoneNumber: '11999999999',
      birthDate: '1990-05-20'
    });
    fixture.detectChanges();

    expect(component.customerForm.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(component.footer).toBeDefined();
    expect(TestBed.inject(CustomerModalFooterService).template()).toBe(component.footer);
  });
});
