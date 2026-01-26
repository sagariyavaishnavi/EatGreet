import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import activityIcon from '../../assets/activity.svg';
import tableIcon from '../../assets/Table-Bar--Streamline-Sharp-Material.svg';
import revenueIcon from '../../assets/trending-up.svg';
import kitchenIcon from '../../assets/Chef-Toque-Hat--Streamline-Flex.svg';

// --- DATA MOCKS ---
const salesData = [
    { name: 'Sun', value: 40 },
    { name: 'Mon', value: 60 },
    { name: 'Tue', value: 35 },
    { name: 'Wed', value: 85, highlight: true },
    { name: 'Thu', value: 50 },
    { name: 'Fri', value: 40 },
    { name: 'Sat', value: 55 },
];

const feedItems = [
    { id: 1, title: 'Table #01', sub: 'Water required', icon: tableIcon },
    { id: 2, title: 'Kitchen', sub: 'Order #12 ready', icon: kitchenIcon },
    { id: 3, title: 'Table #04', sub: 'Extra Roti', icon: tableIcon },
];

// --- COMPONENTS ---

const DashboardCard = ({ value, label, icon, subValue, isCurrency }) => (
    <div className="bg-white rounded-[2rem] px-6 py-4 flex items-center h-[140px] shadow-sm relative border border-transparent hover:border-gray-50 transition-all">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F3F3F3] rounded-full flex items-center justify-center shrink-0">
                <img src={icon} alt="icon" className="w-6 h-6 opacity-80" />
            </div>
            <div className="flex flex-col">
                <h3 className="text-[32px] font-medium text-black leading-none flex items-baseline">
                    {isCurrency && <span className="text-[24px] mr-1 font-medium">₹</span>}
                    {value}
                    {subValue && <span className="text-[24px] text-gray-300 font-medium ml-1">/{subValue}</span>}
                </h3>
                <p className="text-[14px] text-gray-400 mt-2 font-medium tracking-tight">{label}</p>
            </div>
        </div>
    </div>
);

const TimeStatusGauge = () => (
    <div className="bg-white rounded-[2rem] p-8 h-[320px] shadow-sm flex flex-col relative overflow-hidden transition-all border border-transparent">
        <h3 className="text-[24px] font-medium text-black mb-1">Time Status</h3>
        <div className="flex-1 flex items-center justify-center relative translate-y-6">
            <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                <svg width="100%" height="auto" viewBox="0 0 220 120" className="max-w-[340px] overflow-visible">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22C55E" />
                            <stop offset="65%" stopColor="#86EFAC" />
                            <stop offset="100%" stopColor="#DCFCE7" />
                        </linearGradient>
                    </defs>
                    {/* Gray Background Arc */}
                    <path
                        d="M 10 110 A 100 100 0 0 1 210 110"
                        fill="none"
                        stroke="#F3F5F7"
                        strokeWidth="32"
                        strokeLinecap="round"
                    />
                    {/* Green Gradient Overlap Arc */}
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
            {highlight && (
                <>
                    <line
                        x1={x + width / 2}
                        y1={y - 25}
                        x2={x + width / 2}
                        y2={y + pillHeight + 25}
                        stroke="#22C55E"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                    />
                    <circle
                        cx={x + width / 2}
                        cy={y + pillHeight / 2}
                        r="9"
                        fill="#22C55E"
                        stroke="white"
                        strokeWidth="4"
                    />
                </>
            )}
        </g>
    );
};

const AdminDashboard = () => {
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
                        <DashboardCard value="122" label="Total Active Orders" icon={activityIcon} />
                        <DashboardCard value="7" subValue="20" label="Occupied Tables" icon={tableIcon} />
                        <DashboardCard value="25,250" label="Total Revenue" icon={revenueIcon} isCurrency />
                    </div>

                    {/* Middle Row: Sales Analytics (Height Increased to 740px to match total right column height) */}
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
                            <div className="absolute top-[40%] left-0 right-0 border-t border-dashed border-gray-300 pointer-events-none flex items-center justify-between px-8">
                                <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-[12px] font-medium text-gray-400 -translate-y-1/2">₹6573</span>
                                <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-[12px] font-medium text-gray-400 -translate-y-1/2">78%</span>
                            </div>
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
                            {feedItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-[2.2rem] border border-gray-50 hover:bg-white hover:border-gray-100 transition-all cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className="w-[72px] h-[72px] rounded-full bg-[#F3F5F7] flex items-center justify-center shrink-0">
                                            <img src={item.icon} alt={item.title} className="w-9 h-9 opacity-70" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-bold text-black text-[18px] leading-tight">{item.title}</h4>
                                            <p className="text-[15px] text-gray-400 font-bold mt-0.5">{item.sub}</p>
                                        </div>
                                    </div>
                                    <button className="bg-black text-white text-[14px] font-black px-7 py-3 rounded-full hover:bg-gray-800 transition-transform active:scale-95">
                                        Handle
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
