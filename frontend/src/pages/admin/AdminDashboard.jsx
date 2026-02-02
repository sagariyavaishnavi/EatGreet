import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import activityIcon from '../../assets/activity.svg';
import tableIcon from '../../assets/Table-Bar--Streamline-Sharp-Material.svg';
import revenueIcon from '../../assets/trending-up.svg';
import kitchenIcon from '../../assets/Chef-Toque-Hat--Streamline-Flex.svg';
import { statsAPI, orderAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

// --- COMPONENTS ---

const DashboardCard = ({ value, label, icon, subValue, isCurrency }) => {
    const { currencySymbol } = useSettings();
    return (
        <div className="bg-white rounded-[2rem] px-6 py-4 flex items-center h-[140px] shadow-sm relative border border-transparent hover:border-gray-50 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F3F3F3] rounded-full flex items-center justify-center shrink-0">
                    <img src={icon} alt="icon" className="w-6 h-6 opacity-80" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-[32px] font-medium text-black leading-none flex items-baseline">
                        {isCurrency && <span className="text-[24px] mr-1 font-medium">{currencySymbol}</span>}
                        {value}
                        {subValue && <span className="text-[24px] text-gray-300 font-medium ml-1">/{subValue}</span>}
                    </h3>
                    <p className="text-[14px] text-gray-400 mt-2 font-medium tracking-tight">{label}</p>
                </div>
            </div>
        </div>
    );
};

const TimeStatusGauge = () => (
    <div className="bg-white rounded-[2rem] p-8 h-[320px] shadow-sm flex flex-col relative overflow-hidden transition-all border border-transparent">
        <h3 className="text-[24px] font-medium text-black mb-1">Time Status</h3>
        <div className="flex-1 flex items-center justify-center relative translate-y-6">
            <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                <svg width="100%" height="100%" viewBox="0 0 220 120" className="max-w-[340px] overflow-visible">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22C55E" />
                            <stop offset="65%" stopColor="#86EFAC" />
                            <stop offset="100%" stopColor="#DCFCE7" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M 10 110 A 100 100 0 0 1 210 110"
                        fill="none"
                        stroke="#F3F5F7"
                        strokeWidth="32"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 10 110 A 100 100 0 0 1 180.7 39.3"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="32"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <div className="text-center translate-y-2">
                        <div className="flex items-baseline justify-center gap-1.5 leading-none mb-1.5">
                            <span className="text-[36px] font-medium text-black tracking-tight">20</span>
                            <span className="text-[26px] font-medium text-black">min</span>
                        </div>
                        <div className="text-[15px] text-gray-400 font-medium tracking-wide">Avg. wait Time</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CustomPillBar = (props) => {
    const { x, y, width, height, highlight } = props;
    const pillWidth = 46;
    const pillHeight = height > 20 ? height : 40;
    const radius = 23;

    return (
        <g>
            <rect
                x={x + (width - pillWidth) / 2}
                y={y}
                width={pillWidth}
                height={pillHeight}
                rx={radius}
                fill={highlight ? '#22C55E' : '#F1F5F9'}
            />
        </g>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        revenue: 0,
        dineIn: 0,
        takeaway: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [feedItems, setFeedItems] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats and orders in parallel for better performance
                const [statsRes, ordersRes] = await Promise.all([
                    statsAPI.getAdminStats(),
                    orderAPI.getOrders({ status: 'pending,preparing,ready', limit: 10 })
                ]);

                // 1. Process Stats
                setStats(statsRes.data);

                // 2. Process Orders for Feed and Graph
                const orders = ordersRes.data || [];

                // Process Feed (Latest 3 Active Orders)
                const activeOrdersList = orders
                    .filter(o => o.status && ['pending', 'preparing', 'ready'].includes(o.status))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3)
                    .map(o => ({
                        id: o._id,
                        title: `Order #${o._id.slice(-4)}`,
                        sub: (o.items || []).map(i => i.name || 'Item').join(', '),
                        icon: tableIcon // Default icon for now
                    }));
                setFeedItems(activeOrdersList);

                // Process Sales Graph (Last 7 Days Revenue)
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const graphData = days.map(d => ({ name: d, value: 0 }));
                setSalesData(graphData);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-transparent px-4 py-8 space-y-4">
            <div className="space-y-1">
                <h1 className="text-[46px] font-medium text-black tracking-tight leading-none">Dashboard</h1>
                <p className="text-[18px] text-gray-400 font-medium">Welcome back, Admin</p>
            </div>

            {/* Main Content Grid - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Top Row: KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DashboardCard value={stats.activeOrders || 0} label="Total Active Orders" icon={activityIcon} />
                        <DashboardCard value={stats.dineIn || 0} subValue={stats.totalOrders || 0} label="Dine-in / Total" icon={tableIcon} />
                        <DashboardCard value={(stats.revenue || 0).toLocaleString()} label="Total Revenue" icon={revenueIcon} isCurrency />
                    </div>

                    {/* Middle Row: Sales Analytics */}
                    <div className="bg-white rounded-[2.8rem] p-8 relative shadow-sm h-[740px] flex flex-col border border-transparent">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-[24px] font-medium text-black">Sales Analytics</h2>
                            <button className="flex items-center gap-2 px-8 py-2.5 rounded-full border border-gray-100 text-[16px] font-medium text-gray-500 hover:bg-gray-50">
                                Today <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData} margin={{ top: 0, right: 30, left: 10, bottom: 40 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 16, fontWeight: 700, fontFamily: 'Urbanist' }}
                                        dy={30}
                                    />
                                    <Tooltip cursor={false} content={() => null} />
                                    <Bar
                                        dataKey="value"
                                        shape={<CustomPillBar />}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column (Span 4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Time Status Gauge */}
                    <TimeStatusGauge />

                    {/* Live Active Feed */}
                    <div className="bg-white rounded-[2.8rem] p-8 shadow-sm flex flex-col h-[560px] border border-transparent">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[24px] font-medium text-black">Live Active Feed</h2>
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100">
                                <ArrowUpRight className="w-6 h-6 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {feedItems.length > 0 ? feedItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-[2.2rem] border border-gray-50 hover:bg-white hover:border-gray-100 transition-all cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className="w-[72px] h-[72px] rounded-full bg-[#F3F5F7] flex items-center justify-center shrink-0">
                                            <img src={item.icon} alt={item.title} className="w-9 h-9 opacity-70" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-bold text-black text-[18px] leading-tight">{item.title}</h4>
                                            <p className="text-[15px] text-gray-400 font-bold mt-0.5 truncate max-w-[120px]">{item.sub}</p>
                                        </div>
                                    </div>
                                    <button className="bg-black text-white text-[14px] font-black px-7 py-3 rounded-full hover:bg-gray-800 transition-transform active:scale-95">
                                        View
                                    </button>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <p>No active orders</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;
