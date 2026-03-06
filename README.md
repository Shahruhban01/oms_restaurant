# 🍴 RestaurantOS — Frontend

> React + Vite frontend for the RestaurantOS Multi-Tenant Restaurant Management System.
> Connects to the [PHP backend API](../backend/README.md) to deliver a full POS, kitchen display, billing, inventory, and reporting experience.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Routing & Role Guards](#-routing--role-guards)
- [State Management](#-state-management)
- [API Layer](#-api-layer)
- [Custom Hooks](#-custom-hooks)
- [UI Components](#-ui-components)
- [Pages](#-pages)
- [Real-Time Polling](#-real-time-polling)
- [Styling](#-styling)
- [Build & Deployment](#-build--deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🌐 Overview

The frontend is a single-page application (SPA) built with **React 19** and **Vite**.
It supports 5 user roles — each with a completely separate dashboard and navigation.
Zero UI libraries are used — every component is hand-crafted with CSS variables.

**Live demo:** `https://restaurant-oms.vercel.app`
**Backend API:** `https://restaurant-api.developerruhban.com/backend/api`

---

## 🛠 Tech Stack

| Technology       | Version | Purpose                          |
|------------------|---------|----------------------------------|
| React            | 19.2    | UI framework                     |
| React Router DOM | 7.2     | Client-side routing + guards     |
| Axios            | 1.7     | HTTP client with interceptors    |
| Vite             | 7.3     | Build tool & dev server          |

> **No UI library** (no MUI, Tailwind, Ant Design, etc.) — 100% custom CSS with CSS variables.
> **No Redux** — Context API + `useApi` hook pattern throughout.

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── notification.mp3         # Kitchen new-order audio alert
├── src/
│   ├── main.jsx                 # React root, BrowserRouter mount
│   ├── App.jsx                  # Route definitions + role-based guards
│   ├── index.css                # Global CSS variables, reset, utilities
│   │
│   ├── context/
│   │   ├── AuthContext.jsx      # Login, logout, user state, token storage
│   │   └── ToastContext.jsx     # Global toast notification system
│   │
│   ├── hooks/
│   │   ├── useApi.js            # Loading / error / execute wrapper
│   │   ├── usePolling.js        # Smart polling with tab-visibility pause
│   │   └── usePlanLimits.js     # Plan usage checker for limit banners
│   │
│   ├── services/
│   │   └── api.js               # All API calls (Axios instance + all endpoints)
│   │
│   ├── utils/
│   │   ├── auth.js              # Token decode, user helpers
│   │   ├── formatters.js        # Currency (₹), date, status color helpers
│   │   └── constants.js         # Poll intervals, role enums, plan limits
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx    # Shell: sidebar + topbar + <Outlet>
│   │   │   ├── Sidebar.jsx      # Role-aware navigation links
│   │   │   └── TopBar.jsx       # Header with user info + logout
│   │   ├── ui/
│   │   │   ├── Button.jsx       # 5 variants, sizes, loading spinner state
│   │   │   ├── Input.jsx        # Unified input / select / textarea
│   │   │   ├── Modal.jsx        # Accessible overlay modal
│   │   │   ├── Table.jsx        # Data table with loading + empty states
│   │   │   ├── Badge.jsx        # Status and label badges
│   │   │   ├── Card.jsx         # Container card with optional header
│   │   │   ├── Spinner.jsx      # SVG loading spinner
│   │   │   ├── Toast.jsx        # Toast + ToastStack components
│   │   │   └── ConfirmDialog.jsx
│   │   └── shared/
│   │       ├── PlanLimitBanner.jsx  # Warning banner at 85% plan usage
│   │       └── ErrorBoundary.jsx
│   │
│   └── pages/
│       ├── auth/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── SuperAdminSetup.jsx  # One-time superadmin creation page
│       ├── superadmin/
│       │   ├── SuperDashboard.jsx
│       │   ├── Restaurants.jsx
│       │   ├── RestaurantDetail.jsx
│       │   └── ActivityLogs.jsx
│       ├── admin/
│       │   ├── AdminDashboard.jsx
│       │   ├── ManageStaff.jsx
│       │   ├── ManageTables.jsx
│       │   ├── ManageMenu.jsx
│       │   ├── ManageInventory.jsx
│       │   └── Reports.jsx
│       ├── waiter/
│       │   ├── WaiterDashboard.jsx
│       │   └── CreateOrder.jsx
│       ├── kitchen/
│       │   └── KitchenBoard.jsx
│       └── cashier/
│           └── BillingPanel.jsx
│
├── index.html
├── vite.config.js
├── package.json
├── .env                         # Local dev environment (never commit)
└── .env.example                 # Template for env setup
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- Backend API running (locally or on server)

### Installation

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
```

Edit `.env`:
```ini
VITE_API_URL=http://localhost/backend/public/api
```

```bash
# 4. Start development server
npm run dev
# → http://localhost:5173
```

---

## 🔧 Environment Variables

| Variable       | Required | Description                                                             |
|----------------|----------|-------------------------------------------------------------------------|
| `VITE_API_URL` | ✅        | Full URL to the backend API — no trailing slash                        |

**Examples:**

```ini
# Local development (XAMPP)
VITE_API_URL=http://localhost/backend/public/api

# Local development (Vite proxy)
VITE_API_URL=http://localhost:5173/api

# Production (shared hosting)
VITE_API_URL=https://restaurant-api.developerruhban.com/backend/api
```

> `VITE_` prefix is required — Vite only exposes variables prefixed with `VITE_` to the browser.
> Never put secrets in frontend `.env` files — they are visible in the browser bundle.

---

## 📜 Available Scripts

```bash
npm run dev        # Start Vite dev server on port 5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

---

## 🔐 Routing & Role Guards

`App.jsx` defines all routes with role-based protection.
Unauthenticated users are redirected to `/login`.
Users accessing a route outside their role are redirected to their own dashboard.

| Path                          | Role Required  |
|-------------------------------|----------------|
| `/login`                      | Public         |
| `/register`                   | Public         |
| `/setup/superadmin`           | Public (once)  |
| `/superadmin/*`               | `superadmin`   |
| `/admin/*`                    | `admin`        |
| `/waiter/*`                   | `waiter`       |
| `/kitchen/*`                  | `kitchen`      |
| `/cashier/*`                  | `cashier`      |

After login, users are automatically redirected to their role's dashboard:

```
superadmin → /superadmin/dashboard
admin      → /admin/dashboard
waiter     → /waiter/dashboard
kitchen    → /kitchen/board
cashier    → /cashier/billing
```

---

## 🧠 State Management

No Redux. Two global contexts handle all shared state:

### `AuthContext`
```jsx
const { user, token, login, logout, isAuthenticated } = useAuth();
```
- Stores JWT token in `localStorage`
- Decodes token to expose `user.role`, `user.restaurant_id`, `user.email`
- Axios interceptor automatically attaches `Authorization: Bearer <token>` to every request
- On any `401` response, automatically calls `logout()` and redirects to `/login`

### `ToastContext`
```jsx
const { showToast } = useToast();
showToast('Saved successfully', 'success');  // success | error | warning | info
```
- Global toast notifications from any component
- Auto-dismiss after 4 seconds
- Stacks multiple toasts vertically

---

## 🌐 API Layer

All API calls are defined in `src/services/api.js` as named functions.
The Axios instance is pre-configured with `baseURL` from `VITE_API_URL`.

```js
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

---

## 🪝 Custom Hooks

### `useApi(apiFn)`
Wraps any API call with automatic loading and error state:

```jsx
const { data, loading, error, execute } = useApi(api.getMenuItems);

useEffect(() => { execute(); }, []);

if (loading) return <Spinner />;
if (error)   return <p>{error}</p>;
```

### `usePolling(apiFn, interval)`
Smart polling that pauses when the browser tab is hidden:

```jsx
// Polls every 4 seconds, pauses on tab switch
usePolling(() => api.pollKitchen(since), 4000);
```

```js
// Internally uses visibilitychange:
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') startInterval();
  else clearInterval(timer);
});
```

### `usePlanLimits()`
Returns current usage vs plan limits for the logged-in restaurant:

```jsx
const { usage, limits, isNearLimit } = usePlanLimits();
// isNearLimit('staff') → true if > 85% of staff slots used
```

---

## 🧩 UI Components

All components live in `src/components/ui/` and accept consistent props:

### `Button`
```jsx
<Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
  Save
</Button>
```
Variants: `primary` · `secondary` · `danger` · `ghost` · `outline`

### `Input`
```jsx
<Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
<Input as="select" label="Role" value={role} onChange={...}>
  <option value="waiter">Waiter</option>
</Input>
```

### `Modal`
```jsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Staff">
  <StaffForm onSubmit={handleSubmit} />
</Modal>
```

### `Table`
```jsx
<Table
  columns={['Name', 'Role', 'Status', 'Actions']}
  data={staff}
  loading={loading}
  emptyMessage="No staff members yet"
  renderRow={s => <tr key={s.id}>...</tr>}
/>
```

### `Badge`
```jsx
<Badge status="active" />    // green
<Badge status="suspended" /> // red
<Badge status="pending" />   // yellow
```

---

## 📄 Pages

### Auth Pages
| Page | Path | Description |
|------|------|-------------|
| `Login` | `/login` | Email + password login for all roles |
| `Register` | `/register` | Self-serve restaurant + admin registration |
| `SuperAdminSetup` | `/setup/superadmin` | One-time superadmin creation with setup key |

### SuperAdmin Pages
| Page | Path | Description |
|------|------|-------------|
| `SuperDashboard` | `/superadmin/dashboard` | System-wide stats: restaurants, users, orders |
| `Restaurants` | `/superadmin/restaurants` | List, create, suspend, update plan |
| `RestaurantDetail` | `/superadmin/restaurants/:id` | Per-restaurant deep view |
| `ActivityLogs` | `/superadmin/activity-logs` | System-wide audit trail |

### Admin Pages
| Page | Path | Description |
|------|------|-------------|
| `AdminDashboard` | `/admin/dashboard` | Revenue, order counts, plan usage bars |
| `ManageStaff` | `/admin/staff` | Add/edit/disable/delete staff + reset passwords |
| `ManageTables` | `/admin/tables` | Table CRUD with live status display |
| `ManageMenu` | `/admin/menu` | Category + item management with sort order |
| `ManageInventory` | `/admin/inventory` | Stock tracking, adjustments, low-stock alerts |
| `Reports` | `/admin/reports` | Daily / weekly / monthly / best-selling / staff |

### Role Pages
| Page | Path | Role |
|------|------|------|
| `WaiterDashboard` | `/waiter/dashboard` | Table map with live status |
| `CreateOrder` | `/waiter/order/:tableId` | Order builder with item search + notes |
| `KitchenBoard` | `/kitchen/board` | Live order queue with auto-polling |
| `BillingPanel` | `/cashier/billing` | Bill preview, payment processing, daily summary |

---

## ⏱ Real-Time Polling

RestaurantOS uses **smart HTTP polling** instead of WebSockets for shared hosting compatibility.

| Screen | Endpoint | Interval |
|--------|----------|----------|
| Kitchen Board | `GET /api/kitchen/poll?since=` | 4 seconds |
| Waiter Table View | `GET /api/tables` | 6 seconds |
| Billing Panel | On-demand | Manual |

Polling automatically **pauses when the tab is hidden** and **resumes on focus** — saving battery on kitchen tablets.

---

## 🎨 Styling

- **Zero CSS frameworks** — all styles in `index.css` + component-level `<style>` blocks
- **CSS custom properties** (variables) for theming:

```css
:root {
  --color-primary:    #2563eb;
  --color-success:    #16a34a;
  --color-danger:     #dc2626;
  --color-warning:    #d97706;
  --color-bg:         #f8fafc;
  --color-surface:    #ffffff;
  --color-border:     #e2e8f0;
  --color-text:       #1e293b;
  --color-text-muted: #64748b;
  --radius:           8px;
  --shadow:           0 1px 3px rgba(0,0,0,0.1);
}
```

- Currency formatted as **Indian Rupees (₹)** with `en-IN` locale
- Dates formatted in `DD MMM YYYY` style throughout

---

## 🚢 Build & Deployment

### Production Build

```bash
# Uses .env.production automatically if present
npm run build

# Output → frontend/dist/
```

### Deploy to Shared Hosting

```bash
# Upload dist/ contents to public_html/
# Ensure public_html/.htaccess handles SPA routing:
```

```apache
Options -Indexes
RewriteEngine On
RewriteBase /

# Skip backend requests
RewriteCond %{REQUEST_URI} ^/backend [NC]
RewriteRule ^ - [L]

# SPA fallback — all routes → index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

### Deploy to Vercel

```bash
# Set environment variable in Vercel dashboard:
# Settings → Environment Variables → VITE_API_URL=https://your-api-domain.com/backend/api

# Push to GitHub → Vercel auto-deploys on every push to main
```

`vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🔧 Troubleshooting

### CORS Error on Login
- Verify `VITE_API_URL` matches the backend exactly — no trailing slash
- Confirm backend `CORS_ORIGIN` in `.env` matches your frontend URL exactly

### Blank Page After Deploy
- Ensure `public_html/.htaccess` SPA rewrite is in place
- Check browser console for 404 on JS/CSS chunks — may be a `base` path issue in `vite.config.js`

```js
// vite.config.js — add base if deployed in a subfolder:
export default defineConfig({
  base: '/',  // change to '/subfolder/' if needed
});
```

### API Calls Going to Wrong URL
```js
// Debug: check what URL Axios is using
console.log(import.meta.env.VITE_API_URL);
```
Make sure `.env` was present **before** running `npm run build` — Vite bakes env vars at build time.

### Kitchen Board Not Polling
- Check browser console for repeated API errors
- Confirm the tab is in the foreground (polling pauses on hidden tabs by design)
- Verify JWT token is not expired — check Network tab for `401` responses

### Token Expired / Auto Logout
- Default token lifetime is 24h (`JWT_EXPIRY=86400` in backend `.env`)
- Axios interceptor automatically redirects to `/login` on any `401`
- Increase `JWT_EXPIRY` on the backend if sessions are expiring too quickly

---

<div align="center">
  <strong>RestaurantOS Frontend</strong> — Built with React, zero dependencies on UI libraries.
  <br/>
  Part of the <a href="https://github.com/Shahruhban01/oms_restaurant_backend">RestaurantOS</a> full-stack system.
</div>