import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import Menu from './pages/customer/Menu';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes (Placeholders for now) */}
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/menu" element={<Menu />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
