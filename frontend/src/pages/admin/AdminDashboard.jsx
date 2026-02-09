import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import activityIcon from '../../assets/activity.svg';
import tableIcon from '../../assets/Table-Bar--Streamline-Sharp-Material.svg';
import revenueIcon from '../../assets/trending-up.svg';
// import kitchenIcon from '../../assets/Chef-Toque-Hat--Streamline-Flex.svg';
import { statsAPI, orderAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';

// --- COMPONENTS ---

const DashboardCard = ({ value, label, icon, subValue, isCurrency }) => {
    const { currencySymbol } = useSettings();
    return (
        <div className="bg-white rounded-[1.2rem] sm:rounded-[2rem] px-4 sm:px-6 py-3 sm:py-4 flex items-center h-[100px] sm:h-[140px] shadow-sm relative border border-transparent hover:border-gray-50 transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F3F3F3] rounded-full flex items-center justify-center shrink-0">
                    <img src={icon} alt="icon" className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-[18px] sm:text-[28px] lg:text-[32px] font-medium text-black leading-none flex items-baseline">
                        {isCurrency && <span className="text-[14px] sm:text-[20px] lg:text-[24px] mr-1 font-medium">{currencySymbol}</span>}
                        {value}
                        {subValue !== undefined && (
                            <span className="text-[12px] sm:text-[20px] lg:text-[24px] text-gray-400 opacity-30 font-medium ml-1">
                                /{subValue}
                            </span>
                        )}
                    </h3>
                    <p className={`text-[11px] sm:text-[13px] lg:text-[14px] text-gray-400 mt-1 sm:mt-2 font-medium tracking-tight ${label === 'Occupied Tables' ? 'whitespace-pre-line max-w-[70px]' : 'truncate max-w-[80px]'} sm:max-w-full sm:whitespace-normal`}>
                        {label === 'Occupied Tables' ? label.replace(' ', '\n') : label}
                    </p>
                </div>
            </div>
        </div>
    );
};

const TimeStatusGauge = ({ value }) => {
    // Determine percentage (assume 45 mins is max for full gauge)
    const maxVal = 45;
    const percent = Math.min(Math.max((value || 0), 0) / maxVal, 1);

    // Config
    const numTicks = 42;
    const cx = 180;
    const cy = 210;
    const rInner = 130;
    const rOuter = 170;

    // Calculate active ticks
    const activeCount = Math.round(percent * numTicks);

    return (
        <div className="bg-white rounded-[2rem] p-8 h-[320px] shadow-sm flex flex-col relative overflow-hidden transition-all border border-transparent">
            <h3 className="text-[24px] font-medium text-black mb-1">Time Status</h3>

            <div className="flex-1 flex items-center justify-center relative translate-y-[-10px]">
                <svg width="100%" height="240" viewBox="0 0 360 230" className="overflow-visible">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FACC15" />
                            <stop offset="100%" stopColor="#22C55E" />
                        </linearGradient>
                    </defs>

                    {Array.from({ length: numTicks }).map((_, i) => {
                        // Create symmetrical arc from -180 deg to 0 deg
                        const startAngle = -180;
                        const endAngle = 0;
                        const angle = startAngle + (i * (endAngle - startAngle) / (numTicks - 1));
                        const rad = (angle * Math.PI) / 180;

                        const x1 = cx + rInner * Math.cos(rad);
                        const y1 = cy + rInner * Math.sin(rad);
                        const x2 = cx + rOuter * Math.cos(rad);
                        const y2 = cy + rOuter * Math.sin(rad);

                        const isActive = i < activeCount;

                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={isActive ? "url(#gaugeGradient)" : "#F3F5F7"}
                                strokeWidth="10"
                                strokeLinecap="round"
                                className={isActive ? "animate-live-pulse" : ""}
                                style={{
                                    animationDelay: `${i * 0.03}s` // Live ripple effect
                                }}
                            />
                        );
                    })}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-24">
                    <div className="flex items-baseline gap-1">
                        <span className="text-[56px] font-medium text-black tracking-tight leading-none">
                            {value || 0}
                        </span>
                        <span className="text-[28px] font-medium text-black">min</span>
                    </div>
                    <span className="text-[16px] text-gray-400 font-medium mt-1">Avg. Wait Time</span>
                </div>
            </div>

            <style>{`
                @keyframes live-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-live-pulse {
                    animation: live-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
};

const CustomPillBar = (props) => {
    const { x, y, width, height, highlight } = props;
    const pillWidth = Math.min(width * 0.8, 46);
    const radius = pillWidth / 2;

    // In the reference image, bars have different heights/positions
    // For our data, we'll keep it simple but match the pill look
    const barHeight = height > 0 ? height : 4;

    return (
        <g>
            <defs>
                <linearGradient id="pillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#86EFAC" stopOpacity={0.3} />
                </linearGradient>
            </defs>
            {/* Background vertical line for highlighted day (matches image) */}
            {highlight && (
                <line
                    x1={x + width / 2}
                    y1={0}
                    x2={x + width / 2}
                    y2={600}
                    stroke="#22C55E"
                    strokeWidth="2"
                    strokeDasharray="0"
                />
            )}

            {/* Main Pill Bar */}
            <rect
                x={x + (width - pillWidth) / 2}
                y={y}
                width={pillWidth}
                height={barHeight}
                rx={radius}
                fill={highlight ? "url(#pillGradient)" : "#F1F5F9"}
                className="transition-all duration-300"
            />

            {/* Artistic dots like the image if highlighted */}
            {highlight && height > 40 && (
                <circle cx={x + width / 2} cy={y + 10} r="4" fill="white" fillOpacity="0.5" />
            )}
        </g>
    );
};



const AdminDashboard = () => {
    const navigate = useNavigate();
    const socket = useSocket();
    const { user } = useSettings();
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrders: 0,
        dineIn: 0,
        todayRevenue: 0,
        totalTables: 0,
        revenue: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [feedItems, setFeedItems] = useState([]);

    const fetchDashboardData = React.useCallback(async () => {
        try {
            // Fetch stats and orders in parallel for better performance
            const [statsRes, ordersRes] = await Promise.all([
                statsAPI.getAdminStats(),
                orderAPI.getOrders({ status: 'pending,preparing,ready', limit: 100 })
            ]);

            // 3. Robust Total Tables count
            const savedTables = localStorage.getItem('admin_tables');
            let trackedTables = [1, 2, 3, 4, 5, 6]; // Default fallback
            if (savedTables) {
                try {
                    const parsed = JSON.parse(savedTables);
                    if (Array.isArray(parsed)) trackedTables = parsed;
                } catch { /* ignore */ }
            }

            // 4. Calculate Occupied Count Locally for 100% Accuracy with the UI
            const orders = ordersRes.data || [];
            const occupiedTableNumbers = new Set(
                orders
                    .filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
                    .map(o => String(o.tableNumber))
                    .filter(tNo => trackedTables.map(String).includes(tNo))
            );

            // 5. Calculate Real Avg Wait Time (for active orders)
            const activeOrdersForTime = orders.filter(o => ['pending', 'preparing'].includes(o.status));
            let calculatedWaitTime = 0;

            if (activeOrdersForTime.length > 0) {
                const now = new Date();
                const totalTimeMs = activeOrdersForTime.reduce((acc, order) => {
                    return acc + (now - new Date(order.createdAt));
                }, 0);
                calculatedWaitTime = Math.round(totalTimeMs / (1000 * 60) / activeOrdersForTime.length);
            }

            // If no active orders, wait time is 0.
            // If active orders exist, show their average wait time.
            const finalWaitTime = calculatedWaitTime > 0
                ? calculatedWaitTime
                : (activeOrdersForTime.length > 0 ? 1 : 0); // If pending but <1 min, show 1. If no orders, show 0.

            setStats({
                activeOrders: statsRes.data.summary?.activeOrders || 0,
                todayRevenue: statsRes.data.summary?.rangeRevenue || 0,
                totalRevenue: statsRes.data.summary?.totalRevenue || 0,
                dineIn: occupiedTableNumbers.size,
                totalTables: trackedTables.length,
                avgWaitTime: finalWaitTime
            });

            // Process Feed
            const activeOrdersList = orders
                .filter(o => o.status && ['pending', 'preparing', 'ready'].includes(o.status))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
                .map(o => ({
                    id: o._id,
                    title: `Order #${o.dailySequence ? String(o.dailySequence).padStart(3, '0') : o._id.slice(-4)}`,
                    sub: (o.items || []).map(i => i.name || 'Item').join(', '),
                    icon: tableIcon
                }));
            setFeedItems(activeOrdersList);

            // Process Hourly Revenue Data (Today)
            const hourlyData = statsRes.data.charts?.hourlyAnalysis || [];
            const graphData = [];

            // Create array for hours 0-23
            for (let i = 0; i < 24; i++) {
                const hourLabel = i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`;
                const hourData = hourlyData.find(h => h._id === i);

                graphData.push({
                    name: hourLabel,
                    value: hourData ? hourData.totalSales : 0,
                    hourIndex: i // Add index for filtering
                });
            }

            // Dynamic 7-hour window Logic: [Current-3, Current, Current+3]
            const currentHour = new Date().getHours();
            let startHour = currentHour - 3;
            let endHour = currentHour + 3;

            // Adjust window if out of bounds (0-23)
            if (startHour < 0) {
                startHour = 0;
                endHour = 6; // Fixed 7-hour window at start of day
            } else if (endHour > 23) {
                endHour = 23;
                startHour = 17; // Fixed 7-hour window at end of day
            }

            const filteredGraphData = graphData.filter(d => d.hourIndex >= startHour && d.hourIndex <= endHour);
            setSalesData(filteredGraphData);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Socket Listener for Real-Time Stats Update
    useEffect(() => {
        if (!socket || !user?.restaurantName) return;

        socket.emit('joinRestaurant', user.restaurantName);

        const handleUpdate = () => {
            console.log("Dashboard update triggered by socket");
            fetchDashboardData();
        };

        socket.on('orderUpdated', handleUpdate);
        return () => socket.off('orderUpdated');
    }, [socket, user?.restaurantName, fetchDashboardData]);

    const restaurantSlug = user?.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || 'restaurant';

    return (
        <div className="min-h-screen bg-transparent px-2 sm:px-4 pt-0 pb-4 sm:pt-0 sm:pb-8 space-y-4 md:space-y-6">
            <div className="space-y-1">
                <h1 className="text-[20px] sm:text-[24px] lg:text-[30px] font-medium text-black tracking-tight leading-none">Dashboard</h1>
                <p className="text-[12px] sm:text-[18px] text-gray-400 font-medium">Welcome back, Admin</p>
            </div>

            {/* Main Content Grid - 1 Column on Mobile, 12 on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                {/* Left Column (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
                    {/* Top Row: KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                        <div className="col-span-1">
                            <DashboardCard value={stats.activeOrders || 0} label="Active Orders" icon={activityIcon} />
                        </div>
                        <div className="col-span-1">
                            <DashboardCard
                                value={stats.dineIn || 0}
                                subValue={stats.totalTables || 0}
                                label="Occupied Tables"
                                icon={tableIcon}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <DashboardCard value={(stats.todayRevenue || 0).toLocaleString()} label="Today Revenue" icon={revenueIcon} isCurrency />
                        </div>
                    </div>

                    {/* Middle Row: Sales Analytics */}
                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.8rem] p-4 sm:p-8 relative shadow-sm h-[400px] sm:h-[600px] lg:h-[740px] flex flex-col border border-transparent">
                        <div className="flex justify-between items-center gap-2 mb-4 sm:mb-2">
                            <div
                                className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => navigate(`/${restaurantSlug}/admin/sales`)}
                            >
                                <h2 className="text-[16px] sm:text-[24px] font-medium text-black">Sales Analytics</h2>
                                <p className="text-[12px] text-gray-400 font-medium">Today Breakdown</p>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                    onClick={() => navigate(`/${restaurantSlug}/admin/sales`)}
                                    className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={salesData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500, fontFamily: 'Urbanist' }}
                                        dy={15}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={false}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-gray-50">
                                                        <p className="text-[14px] font-medium text-black font-urb">
                                                            {currencySymbol}{payload[0].value.toLocaleString()}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        shape={(props) => <CustomPillBar {...props} />}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column (Span 4) */}
                <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
                    {/* Time Status Gauge */}
                    <div className="hidden sm:block">
                        <TimeStatusGauge value={stats.avgWaitTime || 0} />
                    </div>

                    {/* Live Active Feed */}
                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.8rem] p-4 sm:p-8 shadow-sm flex flex-col h-[400px] sm:h-[500px] lg:h-[560px] border border-transparent">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-[16px] sm:text-[24px] font-medium text-black">Live Feed</h2>
                            <div
                                onClick={() => navigate(`/${restaurantSlug}/admin/orders`)}
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-6 flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar no-scrollbar">
                            {feedItems.length > 0 ? feedItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/${restaurantSlug}/admin/orders?orderId=${item.id}`)}
                                    className="flex items-center justify-between p-3 sm:p-5 bg-[#F9FAFB] rounded-[1.2rem] sm:rounded-[2.2rem] border border-gray-50 hover:bg-white hover:border-gray-100 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 sm:gap-5">
                                        <div className="w-12 h-12 sm:w-[72px] sm:h-[72px] rounded-full bg-[#F3F5F7] flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                            <img src={item.icon} alt={item.title} className="w-6 h-6 sm:w-9 sm:h-9 opacity-70" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-medium text-black text-[15px] sm:text-[18px] leading-tight">{item.title}</h4>
                                            <p className="text-[12px] sm:text-[15px] text-gray-400 font-medium mt-0.5 truncate max-w-[100px] sm:max-w-[120px]">{item.sub}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/${restaurantSlug}/admin/orders?orderId=${item.id}`); }}
                                        className="bg-black text-white text-[12px] sm:text-[14px] font-medium px-4 sm:px-7 py-2 sm:py-3 rounded-full hover:bg-gray-800 transition-transform active:scale-95"
                                    >
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

