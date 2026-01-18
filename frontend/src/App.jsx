import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import Menu from './pages/customer/Menu';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';

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
            <Route path="category" element={<div className="p-4">Category Page (Coming Soon)</div>} />
            <Route path="orders" element={<div className="p-4">Orders Page (Coming Soon)</div>} />
            <Route path="sales" element={<div className="p-4">Sales Page (Coming Soon)</div>} />
        </Route>

        {/* Other Roles (Placeholders) */}
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/menu" element={<Menu />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
