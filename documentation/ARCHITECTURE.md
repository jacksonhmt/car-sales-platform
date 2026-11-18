# Architecture & Connection Flow

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  CLIENT BROWSER                              │
│            (http://localhost:4200)                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Angular 22 Application (Customer Registration)        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  app.component                                   │ │ │
│  │  │    └─ customer-registration.component           │ │ │
│  │  │       ├─ Form Validation (Reactive Forms)       │ │ │
│  │  │       ├─ Error Handling                         │ │ │
│  │  │       └─ UI/UX Management                       │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                       ↓                                 │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  customer.service                                │ │ │
│  │  │  ├─ POST /api/v1/customers (Create)             │ │ │
│  │  │  ├─ GET /api/v1/customers (List)                │ │ │
│  │  │  ├─ GET /api/v1/customers/{id} (Retrieve)       │ │ │
│  │  │  ├─ PUT /api/v1/customers/{id} (Update)         │ │ │
│  │  │  └─ DELETE /api/v1/customers/{id} (Delete)      │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                       ↓                                 │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  HttpClient (Angular Built-in)                   │ │ │
│  │  │  Headers:                                        │ │ │
│  │  │  • Content-Type: application/json                │ │ │
│  │  │  • Accept-Language: en-US                        │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           ↓
        ┌─────────────────────────────────────┐
        │  ANGULAR DEV PROXY                   │
        │  (proxy.conf.json)                   │
        │                                      │
        │  Redirects /api → localhost:8080     │
        │  Handles CORS automatically          │
        │  Debug logs in terminal              │
        └─────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                              │
│            (http://localhost:8080)                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Spring Boot REST API                                  │ │
│  │  /api/v1/customers                                     │ │
│  │  ├─ @PostMapping (Create Customer)                    │ │
│  │  ├─ @GetMapping (List Customers)                      │ │
│  │  ├─ @GetMapping("/{id}") (Get Customer)               │ │
│  │  ├─ @PutMapping("/{id}") (Update Customer)            │ │
│  │  └─ @DeleteMapping("/{id}") (Delete Customer)         │ │
│  └────────────────────────────────────────────────────────┘ │
│                       ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Validation Layer                                       │ │
│  │  ├─ CPF Format (Brazilian)                            │ │
│  │  ├─ Email Format                                      │ │
│  │  ├─ Phone Number (Brazilian)                          │ │
│  │  ├─ Zip Code (Brazilian CEP)                          │ │
│  │  ├─ Birth Date (Not Future)                           │ │
│  │  ├─ Gender Enum (4 options)                           │ │
│  │  └─ Address Fields (when provided)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                       ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Data Normalization                                     │ │
│  │  ├─ Remove CPF formatting                             │ │
│  │  ├─ Lowercase email                                   │ │
│  │  ├─ Remove phone formatting                           │ │
│  │  ├─ Remove zip code formatting                        │ │
│  │  ├─ Uppercase state                                   │ │
│  │  └─ Trim whitespace                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                       ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database (MySQL/PostgreSQL)                            │ │
│  │  ├─ customers table                                    │ │
│  │  ├─ addresses table                                    │ │
│  │  └─ Foreign key relationship                          │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Request/Response Flow

### Create Customer (POST)

```
┌─────────────────────────────────────────────────────────────┐
│ REQUEST (Frontend → Backend)                                │
├─────────────────────────────────────────────────────────────┤
│ Method:  POST                                               │
│ URL:     /api/v1/customers                                  │
│ Headers: Content-Type: application/json                     │
│          Accept-Language: en-US                             │
│                                                              │
│ Body:                                                       │
│ {                                                           │
│   "fullName": "Maria da Silva",                             │
│   "cpf": "529.982.247-25",                                  │
│   "email": "maria@example.com",                             │
│   "phoneNumber": "(11) 99999-9999",                         │
│   "birthDate": "1990-05-20",                                │
│   "gender": "FEMALE",                                       │
│   "address": {                                              │
│     "zipCode": "01310-100",                                 │
│     "street": "Avenida Paulista",                           │
│     "number": "1000",                                       │
│     "neighborhood": "Bela Vista",                           │
│     "city": "São Paulo",                                    │
│     "state": "SP"                                           │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
         ↓ [Validation] ↓ [Normalization]
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE (Backend → Frontend)                               │
├─────────────────────────────────────────────────────────────┤
│ Status: 201 Created                                         │
│                                                              │
│ Body:                                                       │
│ {                                                           │
│   "success": true,                                          │
│   "message": "Customer successfully registered.",           │
│   "data": {                                                 │
│     "id": "550e8400-e29b-41d4-a716-446655440000",           │
│     "fullName": "Maria da Silva",                           │
│     "email": "maria@example.com",                           │
│     "phoneNumber": "11999999999",                           │
│     "birthDate": "1990-05-20",                              │
│     "gender": "FEMALE",                                     │
│     "address": {                                            │
│       "zipCode": "01310100",                                │
│       "street": "Avenida Paulista",                         │
│       "number": "1000",                                     │
│       "neighborhood": "Bela Vista",                         │
│       "city": "São Paulo",                                  │
│       "state": "SP"                                         │
│     },                                                      │
│     "createdAt": "2026-01-01T12:00:00"                      │
│   }                                                         │
│ }                                                           │
│                                                              │
│ Note: CPF is NOT returned for security/privacy             │
└─────────────────────────────────────────────────────────────┘
         ↓ [Parse Response]
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND PROCESSING                                         │
├─────────────────────────────────────────────────────────────┤
│ ✓ Extract data.data (customer object)                       │
│ ✓ Show success message                                      │
│ ✓ Reset form                                                │
│ ✓ Redirect/navigate as needed                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Data Models

### Customer Model
```typescript
interface Customer {
  id?: string;
  fullName: string;           // Required, 3-150 chars
  cpf?: string;               // Required, not returned in response
  email: string;              // Required, valid email
  phoneNumber: string;        // Required, Brazilian format
  additionalPhone?: string;   // Optional, Brazilian format
  birthDate: string;          // Required, YYYY-MM-DD, not future
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  address?: Address;          // Optional, all fields required if provided
  createdAt?: string;         // YYYY-MM-DDTHH:mm:ss
}

interface Address {
  zipCode: string;            // Required, 8 digits (XXXXX-XXX)
  street: string;             // Required, max 150 chars
  number: string;             // Required, max 20 chars
  complement?: string;        // Optional, max 100 chars
  neighborhood: string;       // Required, max 100 chars
  city: string;               // Required, max 100 chars
  state: string;              // Required, 2-char state abbreviation
}
```

---

## 📡 HTTP Status Codes

| Status | Meaning | Scenario |
|--------|---------|----------|
| 200 | OK | GET, PUT, DELETE successful |
| 201 | Created | POST successful |
| 400 | Bad Request | Validation error, invalid format |
| 404 | Not Found | Customer ID not found |
| 409 | Conflict | CPF or email already exists |
| 500 | Server Error | Unexpected backend error |

---

## 🔄 Error Handling

```
Frontend Error Response Structure:
{
  "success": false,
  "code": "VALIDATION_ERROR",  // Use for logic
  "message": "Validation failed.",  // For display
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": "cpf",
      "message": "Invalid CPF format."
    },
    {
      "field": "email",
      "message": "Email already registered."
    }
  ]
}
```

Frontend extracts:
- `response.data.code` → Route logic (show specific error handling)
- `response.data.message` → Display to user
- `response.data.errors` → Highlight fields in form
- `response.data.errors[].field` → Map to form control

---

## 🌐 CORS & Proxy Configuration

### Why Proxy?
```
Without Proxy:
Browser (localhost:4200) → Backend (localhost:8080)
                           ❌ CORS Error (different origin)

With Proxy:
Browser (localhost:4200) → Proxy (same origin)
                                 → Backend (localhost:8080)
                           ✓ No CORS error
```

### proxy.conf.json
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Only active during development** (`npm start`)  
**Not used in production build**

---

## 📂 File Structure

```
car-sales-platform/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── customer-registration/
│   │   │       ├── customer-registration.ts      (Component logic)
│   │   │       ├── customer-registration.html    (Template)
│   │   │       └── customer-registration.css     (Styles)
│   │   ├── services/
│   │   │   └── customer.service.ts               (API client)
│   │   ├── models/
│   │   │   ├── customer.ts                       (Interfaces)
│   │   │   └── api-response.ts                   (Response models)
│   │   ├── app.ts                                (Root component)
│   │   ├── app.config.ts                         (Providers)
│   │   └── app.html                              (Root template)
│   ├── environments/
│   │   ├── environment.ts                        (Dev config)
│   │   └── environment.prod.ts                   (Prod config)
│   ├── main.ts                                   (Entry point)
│   └── styles.css                                (Global styles)
├── proxy.conf.json                               (Dev proxy config)
├── angular.json                                  (Angular config)
├── package.json                                  (Dependencies)
└── tsconfig.json                                 (TypeScript config)
```

---

## 🚀 Deployment Considerations

### Development
- Proxy enabled: `/api` → `localhost:8080`
- Environment: `environment.ts`
- Command: `npm start`

### Production
- Update: `environment.prod.ts` with real server URL
- Command: `npm run build`
- Deploy: `dist/car-sales-platform` folder to web server

Example production URL:
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.example.com/api/v1/customers'
};
```

---

## 🔍 Debugging

### Enable Network Logs in Terminal
Proxy logs show all requests:
```
[HPM] GET http://localhost:4200/api/v1/customers
[HPM] Response: 200 OK
```

### Browser DevTools
1. Open F12
2. Network tab
3. Look for `/api/v1/customers` requests
4. Check Headers, Response, Payload

### Console Logs
Component catches errors and logs:
```typescript
// In customer.service.ts
catchError(error => {
  console.error('API Error:', error);
  return throwError(() => error);
})
```

---

**Last Updated**: 2026-11-14  
**Status**: ✅ Production Ready
