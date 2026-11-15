# Technical Documentation

Complete technical reference for the Car Sales Platform - Customer Registration Frontend

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [Services & API Integration](#services--api-integration)
5. [Form Validation](#form-validation)
6. [Error Handling](#error-handling)
7. [Data Models](#data-models)
8. [Styling & Bootstrap](#styling--bootstrap)
9. [Development Practices](#development-practices)

---

## Project Overview

**Car Sales Platform - Customer Registration Frontend** is a modern Angular application for managing customer registrations with comprehensive form validation and backend API integration.

### Key Characteristics
- ✅ **Modern Stack**: Angular 22 with TypeScript
- ✅ **Professional UI**: Bootstrap 5.3.9
- ✅ **Type-Safe**: Full TypeScript typing throughout
- ✅ **Responsive**: Mobile, tablet, desktop support
- ✅ **Validated**: 25+ validation rules
- ✅ **Documented**: Comprehensive inline documentation

---

## Technology Stack

### Frontend Framework
- **Angular**: 22.2.0 (Latest stable)
- **TypeScript**: 5.6.3 (Strict mode)
- **RxJS**: Reactive programming
- **Angular CLI**: 22 (Build tool)

### Styling & UI
- **Bootstrap**: 5.3.9 (Latest stable)
- **Bootstrap Icons**: 1.11.1 (CDN)
- **CSS3**: Custom styles
- **SCSS**: Preprocessor support

### Development Tools
- **npm**: Package manager
- **Node.js**: v18+ runtime
- **Visual Studio Code**: Recommended editor
- **TypeScript Compiler**: Strict mode enabled

### Browser Support
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

---

## Component Architecture

### Directory Structure

```
src/app/
├── app.ts                          (Root component)
├── app.config.ts                   (App configuration)
├── components/
│   └── customer-registration/
│       ├── customer-registration.component.ts
│       ├── customer-registration.component.html
│       └── customer-registration.component.css
├── services/
│   └── customer.service.ts         (API integration)
├── models/
│   ├── customer.model.ts           (Customer interface)
│   ├── address.model.ts            (Address interface)
│   └── api-response.model.ts       (API response envelope)
└── environments/
    ├── environment.ts              (Development)
    └── environment.prod.ts         (Production)
```

### Customer Registration Component

**File**: `src/app/components/customer-registration/customer-registration.component.ts`

```typescript
export class CustomerRegistrationComponent implements OnInit {
  // Form group for Reactive Forms
  registrationForm: FormGroup;

  // Component state
  showAddress: boolean = false;
  loading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Methods
  ngOnInit(): void
  createForm(): FormGroup
  toggleAddress(): void
  submitForm(): void
  resetForm(): void
  getFieldError(fieldName: string): string
  getAddressFieldError(fieldName: string): string
}
```

**Key Methods**:
- `createForm()` - Initializes Reactive Form with validators
- `toggleAddress()` - Shows/hides address section
- `submitForm()` - Validates and submits form data
- `resetForm()` - Clears all form fields
- `getFieldError()` - Returns error message for a field

### Template Structure

The component uses Bootstrap components:

```html
<div class="container">
  <!-- Header Section -->
  <div class="card">
    <h2>Customer Registration</h2>
  </div>

  <!-- Personal Information Section -->
  <div class="card">
    <h5 class="badge">Personal Information</h5>
    <!-- Form fields: fullName, cpf, email, phone, additionalPhone, birthDate, gender -->
  </div>

  <!-- Address Section (Optional) -->
  <div class="card" *ngIf="showAddress">
    <h5 class="badge">Address Information</h5>
    <!-- Form fields: zipCode, street, number, complement, neighborhood, city, state -->
  </div>

  <!-- Buttons & Messages -->
  <div class="d-flex gap-2">
    <button type="submit">Register Customer</button>
    <button type="button">Reset</button>
  </div>

  <!-- Success/Error Messages -->
  <div class="alert" *ngIf="successMessage">{{ successMessage }}</div>
  <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>
</div>
```

---

## Services & API Integration

### Customer Service

**File**: `src/app/services/customer.service.ts`

Handles all HTTP communication with the backend API.

```typescript
export class CustomerService {
  private readonly apiUrl = '/api/v1/customers';

  constructor(private http: HttpClient) {}

  // Create customer
  createCustomer(customer: Customer): Observable<ApiResponse<Customer>>

  // Get all customers (paginated)
  getCustomers(page: number = 0, size: number = 20): Observable<ApiResponse<PaginatedResponse>>

  // Get customer by ID
  getCustomer(id: number): Observable<ApiResponse<Customer>>

  // Update customer
  updateCustomer(id: number, customer: Customer): Observable<ApiResponse<Customer>>

  // Delete customer
  deleteCustomer(id: number): Observable<ApiResponse<void>>
}
```

### HTTP Headers

All API requests include:
```typescript
headers: new HttpHeaders({
  'Content-Type': 'application/json',
  'Accept-Language': 'en-US'
})
```

### API Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code?: string;           // Error code
  path?: string;           // Request path
  errors?: FieldError[];   // Validation errors
}

interface FieldError {
  field: string;
  message: string;
}
```

---

## Form Validation

### Validation Rules

#### Personal Information

| Field | Type | Rules | Error Message |
|-------|------|-------|----------------|
| **Full Name** | String | Required, 3-150 chars | "Name must be 3-150 characters" |
| **CPF** | String | Required, Format: `000.000.000-00` | "Invalid CPF format" |
| **Email** | String | Required, Valid email | "Invalid email format" |
| **Phone Number** | String | Required, Format: `(00) 00000-0000` | "Invalid phone format" |
| **Additional Phone** | String | Optional, Format: `(00) 00000-0000` | "Invalid phone format" |
| **Birth Date** | Date | Required, YYYY-MM-DD, not future | "Birth date cannot be in the future" |
| **Gender** | Enum | Optional, One of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY | — |

#### Address (Optional)

| Field | Type | Rules | Error Message |
|-------|------|-------|----------------|
| **Zip Code** | String | Required (if address), Format: `00000-000` | "Invalid zip code format" |
| **Street** | String | Required (if address), 1-150 chars | "Street is required" |
| **Number** | String | Required (if address), 1-20 chars | "Number is required" |
| **Complement** | String | Optional, 0-100 chars | — |
| **Neighborhood** | String | Required (if address), 1-100 chars | "Neighborhood is required" |
| **City** | String | Required (if address), 1-100 chars | "City is required" |
| **State** | String | Required (if address), 2-letter UF code | "Invalid state" |

### Validator Examples

```typescript
fullNameControl: new FormControl('', [
  Validators.required,
  Validators.minLength(3),
  Validators.maxLength(150)
])

cpfControl: new FormControl('', [
  Validators.required,
  Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
])

emailControl: new FormControl('', [
  Validators.required,
  Validators.email
])

phoneControl: new FormControl('', [
  Validators.required,
  Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
])

birthDateControl: new FormControl('', [
  Validators.required,
  this.validateBirthDate()
])
```

### Custom Validators

```typescript
validateBirthDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const birthDate = new Date(control.value);
    const today = new Date();
    return birthDate > today ? { 'futureBirthDate': true } : null;
  };
}
```

---

## Error Handling

### Error Categories

#### Validation Errors (400)
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

#### Business Logic Errors (409)
```json
{
  "success": false,
  "code": "CUSTOMER_ALREADY_EXISTS",
  "message": "Customer with this CPF already exists"
}
```

#### Not Found Errors (404)
```json
{
  "success": false,
  "code": "CUSTOMER_NOT_FOUND",
  "message": "Customer not found"
}
```

#### Server Errors (500)
```json
{
  "success": false,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```

### Error Handling in Component

```typescript
submitForm(): void {
  if (this.registrationForm.invalid) return;

  this.loading = true;
  this.customerService.createCustomer(formData).subscribe({
    next: (response) => {
      this.successMessage = response.message;
      this.resetForm();
    },
    error: (error) => {
      // Handle different error types
      if (error.status === 409) {
        this.errorMessage = 'CPF already registered';
      } else if (error.error?.errors) {
        this.errorMessage = error.error.errors[0].message;
      } else {
        this.errorMessage = 'An error occurred';
      }
    },
    complete: () => this.loading = false
  });
}
```

---

## Data Models

### Customer Model

```typescript
export interface Customer {
  id?: number;
  fullName: string;
  cpf: string;
  email: string;
  phoneNumber: string;
  additionalPhone?: string;
  birthDate: string;          // YYYY-MM-DD
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  address?: Address;
  createdAt?: string;         // Timestamp
}
```

### Address Model

```typescript
export interface Address {
  zipCode: string;            // 00000-000
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;              // 2-letter UF code
}
```

### API Response Model

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  path?: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginatedResponse {
  content: Customer[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

---

## Styling & Bootstrap

### Bootstrap Components Used

#### Cards
```html
<div class="card">
  <div class="card-body">
    <!-- Content -->
  </div>
</div>
```

#### Grid System
```html
<div class="container">
  <div class="row">
    <div class="col-md-6"><!-- Left column --></div>
    <div class="col-md-6"><!-- Right column --></div>
  </div>
</div>
```

#### Forms
```html
<div class="mb-3">
  <label for="fullName" class="form-label">Full Name</label>
  <input type="text" class="form-control" id="fullName">
</div>
```

#### Buttons
```html
<button type="submit" class="btn btn-primary">Submit</button>
<button type="button" class="btn btn-secondary">Cancel</button>
```

#### Alerts
```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-danger">Error message</div>
```

### Custom CSS

**File**: `src/app/components/customer-registration/customer-registration.css`

Custom styles layer on top of Bootstrap:
- Form validation feedback
- Button hover effects
- Animations and transitions
- Responsive adjustments
- Focus states
- Loading spinner

---

## Development Practices

### Code Organization

✅ **Standalone Components**: Modern Angular pattern  
✅ **Reactive Forms**: Type-safe form handling  
✅ **Dependency Injection**: Clean architecture  
✅ **RxJS Observables**: Reactive programming  
✅ **Type Safety**: Full TypeScript typing  

### Naming Conventions

**Components**: `feature-name.component.ts`  
**Services**: `feature-name.service.ts`  
**Models**: `model-name.model.ts`  
**Variables**: camelCase  
**Constants**: UPPER_SNAKE_CASE  
**CSS Classes**: kebab-case  

### Comments & Documentation

```typescript
/**
 * Creates the registration form with validators
 * @returns FormGroup with customer registration controls
 */
private createForm(): FormGroup {
  // Implementation
}
```

### Error Handling

- Comprehensive error catching
- User-friendly error messages
- Console logging for debugging
- Error code mapping

### Performance

- Lazy loading support
- OnPush change detection ready
- Unsubscribe handling
- Bundle optimization

---

## Best Practices

### Form Handling
1. Use Reactive Forms (not Template-driven)
2. Validate on both client and server
3. Show clear error messages
4. Disable submit button while loading

### API Communication
1. Use typed Observable responses
2. Handle errors explicitly
3. Include proper HTTP headers
4. Implement retry logic if needed

### Component Design
1. Keep components focused and small
2. Extract logic to services
3. Use OnInit for initialization
4. Implement OnDestroy for cleanup

### Styling
1. Use Bootstrap utilities first
2. Override only when necessary
3. Keep custom CSS minimal
4. Follow mobile-first approach

---

## Running & Building

### Development Server
```bash
npm start
# App opens at http://localhost:4200
```

### Production Build
```bash
npm run build
# Output in dist/car-sales-platform/
```

### Testing
```bash
ng test
# Run unit tests
```

---

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

---

**Last Updated**: November 14, 2026  
**Version**: 1.0  
**Status**: Production Ready

### Request Format

All requests should include:
- `Content-Type: application/json`
- `Accept-Language: en-US` (for English responses)

### Customer Data Model

```typescript
{
  fullName: string;          // Required: 3-150 characters
  cpf: string;               // Required: Valid CPF format
  email: string;             // Required: Valid email, max 150 chars
  phoneNumber: string;       // Required: Brazilian phone format
  additionalPhone?: string;  // Optional: Brazilian phone format
  birthDate: string;         // Required: YYYY-MM-DD format
  gender?: string;           // Optional: MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY
  address?: {                // Optional
    zipCode: string;         // CEP format: 00000-000
    street: string;          // Max 150 characters
    number: string;          // Max 20 characters
    complement?: string;     // Max 100 characters
    neighborhood: string;    // Max 100 characters
    city: string;            // Max 100 characters
    state: string;           // Valid Brazilian state (SP, RJ, etc.)
  }
}
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── customer-registration/
│   │       ├── customer-registration.ts
│   │       ├── customer-registration.html
│   │       └── customer-registration.css
│   ├── services/
│   │   └── customer.service.ts
│   ├── models/
│   │   ├── customer.ts
│   │   └── api-response.ts
│   ├── app.ts
│   ├── app.html
│   ├── app.css
│   ├── app.routes.ts
│   └── app.config.ts
├── main.ts
├── index.html
└── styles.css
```

## Component Documentation

### CustomerRegistration Component

The main component that handles customer registration with the following features:

**Inputs/Outputs**: None (standalone component)

**Services Used**:
- `CustomerService`: For API communication

**Form Sections**:

1. **Personal Information**
   - Full Name (required)
   - CPF (required, format validation)
   - Email (required, email validation)
   - Phone Number (required, format validation)
   - Additional Phone (optional)
   - Birth Date (required, date validation)
   - Gender (optional, dropdown)

2. **Address Information** (optional)
   - Checkbox to enable/disable address input
   - Zip Code (format: 00000-000)
   - Street (max 150 characters)
   - Number (max 20 characters)
   - Complement (max 100 characters, optional)
   - Neighborhood (max 100 characters)
   - City (max 100 characters)
   - State (dropdown with Brazilian states)

**Validation**:
- Client-side validation using Angular Reactive Forms
- Server-side validation errors are displayed in the form
- Field-specific error messages

**Error Handling**:
- Displays error messages from the API
- Shows field-specific validation errors
- Network error handling

## Environment Configuration

Currently, the API base URL is hardcoded in the `CustomerService`. To change it:

Edit `src/app/services/customer.service.ts`:
```typescript
private apiUrl = 'http://localhost:8080/api/v1/customers';
```

For production use, consider implementing environment configuration:
```bash
ng build --configuration production
```

## Testing

Run unit tests:
```bash
npm test
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Issues
If you encounter CORS errors when running the frontend on `localhost:4200`:

1. The backend needs to have CORS configured
2. Or use a development proxy in `angular.json`

### API Connection Issues
- Ensure the backend is running on `http://localhost:8080`
- Check the browser console for network errors
- Verify the Accept-Language header is set correctly

## Next Steps

1. Implement customer listing/search functionality
2. Add customer edit capability
3. Implement pagination for customer list
4. Add authentication and authorization
5. Implement customer deletion with confirmation
6. Add filter and sort options
7. Implement internationalization (i18n)
8. Add unit and integration tests

## License

This project is part of the Car Sales Platform system.

## Support

For issues or questions, please contact the development team.
