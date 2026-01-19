import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Heart, Clock } from 'lucide-react';

const CustomerProfile = () => {
    const [profile, setProfile] = useState({
        fullName: 'Manav Bhatt',
        email: 'manav@example.com',
        phone: '+91 98765 43210',
        address: 'B-404, Sunrise Apartments, Mumbai'
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors shadow-sm ${isEditing
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    {isEditing ? 'Save' : 'Edit'}
                </button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3">
                    {profile.fullName.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{profile.fullName}</h2>
                <p className="text-gray-500 text-sm">Foodie Level: Expert 🍔</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-2xl flex flex-col items-center text-center">
                    <Heart className="w-6 h-6 text-orange-500 mb-2" />
                    <span className="text-xl font-bold text-gray-800">12</span>
                    <span className="text-xs text-gray-500 font-bold uppercase">Favorites</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl flex flex-col items-center text-center">
                    <Clock className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-xl font-bold text-gray-800">45</span>
                    <span className="text-xs text-gray-500 font-bold uppercase">Orders</span>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-4 uppercase">Full Name</label>
                    <div className="bg-gray-50 rounded-2xl p-2 flex items-center gap-3 border border-transparent focus-within:border-black focus-within:bg-white transition-all">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                            <User className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="bg-transparent w-full text-sm font-bold text-gray-700 focus:outline-none disabled:opacity-70"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-4 uppercase">Email</label>
                    <div className="bg-gray-50 rounded-2xl p-2 flex items-center gap-3 border border-transparent focus-within:border-black focus-within:bg-white transition-all">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="bg-transparent w-full text-sm font-bold text-gray-700 focus:outline-none disabled:opacity-70"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-4 uppercase">Phone</label>
                    <div className="bg-gray-50 rounded-2xl p-2 flex items-center gap-3 border border-transparent focus-within:border-black focus-within:bg-white transition-all">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                            <Phone className="w-4 h-4" />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="bg-transparent w-full text-sm font-bold text-gray-700 focus:outline-none disabled:opacity-70"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-4 uppercase">Saved Address</label>
                    <div className="bg-gray-50 rounded-2xl p-2 flex items-center gap-3 border border-transparent focus-within:border-black focus-within:bg-white transition-all">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <textarea
                            name="address"
                            value={profile.address}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows="2"
                            className="bg-transparent w-full text-sm font-bold text-gray-700 focus:outline-none resize-none py-1 disabled:opacity-70"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
