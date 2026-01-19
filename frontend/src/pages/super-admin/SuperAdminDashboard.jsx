import React from 'react';
import {
    BarChart,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Settings,
    Bell,
    LayoutDashboard,
    UtensilsCrossed,
    CreditCard,
    BarChart3,
    Users,
    ChevronDown,
    TrendingUp,
    AlertTriangle,
    Store,
    Ticket
} from 'lucide-react';
import { motion } from 'framer-motion';


const revenueData = [
    { name: 'Jan', value: 0 },
    { name: 'Feb', value: 0 },
    { name: 'Mar', value: 0 },
    { name: 'Apr', value: 0 },
    { name: 'May', value: 0 },
    { name: 'Jun', value: 0 },
    { name: 'Jul', value: 0 },
    { name: 'Aug', value: 0 },
    { name: 'Sep', value: 0 },
    { name: 'Oct', value: 0 },
    { name: 'Nov', value: 0 },
    { name: 'Dec', value: 0 },
];

const paymentStatusData = [
    { name: 'Paid', value: 0, color: '#10B981' },
    { name: 'Pending', value: 0, color: '#F59E0B' },
    { name: 'Overdue', value: 0, color: '#EF4444' },
];

const StatCard = ({ title, value, change, icon: Icon, gradient, colorClass }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-[1.8rem] shadow-sm border border-white/50 relative overflow-hidden ${gradient} flex flex-col justify-between h-36`}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-600 text-xs font-bold mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
            </div>
            <div className="bg-white/60 p-3 rounded-2xl shadow-sm border border-white/40">
                <Icon className="w-6 h-6 text-gray-700" />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${colorClass} bg-white/50 px-3 py-1 rounded-full text-xs font-bold`}>
                <TrendingUp className="w-3 h-3" />
                {change}
            </div>
            <span className="text-xs text-gray-500 font-medium">vs last Month</span>
        </div>
    </motion.div>
);

export default function SuperAdminDashboard() {
    return (
        <div className="h-screen bg-[#F0F2F4] p-4 md:p-6 flex flex-col overflow-hidden">


            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col space-y-6 min-h-0 overflow-y-auto no-scrollbar">
                {/* Welcome Section */}
                <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800">Dashboard</h1>
                        <p className="text-gray-500 text-sm font-medium">Welcome back, <span className="text-gray-800">Super Admin</span></p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Restaurants"
                        value="0"
                        change="0%"
                        icon={Store}
                        gradient="bg-gradient-to-br from-[#E2F0E9] to-[#D4E9F2]"
                        colorClass="text-emerald-600"
                    />
                    <StatCard
                        title="Active Subscriptions"
                        value="0"
                        change="0%"
                        icon={Ticket}
                        gradient="bg-gradient-to-br from-[#E6F3E6] to-[#CDE7CD]"
                        colorClass="text-emerald-600"
                    />
                    <StatCard
                        title="Monthly Revenue"
                        value="₹0"
                        change="0%"
                        icon={BarChart3}
                        gradient="bg-gradient-to-br from-[#E9F5E9] to-[#DFF0DF]"
                        colorClass="text-emerald-600"
                    />
                    <StatCard
                        title="Unpaid Restaurants"
                        value="0"
                        change="0%"
                        icon={AlertTriangle}
                        gradient="bg-gradient-to-br from-[#FAF3E5] to-[#F1E4C9]"
                        colorClass="text-rose-500"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    {/* Subscription Revenue Line Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-white/60 shadow-sm flex flex-col"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Subscription Revenue</h3>
                            <p className="text-xs text-gray-500">Monthly recurring revenue trends</p>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10B981"
                                        strokeWidth={4}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Payment Status Donut Chart */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-white/60 shadow-sm flex flex-col items-center justify-between"
                    >
                        <div className="w-full text-left mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Payment Status</h3>
                            <p className="text-xs text-gray-500">Restaurant payment breakdown</p>
                        </div>

                        <div className="relative flex-1 w-full min-h-0 flex items-center justify-center">
                            <div className="aspect-square h-full max-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentStatusData}
                                            innerRadius="70%"
                                            outerRadius="100%"
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {paymentStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-extrabold text-gray-900">0</span>
                                    <span className="text-xs text-gray-400 font-bold tracking-widest">TOTAL</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-3 gap-2 mt-4">
                            {paymentStatusData.map((item) => (
                                <div key={item.name} className="flex flex-col items-center">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-xs font-bold text-gray-700">{item.value}</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
