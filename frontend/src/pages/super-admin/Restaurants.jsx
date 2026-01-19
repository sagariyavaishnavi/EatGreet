import React from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    Ban,
    ExternalLink,
    ChevronRight
} from 'lucide-react';


const restaurants = [];

export default function Restaurants() {
    return (
        <div className="h-screen bg-[#F0F2F4] p-4 md:p-6 flex flex-col overflow-hidden">


            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col space-y-6 min-h-0 overflow-y-auto no-scrollbar">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-gray-900">Restaurants</h1>
                            <span className="bg-[#FFEDE6] text-[#F15A2B] px-4 py-1 rounded-full text-sm font-bold">0 Total</span>
                        </div>
                        <p className="text-gray-500 font-medium">Manage Partner restaurants, Monitor performance, Control access.</p>

        <div className="flex flex-col space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-gray-900">Restaurants</h1>
                        <span className="bg-[#FFEDE6] text-[#F15A2B] px-4 py-1 rounded-full text-sm font-bold">0 Total</span>
                    </div>
                    <p className="text-gray-500 font-medium">Manage Partner restaurants, Monitor performance, Control access.</p>
                </div>
                <button className="bg-[#F15A2B] hover:bg-[#d94e24] text-white px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Add Restaurants
                </button>
            </div>

            {/* List Section */}
            <div className="flex-1 min-h-0 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-white/60 shadow-sm flex flex-col overflow-hidden">
                {/* Table Header/Toolbar */}
                <div className="p-6 pb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">All Restaurants</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-12 pr-6 py-3 bg-gray-100/50 border border-transparent focus:bg-white focus:border-gray-200 rounded-full w-[300px] text-sm font-medium transition-all outline-none"
                                />
                            </div>
                            <button className="p-3 bg-gray-100/50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl transition-all">
                                <Filter className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Column Names */}
                    <div className="grid grid-cols-12 gap-4 px-6 mb-4">
                        <div className="col-span-3 text-[10px] uppercase tracking-widest font-bold text-gray-400">Restaurants</div>
                        <div className="col-span-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">Admin Contact</div>
                        <div className="col-span-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">Join Date</div>
                        <div className="col-span-1 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-center">Subscription</div>
                        <div className="col-span-1 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-center">Usage</div>
                        <div className="col-span-1 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-center">Status</div>
                        <div className="col-span-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 text-right pr-4">Action</div>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 no-scrollbar">
                    {restaurants.length > 0 ? (
                        restaurants.map((restaurant, idx) => (
                            <motion.div
                                key={restaurant.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="grid grid-cols-12 items-center gap-4 bg-white hover:bg-gray-50/50 px-6 py-5 rounded-[1.8rem] border border-gray-100 transition-all cursor-pointer group"
                            >
                                {/* Restaurant Info */}
                                <div className="col-span-3 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${restaurant.color}`}>
                                        {restaurant.initials}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium">ID {restaurant.id}</p>
                                    </div>
                                </div>

                                {/* Admin Contact */}
                                <div className="col-span-2">
                                    <p className="font-bold text-sm text-gray-800">{restaurant.admin}</p>
                                    <p className="text-xs text-gray-400 font-medium truncate">{restaurant.email}</p>
                                </div>

                                {/* Join Date */}
                                <div className="col-span-2">
                                    <p className="font-bold text-sm text-gray-800">{restaurant.joinDate}</p>
                                </div>

                                {/* Subscription */}
                                <div className="col-span-1 flex justify-center">
                                    <span className="px-4 py-1.5 bg-[#E6DAFF] text-[#8C52FF] rounded-full text-[10px] font-extrabold uppercase tracking-tight">
                                        {restaurant.subscription}
                                    </span>
                                </div>

                                {/* Usage */}
                                <div className="col-span-1 text-center">
                                    <p className="font-bold text-sm text-gray-800">{restaurant.usage.split(' ')[0]} <span className="text-gray-400 font-medium">Orders</span></p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{restaurant.billing}</p>
                                </div>

                                {/* Status */}
                                <div className="col-span-1 flex justify-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${restaurant.status === 'Active'
                                        ? 'bg-[#E7F9F0] text-[#10B981]'
                                        : 'bg-[#FFEDED] text-[#EF4444]'
                                        }`}>
                                        {restaurant.status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                                    <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-rose-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-black">
                                        <Ban className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <div className="p-6 bg-gray-100 rounded-full mb-4">
                                <Search className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="font-bold text-lg">No restaurants found</p>
                            <p className="text-sm">Try adding your first partner restaurant.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
