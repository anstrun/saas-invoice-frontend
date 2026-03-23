# Skill: FacturaSaaS - Frontend Architecture

## Overview

This skill documents the frontend architecture of FacturaSaaS, a React + Vite electronic invoicing application for Ecuador (SRI).

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod
- **UI Components**: shadcn/ui (Radix UI) + Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner + Toast

## Project Structure

```
src/
├── app/                          # Application setup
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   ├── routes.tsx                # Route definitions
│   └── providers.tsx              # React providers (QueryClient, Tooltip, Toaster)
│
├── assets/
│   └── designSystem.ts           # Centralized tokens (colors, spacing, typography)
│
├── features/                     # Feature-based architecture
│   ├── auth/
│   │   ├── components/
│   │   │   └── AuthGuard.tsx    # Route protection
│   │   ├── hooks/
│   │   │   └── useAuth.ts       # React Query hooks (useLogin, useLogout, useCurrentUser)
│   │   ├── pages/
│   │   │   └── LoginPage.tsx    # Login screen
│   │   ├── services/
│   │   │   └── auth.service.ts  # API calls (login, logout, getMe, refresh)
│   │   ├── types/
│   │   │   └── auth.types.ts    # TypeScript interfaces
│   │   └── index.ts             # Barrel export
│   │
│   ├── customers/
│   │   ├── hooks/
│   │   │   └── useCustomers.ts   # CRUD hooks
│   │   ├── services/
│   │   │   └── customer.service.ts
│   │   ├── types/
│   │   │   └── customer.types.ts
│   │   └── index.ts
│   │
│   ├── invoices/
│   │   ├── components/
│   │   │   ├── ClientData.tsx
│   │   │   ├── CompanyInfo.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   └── PaymentMethod.tsx
│   │   ├── helpers/
│   │   │   └── invoice.helpers.ts   # Process SRI response
│   │   ├── hooks/
│   │   │   └── useInvoices.ts
│   │   ├── mappers/
│   │   │   └── invoice.mapper.ts   # DTO transformation
│   │   ├── pages/
│   │   │   └── InvoicePage.tsx
│   │   ├── services/
│   │   │   ├── invoice.service.ts
│   │   │   └── branch.service.ts   # Branch services
│   │   ├── types/
│   │   │   └── invoice.types.ts
│   │   └── index.ts
│   │
│   └── certificates/
│       ├── hooks/
│       │   └── useCertificates.ts
│       ├── services/
│       │   └── certificate.service.ts
│       ├── types/
│       │   └── certificate.types.ts
│       └── index.ts
│
├── shared/                       # Shared code
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── config/
│   │   └── api.config.ts        # API base URL
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   ├── use-mobile.tsx
│   │   └── useParentAuth.ts     # PostMessage auth receiver
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   └── utils.ts            # cn() utility
│   ├── services/
│   │   └── api.client.ts       # Centralized fetch wrapper
│   └── types/
│       └── api.types.ts        # Common types + SRI enums
│
├── pages/
│   └── NotFound.tsx
├── index.css                    # Tailwind + CSS variables
└── vite-env.d.ts
```

## Architecture Patterns

### Feature-Based Architecture

Each feature (auth, customers, invoices, certificates) follows the same structure:
- `types/` - TypeScript interfaces
- `services/` - API calls (using api.client)
- `hooks/` - React Query hooks
- `components/` - Feature-specific UI components
- `pages/` - Page components
- `index.ts` - Public API (barrel export)

### Shared Layer

Code used across multiple features:
- `api.client.ts` - Centralized fetch with JWT, refresh token, credentials
- `api.config.ts` - API base URL
- `designSystem.ts` - Design tokens (colors, spacing, typography)
- `ui/` - shadcn/ui components

### Authentication Flow

This application runs as an **iframe** embedded in a parent application (`saas-frontend`). Authentication is received via `postMessage` from the parent.

#### Parent App Integration

The parent app sends authentication data using `postMessage`:
```javascript
iframeRef.current.contentWindow.postMessage({
  type: 'AUTH_DATA',
  token: '<jwt_token>',
  user: {
    id: '<user_id>',
    email: '<user_email>',
    name: '<user_name>',
    tenantId: '<tenant_id>',
    tenantName: '<tenant_name>'
  }
}, '<iframe_origin>');
```

#### useParentAuth Hook

Located at `src/hooks/useParentAuth.ts`, this hook:
1. Listens for `message` events from parent window
2. On `AUTH_DATA` message: stores token in `localStorage._at` and user data in state
3. On `AUTH_LOGOUT` message: clears localStorage and notifies parent
4. Sends `REQUEST_AUTH` message to parent if no token exists

```typescript
interface ParentAuthData {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    tenantId: string;
    tenantName?: string;
  };
}

// Usage
const { authData, isLoading } = useParentAuth();
```

#### Legacy Login Flow (Deprecated)

The original login flow (`POST /api/auth/login`) is no longer used. Token storage:
- Key: `_at` (access token in localStorage)
- Key: `_rt` (refresh token in localStorage)

#### Protected Routes

`AuthGuard` checks for token existence in localStorage.

### Response Structure

All API responses follow a standard structure with a `data` wrapper:

```typescript
// Branch Response
interface BranchResponse {
  success: boolean;
  data: {
    success: boolean;
    branch: Branch;
  };
}

// Certificate Status Response
interface CertificateStatusResponse {
  success: boolean;
  data: {
    success: boolean;
    hasActiveCertificate: boolean;
    certificate: CertificateStatus | null;
  };
}

// Certificate Response
interface CertificateResponse {
  success: boolean;
  data: {
    success: boolean;
    certificate: Certificate;
  };
}

// Certificate List Response
interface CertificateListResponse {
  success: boolean;
  data: {
    success: boolean;
    certificates: Certificate[];
  };
}
```

### API URL Structure

All services use `http://localhost:3002/api/v1` (saas-backend microservice).

Each service has its own API client with the base URL:

```typescript
// certificate.service.ts
const CERTIFICATES_API_URL = "http://localhost:3002/api/v1";

// branch.service.ts
const BRANCHES_API_URL = "http://localhost:3002/api/v1";

// customer.service.ts
const CUSTOMER_API_URL = "http://localhost:3002/api/v1";

// invoice.service.ts
const INVOICE_API_URL = "http://localhost:3002/api/v1";
```

**API Endpoints:**

| Service | Endpoints |
|---------|-----------|
| Certificates | `/certificates/upload`, `/certificates/status`, `/certificates` |
| Branches | `/branches/current`, `/branches/:id` |
| Customers | `/customers`, `/customers/:id`, `/customers/identification?identification=` |
| Invoices | `/invoices`, `/invoices/:accessKey` |

**Note:** The backend extracts `tenantId` from the JWT token, so it's NOT sent as a parameter.

### Customer Hooks (useCustomers.ts)

```typescript
// Search customers
useCustomers(search?: string, page?: number, limit?: number)

// Get customer by ID
useCustomer(id: string)

// Find customer by identification number
useCustomerByIdNumber(identification: string)

// Create new customer
useCreateCustomer()

// Update customer
useUpdateCustomer()
```

### Branch Hooks (useBranch.ts)

```typescript
// Get current branch (from JWT token)
useCurrentBranch()
```

### Certificate Hooks (useCertificates.ts)

```typescript
// Get certificate status
useCertificateStatus()

// List all certificates
useCertificates()

// Upload certificate
useUploadCertificate()
```

### InvoicePage Features

The `InvoicePage` component integrates:
- **CompanyInfo**: Displays branch data from `useCurrentBranch()`
- **ClientDataPanel**: Customer search/create with `useCustomerByIdNumber()` and `useCreateCustomer()`
- **CertificateUploadDialog**: Shows when `hasActiveCertificate === false`

```typescript
// InvoicePage state management
const { data: certStatus } = useCertificateStatus();
const { data: branchData } = useCurrentBranch();
const { data: customerData, isLoading: isSearching } = useCustomerByIdNumber(searchTerm);
const createCustomer = useCreateCustomer();
const showCertDialog = certStatus?.data?.hasActiveCertificate === false;

// Customer search with debounce (500ms)
useEffect(() => {
  const timer = setTimeout(() => {
    if (clientData.ruc.length >= 10) {
      setSearchTerm(clientData.ruc);
    }
  }, 500);
  return () => clearTimeout(timer);
}, [clientData.ruc]);
```

### ClientDataPanel Props

```typescript
interface ClientDataProps {
  data: ClientData;
  onChange: (data: ClientData) => void;
  isReadonly?: boolean;        // Blocks razonSocial, email when true
  showSaveButton?: boolean;    // Shows "Guardar Cliente" button
  onSave?: () => void;         // Callback when save button clicked
  isSaving?: boolean;          // Loading state for save operation
  isSearching?: boolean;       // Loading state for customer search
}
```

## Design System

Located at `src/assets/designSystem.ts`, exports `ds` object with:

```typescript
ds.colors          // brand, surface, dark, text, success/warning/error
ds.typography      // pageTitle, sectionHeading, body, label, etc.
ds.spacing         // page, card, section, element, form, input
ds.radius           // card, interactive, button, badge, input
ds.shadows         // card, stickyBar
ds.sizing          // sidebar, icon, avatar, actionButton
ds.layouts         // twoColumns, splitScreen, productGrid
ds.transitions     // default, all, ease
```

Usage in components:
```tsx
import { ds } from "@/assets/designSystem";

<div className={`${ds.radius.card} ${ds.spacing.card.padding} ${ds.shadows.card}`}>
  <h2 className={ds.typography.sectionHeading}>Title</h2>
</div>
```

## Routing

```typescript
// src/app/routes.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />  {/* Public */}
  <Route element={<AuthGuard><AppLayout /></AuthGuard>}>  {/* Protected */}
    <Route path="/" element={<InvoicePage />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Key Files

| File | Purpose |
|------|---------|
| `api.client.ts` | Base HTTP client with JWT auth |
| `useParentAuth.ts` | PostMessage auth receiver from parent app |
| `auth.service.ts` | Auth API calls (legacy) |
| `AuthGuard.tsx` | Route protection |
| `designSystem.ts` | Design tokens |
| `invoice.service.ts` | Invoice CRUD (uses INVOICE_API_URL) |
| `invoice.helpers.ts` | SRI response processing |
| `invoice.mapper.ts` | Form → API DTO |
| `branch.service.ts` | Branch services (uses BRANCHES_API_URL) |
| `branch.types.ts` | Branch interfaces with data wrapper |
| `useBranch.ts` | useCurrentBranch hook |
| `certificate.service.ts` | Certificate CRUD (uses CERTIFICATES_API_URL) |
| `certificate.types.ts` | Certificate interfaces with data wrapper |
| `useCertificates.ts` | useCertificateStatus, useCertificates, useUploadCertificate |
| `customer.service.ts` | Customer CRUD (uses CUSTOMER_API_URL) |
| `customer.types.ts` | Customer interfaces |
| `useCustomers.ts` | useCustomerByIdNumber, useCreateCustomer, etc. |
| `ClientData.tsx` | Customer search/create panel |
| `InvoicePage.tsx` | Main invoicing page |

## Environment Variables

- `VITE_API_URL` - Backend API URL (defaults to `http://localhost:3000/api/v1`)

## Scripts

```bash
npm run dev     # Start dev server (http://localhost:8080)
npm run build   # Production build
npm run preview # Preview production build
npm run lint    # ESLint checks
npm run test    # Run tests
```

## API Reference

See `skills/api-reference.md` for complete API documentation including:
- Authentication endpoints (login, refresh, logout, me)
- Customer CRUD
- Invoice creation and retrieval
- Certificate management
- SRI response handling
