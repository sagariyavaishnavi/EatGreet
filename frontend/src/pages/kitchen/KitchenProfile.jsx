import React, { useState } from 'react';
import { User, Mail, Phone, Save, ChefHat } from 'lucide-react';

const KitchenProfile = () => {
    const [profile, setProfile] = useState({
        fullName: 'Chef Gordon',
        email: 'chef@eatgreet.com',
        phone: '+91 88888 77777',
        role: 'Head Chef',
        specialty: 'Italian Cuisine'
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Kitchen Staff Profile</h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm ${isEditing
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                >
                    {isEditing ? <Save className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center mb-4 text-orange-500 text-4xl font-bold border-4 border-white shadow-sm">
                        {profile.fullName.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{profile.fullName}</h2>
                    <p className="text-gray-500 text-sm">{profile.role}</p>
                    <div className="mt-4 px-4 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold flex items-center gap-2">
                        <ChefHat className="w-3 h-3" />
                        {profile.specialty}
                    </div>
                </div>

                {/* Right Column: details */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Staff Information</h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenProfile;
