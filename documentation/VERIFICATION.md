# Testing & Verification Guide

Complete testing, verification, and troubleshooting guide for the Car Sales Platform

---

## 📋 Table of Contents

1. [Pre-Flight Checklist](#pre-flight-checklist)
2. [Starting the Application](#starting-the-application)
3. [Testing Procedures](#testing-procedures)
4. [API Integration Testing](#api-integration-testing)
5. [Responsive Design Testing](#responsive-design-testing)
6. [Error Scenario Testing](#error-scenario-testing)
7. [Performance Testing](#performance-testing)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Security Checklist](#security-checklist)

---

## Pre-Flight Checklist

### System Requirements ✅

```bash
# Verify Node.js (v18+)
node --version
# Expected: v18.0.0 or higher

# Verify npm (v9+)
npm --version
# Expected: v9.0.0 or higher

# Verify Angular CLI (v22+)
ng version
# Expected: Angular CLI 22.x.x
```

### Project Setup ✅

- ✅ Project cloned/downloaded
- ✅ Dependencies installed (`npm install` completed)
- ✅ No TypeScript errors (run `npm run build`)
- ✅ Backend accessible at `http://localhost:8080`
- ✅ Port 4200 available
- ✅ Proxy configuration in place (`proxy.conf.json`)

### Backend Verification ✅

```bash
# Test backend connectivity
curl http://localhost:8080/swagger-ui.html

# Expected response: 200 OK with Swagger UI HTML
# If error: Start backend first or check connection URL

# Test API endpoint
curl http://localhost:8080/api/v1/customers

# Expected response: JSON with success envelope
```

---

## Starting the Application

### Step 1: Start Backend

```bash
# Option 1: Using Maven (Spring Boot)
cd backend-directory
./mvnw spring-boot:run

# Option 2: Using Java
java -jar application.jar

# Option 3: Using Docker
docker run -p 8080:8080 car-sales-backend
```

**Verification**:
```bash
curl -i http://localhost:8080/swagger-ui.html
# Expected: HTTP 200 OK
```

### Step 2: Start Frontend

```bash
cd car-sales-platform
npm start
```

**Expected Console Output**:
```
✔ Compiled successfully
Application bundle generated successfully.

✔ Compilation successful
✔ Built successfully.

  ✔ Building...

Initial chunk files | Names           | Raw size | Estimated transfer
main.js             |           ...    | 234.56 kB|  58.90 kB
polyfills.js        |           ...    | 35.48 kB |   11.46 kB
styles.css          |           ...    | 18.23 kB |    5.62 kB
runtime.js          |           ...    | 12.36 kB |    3.82 kB

Build at: dist/car-sales-platform/ (3 seconds)
✔ Compiled successfully.

Application bundle generated successfully. 
In file changed auto-reload is enabled. With this feature, your app will be updated in browser on every file modification.
```

### Step 3: Verify Application Loaded

1. Open browser at `http://localhost:4200`
2. Customer registration form should display
3. Check browser console (F12) for errors
4. Network tab should show successful requests

---

## Testing Procedures

### 1. Form Display Testing

| Test | Action | Expected Result |
|------|--------|-----------------|
| **Form Loads** | Open http://localhost:4200 | Registration form displays |
| **Personal Section** | Page loads | "Personal Information" card visible |
| **Address Toggle** | Check checkbox | Address section appears |
| **Address Toggle** | Uncheck checkbox | Address section disappears |
| **All Fields Visible** | Check all required fields | 7 personal + 7 address (optional) fields |

### 2. Form Input Validation Testing

#### Full Name Field
```
Test Case 1: Empty submission
├─ Input: (empty)
├─ Click Submit
└─ Expected: Error "Full Name is required"

Test Case 2: Too short
├─ Input: "ab"
├─ Click Submit
└─ Expected: Error "Full Name must be 3-150 characters"

Test Case 3: Valid
├─ Input: "John Doe"
├─ Action: No error
└─ Expected: Field marked valid
```

#### CPF Field
```
Test Case 1: Invalid format
├─ Input: "12345678901"
├─ Tab or Submit
└─ Expected: Error "Invalid CPF format"

Test Case 2: Valid format
├─ Input: "123.456.789-10"
├─ Tab or Submit
└─ Expected: Field marked valid

Test Case 3: Empty
├─ Input: (empty)
├─ Submit
└─ Expected: Error "CPF is required"
```

#### Email Field
```
Test Case 1: Invalid email
├─ Input: "notanemail"
├─ Tab or Submit
└─ Expected: Error "Invalid email format"

Test Case 2: Valid email
├─ Input: "user@example.com"
├─ Tab
└─ Expected: Field marked valid

Test Case 3: Too long
├─ Input: (151+ characters)
├─ Submit
└─ Expected: Error "Email too long"
```

#### Phone Number
```
Test Case 1: Invalid format
├─ Input: "1234567890"
├─ Tab
└─ Expected: Error "Invalid phone format"

Test Case 2: Valid format
├─ Input: "(11) 99999-9999"
├─ Tab
└─ Expected: Field marked valid

Test Case 3: Empty
├─ Input: (empty)
├─ Submit
└─ Expected: Error "Phone Number is required"
```

#### Birth Date
```
Test Case 1: Future date
├─ Input: 2099-12-31
├─ Tab
└─ Expected: Error "Birth date cannot be in future"

Test Case 2: Valid past date
├─ Input: 1990-05-20
├─ Tab
└─ Expected: Field marked valid

Test Case 3: Empty
├─ Input: (empty)
├─ Submit
└─ Expected: Error "Birth Date is required"
```

#### Address Fields (if enabled)
```
Test Case 1: Zip Code format
├─ Input: "01310100" (invalid format)
├─ Tab
└─ Expected: Error "Invalid zip code format"

Test Case 2: Zip Code valid
├─ Input: "01310-100"
├─ Tab
└─ Expected: Field marked valid

Test Case 3: All address fields empty
├─ Action: Toggle address ON
├─ Submit without filling
└─ Expected: Errors on all required fields
```

### 3. Form Submission Testing

#### Success Scenario
```bash
Test: Register valid customer
├─ Fill all required fields with valid data
├─ Click "Register Customer"
├─ Expected:
│  ├─ Loading spinner appears
│  ├─ Form disables temporarily
│  ├─ Success message shows
│  ├─ Form resets/clears
│  └─ No errors in console
└─ Check backend: Customer saved

# Verify in backend
curl http://localhost:8080/api/v1/customers
# Should see new customer in response
```

#### Validation Error Scenario
```bash
Test: Submit with invalid data
├─ Leave required fields empty
├─ Click "Register Customer"
├─ Expected:
│  ├─ Form NOT submitted
│  ├─ Validation errors display
│  ├─ Red error messages below fields
│  ├─ Submit button remains enabled
│  └─ No network request made
```

#### Conflict Scenario (CPF/Email Exists)
```bash
Test: Register duplicate CPF
├─ Use CPF from existing customer
├─ Click "Register Customer"
├─ Expected:
│  ├─ Request sent to backend
│  ├─ Error message appears
│  ├─ Error says "Customer already exists"
│  ├─ Form retains data
│  └─ No form reset
```

#### Connection Error Scenario
```bash
Test: Backend not running
├─ Stop backend server
├─ Fill form and submit
├─ Expected:
│  ├─ Loading spinner appears briefly
│  ├─ Error message "Connection failed"
│  ├─ No error in console (or expected CORS/network error)
│  ├─ Form retains data
│  └─ User can retry
```

---

## API Integration Testing

### Test with cURL

#### Create Customer
```bash
curl -X POST http://localhost:8080/api/v1/customers \
  -H 'Content-Type: application/json' \
  -H 'Accept-Language: en-US' \
  -d '{
    "fullName": "John Doe",
    "cpf": "123.456.789-10",
    "email": "john@example.com",
    "phoneNumber": "(11) 99999-9999",
    "birthDate": "1990-05-20"
  }'

# Expected response (201 Created):
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    ...
  }
}
```

#### Get All Customers
```bash
curl http://localhost:8080/api/v1/customers

# Expected response (200 OK):
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "content": [...],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### Get Single Customer
```bash
# Set CUSTOMER_ID to the UUID returned by the API.
CUSTOMER_ID='<customer-uuid>'
curl "http://localhost:8080/api/v1/customers/$CUSTOMER_ID"

# Expected response (200 OK):
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": { ... }
}
```

#### Update Customer
```bash
curl -X PUT "http://localhost:8080/api/v1/customers/$CUSTOMER_ID" \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Jane Doe",
    "cpf": "123.456.789-10",
    ...
  }'

# Expected response (200 OK)
```

#### Delete Customer
```bash
curl -X DELETE "http://localhost:8080/api/v1/customers/$CUSTOMER_ID"

# Expected response (200 OK):
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## Responsive Design Testing

### Mobile Testing (375px width)

```
☐ Form stacks vertically
☐ Labels above inputs
☐ Buttons full width
☐ Text readable without zoom
☐ Address section scrolls
☐ No horizontal scrolling
☐ Touch-friendly button size
```

### Tablet Testing (768px width)

```
☐ Two-column layout (optional)
☐ Form fields properly spaced
☐ Buttons side-by-side
☐ Address section visible
☐ All content readable
☐ No layout issues
```

### Desktop Testing (1920px width)

```
☐ Full layout displays
☐ Cards properly aligned
☐ Form has good spacing
☐ Icons display correctly
☐ No excessive white space
☐ Professional appearance
```

### Browser Testing

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest 2 | ✅ Test |
| Firefox | Latest 2 | ✅ Test |
| Safari | Latest 2 | ✅ Test |
| Edge | Latest 2 | ✅ Test |

### Test Procedures

```bash
# Chrome DevTools Device Emulation
1. Open DevTools (F12)
2. Click device icon
3. Select device or custom size
4. Test form at various breakpoints
5. Check responsive images

# Test on actual devices
1. Get local IP: ipconfig (Windows) or ifconfig (Mac/Linux)
2. Visit http://your-ip:4200
3. Test on phone/tablet
4. Verify form works
5. Check zoom behavior
```

---

## Error Scenario Testing

### Network Errors

| Scenario | Test | Expected |
|----------|------|----------|
| **Backend Down** | Stop backend, submit form | Error: "Connection failed" |
| **Timeout** | Add network throttling, submit | Error after timeout |
| **CORS Error** | Wrong proxy config | Console error: CORS |
| **Invalid Response** | Mock bad response | Error: "Invalid response" |

### Validation Errors

| Scenario | Test | Expected |
|----------|------|----------|
| **Empty Form** | Submit empty | All fields marked invalid |
| **Single Field** | Leave one field empty | Error on that field only |
| **Invalid Format** | Wrong CPF format | CPF error message |
| **Future Date** | Select 2099 date | Date error message |

### Server Errors

```bash
# Simulate 409 Conflict (CPF exists)
curl -X POST http://localhost:8080/api/v1/customers \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Existing User",
    "cpf": "123.456.789-10",
    ...
  }'

# Expected response (409):
{
  "success": false,
  "code": "CUSTOMER_ALREADY_EXISTS",
  "message": "Customer with this CPF already exists"
}
```

---

## Performance Testing

### Load Testing

```bash
# Install Apache Bench
npm install -g apache-benchmark

# Test homepage (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:4200/

# Expected: All requests successful
# Response time < 100ms average
```

### Bundle Size

```bash
# Build and analyze
npm run build

# Expected sizes:
# - main.js: ~234 KB
# - Total: ~544 KB (raw), ~103 KB (gzipped)

# Analyze with webpack-bundle-analyzer
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/car-sales-platform/stats.json
```

### Page Load Time

```
Metrics to check (DevTools > Network):
✅ First Contentful Paint (FCP) < 1.5s
✅ Largest Contentful Paint (LCP) < 2.5s
✅ Cumulative Layout Shift (CLS) < 0.1
✅ Time to Interactive (TTI) < 3.5s
```

---

## Troubleshooting Guide

### Issue: Form Not Loading

**Symptoms**: Blank page or 404 error

**Checklist**:
1. ✅ Backend running? Check: `curl http://localhost:8080`
2. ✅ Frontend running? Check: `npm start` in correct directory
3. ✅ Port 4200 free? Try: `ng serve --port 4201`
4. ✅ Node.js v18+? Check: `node --version`
5. ✅ npm packages installed? Run: `npm install`

**Solution**:
```bash
# Clean rebuild
rm -rf node_modules
npm install
npm start
```

### Issue: Form Fields Not Responding

**Symptoms**: Can't type in fields or click buttons

**Checklist**:
1. ✅ Check browser console for JavaScript errors (F12)
2. ✅ Reload page: Ctrl+Shift+R (hard refresh)
3. ✅ Check form is not disabled
4. ✅ Check for validation errors

**Solution**:
```bash
# Check for errors
npm run build

# If errors found, fix TypeScript errors
# Restart dev server
npm start
```

### Issue: Backend Connection Failed

**Symptoms**: "Connection Error" message on form submit

**Checklist**:
1. ✅ Backend running on port 8080?
2. ✅ Proxy config correct in `proxy.conf.json`?
3. ✅ Check browser console for CORS error
4. ✅ Check network tab for failed requests

**Solution**:
```bash
# Verify backend
curl http://localhost:8080/api/v1/customers

# Check proxy
cat proxy.conf.json

# Restart frontend
npm start
```

### Issue: Validation Errors Incorrect

**Symptoms**: Error messages don't match input

**Checklist**:
1. ✅ Check form validators in component
2. ✅ Compare with API documentation
3. ✅ Clear browser cache

**Solution**:
```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Clear DevTools cache
DevTools → Application → Clear Site Data
```

### Issue: Form Submission Doesn't Work

**Symptoms**: Button click does nothing

**Checklist**:
1. ✅ Check console for errors (F12)
2. ✅ Verify all required fields filled
3. ✅ Check network requests in DevTools
4. ✅ Verify backend is running

**Solution**:
```bash
# Test API directly
curl -X POST http://localhost:8080/api/v1/customers \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Test","cpf":"123.456.789-10","email":"test@example.com","phoneNumber":"(11)99999-9999","birthDate":"1990-05-20"}'

# If API works, check component logic
# Restart frontend
npm start
```

### Issue: CORS Error

**Symptoms**: `Access-Control-Allow-Origin` error in console

**Error Message**:
```
Access to XMLHttpRequest at 'http://localhost:8080/api/v1/customers'
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution**:

Option 1: Verify proxy is working
```bash
# Check proxy.conf.json exists
ls -la proxy.conf.json

# Verify dev config uses it
grep -A2 "proxyConfig" angular.json

# Should show:
# "proxyConfig": "proxy.conf.json"
```

Option 2: Restart with proxy
```bash
npm start
# Dev server should use proxy automatically
```

Option 3: Configure backend CORS (production)
```
Contact backend team to configure CORS:
- Allow-Origin: Your frontend URL
- Allow-Methods: GET, POST, PUT, DELETE
- Allow-Headers: Content-Type, Authorization
```

### Issue: npm install Fails

**Symptoms**: Dependency installation error

**Error Message**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve dependency peer
```

**Solution**:
```bash
# Clear cache
npm cache clean --force

# Use legacy peer deps (temporary)
npm install --legacy-peer-deps

# Or use npm 7+ force resolution
npm install --force
```

---

## Security Checklist

- ✅ No sensitive data in code
- ✅ HTTPS enabled (production)
- ✅ Input validation on client
- ✅ Input validation on server
- ✅ CORS properly configured
- ✅ No console errors with sensitive data
- ✅ Passwords not logged
- ✅ API keys not exposed
- ✅ CSP headers configured
- ✅ Dependencies up-to-date

---

## Post-Testing Checklist

Before deploying to production:

- ✅ All forms tested and working
- ✅ All validation working correctly
- ✅ All error scenarios handled
- ✅ Responsive design tested on devices
- ✅ Performance acceptable
- ✅ Security checklist passed
- ✅ Documentation reviewed
- ✅ Build runs without errors
- ✅ Deployment instructions tested

---

**Last Updated**: November 14, 2026  
**Version**: 1.0  
**Status**: Production Ready
# 
# Initial chunk files | Names         |  Raw size | Estimated transfer size
# ...
# Application bundle generation complete.
#
# ➜ Application is running at http://localhost:4200
```

### Step 3: Open in Browser
Navigate to: **http://localhost:4200**

You should see:
- Customer Registration Form
- Two sections: Personal Information & Address
- All fields properly labeled in English

---

## ✅ Functionality Verification

### Test 1: View Form
- [ ] Form loads without errors
- [ ] All fields are visible
- [ ] Form styling looks professional
- [ ] No console errors (F12)

### Test 2: Form Validation
Fill form with invalid data:
- [ ] Name too short (< 3 chars) → Error message
- [ ] Invalid CPF format → Error message
- [ ] Invalid email → Error message
- [ ] Invalid phone format → Error message
- [ ] Future birth date → Error message

### Test 3: Form Submission (Success)
Fill with valid data:
```
Full Name: John Smith
CPF: 529.982.247-25
Email: john@example.com
Phone: (11) 99999-9999
Birth Date: 1990-05-20
Gender: Male
Address:
  Zip Code: 01310-100
  Street: Avenida Paulista
  Number: 1000
  Neighborhood: Bela Vista
  City: São Paulo
  State: SP
```

Then:
- [ ] Click "Register"
- [ ] Loading spinner appears
- [ ] Check browser Network tab (F12)
  - [ ] POST request to `/api/v1/customers`
  - [ ] Status: 201 Created (or 200 if configured differently)
- [ ] Success message appears
- [ ] Form resets

### Test 4: Error Handling
Submit duplicate data (same CPF/email):
- [ ] Error message displays
- [ ] Field errors highlighted
- [ ] HTTP 409 Conflict response shown

---

## 🔍 Debug Information

### Browser Console (F12)
Should show:
- No TypeScript/JavaScript errors
- HTTP requests logged
- API responses visible in Network tab

### Network Tab (F12)
Expected requests:
```
GET  /api/v1/customers (on page load - if listing feature used)
POST /api/v1/customers (on form submission)
     ├─ Headers: Content-Type: application/json
     ├─ Headers: Accept-Language: en-US
     └─ Response: 201 Created with customer data
```

### Terminal (npm start)
Should show proxy logs:
```
[HPM] GET /api/v1/customers
[HPM] Response: 200 OK

[HPM] POST /api/v1/customers
[HPM] Response: 201 Created
```

---

## 📊 Response Validation

### Success Response Structure
```json
{
  "success": true,
  "message": "Customer successfully registered.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Smith",
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
    "createdAt": "2026-01-14T10:30:00"
  }
}
```

### Expected Normalizations (Backend)
- CPF: No formatting → `52998224725`
- Email: Lowercase → `john@example.com`
- Phone: Digits only → `11999999999`
- Zip Code: Digits only → `01310100`
- State: Uppercase → `SP`

---

## ⚠️ Common Issues & Solutions

### Issue: "Cannot GET /api/v1/customers"
**Cause**: Proxy not working  
**Solution**: 
```bash
# Make sure proxy is active (npm start)
# Check proxy.conf.json exists
# Restart npm start
```

### Issue: CORS Error in Console
**Cause**: Proxy misconfigured  
**Solution**:
```bash
# Kill npm start (Ctrl+C)
# Verify proxy.conf.json exists
# Delete node_modules and reinstall
npm install
npm start
```

### Issue: Backend responds but form shows nothing
**Cause**: API response format mismatch  
**Solution**:
- Check response in Network tab (F12)
- Verify `success`, `message`, `data` fields
- Compare with documentation

### Issue: 404 Customer Not Found
**Cause**: Backend port incorrect  
**Solution**:
```bash
# Verify backend is running on 8080
curl http://localhost:8080/swagger-ui.html

# If different port, update proxy.conf.json:
{
  "/api": {
    "target": "http://localhost:YOUR_PORT"
    ...
  }
}
```

### Issue: Form submission timeout
**Cause**: Backend not responding  
**Solution**:
1. Check backend logs
2. Verify no errors in backend
3. Test backend directly: `curl http://localhost:8080/api/v1/customers`

---

## 🔐 Security Verification

### HTTPS (Production)
- [ ] Update `environment.prod.ts` with HTTPS URL
- [ ] Certificate validation enabled
- [ ] No sensitive data in localStorage

### CORS (Production)
- [ ] Remove proxy from production
- [ ] Configure CORS on backend
- [ ] Use real API domain

### CPF Privacy
- [ ] CPF not displayed in response (by design)
- [ ] CPF not saved in localStorage
- [ ] CPF only transmitted to backend

---

## 📱 Responsive Design

Test on different screen sizes:
- [ ] Desktop (1920px) - Full layout
- [ ] Laptop (1366px) - Comfortable spacing
- [ ] Tablet (768px) - Optimized layout
- [ ] Mobile (375px) - Stacked form

---

## 🎯 Final Verification Summary

| Item | Status | Notes |
|------|--------|-------|
| Files created | ✅ | All 3 files present |
| Backend running | ? | User must verify |
| Frontend starts | ✅ | Run `npm start` |
| Proxy configured | ✅ | `proxy.conf.json` |
| Form displays | ✅ | All fields visible |
| Validation works | ✅ | Check all validators |
| API integration | ? | Test with real backend |
| CORS handling | ✅ | Via proxy |
| Error display | ✅ | Field-level errors |
| Responsive design | ✅ | Mobile optimized |

---

## 📞 Support Resources

### Documentation Files
1. **START_HERE.md** - Quick start (5 min read)
2. **BACKEND_CONNECTION.md** - Connection details
3. **ARCHITECTURE.md** - System design
4. **CONNECTION_SUMMARY.txt** - Quick reference
5. **DOCUMENTATION.md** - Full technical docs
6. **README.md** - Project overview

### Backend Resources
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI: http://localhost:8080/v3/api-docs
- API Documentation: [Provided by user]

### Angular Resources
- Angular Docs: https://angular.io/docs
- Angular CLI: https://angular.io/cli
- TypeScript: https://www.typescriptlang.org

---

## ✨ Next Steps

1. **Verify backend is running**
   ```bash
   curl http://localhost:8080/swagger-ui.html
   ```

2. **Start frontend**
   ```bash
   cd car-sales-platform
   npm start
   ```

3. **Test the form**
   - Open http://localhost:4200
   - Fill with valid data
   - Click Register

4. **Check Network tab**
   - F12 → Network
   - Look for `/api/v1/customers` requests

5. **Monitor logs**
   - Terminal shows proxy logs
   - Browser console shows errors

6. **Implement additional features**
   - Customer list/pagination
   - Edit customer
   - Delete customer
   - Language switching (i18n)

---

**Test Date**: [Your testing date]  
**Status**: Ready for QA  
**Last Updated**: 2026-11-14

