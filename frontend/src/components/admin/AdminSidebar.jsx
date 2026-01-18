import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu as MenuIcon, List, ShoppingBag, BarChart3, Settings, LogOut } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100';
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: MenuIcon, label: 'Menu', path: '/admin/menu' },
    { icon: List, label: 'Category', path: '/admin/category' },
    { icon: ShoppingBag, label: 'Order', path: '/admin/orders' },
    { icon: BarChart3, label: 'Sales', path: '/admin/sales' },
  ];

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <span className="text-xl font-bold text-gray-800">Eat<span className="text-primary font-normal">Greet</span></span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
            onClick={() => {
                localStorage.removeItem('isAuthenticated');
                window.location.href = '/admin/login';
            }}
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 w-full rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
