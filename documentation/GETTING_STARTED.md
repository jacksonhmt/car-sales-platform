# Getting Started Guide

Complete setup guide for the Car Sales Platform - Customer Registration Frontend

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [First Steps](#first-steps)
5. [Configuration](#configuration)
6. [Building for Production](#building-for-production)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Angular CLI**: v22 or higher
- **Code Editor**: Visual Studio Code (recommended)

### Verify Installation

Check if you have the required tools installed:

```bash
# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: v9.0.0 or higher

# Install Angular CLI globally (if not installed)
npm install -g @angular/cli@22
```

### Backend Requirements

The application requires a running backend API:
- **Backend URL**: `http://localhost:8080`
- **API Base**: `http://localhost:8080/api/v1/customers`
- **Status**: Must be running before starting the frontend

---

## Installation

### Step 1: Clone or Download the Project

Navigate to the project directory:

```bash
cd car-sales-platform
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

**What this does**:
- Downloads all dependencies listed in `package.json`
- Creates `node_modules/` folder
- Generates `package-lock.json` for version consistency
- Takes 2-3 minutes depending on internet speed

**Expected Output**:
```
added X packages in Xm
```

### Step 3: Verify Installation

Verify that the project is ready:

```bash
npm run build
```

**Expected Output**:
```
✔ Compilation successful
Build at: dist/car-sales-platform
```

---

## Running the Application

### Start Development Server

```bash
npm start
```

**What this does**:
- Compiles the Angular application
- Starts a local web server
- Opens the application in your default browser
- Enables hot-reload for code changes

**Expected Output**:
```
✔ Compiled successfully
Application bundle generated successfully. 
Build at: dist/car-sales-platform/...
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:4200
```

The customer registration form should load automatically.

### Stop the Server

Press `Ctrl+C` in the terminal to stop the development server.

---

## First Steps

### 1. Verify Connectivity

**Check Backend Connection**:

1. Open your browser's Developer Tools (F12)
2. Go to the Network tab
3. Fill out a simple form field and press Tab
4. Look for a network request to `/api/` endpoints
5. Verify the response status is 2xx (success)

**Expected Behavior**:
- Form fields should accept input
- No CORS errors in console
- Network requests complete successfully

### 2. Try the Registration Form

1. Fill in the Personal Information section:
   - **Full Name**: Any name (3+ characters)
   - **CPF**: Use format `000.000.000-00` (example: `123.456.789-10`)
   - **Email**: Valid email address
   - **Phone**: Format `(00) 00000-0000` (example: `(11) 99999-9999`)
   - **Birth Date**: Any past date (YYYY-MM-DD format)
   - **Gender**: Optional

2. (Optional) Enable address information:
   - Check "Include Address Information"
   - Fill in all address fields
   - Select a Brazilian state

3. Click "Register Customer"

4. Expected results:
   - ✅ Success: See success message, form resets
   - ❌ Error: See error message with details

### 3. Check Browser Console

Open Developer Tools (F12) and check the Console tab:

```javascript
// Should see logs like:
Registering customer...
Response: { success: true, ... }
Customer registered with ID: 1
```

No error messages should appear (CORS, network, etc.).

---

## Configuration

### Development Environment

**File**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1/customers'
};
```

**Note**: Uses relative URL `/api/v1/customers` because the proxy redirects it.

### Proxy Configuration

**File**: `proxy.conf.json` (root directory)

The proxy automatically redirects development API calls to the backend:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "pathRewrite": { "^/api": "/api" }
  }
}
```

**How it works**:
1. Frontend makes request to `http://localhost:4200/api/v1/customers`
2. Proxy intercepts and forwards to `http://localhost:8080/api/v1/customers`
3. Response returns to frontend (no CORS issues)
4. Only active during development (`npm start`)

### Production Environment

**File**: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-api-domain.com/api/v1/customers'
};
```

**Before deploying**, update this file with your production backend URL.

### Changing the Backend URL

To connect to a different backend:

1. **For Development**: Edit `proxy.conf.json`
   ```json
   "target": "http://your-backend-url:8080"
   ```

2. **For Production**: Edit `src/environments/environment.prod.ts`
   ```typescript
   apiBaseUrl: 'https://your-backend-url/api/v1/customers'
   ```

3. Restart the dev server or rebuild

---

## Building for Production

### Create Production Build

```bash
npm run build
```

**Options**:
```bash
# Standard production build
npm run build

# Or with explicit configuration
ng build --configuration production

# With optimization flags
ng build --configuration production --aot --optimization
```

**Expected Output**:
```
✔ Compilation successful
Build at: dist/car-sales-platform/
```

### Build Artifacts

The compiled application is in `dist/car-sales-platform/`:

```
dist/car-sales-platform/
├── index.html              (Entry point)
├── main.js                 (Application code - minified)
├── styles.css              (Global styles - minified)
├── runtime.js              (Angular runtime)
├── polyfills.js            (Browser compatibility)
└── assets/                 (Static files)
```

### Build Statistics

- **Total Size**: ~544 KB
- **Gzipped Size**: ~103 KB
- **Build Time**: ~1.6 seconds
- **Errors**: 0
- **Warnings**: 0

### Deploy to Production

To deploy, copy the contents of `dist/car-sales-platform/` to your hosting:

```bash
# Example: Copy to a web server
cp -r dist/car-sales-platform/* /var/www/html/

# Or: Deploy to cloud platform
aws s3 sync dist/car-sales-platform/ s3://my-bucket/
```

---

## Project Structure

```
car-sales-platform/
├── angular.json                 (Angular configuration)
├── tsconfig.json                (TypeScript configuration)
├── package.json                 (Dependencies)
├── proxy.conf.json              (Dev proxy)
│
├── src/
│   ├── index.html               (HTML entry point)
│   ├── main.ts                  (Bootstrap file)
│   ├── styles.css               (Global styles)
│   │
│   └── app/
│       ├── app.ts               (Root component)
│       ├── app.config.ts        (App configuration)
│       │
│       ├── components/
│       │   └── customer-registration/
│       │       ├── customer-registration.component.ts
│       │       ├── customer-registration.component.html
│       │       └── customer-registration.component.css
│       │
│       ├── services/
│       │   └── customer.service.ts
│       │
│       ├── models/
│       │   ├── customer.model.ts
│       │   ├── address.model.ts
│       │   └── api-response.model.ts
│       │
│       └── environments/
│           ├── environment.ts
│           └── environment.prod.ts
│
├── dist/                        (Production build output)
└── node_modules/                (Dependencies - after npm install)
```

---

## Common Commands

### Development

```bash
# Start development server
npm start

# Run unit tests
npm test

# Run linter
ng lint

# Format code
npx prettier --write "src/**/*.ts"
```

### Building

```bash
# Development build
npm run build

# Production build
npm run build -- --configuration production

# Analyze bundle size
ng build -- --stats-json
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/car-sales-platform/stats.json
```

### Debugging

```bash
# Enable debugging in browser
# 1. Open Chrome DevTools (F12)
# 2. Go to Sources tab
# 3. Breakpoints work in TypeScript files

# Check terminal logs
# Look for errors in npm start terminal

# Check browser console
# Press F12 → Console tab
```

---

## Troubleshooting

### Issue: Port 4200 Already in Use

**Error**:
```
ERROR in Cannot start server on port 4200. It is already in use.
```

**Solutions**:

Option 1: Use a different port
```bash
ng serve --port 4201
```

Option 2: Kill the process using port 4200
```bash
# macOS/Linux
lsof -i :4200
kill -9 <PID>

# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Issue: Cannot Connect to Backend

**Error**:
```
ERR_CONNECTION_REFUSED or CORS error
```

**Checklist**:
1. ✅ Is the backend running at `http://localhost:8080`?
2. ✅ Check proxy configuration in `proxy.conf.json`
3. ✅ Verify API base URL in `src/environments/environment.ts`
4. ✅ Check browser console for CORS error details
5. ✅ Restart both backend and frontend

**Solution**:
```bash
# Restart frontend
npm start

# In another terminal, verify backend is running
curl http://localhost:8080/api/v1/customers
```

### Issue: npm install Fails

**Error**:
```
npm ERR! command failed
```

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Update npm
npm install -g npm@latest

# Check for permission issues
sudo chown -R $USER ~/.npm
```

### Issue: Build Errors

**Check TypeScript errors**:
```bash
# Strict type checking
ng build --strict

# See all errors
ng build --stats-json
```

**Solutions**:
1. Make sure all dependencies are installed: `npm install`
2. Update Angular CLI: `npm install -g @angular/cli@latest`
3. Check TypeScript version: `npx tsc --version`

### Issue: Form Not Submitting

**Debugging**:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Check for error messages
4. Check Network tab to see API requests

**Common causes**:
- Form validation failing (check error messages)
- Backend not responding (check connection)
- CORS error (check browser console)

---

## Next Steps

1. **Explore the Form**: Fill it out and test the validation
2. **Read the Documentation**: Check [INDEX.md](./INDEX.md)
3. **Start Developing**: See [DOCUMENTATION.md](./DOCUMENTATION.md)
4. **Test Everything**: See [VERIFICATION.md](./VERIFICATION.md)

---

## Getting Help

### Documentation
- **Complete Index**: [INDEX.md](./INDEX.md)
- **Technical Details**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Backend Integration**: [BACKEND_CONNECTION.md](./BACKEND_CONNECTION.md)
- **Testing & Debugging**: [VERIFICATION.md](./VERIFICATION.md)

### External Resources
- [Angular Official Docs](https://angular.io/docs)
- [Bootstrap Docs](https://getbootstrap.com/docs/5.3/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Angular CLI Documentation](https://angular.io/cli)

---

**Last Updated**: November 14, 2026  
**Version**: 1.0  
**Status**: Production Ready

