import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Bell, ChevronDown } from 'lucide-react';

import logo from '../../assets/logo-full.png';

export default function SuperAdminNavbar() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/super-admin' },
        { name: 'Restaurants', path: '/super-admin/restaurants' },
        { name: 'Payment', path: '/super-admin/payments' },
        { name: 'Reports', path: '/super-admin/reports' },
        { name: 'Users', path: '/super-admin/users' },
    ];

    return (
        <nav className="flex items-center justify-between mb-6 px-2 py-2">
            <div className="flex items-center gap-2">
                <Link to="/super-admin">
                    <img src={logo} alt="EatGreet" className="h-9" />
                </Link>
            </div>

            <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 ${isActive
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-500 hover:text-black hover:bg-gray-100'
                                }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white rounded-full transition-colors">
                    <Settings className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-white rounded-full relative transition-colors">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-300">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-white">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" alt="Admin" className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden md:flex items-center gap-0.5 group cursor-pointer">
                        <span className="font-extrabold text-sm text-gray-900">Admin</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
