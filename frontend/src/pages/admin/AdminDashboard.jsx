import { Clock, Loader2, UtensilsCrossed } from 'lucide-react';
import PropTypes from 'prop-types';
import clockIcon from '../../assets/clock.svg';
import chefHatIcon from '../../assets/Chef-Toque-Hat--Streamline-Flex.svg';
import bellIcon from '../../assets/Bell--Streamline-Flex.svg';
import { useState, useEffect } from 'react';


const activeOrders = [
    {
        id: "#002",
        table: "001",
        waiter: "John Patel",
        time: "7:38 PM",
        guests: 6,
        status: "PREPARING",
        timer: "08:12",
        statusColor: "bg-orange-100 text-orange-600",
        timerColor: "border-orange-400 text-gray-800",
        items: [
            { name: "Margarita pizza", qty: 2, price: 199.00 },
            { name: "Paneer Tandoor pizza", qty: 1, price: 249.00 },
            { name: "cock", qty: 2, price: 20.00 }
        ],
        total: 687.00
    },
    {
        id: "#001",
        table: "001",
        waiter: "John Patel",
        time: "7:38 PM",
        guests: 6,
        status: "READY",
        timer: "12:09",
        statusColor: "bg-green-100 text-green-600",
        timerColor: "border-green-400 text-gray-800",
        items: [
            { name: "Margarita pizza", qty: 2, price: 199.00 },
            { name: "Paneer Tandoor pizza", qty: 1, price: 249.00 },
            { name: "cock", qty: 2, price: 20.00 }
        ],
        total: 687.00
    },
    {
        id: "#003",
        table: "001",
        waiter: "John Patel",
        time: "7:38 PM",
        guests: 6,
        status: "PENDING",
        timer: "03:33",
        statusColor: "bg-gray-100 text-gray-600",
        timerColor: "border-gray-300 text-gray-800",
        items: [
            { name: "Margarita pizza", qty: 2, price: 199.00 },
            { name: "Paneer Tandoor pizza", qty: 1, price: 249.00 },
            { name: "cock", qty: 2, price: 20.00 }
        ],
        total: 687.00
    }
];

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
                        <span className="text-4xl font-bold text-gray-900">122</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Total Pending Orders</p>
                </div>

                {/* Preparing Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={chefHatIcon} alt="Preparing" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl font-bold text-gray-900">96</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Preparing Orders</p>
                </div>

                {/* Ready Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={bellIcon} alt="Ready" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl font-bold text-gray-900">96</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Ready to serve</p>
                </div>

                {/* Today Orders Complete Card */}
                {(() => {
                    const completed = 70;
                    const total = 136;
                    const percentage = Math.round((completed / total) * 100);

                    let gradientClass = "from-white to-[#F9FAFB]";
                    let barColorClass = "bg-gray-200";
                    let accentColor = "#D1D5DB"; // gray-300

                    if (percentage < 33) {
                        gradientClass = "from-white to-red-50";
                        barColorClass = "bg-red-400";
                        accentColor = "#F87171";
                    } else if (percentage >= 33 && percentage <= 70) {
                        gradientClass = "from-white to-[#F3EFE0]"; // Light yellow/beige
                        barColorClass = "bg-[#F3C465]"; // Golden yellow
                        accentColor = "#FCD34D";
                    } else {
                        gradientClass = "from-white to-green-50";
                        barColorClass = "bg-emerald-400";
                        accentColor = "#34D399";
                    }

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
                                    {/* Background Track */}
                                    <div className="absolute inset-0 w-full h-full bg-black/5"></div>

                                    {/* Active Fill */}
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${barColorClass}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>

                                    {/* Markers Overlay */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activeOrders.concat([
                        {
                            id: "#004",
                            table: "003",
                            waiter: "Aravind",
                            time: "8:05 PM",
                            guests: 2,
                            status: "PREPARING",
                            timer: "02:15",
                            statusColor: "bg-orange-100 text-orange-600",
                            timerColor: "text-orange-600 border-orange-400",
                            items: [
                                { name: "Veg Burger", qty: 2, price: 150.00 },
                                { name: "Coke", qty: 2, price: 40.00 }
                            ],
                            total: 380.00
                        }
                    ]).map((order) => (
                        <div key={order.id} className="bg-[#F8F9FA] p-6 rounded-[1.5rem] flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-gray-900">Order {order.id}</h3>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'READY' ? 'bg-green-100 text-green-600' : order.status === 'PREPARING' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex items-start justify-between mb-6">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-gray-500 w-full pr-2">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                        <span className="truncate">Table no. {order.table}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <span className="truncate">{order.waiter}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="truncate">Time: {order.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        <span className="truncate">Guests: {order.guests}</span>
                                    </div>
                                </div>

                                {/* Circular Timer */}
                                <div className={`w-14 h-14 shrink-0 rounded-full border-[3px] flex flex-col items-center justify-center ${order.status === 'READY' ? 'border-green-400 text-green-600' : order.status === 'PREPARING' ? 'border-yellow-400 text-gray-800' : 'border-gray-300 text-gray-500'}`}>
                                    <span className="text-xs font-bold leading-none">{order.timer}</span>
                                    <span className="text-[8px] uppercase font-bold text-gray-400 mt-0.5">Work Time</span>
                                </div>
                            </div>

                            <div className="border-t border-b border-gray-200 py-4 mb-4 space-y-3 flex-grow">
                                <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                    <span>Order Item</span>
                                    <span>Amount</span>
                                </div>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500 pt-0.5">Qty {item.qty}</p>
                                        </div>
                                        <span className="font-bold text-gray-800">₹{item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-base text-gray-800">Total Amount</span>
                                <span className="font-extrabold text-xl text-gray-900">₹{order.total.toFixed(2)}</span>
                            </div>

                            <div className="flex gap-3 mt-auto">
                                {order.status === 'PREPARING' && (
                                    <button className="flex-1 bg-[#FBBF24] hover:bg-yellow-500 text-white text-sm font-bold py-3.5 rounded-xl transition-colors shadow-sm">
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'READY' && (
                                    <button className="flex-1 bg-black hover:bg-gray-800 text-white text-sm font-bold py-3.5 rounded-xl transition-colors shadow-sm">
                                        Mark Complete
                                    </button>
                                )}
                                {order.status === 'PENDING' && (
                                    <button className="flex-1 bg-[#FD6941] hover:bg-orange-600 text-white text-sm font-bold py-3.5 rounded-xl transition-colors shadow-sm">
                                        Accept
                                    </button>
                                )}
                                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold py-3.5 rounded-xl transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
