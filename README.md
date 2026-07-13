# Alpha Admin — Advanced Enterprise SaaS Dashboard

Alpha Admin is a production-quality, portfolio-ready React 19 dashboard and product management system inspired by modern industry platforms like Stripe, Vercel, Linear, and Notion.

## ✨ Main Features

1. **Authentication & Role-Based Access Control**:
   - Simulated JWT-based login session stored locally in `Zustand` & `localStorage`.
   - Admin and standard User presets.
   - Admin view permissions for settings, full analytics graphs, and unpublished (hidden) items. Standard User sees ONLY published products list and details.

2. **Dashboard Layout**:
   - Responsive design with collapsible desktop sidebar & hamburger mobile drawer.
   - Global search decorative display, profile status dropdown, and live notification alerts panel.
   - Breadcrumbs navigation.

3. **Products Catalog Module**:
   - Responsive tabular inventory built with TanStack Table.
   - Live debounced search query.
   - Filters: Multi-Category filter, Price filter, and Star Rating filter.
   - Sorting: Price, Rating, and Name (A-Z/Z-A).
   - Local published status override allowing admins to toggle hide/show states.
   - Download current filtered inventory to CSV format.

4. **URL Synchronization**:
   - Complete sync of search query, category, rating, sorting, and page index parameters to URLSearchParams. Preserves catalog states upon page reloads.

5. **Product Details**:
   - Interactive thumbnails gallery.
   - Stock level alarms (In Stock, Low Stock, Out of stock).
   - Technical specifications breakdown.

6. **Analytics Workspace**:
   - Visual KPI indicators (Total Products, Published Count, Average Rating, Stock Valuation).
   - Recharts visual graphs:
     - Rating Distribution Bracket (Area Chart)
     - Products per Category (Bar Chart)
     - Inventory Value Share per Category (Donut Pie Chart)
     - Average Category Performance Star Score (Line Chart)

7. **Performance & Bonus Features**:
   - Background polling: Auto-refreshes data every 10 seconds.
   - Dark Mode: Toggleable theme settings stored in local preferences.
   - Toast system: Auto-dismissing global notification toasts.
   - Drag & Drop: Native HTML5 drag-and-drop table column reordering.
   - Column visibility: Show / hide specific table columns dynamically.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite` integration)
- **State Management**: Zustand
- **Query Caching**: TanStack Query (React Query) v5
- **Table Controls**: TanStack Table (React Table) v8
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 📂 Folder Structure (Feature-Based)

```
src/
├── app/                  # Main App wrapper & configurations
├── assets/               # Stylings, fonts, assets
├── components/           # Reusable shared UI elements
├── features/             # Feature domains
│   ├── auth/             # Login page, RBAC guards
│   ├── products/         # Products table list, details layout
│   ├── analytics/        # KPI panels, Recharts diagrams
│   └── settings/         # Preferences page
├── hooks/                # Reusable custom hooks
├── layouts/              # Dashboard layout (sidebar, navbar)
├── services/             # Axios API service clients
├── store/                # Zustand global state stores
└── utils/                # Helper functions (CSV exporter, formats)
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@alpha.com` | `123456` |
| **Standard User** | `user@alpha.com` | `123456` |

---

## ⚡ Performance Optimizations

- **Route-based Code Splitting**: Utilizing React `lazy` and `Suspense` for modular bundle loading.
- **Query Caching & Background Sync**: TanStack Query manages query status to avoid redundant server requests.
- **Debounced Inputs**: Search queries are debounced by 400ms to reduce UI re-rendering cycles.
- **Optimal State Selectors**: Selecting specific values from Zustand stores to prevent unnecessary component renders.
- **Memoized Callbacks**: Using `useMemo` and `useCallback` on heavy filter arrays and filter updates.

---

## 🚀 Installation & Running Locally

1. Clone the project.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build the production package:
   ```bash
   npm run build
   ```
