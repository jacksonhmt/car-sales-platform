import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer';
import { ApiResponse } from '../../../models/api-response';
import { CustomerModalFooterService } from '../../../services/customer-modal-footer.service';
import { formatCpf, formatPhone, formatZipCode } from '../../../utils/formatters';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  selector: 'app-customer-registration',
  templateUrl: './customer-registration.html',
})
export class CustomerRegistration implements OnInit, OnDestroy {
  customerForm!: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};
  showAddress = false;
  customerId: number | null = null;
  private alertTimer?: ReturnType<typeof setTimeout>;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly footerService = inject(CustomerModalFooterService);
  @ViewChild('footer', { static: true }) footer!: TemplateRef<unknown>;
  readonly isReadOnly = this.route.snapshot.data['mode'] === 'view';

  genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
  ];

  brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  private readonly addressRules: Record<string, ValidatorFn[]> = {
    zipCode: [Validators.pattern(/^\d{5}-\d{3}$/)],
    street: [Validators.maxLength(150)],
    number: [Validators.maxLength(20)],
    complement: [Validators.maxLength(100)],
    neighborhood: [Validators.maxLength(100)],
    city: [Validators.maxLength(100)],
    state: [Validators.pattern(new RegExp(`^(${this.brazilianStates.join('|')})$`))]
  };

  private readonly requiredAddressFields = ['zipCode', 'street', 'number', 'neighborhood', 'city', 'state'];

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService
  ) {}

  get isEditMode(): boolean {
    return this.customerId !== null;
  }

  ngOnInit(): void {
    this.footerService.template.set(this.footer);
    this.initializeForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.customerId = Number(id);
      this.loadCustomer(this.customerId);
    }
  }

  private loadCustomer(id: number): void {
    this.loading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data) this.patchCustomer(response.data);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Customer not found.';
        this.scheduleAlertDismiss();
      }
    });
  }

  // CPF is returned by the API but cannot be changed, so it is locked when editing.
  private patchCustomer(customer: Customer): void {
    this.showAddress = !!customer.address;
    this.applyAddressValidators();
    this.customerForm.patchValue({
      fullName: customer.fullName,
      cpf: customer.cpf ? formatCpf(customer.cpf) : '',
      email: customer.email,
      phoneNumber: formatPhone(customer.phoneNumber),
      additionalPhone: customer.additionalPhone ? formatPhone(customer.additionalPhone) : '',
      birthDate: customer.birthDate,
      gender: customer.gender ?? '',
      includeAddress: this.showAddress,
      zipCode: customer.address ? formatZipCode(customer.address.zipCode) : '',
      street: customer.address?.street ?? '',
      number: customer.address?.number ?? '',
      complement: customer.address?.complement ?? '',
      neighborhood: customer.address?.neighborhood ?? '',
      city: customer.address?.city ?? '',
      state: customer.address?.state ?? ''
    });

    if (this.isReadOnly) {
      this.customerForm.disable();
    } else {
      this.customerForm.controls['cpf'].disable();
    }
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }

  ngOnDestroy(): void {
    clearTimeout(this.alertTimer);
    this.footerService.template.set(null);
  }

  private scheduleAlertDismiss(): void {
    clearTimeout(this.alertTimer);
    this.alertTimer = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  private initializeForm(): void {
    this.customerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      additionalPhone: ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      birthDate: ['', [Validators.required]],
      gender: [''],
      zipCode: [''],
      street: [''],
      number: [''],
      complement: [''],
      neighborhood: [''],
      city: [''],
      state: [''],
      includeAddress: [false]
    });
    this.applyAddressValidators();
  }

  private applyAddressValidators(): void {
    for (const [field, rules] of Object.entries(this.addressRules)) {
      const required = this.showAddress && this.requiredAddressFields.includes(field);
      const control = this.customerForm.get(field)!;
      control.setValidators(required ? [Validators.required, ...rules] : rules);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  errorText(field: string): string {
    const errors = this.customerForm.get(field)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required.';
    if (errors['pattern']) return 'Invalid format.';
    return '';
  }

  get f() {
    return this.customerForm.controls;
  }

  applyMask(field: 'cpf' | 'phoneNumber' | 'additionalPhone' | 'zipCode'): void {
    const control = this.customerForm.controls[field];
    const value = control.value ?? '';
    const formatters = {
      cpf: formatCpf,
      phoneNumber: formatPhone,
      additionalPhone: formatPhone,
      zipCode: formatZipCode
    };
    const formatted = formatters[field](value);
    if (formatted !== value) {
      control.setValue(formatted, { emitEvent: false });
    }
  }

  getFieldError(fieldName: string): string {
    return this.fieldErrors[fieldName] || '';
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.fieldErrors = {};

    if (this.customerForm.invalid) {
      this.errorMessage = 'Please check the form for errors.';
      this.scheduleAlertDismiss();
      return;
    }

    this.loading = true;
    const formValue = this.customerForm.getRawValue();

    const customer: Customer = {
      fullName: formValue.fullName,
      cpf: formValue.cpf,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      additionalPhone: formValue.additionalPhone || undefined,
      birthDate: formValue.birthDate,
      gender: formValue.gender || undefined,
      address: formValue.includeAddress ? {
        zipCode: formValue.zipCode,
        street: formValue.street,
        number: formValue.number,
        complement: formValue.complement || undefined,
        neighborhood: formValue.neighborhood,
        city: formValue.city,
        state: formValue.state
      } : null
    };

    const request = this.customerId !== null
      ? this.customerService.updateCustomer(this.customerId, customer)
      : this.customerService.createCustomer(customer);

    request.subscribe({
      next: (response: ApiResponse<Customer>) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message || 'Customer saved successfully!';
          if (!this.isEditMode) {
            this.customerForm.reset();
            this.showAddress = false;
            this.applyAddressValidators();
            this.submitted = false;
            this.fieldErrors = {};
          }
        } else {
          this.errorMessage = response.message || 'An error occurred during registration.';
        }
        this.scheduleAlertDismiss();
      },
      error: (error) => {
        this.loading = false;
        if (error.error && error.error.errors) {
          error.error.errors.forEach((err: any) => {
            this.fieldErrors[err.field] = err.message;
          });
        }
        this.errorMessage = error.error?.message || 'An error occurred during registration.';
        this.scheduleAlertDismiss();
      }
    });
  }

  onReset(): void {
    this.customerForm.reset();
    this.showAddress = false;
    this.applyAddressValidators();
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};
  }

  resetForm(): void {
    this.onReset();
  }

  toggleAddress(): void {
    this.showAddress = !this.showAddress;
    this.customerForm.patchValue({ includeAddress: this.showAddress });
    if (!this.showAddress) {
      this.customerForm.patchValue({
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
      });
    }
    this.applyAddressValidators();
  }
}

