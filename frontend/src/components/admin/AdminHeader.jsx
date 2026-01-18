import { Bell, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const AdminHeader = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-black text-white' : 'text-gray-600 hover:text-gray-900';
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Menu', path: '/admin/menu' },
    { label: 'Category', path: '/admin/category' },
    { label: 'Order', path: '/admin/orders' },
    { label: 'Sales', path: '/admin/sales' },
  ];

  return (
    <header className="px-8 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/80">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <span className="text-xl font-bold text-gray-800">Eat<span className="text-primary font-normal">Greet</span></span>
      </div>

      {/* Center Navigation */}
      <nav className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
        {navItems.map((item) => (
            <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isActive(item.path)}`}
            >
                {item.label}
            </Link>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 border border-gray-200">
            <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 border border-gray-200 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Admin&background=FD6941&color=fff" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
               <button className="flex items-center gap-2 text-sm font-bold text-gray-800">
                   Admin
                   <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
               </button>
            </div>
        </div>
      </div>
    </header>
  );
};

AdminHeader.propTypes = {
    title: PropTypes.string, // title is optional now as we are using it for navigation
};

export default AdminHeader;
