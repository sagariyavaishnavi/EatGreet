import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import {
    Calendar, Download, TrendingUp, ShoppingBag,
    DollarSign, Percent, ChevronDown, Filter,
    FileText, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { statsAPI, orderAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const KPICard = ({ title, value, subtext, icon: Icon, trend, isCurrency }) => {
    const { currencySymbol } = useSettings();
    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-transparent hover:border-gray-50 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                    <Icon className="w-6 h-6 text-gray-700" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight flex items-baseline">
                    {isCurrency && <span className="text-xl mr-1 font-medium">{currencySymbol}</span>}
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
                <p className="text-[11px] text-gray-400 font-medium mt-2">{subtext}</p>
            </div>
        </div>
    );
};

const AdminSales = () => {
    const { currencySymbol } = useSettings();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [stats, setStats] = useState({
        summary: {},
        charts: {
            revenueTrend: [],
            hourlyAnalysis: [],
            bestsellers: []
        }
    });

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const { data } = await statsAPI.getAdminStats({
                startDate: dateRange.start,
                endDate: dateRange.end
            });
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch sales data", error);
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, [dateRange]);

    const COLORS = ['#FD6941', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6'];

    const handleExport = (type) => {
        toast.success(`Preparing ${type.toUpperCase()} report...`);
        // Logic for export would go here
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-[20px] sm:text-[24px] lg:text-[30px] font-medium text-black tracking-tight leading-none">Sales & Analytics</h1>
                    <p className="text-gray-400 font-medium mt-1">Track your restaurant's financial performance</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full px-4 py-2 flex items-center gap-3 shadow-sm border border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="text-sm font-medium border-none focus:ring-0 bg-transparent p-0"
                            />
                            <span className="text-gray-300">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="text-sm font-medium border-none focus:ring-0 bg-transparent p-0"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => handleExport('csv')}
                        className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-all shadow-md active:scale-95"
                        title="Download CSV"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={stats.summary.rangeRevenue || 0}
                    subtext="For the selected period"
                    icon={DollarSign}
                    isCurrency
                />
                <KPICard
                    title="Total Orders"
                    value={stats.summary.totalOrders || 0}
                    subtext="Volume of sales"
                    icon={ShoppingBag}
                />
                <KPICard
                    title="Avg. Order Value"
                    value={stats.summary.avgOrderValue ? Math.round(stats.summary.avgOrderValue) : 0}
                    subtext="Revenue per order"
                    icon={TrendingUp}
                    isCurrency
                />
                <KPICard
                    title="Cancellation Rate"
                    value={`${stats.summary.cancellationRate ? stats.summary.cancellationRate.toFixed(1) : 0}%`}
                    subtext="Failed order percentage"
                    icon={Percent}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-transparent min-h-[450px]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Revenue Trend</h3>
                            <p className="text-sm text-gray-400">Daily financial growth</p>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.charts.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${currencySymbol}${value}`, 'Revenue']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#FD6941"
                                    strokeWidth={4}
                                    dot={{ fill: '#FD6941', strokeWidth: 2, r: 6, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bestsellers List */}
                <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-transparent flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Bestselling Items</h3>
                    <p className="text-sm text-gray-400 mb-6">Most popular menu choices</p>

                    <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                        {stats.charts.bestsellers.length > 0 ? stats.charts.bestsellers.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-orange-50 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-gray-400 group-hover:text-orange-500">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                                        <p className="text-xs text-gray-400">{item.count} orders</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{currencySymbol}{item.revenue.toLocaleString()}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                <Clock className="w-12 h-12 opacity-20 mb-2" />
                                <p className="text-sm">No data yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-transparent">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900">Peak Hours Analysis</h3>
                    <p className="text-sm text-gray-400">Identify your busiest times of day</p>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.charts.hourlyAnalysis}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis
                                dataKey="_id"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `${val}:00`}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: '#F9FAFB' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(val) => `${val}:00`}
                            />
                            <Bar
                                dataKey="total"
                                fill="#FD6941"
                                radius={[10, 10, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminSales;
