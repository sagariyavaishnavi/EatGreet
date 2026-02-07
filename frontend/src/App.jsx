import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
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
import SuperAdminLogin from './pages/super-admin/SuperAdminLogin';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminCategory from './pages/admin/AdminCategory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminTable from './pages/admin/AdminTable';
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

// Protected Route for Store Admins
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const role = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  // Redirect Super Admins to their own dashboard if they try to access admin routes
  if (role === 'superadmin') {
    return <Navigate to="/super-admin" replace />;
  }
  return children;
};

// Protected Route for Super Admin
const SuperAdminRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const role = localStorage.getItem('userRole');

  if (!isAuthenticated || role !== 'superadmin') {
    return <Navigate to="/super-admin/login" replace />;
  }
  return children;
};

// Helper component for redirecting /admin/subpath
const AdminSubpathRedirect = () => {
  const { "*": splat } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const restaurantSlug = user?.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || 'restaurant';
  return <Navigate to={`/${restaurantSlug}/admin/${splat}`} replace />;
};

const SessionClearRedirect = () => {
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  }, []);
  return <Navigate to="/" replace />;
};

const TitleUpdater = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    let title = 'EatGreet';

    // Admin Routes
    if (pathname === '/admin') title = 'Dashboard';
    else if (pathname === '/admin/menu') title = 'Menu';
    else if (pathname === '/admin/category') title = 'Category';
    // Super Admin Routes
    else if (pathname === '/super-admin') title = 'Super Admin';
    else if (pathname === '/super-admin/login') title = 'Super Admin Login';

    // Auth & Landing
    else if (pathname === '/login') title = 'Login';
    else if (pathname === '/signup') title = 'Signup';

    // Default fallback
    else {
      const pathSegments = pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const lastSegment = pathSegments[pathSegments.length - 1];
        title = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
      }
    }

    document.title = title;
  }, [pathname]);

  return null;
};

import { SettingsProvider } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <SettingsProvider>
      <ErrorBoundary>
        <Router>
          <TitleUpdater />
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Auth */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Super Admin Auth */}
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<Navigate to={`/${JSON.parse(localStorage.getItem('user'))?.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || 'restaurant'}/admin`} replace />} />
            <Route path="/admin/*" element={<AdminSubpathRedirect />} />

            <Route path="/:restaurantName/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="category" element={<AdminCategory />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="table" element={<AdminTable />} />
              <Route path="sales" element={<div className="p-4">Sales Page (Coming Soon)</div>} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={
              <SuperAdminRoute>
                <SuperAdminLayout />
              </SuperAdminRoute>
            }>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="restaurants" element={<Restaurants />} />
              <Route path="payments" element={<Payments />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<Users />} />
              <Route path="profile" element={<SuperAdminProfile />} />
              <Route path="settings" element={<SuperAdminSettings />} />
            </Route>

            <Route path="/kitchen" element={<Navigate to={`/${JSON.parse(localStorage.getItem('user'))?.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || 'restaurant'}/kitchen`} replace />} />

            <Route path="/:restaurantName/kitchen" element={
              <ProtectedRoute>
                <KitchenLayout />
              </ProtectedRoute>
            }>
              <Route index element={<KitchenDashboard />} />
              <Route path="profile" element={<KitchenProfile />} />
              <Route path="settings" element={<KitchenSettings />} />
            </Route>



            {/* Dynamic Restaurant Routes */}
            <Route path="/r/:restaurantId" element={<CustomerLayout />}>
              <Route index element={<Menu />} />
              <Route path="menu" element={<Menu />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="favorites" element={<CustomerFavorites />} />
            </Route>

            {/* New Table Specific Route */}
            <Route path="/:restaurantName/table/:tableNo" element={<CustomerLayout />}>
              <Route index element={<Menu />} />
              <Route path="menu" element={<Menu />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="favorites" element={<CustomerFavorites />} />
            </Route>



            {/* Fallback */}
            <Route path="*" element={<SessionClearRedirect />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </SettingsProvider>
  );
}

export default App;
