# 🚗 Car Sales Platform

Angular application for managing customers, with a dashboard and backend API integration.

## 🛠️ Technology Stack

- **Frontend**: Angular 22
- **Styling**: Bootstrap 6.0.0-alpha.1, Bootstrap Icons and custom CSS
- **Language**: TypeScript 6.0
- **Package manager**: npm
- **Build and tests**: Angular CLI and Vitest

Bootstrap 6 is an alpha release. See `package.json` for dependency ranges and `package-lock.json` for the exact installed versions.

## 🚀 Getting Started

Install a Node.js version compatible with the project's Angular dependencies and npm. The configured package manager is npm 11.20.0.

```bash
cd car-sales-platform
npm ci
npm start
```

Open [http://localhost:4200](http://localhost:4200). The customer features require the backend API to be running at `http://localhost:8080`.

## ✨ Features

- Dashboard with the total number of customers
- Paginated customer list with create, view, edit and delete actions
- Customer form with validation and an optional address
- API error messages and field-level feedback
- Responsive layout and theme selection

## 🌐 API Integration

The application uses the relative API URL `/api/v1/customers`, configured in `src/environments/environment.ts`. During development, `proxy.conf.json` forwards `/api` requests to `http://localhost:8080`.

The customer service uses GET, POST, PUT and DELETE requests. See the [Backend Connection Guide](./documentation/BACKEND_CONNECTION.md) for additional integration information.

## 📋 Project Structure

```text
car-sales-platform/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── customer/
│   │   │   │   ├── customer-list/
│   │   │   │   └── customer-registration/
│   │   │   ├── dashboard/
│   │   │   ├── navbar/
│   │   │   └── sidebar/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   └── environment.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── documentation/
├── public/
├── angular.json
├── package.json
├── package-lock.json
├── proxy.conf.json
└── tsconfig.json
```

## 🧪 Testing

```bash
npm test -- --watch=false
```

## 🚀 Production Build

```bash
npm run build
```

The browser files are generated in `dist/car-sales-platform/browser/`. Configure the web server to serve `index.html` for Angular routes and to forward `/api` requests to the backend; the development proxy is not included in the production build.

## 📚 Documentation

The following guides contain additional project information. Some details may describe an earlier version of the application; use the current code and configuration as the source of truth.

- [Documentation Index](./documentation/INDEX.md)
- [Getting Started](./documentation/GETTING_STARTED.md)
- [Architecture](./documentation/ARCHITECTURE.md)
- [Backend Connection](./documentation/BACKEND_CONNECTION.md)
- [Verification](./documentation/VERIFICATION.md)
- [Technical Documentation](./documentation/DOCUMENTATION.md)
- [Quick Reference](./documentation/CONNECTION_SUMMARY.txt)
