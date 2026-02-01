import React from 'react';
import { Bell, Settings, Menu, X, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import logo from '../../assets/logo-full.png';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const restaurantSlug = user?.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || 'restaurant';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    // Exact match or matches if it ignores the dynamic slug part
    return location.pathname === path || (path !== '/' && location.pathname.endsWith(path)) ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50';
  };

  const navItems = [
    { label: 'Dashboard', path: `/${restaurantSlug}/admin` },
    { label: 'Menu', path: `/${restaurantSlug}/admin/menu` },
    { label: 'Category', path: `/${restaurantSlug}/admin/category` },
    { label: 'Order', path: `/${restaurantSlug}/admin/orders` },
    { label: 'Table', path: `/${restaurantSlug}/admin/table` },
    { label: 'Sales', path: `/${restaurantSlug}/admin/sales` },
  ];

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="px-4 sm:px-[30px] py-3 flex items-center justify-between sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-gray-100/50 transition-all">
      {/* Logo Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link to={`/${restaurantSlug}/admin`} className="block">
          <img src={logo} alt="EatGreet" className="h-8 sm:h-10 w-auto object-contain" />
        </Link>
      </div>

      {/* Center Navigation Pills (Desktop) */}
      <nav className="hidden lg:flex items-center bg-white p-1.5 rounded-full shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive(item.path)}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to={`/${restaurantSlug}/admin/settings`} className="w-9 h-9 sm:w-11 sm:h-11 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-600 hover:text-black">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
        <button className="hidden sm:flex w-11 h-11 bg-white hover:bg-gray-50 rounded-full items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-600 hover:text-black relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <button
          onClick={handleLogout}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-white hover:bg-red-50 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-400 hover:text-red-500"
          title="Logout"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Profile Capsule */}
        <Link to={`/${restaurantSlug}/admin/profile`} className="flex items-center gap-3 pl-1.5 pr-1.5 sm:pr-4 py-1.5 bg-white rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-md transition-all">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-50">
            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FD6941&color=fff`} alt={user?.name || 'Admin'} className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop Click-off */}
          <div className="fixed inset-0 top-[65px] bg-black/5 z-[90] lg:hidden" onClick={() => setIsMenuOpen(false)}></div>

          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-2xl p-4 lg:hidden animate-in slide-in-from-top-4 z-[100] ring-1 ring-black/5">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-5 py-4 rounded-2xl text-[17px] font-bold transition-all ${location.pathname === item.path
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

AdminHeader.propTypes = {
  title: PropTypes.string,
};

export default AdminHeader;
