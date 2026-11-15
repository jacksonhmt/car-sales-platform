import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CustomerRegistration } from './customer-registration';
import { CustomerService } from '../../../services/customer.service';
import { CustomerModalFooterService } from '../../../services/customer-modal-footer.service';

describe('CustomerRegistration', () => {
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
      .mockReturnValue(of({ success: true, message: 'Saved', data: undefined } as any));

    component.customerId = 1;
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
    expect(update.mock.calls[0][1].cpf).toBe('529.982.247-25');
  });

  it('should disable the form and register the footer template in read-only mode', () => {
    Object.assign(component, { isReadOnly: true });
    component.customerId = 1;
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
