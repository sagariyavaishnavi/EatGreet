import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Building, LogOut, Settings } from 'lucide-react';

const AdminProfile = () => {
    const navigate = useNavigate();
    // Read-only state for display
    const [profile] = useState({
        fullName: 'Manav Bhatt',
        email: 'manav@eatgreet.com',
        phone: '+91 98765 43210',
        restaurantName: 'EatGreet HQ',
        address: '123, Food Street, Gujarat, India',
        role: 'Restaurant Admin',
        joinDate: 'Jan 20, 2026'
    });

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem('isAuthenticated');
            navigate('/admin/login');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <Link
                    to="/admin/settings"
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Settings className="w-4 h-4" />
                    Manage Profile & Settings
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Profile Overview Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative shrink-0">
                        <div className="w-32 h-32 rounded-full bg-orange-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            <span className="text-4xl font-bold text-[#FD6941]">
                                {profile.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800">{profile.fullName}</h2>
                        <p className="text-gray-500 font-medium">{profile.role}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Active
                        </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                        <button
                            onClick={handleLogout}
                            className="w-full md:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Read-Only Details Grid */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#FD6941]" />
                        Account Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                            <div className="flex items-center gap-3 text-gray-700 font-medium">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                {profile.email}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                            <div className="flex items-center gap-3 text-gray-700 font-medium">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Phone className="w-4 h-4" />
                                </div>
                                {profile.phone}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Restaurant Name</label>
                            <div className="flex items-center gap-3 text-gray-700 font-medium">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Building className="w-4 h-4" />
                                </div>
                                {profile.restaurantName}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Address</label>
                            <div className="flex items-center gap-3 text-gray-700 font-medium">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                {profile.address}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                            Need to update these details? <Link to="/admin/settings" className="text-[#FD6941] font-bold hover:underline">Go to Settings</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
