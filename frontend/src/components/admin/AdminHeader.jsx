import React from 'react';
import { Bell, Settings, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import logo from '../../assets/logo-full.png';

const AdminHeader = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50';
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Menu', path: '/admin/menu' },
    { label: 'Category', path: '/admin/category' },
    { label: 'Order', path: '/admin/orders' },
    { label: 'Sales', path: '/admin/sales' },
  ];

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="px-[30px] py-3 flex items-center justify-between sticky top-0 z-50 bg-transparent transition-all">
      {/* Logo Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link to="/admin" className="block">
          <img src={logo} alt="EatGreet" className="h-10 w-auto object-contain" />
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
      <div className="flex items-center gap-3">
        <button className="hidden sm:flex w-11 h-11 bg-white hover:bg-gray-50 rounded-full items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-600 hover:text-black">
          <Settings className="w-5 h-5" />
        </button>
        <button className="w-11 h-11 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-600 hover:text-black relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Profile Capsule */}
        <div className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 bg-white rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-md transition-all">
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-50">
            <img src="https://ui-avatars.com/api/?name=Admin&background=FD6941&color=fff" alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">Admin</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-4 lg:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-base font-medium transition-all ${location.pathname === item.path
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

AdminHeader.propTypes = {
  title: PropTypes.string, // title is optional now as we are using it for navigation
};

export default AdminHeader;
