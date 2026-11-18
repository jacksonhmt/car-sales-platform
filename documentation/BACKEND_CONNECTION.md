# Backend Connection & Integration Guide

Complete guide for integrating with the backend API

---

## 📋 Table of Contents

1. [Connection Overview](#connection-overview)
2. [Development Setup](#development-setup)
3. [Proxy Configuration](#proxy-configuration)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Format](#requestresponse-format)
6. [Environment Configuration](#environment-configuration)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Connection Overview

### Architecture

```
┌──────────────────────────────────┐
│  Browser                         │
│  http://localhost:4200           │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Angular Application       │  │
│  │  (Customer Registration)   │  │
│  └────────────────────────────┘  │
│              ↓                    │
│  ┌────────────────────────────┐  │
│  │  Angular Dev Proxy         │  │
│  │  (proxy.conf.json)         │  │
│  │  Redirects /api → :8080    │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  Backend Server                  │
│  http://localhost:8080           │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Spring Boot Application   │  │
│  │  REST API                  │  │
│  │  /api/v1/customers         │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Key Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Frontend** | User interface and form | Angular 22 |
| **Proxy** | Handles CORS, routes requests | Angular CLI built-in |
| **Backend** | API endpoints, business logic | Spring Boot |
| **Database** | Data persistence | Backend-managed |

---

## Development Setup

### Backend Requirements

The backend must be running at `http://localhost:8080`

```bash
# Check if backend is running
curl http://localhost:8080/swagger-ui.html
# Expected: 200 OK with Swagger UI

# If not running, start it
# (Depends on your backend setup)
./mvnw spring-boot:run
# or
java -jar application.jar
# or
docker run -p 8080:8080 your-image-name
```

### Frontend Setup

```bash
# 1. Navigate to project
cd car-sales-platform

# 2. Install dependencies
npm install

# 3. Start development server with proxy
npm start

# 4. Application opens at
# http://localhost:4200
```

### Verify Connection

1. **Check Backend**: `curl http://localhost:8080`
2. **Check Frontend**: `curl http://localhost:4200`
3. **Submit Form**: Fill and submit customer registration
4. **Check Console**: Open DevTools (F12) → Network tab
5. **Look for**: Successful requests to `/api/v1/customers`

---

## Proxy Configuration

### What is a Proxy?

During development, the frontend and backend run on different ports:
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`

Browsers block cross-origin requests (CORS). The Angular dev proxy solves this by intercepting frontend requests and forwarding them to the backend.

### Configuration File

**File**: `proxy.conf.json` (root directory)

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "pathRewrite": {
      "^/api": "/api"
    },
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### How It Works

```
Request Flow:
1. Frontend: POST http://localhost:4200/api/v1/customers
2. Proxy intercepts /api request
3. Proxy forwards to: http://localhost:8080/api/v1/customers
4. Backend processes and responds
5. Proxy returns response to frontend
6. Frontend receives data (no CORS error)
```

### Angular CLI Integration

**File**: `angular.json`

The development configuration uses the proxy:

```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

When you run `npm start`, the proxy is automatically active.

### Testing the Proxy

```bash
# Terminal 1: Start backend (if not running)
cd backend
./mvnw spring-boot:run

# Terminal 2: Start frontend with proxy
cd car-sales-platform
npm start

# Terminal 3: Test the connection
curl -X GET http://localhost:4200/api/v1/customers

# Expected: Proxied request to backend
# Response: JSON with customers
```

### Disabling Proxy

If you need to disable the proxy temporarily:

```bash
# Use Angular CLI directly without proxy config
ng serve --no-proxy-config
```

---

## API Endpoints

### Base URL

**Development**: `http://localhost:4200/api/v1/customers`  
(Proxied to `http://localhost:8080/api/v1/customers`)

**Production**: Configure in `src/environments/environment.prod.ts`

### Available Endpoints

#### 1. Create Customer

```http
POST /api/v1/customers
Content-Type: application/json
Accept-Language: en-US

{
  "fullName": "John Doe",
  "cpf": "123.456.789-10",
  "email": "john@example.com",
  "phoneNumber": "(11) 99999-9999",
  "birthDate": "1990-05-20",
  "gender": "MALE",
  "address": {
    "zipCode": "01310-100",
    "street": "Avenida Paulista",
    "number": "1000",
    "complement": "Apt 12",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "11999999999",
    "birthDate": "1990-05-20",
    "gender": "MALE",
    "address": {
      "zipCode": "01310100",
      "street": "Avenida Paulista",
      "number": "1000",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP"
    },
    "createdAt": "2026-11-14T12:00:00"
  }
}
```

#### 2. Get All Customers (Paginated)

```http
GET /api/v1/customers?page=0&size=20
Accept-Language: en-US
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "11999999999",
        "birthDate": "1990-05-20"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### 3. Get Customer by ID

Use the UUID returned by the API, without a prefix, in the customer URL.

```http
GET /api/v1/customers/550e8400-e29b-41d4-a716-446655440000
Accept-Language: en-US
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    ...
  }
}
```

#### 4. Update Customer

```http
PUT /api/v1/customers/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
Accept-Language: en-US

{
  "fullName": "Jane Doe",
  "cpf": "123.456.789-10",
  ...
}
```

**Response** (200 OK): Updated customer object

#### 5. Delete Customer

```http
DELETE /api/v1/customers/550e8400-e29b-41d4-a716-446655440000
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## Request/Response Format

### Request Headers

All requests must include:

```http
Content-Type: application/json
Accept-Language: en-US
```

### Response Envelope

All responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;           // true for success, false for error
  message: string;            // Human-readable message
  data?: T;                   // Response data (optional for errors)
  code?: string;              // Error code (optional)
  path?: string;              // Request path (optional)
  errors?: FieldError[];      // Validation errors (optional)
}

interface FieldError {
  field: string;              // Field name
  message: string;            // Error message
}
```

### Success Response Example

```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": { ... }
}
```

### Error Response Example

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "path": "/api/v1/customers",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST (create) |
| **400** | Bad Request | Invalid input or validation error |
| **404** | Not Found | Customer not found |
| **409** | Conflict | CPF or email already exists |
| **500** | Server Error | Unexpected backend error |

---

## Environment Configuration

### Development Environment

**File**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1/customers'  // Relative URL (uses proxy)
};
```

### Production Environment

**File**: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.yourdomain.com/api/v1/customers'
};
```

### Customer Service Usage

```typescript
import { environment } from '@/environments/environment';

export class CustomerService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  createCustomer(customer: Customer): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(
      this.apiUrl,
      customer,
      { headers: this.getHeaders() }
    );
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US'
    });
  }
}
```

### Switching Environments

```bash
# Development (uses proxy)
npm start

# Production
npm run build
# Or
ng build --configuration production
```

---

## Production Deployment

### Before Deploying

1. ✅ Update `src/environments/environment.prod.ts` with real API URL
2. ✅ Remove proxy configuration (not needed in production)
3. ✅ Test build: `npm run build`
4. ✅ Verify no errors: `ng build --configuration production`
5. ✅ Backend CORS must be configured to allow production domain

### Build Process

```bash
# Create production build
npm run build

# Output location
# dist/car-sales-platform/

# Contents
# ├── index.html
# ├── main.js (minified)
# ├── styles.css (minified)
# ├── runtime.js
# ├── polyfills.js
# └── assets/
```

### Deployment Options

#### Option 1: Web Server (Nginx, Apache)
```bash
# Copy build output
cp -r dist/car-sales-platform/* /var/www/html/

# Update nginx config to proxy /api to backend
location /api {
  proxy_pass http://backend:8080;
}
```

#### Option 2: Docker
```dockerfile
# Dockerfile
FROM node:18 as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/car-sales-platform /usr/share/nginx/html
```

#### Option 3: Cloud Platform (AWS, Azure, Heroku)
```bash
# Deploy dist/car-sales-platform folder
# Configure backend URL for your environment
# Set API proxy if needed
```

### Production Configuration

**Critical**: Configure CORS on backend

```
For frontend at: https://yourdomain.com
Backend should allow:

Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept-Language
Access-Control-Allow-Credentials: true
```

---

## Troubleshooting

### CORS Error

**Error Message**:
```
Access to XMLHttpRequest at 'http://localhost:8080/...'
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Causes**:
- Backend CORS not configured (production)
- Proxy not configured (development)
- Proxy not active

**Solutions**:

Development:
```bash
# Verify proxy.conf.json exists
ls proxy.conf.json

# Restart with proxy
npm start
```

Production:
```
Configure backend to allow your frontend domain:
1. Add frontend URL to CORS whitelist
2. Configure allowed methods and headers
3. Set Access-Control-Allow-Credentials: true
```

### Connection Refused

**Error Message**:
```
ERR_CONNECTION_REFUSED
```

**Causes**:
- Backend not running
- Wrong port in configuration
- Firewall blocking connection

**Solutions**:
```bash
# Check backend status
curl http://localhost:8080

# If not running, start backend
./mvnw spring-boot:run

# Check proxy config
cat proxy.conf.json

# Restart frontend
npm start
```

### Timeout Errors

**Causes**:
- Backend slow to respond
- Network latency
- Request too large

**Solutions**:
```bash
# Increase timeout in customer.service.ts
timeout(30000),  // 30 seconds

# Optimize backend queries
# Check network conditions
# Reduce request payload size
```

### Authentication Issues

**Note**: Currently no authentication is required.

If adding authentication later:
```typescript
// Add auth token to headers
private getHeaders(): HttpHeaders {
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.authToken}`
  });
}
```

---

## Testing API Locally

### Using cURL

```bash
# Create customer
curl -X POST http://localhost:8080/api/v1/customers \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Test User",
    "cpf": "123.456.789-10",
    "email": "test@example.com",
    "phoneNumber": "(11) 99999-9999",
    "birthDate": "1990-05-20"
  }'

# Get all customers
curl http://localhost:8080/api/v1/customers

# Set CUSTOMER_ID to the UUID returned by the API.
CUSTOMER_ID='<customer-uuid>'

# Get single customer
curl "http://localhost:8080/api/v1/customers/$CUSTOMER_ID"

# Update customer
curl -X PUT "http://localhost:8080/api/v1/customers/$CUSTOMER_ID" \
  -H 'Content-Type: application/json' \
  -d '{...}'

# Delete customer
curl -X DELETE "http://localhost:8080/api/v1/customers/$CUSTOMER_ID"
```

### Using Postman

1. Import API from: `http://localhost:8080/v3/api-docs`
2. Create requests for each endpoint
3. Test with various inputs
4. Verify responses

### Using Browser DevTools

```javascript
// Create customer from console
fetch('/api/v1/customers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'Test',
    cpf: '123.456.789-10',
    email: 'test@example.com',
    phoneNumber: '(11) 99999-9999',
    birthDate: '1990-05-20'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## Best Practices

### Development
- ✅ Use proxy to avoid CORS issues
- ✅ Test with actual backend data
- ✅ Check browser DevTools Network tab
- ✅ Log requests for debugging

### Production
- ✅ Use HTTPS endpoints
- ✅ Configure backend CORS properly
- ✅ Use environment-specific URLs
- ✅ Implement error retry logic
- ✅ Monitor API health

### Security
- ✅ Never hardcode credentials
- ✅ Use HTTPS in production
- ✅ Validate all inputs
- ✅ Don't expose API keys
- ✅ Implement authentication (if needed)

---

**Last Updated**: November 14, 2026  
**Version**: 1.0  
**Status**: Production Ready
- **CORS**: ✅ Tratado pelo proxy
- **Debug**: ✅ Logs detalhados

### Produção
- **Arquivo**: `src/environments/environment.prod.ts`
- **Updated for**: `https://your-domain.com/api/v1/customers`
- **Build**: `npm run build`

---

## HTTP Headers

All requests include:

```
Content-Type: application/json
Accept-Language: en-US
```

**Note**: To receive responses in Portuguese, change:
```typescript
'Accept-Language': 'pt-BR'
```

---

## Best Practices

### Development
- ✅ Use proxy to avoid CORS issues
- ✅ Test with actual backend data
- ✅ Check browser DevTools Network tab
- ✅ Log requests for debugging

### Production
- ✅ Use HTTPS endpoints
- ✅ Configure backend CORS properly
- ✅ Use environment-specific URLs
- ✅ Implement error retry logic
- ✅ Monitor API health

### Security
- ✅ Never hardcode credentials
- ✅ Use HTTPS in production
- ✅ Validate all inputs
- ✅ Don't expose API keys
- ✅ Implement authentication (if needed)

---

## Additional Resources

- **Backend Swagger UI**: http://localhost:8080/swagger-ui.html
- **Backend OpenAPI Docs**: http://localhost:8080/v3/api-docs
- [Angular HttpClient Guide](https://angular.io/guide/http)
- [RESTful API Best Practices](https://restfulapi.net/)

---

**Last Updated**: November 14, 2026  
**Version**: 1.0  
**Status**: Production Ready
