import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Settings, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

import logo from '../../assets/logo-full.png';

export default function SuperAdminNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useSettings();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/super-admin' },
        { name: 'Restaurants', path: '/super-admin/restaurants' },
        { name: 'Payment', path: '/super-admin/payments' },
        { name: 'Reports', path: '/super-admin/reports' },
        { name: 'Users', path: '/super-admin/users' },
    ];

    return (
        <nav className="flex items-center justify-between px-[30px] py-3 sticky top-0 z-50 bg-transparent">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <Link to="/super-admin" className="block">
                    <img src={logo} alt="EatGreet" className="h-10 w-auto object-contain" />
                </Link>
            </div>

            {/* Navigation Pills */}
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-full shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 overflow-x-auto no-scrollbar max-w-[calc(100vw-180px)] lg:max-w-none">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-500 hover:text-black hover:bg-gray-50'
                                }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                <Link to="/super-admin/settings" className="w-11 h-11 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-600 hover:text-black">
                    <Settings className="w-5 h-5" />
                </Link>

                <button className="w-11 h-11 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-600 hover:text-black relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                {/* Profile Capsule */}
                <div className="relative group">
                    <div className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 bg-white rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-50">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=2C3E50&color=fff`} alt={user?.name || 'Admin'} className="w-full h-full object-cover" />
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            <span className="font-medium text-sm text-gray-800">{user?.name || 'Admin'}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
                        <Link to="/super-admin/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <Settings className="w-4 h-4" />
                            Profile Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
