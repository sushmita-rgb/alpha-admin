import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Lazy loaded page components
const Login = lazy(() => import('../features/auth/Login'));
const Dashboard = lazy(() => import('../features/analytics/Dashboard'));
const ProductsList = lazy(() => import('../features/products/ProductsList'));
const ProductDetails = lazy(() => import('../features/products/ProductDetails'));
const Analytics = lazy(() => import('../features/analytics/Analytics'));
const Settings = lazy(() => import('../features/settings/Settings'));

// Loading Screen Fallback for Code Splitting
const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-2.5">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      <span className="text-xs text-slate-400 font-medium">Loading panel...</span>
    </div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Private Routes Wrapper */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'user']} />}>
          <Route element={<DashboardLayout />}>
            {/* Root path: Redirects based on role inside the component, or defaults to layout subpages */}
            <Route path="/" element={<Navigate to="/products" replace />} />
            
            {/* Common Authenticated Routes */}
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            
            {/* Admin-only Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
