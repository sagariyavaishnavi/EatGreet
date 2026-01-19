import { Clock, Loader2, UtensilsCrossed } from 'lucide-react';
import PropTypes from 'prop-types';
import clockIcon from '../../assets/clock.svg';
import chefHatIcon from '../../assets/Chef-Toque-Hat--Streamline-Flex.svg';
import bellIcon from '../../assets/Bell--Streamline-Flex.svg';
import { useState, useEffect } from 'react';


const activeOrders = [];

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, value, title }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 rounded-full">
                <Icon className="w-6 h-6 text-gray-700" />
            </div>
            <div>
                <h3 className="text-4xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
        <p className="text-gray-500 font-medium ml-1">{title}</p>
    </div>
);

StatCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
};

const AdminDashboard = () => {
    return (
        <div className="space-y-8">
            {/* Dashboard Main Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Welcome back, Admin</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Pending Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={clockIcon} alt="Pending" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl font-bold text-gray-900">0</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Total Pending Orders</p>
                </div>

                {/* Preparing Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={chefHatIcon} alt="Preparing" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl font-bold text-gray-900">0</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Preparing Orders</p>
                </div>

                {/* Ready Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={bellIcon} alt="Ready" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl font-bold text-gray-900">0</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Ready to serve</p>
                </div>

                {/* Today Orders Complete Card */}
                {(() => {
                    const completed = 0;
                    const total = 0;
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                    let gradientClass = "from-white to-[#F9FAFB]";
                    let barColorClass = "bg-gray-200";

                    return (
                        <div className={`p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden bg-gradient-to-b ${gradientClass} flex flex-col justify-between h-40 lg:col-span-2`}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-800 text-lg font-medium leading-tight max-w-[50%]">Today Orders Complete</p>
                                <div className="text-right">
                                    <span className="text-4xl font-normal text-gray-900">{completed}</span>
                                    <span className="text-2xl font-light text-gray-400">/{total}</span>
                                </div>
                            </div>

                            {/* Custom Process Bar */}
                            <div className="w-full relative mt-auto">
                                <div className="flex justify-between text-[10px] text-gray-400 font-medium mb-1 px-0.5">
                                    <span>0%</span>
                                    <span className="ml-[10%]">33%</span>
                                    <span className="ml-[15%]">60%</span>
                                    <span>100%</span>
                                </div>
                                <div className="h-4 w-full bg-gray-200/50 rounded-full overflow-hidden relative flex">
                                    <div className="absolute inset-0 w-full h-full bg-black/5"></div>
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${barColorClass}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                    <div className="absolute top-0 left-[33%] w-0.5 h-full bg-white/80"></div>
                                    <div className="absolute top-0 left-[60%] w-0.5 h-full bg-white/80"></div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Active Orders Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Active Order</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-3 bg-gray-50 rounded-full text-sm w-80 focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-400"
                            />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <button className="p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <UtensilsCrossed className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No Active Orders</h3>
                    <p className="text-gray-400 text-sm max-w-[200px]">New orders will appear here in real-time once placed by customers.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
