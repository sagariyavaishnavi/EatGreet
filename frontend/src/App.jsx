import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Super Admin Imports
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import Restaurants from './pages/super-admin/Restaurants';
import Payments from './pages/super-admin/Payments';
import Reports from './pages/super-admin/Reports';
import Users from './pages/super-admin/Users';
import SuperAdminProfile from './pages/super-admin/SuperAdminProfile';
import SuperAdminSettings from './pages/super-admin/SuperAdminSettings';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminCategory from './pages/admin/AdminCategory';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSettings from './pages/admin/AdminSettings';
import SuperAdminLayout from './layouts/SuperAdminLayout';

import KitchenLayout from './layouts/KitchenLayout';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import KitchenProfile from './pages/kitchen/KitchenProfile';
import KitchenSettings from './pages/kitchen/KitchenSettings';

// Customer Imports
import CustomerLayout from './layouts/CustomerLayout';
import Menu from './pages/customer/Menu';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerSettings from './pages/customer/CustomerSettings';
import CustomerFavorites from './pages/customer/Favorites';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="category" element={<AdminCategory />} />
          <Route path="orders" element={<div className="p-4">Orders Page (Coming Soon)</div>} />
          <Route path="sales" element={<div className="p-4">Sales Page (Coming Soon)</div>} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route path="settings" element={<SuperAdminSettings />} />
        </Route>

        {/* Kitchen Routes */}
        <Route path="/kitchen" element={<KitchenLayout />}>
          <Route index element={<KitchenDashboard />} />
          <Route path="profile" element={<KitchenProfile />} />
          <Route path="settings" element={<KitchenSettings />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="menu" replace />} />
          <Route path="menu" element={<Menu />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="favorites" element={<CustomerFavorites />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>

        {/* Dynamic Restaurant Routes for QR Code Access */}
        <Route path="/r/:restaurantId" element={<CustomerLayout />}>
          <Route index element={<Menu />} />
          <Route path="menu" element={<Menu />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="favorites" element={<CustomerFavorites />} />
         </Route>

        {/* Legacy/Shortcut Routes */}
        <Route path="/menu" element={<Navigate to="/customer/menu" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
