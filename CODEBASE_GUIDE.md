# Inventory Management System — Codebase Guide

## Table of Contents
1. [What This Project Is](#what-this-project-is)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [How to Run the Project](#how-to-run-the-project)
5. [Database Design](#database-design)
6. [Business Flow](#business-flow)
7. [How the Frontend and Backend Talk to Each Other](#how-the-frontend-and-backend-talk-to-each-other)
8. [Authentication & Authorization](#authentication--authorization)
9. [What's Working Well](#whats-working-well)
10. [What's Lacking & How to Improve](#whats-lacking--how-to-improve)
11. [Recommended Learning Path](#recommended-learning-path)

---

## What This Project Is

This is a **multi-tenant inventory and sales management system** built for **car audio stores**. It lets store owners and employees manage products, track inventory through stock movements, create sales orders, generate invoices, and view a dashboard with analytics.

"Multi-tenant" means the system supports multiple stores, each with their own data — one database serves all stores, but each store only sees its own products, orders, and users.

---

## Tech Stack

| Layer         | Technology                                    |
|---------------|-----------------------------------------------|
| **Frontend**  | React 19, Vite, MUI (Material UI), Tailwind CSS, Chart.js |
| **Backend**   | Node.js, Express 5                            |
| **Database**  | MySQL with Prisma ORM                         |
| **Auth**      | JWT (JSON Web Tokens), bcrypt for password hashing |
| **PDF**       | jsPDF (client-side), Puppeteer (server-side dashboard export) |

**What each piece does (simplified):**

- **React** = builds the pages users see and interact with
- **Vite** = the tool that bundles your React code and serves it during development (like a super-fast compiler)
- **MUI** = pre-built UI components (buttons, tables, sidebars, modals) so you don't design everything from scratch
- **Tailwind CSS** = utility CSS classes (`flex`, `p-4`, `bg-white`) so you style things inline instead of writing CSS files
- **Express** = the framework that receives HTTP requests from the frontend and sends back JSON data
- **Prisma** = translates your JavaScript code into SQL queries so you don't write raw SQL
- **JWT** = a token the server gives you after login; the frontend attaches it to every request to prove "I'm logged in as this user"
- **bcrypt** = hashes passwords so the database never stores your actual password

---

## Project Structure

```
inventoryManagement/
├── start-app.bat              # Windows script to start both servers + open browser
├── package.json               # Root-level dependencies (shared)
│
├── backend/
│   ├── server.js              # Entry point — starts Express on port 3000
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware (runs before every protected route)
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (all tables, columns, relationships)
│   │   ├── client.js          # Exports a shared Prisma client instance
│   │   ├── seed.js            # Populates the database with initial data (admin user, roles, permissions, demo products)
│   │   └── migrations/        # SQL migration files (history of every schema change)
│   ├── routes/
│   │   ├── index.js           # Route hub — connects all sub-routers to /api/*
│   │   ├── auth.js            # Login, register, email/storeTag validation (PUBLIC — no token needed)
│   │   ├── dashboard.js       # Summary stats, top-selling products, recent transactions, PDF export
│   │   ├── inventory.js       # Legacy inventory CRUD (from an older version of the app)
│   │   ├── invoices.js        # Legacy invoice CRUD (from an older version of the app)
│   │   ├── products.js        # Product listing by store
│   │   ├── product-variants.js# Variant listing + "quick add" demo data endpoint
│   │   ├── sales-order.js     # Full CRUD for sales orders + stock movement tracking
│   │   └── users.js           # List store users, approve/reject employee requests
│   └── data/                  # Static JSON files (likely leftover from pre-database prototyping)
│
├── frontend/
│   ├── index.html             # HTML shell that Vite injects React into
│   ├── vite.config.js         # Vite config (React plugin, proxy to backend)
│   ├── tailwind.config.js     # Tailwind theme customization
│   ├── src/
│   │   ├── main.jsx           # React entry point (wraps App in BrowserRouter)
│   │   ├── App.jsx            # Root component — routing, sidebar, layout grid
│   │   ├── theme.js           # MUI theme overrides
│   │   ├── pages/             # One file per page/route
│   │   │   ├── Login.jsx
│   │   │   ├── Register/index.jsx     # Multi-step registration (owner or employee flow)
│   │   │   ├── AccessStatus.jsx       # "Pending approval" / "Rejected" screen
│   │   │   ├── dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── SalesPage.jsx
│   │   │   ├── CreateOrderSale/index.jsx  # Multi-step sales order form
│   │   │   ├── CreateProduct/index.jsx
│   │   │   ├── Users.jsx
│   │   │   └── ProtectedRoute.jsx     # Wrapper that redirects to /login if not authenticated
│   │   ├── components/
│   │   │   ├── globalComponents/      # Reusable across pages (Sidebar, DataTable, SearchBar, Button, etc.)
│   │   │   ├── localComponents/       # Page-specific (ChartBar, Invoice, TopSellingProducts, etc.)
│   │   │   └── StepsComponents/       # Step-by-step form wizards (registration, create order, create product)
│   │   ├── utils/
│   │   │   ├── auth/                  # Token decoding, permission/role helpers
│   │   │   ├── aggregation/           # Functions to group sales data by week/month/year for charts
│   │   │   └── files/                 # PDF generation helpers (jsPDF)
│   │   └── assets/                    # Images and SVG icon components
```

---

## How to Run the Project

### Prerequisites

1. **Node.js** (v18 or newer) — [download here](https://nodejs.org)
2. **MySQL** — you need a running MySQL server (local install, or use XAMPP/Laragon/Docker)
3. **Git** — to clone the repo

### Step-by-Step

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd inventoryManagement

# 2. Install dependencies for both backend and frontend
cd backend
npm install
cd ../frontend
npm install
cd ..

# 3. Set up the database
#    Create a file called .env inside the backend/ folder with:
#
#    DATABASE_URL="mysql://root:yourpassword@localhost:3306/inventory_db"
#    JWT_SECRET="any-random-string-here"
#    BYPASS_AUTH=false
#
#    Then create the database in MySQL:
#    mysql -u root -p -e "CREATE DATABASE inventory_db;"

# 4. Run Prisma migrations to create all tables
cd backend
npx prisma migrate dev

# 5. Seed the database with initial data (admin user, roles, permissions)
npx prisma db seed

# 6. Start both servers
#    Option A — use the batch file (Windows only):
cd ..
start-app.bat

#    Option B — start manually in two terminals:
#    Terminal 1 (backend):
cd backend
npx nodemon server.js

#    Terminal 2 (frontend):
cd frontend
npm run dev
```

### Default Login After Seeding

| Field    | Value              |
|----------|--------------------|
| Email    | admin@example.com  |
| Password | admin123           |

The frontend runs on **http://localhost:5173** and the backend API on **http://localhost:3000**.

---

## Database Design

The database has ~25 tables. Here's what the core ones do, grouped by purpose:

### Users & Access Control (RBAC)
- **Users** — every person who logs in (email, password hash, status like ACTIVE or PENDING_APPROVAL)
- **Stores** — each store is a "tenant"; one owner, many employees
- **Roles** — named roles like "Admin" or "User"
- **Permissions** — granular permissions like `product:create`, `invoice:view`
- **UserRoles** — links users to roles (a user can have multiple roles)
- **RolePermissions** — links roles to permissions (a role grants many permissions)

This is called **RBAC (Role-Based Access Control)**. The flow: User → has Roles → each Role grants Permissions → the app checks permissions before showing features.

### Products
- **Products** — the master product record (name, brand, category, status)
- **ProductVariants** — each product can have variants (different SKUs, prices). Example: "Pioneer Speaker" can have a "6.5 inch" variant and an "8 inch" variant
- **Attributes / AttributeValues / ProductVariantAttributes** — flexible attribute system (Color: Black, Size: 6.5") linked to variants

### Inventory
- **StockMovements** — every stock change is recorded as a movement with a `change` value (+20 for receiving, -3 for selling). **Current stock = sum of all movements for that variant.** This is called a "ledger-based" inventory system — you never store "current stock" directly; you calculate it
- **StockAudits / StockAdjustmentPerProduct** — physical stock counts to catch discrepancies

### Sales
- **SalesOrders** — a customer order (date, customer name, channel, payment/delivery status)
- **SalesOrderItems** — line items (which variant, quantity, price). Can also be a service item (no product, just a description and price)
- **Channels / SubChannels** — where the sale came from (Online → Tokopedia, Offline → Walk-in)

### Invoices & Credit Notes
- **Invoices / InvoiceLineItems** — billing documents linked to sales orders
- **CreditNotes / CreditNoteItems** — refund/credit documents linked to invoices

### Purchasing (Schema Only — Not Yet Built)
- **PurchaseOrders / PurchaseOrderItems** — ordering from suppliers
- **ReceivedGoodsNotes** — tracking what actually arrived
- **PurchaseReturns / PurchaseReturnItems** — returning to suppliers

### Audit Trail
- **AuditLogs** — records who changed what, when, with old/new values (not yet fully implemented in routes)

---

## Business Flow

Here's how the app is meant to be used, step by step:

### 1. Registration & Store Setup
```
Owner registers → creates account + store → immediately ACTIVE
Employee registers → picks a storeTag → status = PENDING_APPROVAL
Owner sees pending employees → approves or rejects them
```

### 2. Adding Products
```
Owner/employee goes to Products page
→ creates a Product (name, brand, category)
   → creates ProductVariants (SKU, selling price, threshold stock)
      → adds Attributes (Color, Size) to variants
→ initial stock is added via StockMovements (change = +N)
```

There's also a "Quick Add" button that creates two demo products (speakers + amplifier) with stock for testing.

### 3. Creating a Sales Order
```
User goes to Sales → Create Order
→ fills in customer info, channel, date
→ adds product variants (quantity, price) and/or service items
→ reviews the order
→ submits

On submit:
  1. SalesOrder record is created
  2. SalesOrderItems are created for each line
  3. StockMovements are created with NEGATIVE change (stock goes down)
```

### 4. Dashboard Analytics
```
Dashboard fetches:
  - Summary boxes: total sales count, total revenue, low-stock items, unique customers
  - Cashflow chart: revenue grouped by week/month/year
  - Category pie chart: sales by product category
  - Top 5 selling products
  - 5 most recent transactions
```

### 5. User Management
```
Owner sees all users in their store
→ can approve pending employees
→ can reject pending employees
```

---

## How the Frontend and Backend Talk to Each Other

```
┌──────────────────┐         HTTP          ┌──────────────────┐         SQL          ┌─────────┐
│                  │  ──── requests ────>   │                  │  ──── queries ───>   │         │
│  React Frontend  │                       │  Express Backend │                      │  MySQL  │
│  (localhost:5173) │  <── JSON responses── │  (localhost:3000) │  <── results ──────  │         │
└──────────────────┘                       └──────────────────┘                      └─────────┘
```

**Example: Loading the dashboard**

1. Dashboard page mounts → `useEffect` fires
2. Frontend calls `fetch("/api/dashboard/summary", { headers: { Authorization: "Bearer <jwt>" } })`
3. Vite's dev proxy forwards `/api/*` to `localhost:3000`
4. Express receives the request → `authenticateToken` middleware runs → verifies JWT → attaches `req.user`
5. The route handler queries Prisma → Prisma generates SQL → MySQL returns data
6. Express sends JSON back → React receives it → updates state → page re-renders with data

---

## Authentication & Authorization

### Login Flow
```
User types email + password
→ POST /api/auth/login
→ Server finds user, compares bcrypt hash
→ If valid, server creates a JWT containing: userId, storeId, email, roles, permissions
→ JWT sent to frontend → stored in localStorage
→ Every subsequent API call includes: Authorization: Bearer <token>
```

### Route Protection
- **Backend**: `authenticateToken` middleware verifies the JWT on every `/api/*` route (except login and register). If the token is missing or expired, the request is rejected with 401/403.
- **Frontend**: `ProtectedRoute` component checks if a token exists in localStorage. If not, it redirects to `/login`.

### Permission System
Permissions like `product:create` or `invoice:view` are embedded in the JWT. The frontend has helper functions (`hasPermission`, `hasRole`) to conditionally show/hide features. **However**, the backend routes don't actually check permissions yet — any authenticated user can hit any endpoint.

---

## What's Working Well

1. **Solid database design** — the Prisma schema is well-thought-out with proper relationships, indexes, and enums. The ledger-based stock tracking (StockMovements) is a professional approach.

2. **Multi-tenant architecture** — data is properly scoped by `storeId` in most queries, so stores can't see each other's data.

3. **Registration flow** — the owner/employee split with approval workflow is a real-world pattern that works correctly.

4. **Sales order CRUD** — full create, read, update, and delete with proper stock movement reversal on edits and deletes. The transaction-based approach (`prisma.$transaction`) ensures data consistency.

5. **Reusable components** — global components like `DataTable`, `SearchBar`, `Button`, `FilterTabs`, and `PopupComp` show good component-thinking.

6. **Dashboard analytics** — summary cards, charts, top sellers, and recent transactions give a useful overview.

---

## What's Lacking & How to Improve

### 🔴 Critical Issues (Fix These First)

#### 1. Backend Permission Checks Are Missing
**Problem:** The JWT contains permissions, but no route actually checks them. Any logged-in user can delete products, approve users, or create orders — even if they're just an employee with "view-only" access.

**How to fix:** Create a middleware that checks permissions per route.
```javascript
// middleware/authorize.js
const authorize = (module, action) => (req, res, next) => {
  const permissions = req.user.userRoles.flatMap(ur =>
    ur.role.rolePermissions.map(rp => `${rp.permission.module}:${rp.permission.permission}`)
  );
  if (!permissions.includes(`${module}:${action}`)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Usage in routes:
router.delete('/:id', authorize('product', 'delete'), async (req, res) => { ... });
```

#### 2. Legacy Routes Are Broken
**Problem:** `inventory.js` and `invoices.js` use `req.user.id` (old schema) instead of `req.user.userId` (current schema). They reference models and fields that no longer exist in the Prisma schema (like `productCode`, `initialStock`, `userId` on products). These routes will crash if called.

**How to fix:** Either remove them entirely or rewrite them to match the current schema. The inventory functionality is now handled through `product-variants.js` + `StockMovements`.

#### 3. No Input Validation
**Problem:** The backend trusts whatever the frontend sends. If someone sends a negative price, an empty product name, or an invalid date, the server will try to save it. Malicious users could also send crafted requests directly to the API.

**How to fix:** Use a validation library like **Zod** or **Joi**:
```javascript
const { z } = require('zod');

const salesOrderSchema = z.object({
  formData: z.object({
    generalInfo: z.object({
      customerName: z.string().min(1).optional(),
      orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      channelId: z.number().int().positive().optional(),
    }),
    totals: z.object({
      totalAmount: z.number().min(0),
    }),
  }),
  products: z.array(z.object({
    productVariantId: z.number().int().positive(),
    quantitySold: z.number().int().positive(),
    unitPrice: z.number().min(0),
  })),
});
```

#### 4. No Error Boundary on the Frontend
**Problem:** If any component throws a JavaScript error, the entire app crashes to a white screen with no way to recover.

**How to fix:** Add a React Error Boundary at the top level:
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <h1>Something went wrong. Please refresh.</h1>;
    return this.props.children;
  }
}
```

---

### 🟡 Important Improvements

#### 5. No Environment Variable Handling on the Frontend
**Problem:** The backend URL is hardcoded as relative paths (e.g., `fetch("/api/...")`). This works in development because Vite proxies it, but will break in production unless you set up a proper proxy server.

**How to fix:** Use `import.meta.env.VITE_API_URL` in frontend code and define it in a `.env` file:
```
VITE_API_URL=http://localhost:3000
```

#### 6. No Centralized API Layer
**Problem:** Every page component does its own `fetch()` calls with its own headers and error handling. This leads to duplicated code and inconsistent error handling.

**How to fix:** Create a shared API utility:
```javascript
// utils/api.js
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Usage:
const summary = await api('/api/dashboard/summary');
```

#### 7. Token Expiration Is Not Handled Gracefully
**Problem:** The JWT expires after 1 hour. When it does, API calls start returning 403, but the user isn't redirected to login — they just see errors or empty data.

**How to fix:** Check for 401/403 responses globally (in the API utility above) and redirect to login. Optionally, implement refresh tokens for a smoother experience.

#### 8. No Loading States or Skeleton Screens
**Problem:** Most pages show nothing or a plain "Loading..." text while data fetches. This feels sluggish.

**How to fix:** Use MUI's `<Skeleton>` components to show placeholder shapes while loading. You already have MUI installed, so this is easy:
```jsx
{loading ? <Skeleton variant="rectangular" height={200} /> : <ChartBar />}
```

#### 9. State Management Is All Local
**Problem:** Each page fetches its own data independently. If you create a sales order and go back to the sales list, you need a full re-fetch. There's no shared state.

**How to fix (pick one based on complexity):**
- **Simple:** React Context + `useReducer` for shared data like user info and permissions
- **Medium:** **TanStack Query (React Query)** — handles caching, background re-fetching, and loading states automatically. This is the best next step for your project
- **Advanced:** Zustand or Redux Toolkit (probably overkill for this project)

#### 10. No Tests
**Problem:** Zero test files. If you change a route or component, you have no way to verify you didn't break something else.

**How to fix (start small):**
- **Backend:** Use **Jest** + **Supertest** to test API routes
- **Frontend:** Use **Vitest** + **React Testing Library** (Vitest is already compatible with your Vite setup)

Start with one test file for your most critical route (`sales-order.js`) and one for a key component.

---

### 🟢 Nice-to-Have Enhancements

#### 11. Purchase Order Module (Schema Exists, No Routes)
The Prisma schema already defines `PurchaseOrders`, `PurchaseOrderItems`, `ReceivedGoodsNotes`, and `PurchaseReturns`, but there are no API routes or frontend pages for them. This is the natural next feature to build — it completes the inventory cycle (buy from suppliers → track receiving → sell to customers).

#### 12. Audit Logs Are Not Being Written
The `AuditLogs` table exists but no route writes to it. Implementing this would let store owners see "who changed what and when."

#### 13. No Pagination
All list queries (`findMany`) return every record with no limit. As the database grows, this will get slow. Add `skip` and `take` to Prisma queries and a pagination component on the frontend.

#### 14. No Search on Most Pages
The inventory and invoice routes have search endpoints, but the sales page and products page do searches client-side (or not at all). Backend search with database indexes is much more efficient.

#### 15. PDF Invoice Generation
There's a `handleDownloadPdf.js` utility on the frontend, but it generates PDFs client-side with jsPDF. For professional invoices, consider a server-side template (HTML → PDF with Puppeteer, or a library like `pdf-lib`).

#### 16. No Image Upload for Products
`ProductVariants` has an `image` column, but there's no upload endpoint. Consider using **Multer** for file uploads and storing images in a cloud service (Cloudinary, S3) or locally in a `/uploads` folder.

#### 17. Mobile Responsiveness
The sidebar hides on mobile and there's a hamburger menu, but many page layouts (9-column grid, fixed px padding) will feel cramped on phones. Test and adjust the grid breakpoints.

#### 18. Dark Mode
Your Tailwind config and MUI theme are set up for light mode only. Adding dark mode is a great learning exercise for CSS variables and Tailwind's `dark:` variant.

---

## Recommended Learning Path

If you want to use this project to grow as a full-stack developer, here's a suggested order:

1. **Fix the broken legacy routes** (inventory.js, invoices.js) — teaches you about database schema evolution and how ORMs work
2. **Add the authorization middleware** — teaches you about middleware patterns and security
3. **Add input validation with Zod** — teaches you about data integrity and defensive programming
4. **Create the centralized API utility** — teaches you about DRY code and abstraction
5. **Implement React Query** — teaches you about caching, data synchronization, and how modern React apps handle server state
6. **Build the Purchase Orders module** — teaches you full-stack feature development from schema to UI
7. **Add pagination** — teaches you about database performance and UX patterns
8. **Write your first tests** — teaches you about software reliability and confidence in changes
9. **Deploy the app** (e.g., Railway for backend, Vercel for frontend, PlanetScale for MySQL) — teaches you about DevOps, environment variables, and production concerns

Each step builds on the previous one and teaches a different aspect of full-stack development. Take them one at a time — don't try to do everything at once.

---

*Generated for learning purposes. This guide reflects the codebase as of its latest commit.*
