import React from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    Ban
} from 'lucide-react';

import { authAPI } from '../../utils/api';

export default function Restaurants() {
    const [restaurants, setRestaurants] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await authAPI.getRestaurants();
            setRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRestaurants = restaurants.filter(res =>
        res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (res) => {
        const name = res.restaurantName || res.name;
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getColor = (idx) => {
        const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600', 'bg-emerald-100 text-emerald-600'];
        return colors[idx % colors.length];
    };
    return (
        <div className="h-screen bg-[#F0F2F4] p-4 md:p-6 flex flex-col overflow-hidden">
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col space-y-6 min-h-0">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-medium text-gray-900">Restaurants</h1>
                            <span className="bg-[#FFEDE6] text-[#F15A2B] px-4 py-1 rounded-full text-sm font-medium">
                                {restaurants.length} Total
                            </span>
                        </div>
                        <p className="text-gray-500 font-medium">Manage Partner restaurants, Monitor performance, Control access.</p>
                    </div>
                    <button className="bg-[#F15A2B] hover:bg-[#d94e24] text-white px-8 py-3.5 rounded-full font-medium flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95">
                        <Plus className="w-5 h-5" />
                        Add Restaurant
                    </button>
                </div>

                {/* List Section */}
                <div className="flex-1 min-h-0 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-white/60 shadow-sm flex flex-col overflow-hidden">
                    {/* Table Header/Toolbar */}
                    <div className="p-6 pb-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <h2 className="text-2xl font-medium text-gray-900">All Restaurants</h2>
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
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
                            <div className="col-span-3 text-[10px] uppercase tracking-widest font-medium text-gray-400">Restaurants</div>
                            <div className="col-span-2 text-[10px] uppercase tracking-widest font-medium text-gray-400">Admin Contact</div>
                            <div className="col-span-2 text-[10px] uppercase tracking-widest font-medium text-gray-400">Join Date</div>
                            <div className="col-span-1 text-[10px] uppercase tracking-widest font-medium text-gray-400 text-center">Subscription</div>
                            <div className="col-span-1 text-[10px] uppercase tracking-widest font-medium text-gray-400 text-center">Usage</div>
                            <div className="col-span-1 text-[10px] uppercase tracking-widest font-medium text-gray-400 text-center">Status</div>
                            <div className="col-span-2 text-[10px] uppercase tracking-widest font-medium text-gray-400 text-right pr-4">Action</div>
                        </div>
                    </div>

                    {/* List Content */}
                    <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 no-scrollbar">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                <p className="font-medium text-lg animate-pulse">Loading Restaurants...</p>
                            </div>
                        ) : filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map((restaurant, idx) => (
                                <motion.div
                                    key={restaurant._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="grid grid-cols-12 items-center gap-4 bg-white hover:bg-gray-50/50 px-6 py-5 rounded-[1.8rem] border border-gray-100 transition-all cursor-pointer group"
                                >
                                    <div className="col-span-3 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm ${getColor(idx)}`}>
                                            {getInitials(restaurant)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{restaurant.restaurantName || restaurant.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium">ID {restaurant._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="font-medium text-sm text-gray-800">{restaurant.name}</p>
                                        <p className="text-xs text-gray-400 font-medium truncate">{restaurant.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="font-medium text-sm text-gray-800">{new Date(restaurant.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <span className="px-4 py-1.5 bg-[#E6DAFF] text-[#8C52FF] rounded-full text-[10px] font-medium uppercase tracking-tight">
                                            Premium
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <p className="font-medium text-sm text-gray-800">45 <span className="text-gray-400 font-normal">Orders</span></p>
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Monthly</p>
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <span className="px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-tight bg-[#E7F9F0] text-[#10B981]">
                                            Active
                                        </span>
                                    </div>
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
                                <p className="font-medium text-lg">No restaurants found</p>
                                <p className="text-sm">Try adding your first partner restaurant.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
