import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Spinner from './components/ui/Spinner';

// Pages
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

import SuperAdminSetup from './pages/auth/SuperAdminSetup';
import SuperDashboard    from './pages/superadmin/SuperDashboard';
import Restaurants       from './pages/superadmin/Restaurants';
import RestaurantDetail  from './pages/superadmin/RestaurantDetail';
import SuperActivityLogs from './pages/superadmin/ActivityLogs';

import AdminDashboard  from './pages/admin/AdminDashboard';
import ManageStaff     from './pages/admin/ManageStaff';
import ManageTables    from './pages/admin/ManageTables';
import ManageMenu      from './pages/admin/ManageMenu';
import ManageInventory from './pages/admin/ManageInventory';
import Reports         from './pages/admin/Reports';

import WaiterDashboard from './pages/waiter/WaiterDashboard';
import CreateOrder     from './pages/waiter/CreateOrder';

import KitchenBoard  from './pages/kitchen/KitchenBoard';
import BillingPanel  from './pages/cashier/BillingPanel';

import { getDashboardRoute } from './utils/auth';

function RequireAuth({ children, roles }) {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to={getDashboardRoute(user?.role)} replace />;
  return children;
}

function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh' }}>
      <Spinner size={36} />
    </div>
  );
}

export default function App() {
  const { isLoggedIn, user } = useAuth();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={isLoggedIn ? <Navigate to={getDashboardRoute(user?.role)} /> : <Login />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to={getDashboardRoute(user?.role)} /> : <Register />} />
          <Route path="/setup/superadmin" element={<SuperAdminSetup />} />

          {/* SuperAdmin */}
          <Route element={<RequireAuth roles={['superadmin']}><AppLayout /></RequireAuth>}>
            <Route path="/superadmin/dashboard"         element={<SuperDashboard />} />
            <Route path="/superadmin/restaurants"       element={<Restaurants />} />
            <Route path="/superadmin/restaurants/:id"   element={<RestaurantDetail />} />
            <Route path="/superadmin/logs"              element={<SuperActivityLogs />} />
          </Route>

          {/* Admin */}
          <Route element={<RequireAuth roles={['admin']}><AppLayout /></RequireAuth>}>
            <Route path="/admin/dashboard"  element={<AdminDashboard />} />
            <Route path="/admin/staff"      element={<ManageStaff />} />
            <Route path="/admin/tables"     element={<ManageTables />} />
            <Route path="/admin/menu"       element={<ManageMenu />} />
            <Route path="/admin/inventory"  element={<ManageInventory />} />
            <Route path="/admin/reports"    element={<Reports />} />
          </Route>

          {/* Waiter */}
          <Route element={<RequireAuth roles={['waiter']}><AppLayout /></RequireAuth>}>
            <Route path="/waiter/dashboard" element={<WaiterDashboard />} />
            <Route path="/waiter/orders"    element={<CreateOrder />} />
          </Route>

          {/* Kitchen */}
          <Route element={<RequireAuth roles={['kitchen']}><AppLayout /></RequireAuth>}>
            <Route path="/kitchen/board" element={<KitchenBoard />} />
          </Route>

          {/* Cashier */}
          <Route element={<RequireAuth roles={['cashier']}><AppLayout /></RequireAuth>}>
            <Route path="/cashier/billing" element={<BillingPanel />} />
            <Route path="/cashier/summary" element={<BillingPanel summary />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to={isLoggedIn ? getDashboardRoute(user?.role) : '/login'} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
