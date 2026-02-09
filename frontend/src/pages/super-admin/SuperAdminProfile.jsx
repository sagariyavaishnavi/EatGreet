import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Building, Camera, Save, Shield, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

const SuperAdminProfile = () => {
    const navigate = useNavigate();
    const { user, logout } = useSettings();

    const [profile, setProfile] = useState({
        fullName: user.name || 'Super Admin',
        email: user.email || '',
        phone: user.phone || '+91 00000 00000',
        companyName: user.restaurantName || 'EatGreet Inc.',
        role: user.role === 'super-admin' ? 'Super Admin' : user.role,
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Jan 01, 2026'
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        const loadToast = toast.loading('Updating profile...');
        try {
            const response = await authAPI.updateProfile({
                name: profile.fullName,
                email: profile.email,
                phone: profile.phone,
                restaurantName: profile.companyName
            });

            // Update local storage
            const updatedUser = { ...user, ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success('Profile updated successfully!', { id: loadToast });
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile', { id: loadToast });
        }
    };

    const handleLogout = () => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-800">Are you sure you want to log out?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            logout();
                            toast.dismiss(t.id);
                            toast.success('Logged out successfully');
                            navigate('/');
                        }}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                        Sign Out
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <button
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    className={`px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm ${isEditing
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                >
                    {isEditing ? <Save className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center h-fit">
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full bg-black border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300" alt="Super Admin" className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full shadow-md hover:bg-gray-800 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{profile.fullName}</h2>
                    <div className="flex items-center gap-1 text-gray-500 mb-6">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <p className="text-sm font-medium text-blue-500">{profile.role}</p>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="px-4 py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold w-full">
                            Member since {profile.joinDate}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Details Form */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={profile.companyName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminProfile;
