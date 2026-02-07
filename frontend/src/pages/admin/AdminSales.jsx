import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Legend
} from 'recharts';
import { Calendar, DollarSign, TrendingUp, Download, Eye, X, Printer, FileText, Search, Filter, ChevronDown, Wallet } from 'lucide-react';
import { orderAPI, restaurantAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

// Helper to format currency
const formatCurrency = (amount, symbol = '$') => {
    if (amount === undefined || amount === null) return `${symbol}0.00`;
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const SalesCard = ({ title, value, subValue, icon: Icon, trend }) => {
    return (
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-transparent hover:border-gray-100 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-black">
                    <Icon className="w-6 h-6 opacity-70" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-black">{value}</h3>
                {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
            </div>
        </div>
    );
};

const DynamicEbitdaCard = ({ stats, currencySymbol }) => {
    const [period, setPeriod] = useState('Monthly'); // Default
    const [isOpen, setIsOpen] = useState(false);

    const getData = () => {
        switch(period) {
            case 'Weekly': return stats.weekly.ebitda;
            case 'Quarterly': return stats.quarterly.ebitda;
            case 'Annual': return stats.annual.ebitda;
            case 'Monthly':
            default: return stats.monthly.ebitda;
        }
    };

    return (
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-transparent hover:border-gray-100 transition-all relative">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-orange-600 bg-orange-50">
                    <Wallet className="w-6 h-6" />
                </div>
                
                {/* Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1 text-xs font-bold bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg text-gray-500 transition-colors"
                    >
                        {period} <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 overflow-hidden">
                                {['Weekly', 'Monthly', 'Quarterly', 'Annual'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setPeriod(p); setIsOpen(false); }}
                                        className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 ${period === p ? 'text-black bg-gray-50' : 'text-gray-500'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">EBITDA ({period})</p>
                <h3 className="text-2xl font-bold text-black">{formatCurrency(getData(), currencySymbol)}</h3>
                <p className="text-xs text-gray-400 mt-1">Net Earnings (~35%)</p>
            </div>
        </div>
    );
};

// Invoice Modal Component
const InvoiceModal = ({ order, isOpen, onClose, currencySymbol, restaurant }) => {
    if (!isOpen || !order) return null;

    // Calculate order stats
    const orderStats = useMemo(() => {
        if (!order) return null;
        const subtotal = order.items?.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0) || 0;
        const cgst = subtotal * 0.025;
        const sgst = subtotal * 0.025;
        const totalRaw = subtotal + cgst + sgst;
        const grandTotal = Math.round(totalRaw);
        const roundOff = grandTotal - totalRaw;

        return {
            subtotal,
            cgst,
            sgst,
            totalRaw,
            grandTotal,
            roundOff
        };
    }, [order]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const itemsRows = (order.items || []).map((it, i) => `
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
                <div style="flex: 1;">${i + 1}.${it.name}</div>
                <div style="width: 30px; text-align: center;">${it.quantity || 1}</div>
                <div style="width: 60px; text-align: right;">${(it.price || 0).toFixed(2)}</div>
                <div style="width: 70px; text-align: right;">${(it.price * (it.quantity || 1)).toFixed(2)}</div>
            </div>
        `).join('');

        const html = `
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Invoice</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
                    body { 
                        font-family: 'Courier Prime', monospace; 
                        color: #000; 
                        width: 300px; 
                        margin: 0 auto; 
                        padding: 20px;
                    }
                    .header { text-align: center; margin-bottom: 20px; }
                    .restaurant-name { font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
                    .restaurant-info { font-size: 12px; margin-bottom: 2px; }
                    .divider { border-top: 1px dashed #000; margin: 10px 0; }
                    .info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 3px; }
                    .table-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-bottom: 5px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 14px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="restaurant-name">${restaurant?.name || 'EatGreet Restaurant'}</div>
                    <div class="restaurant-info">${restaurant?.address || restaurant?.restaurantDetails?.address || 'Restaurant Address'}</div>
                    ${(restaurant?.contactNumber || restaurant?.restaurantDetails?.contactNumber) ? `<div class="restaurant-info">Tel: ${restaurant.contactNumber || restaurant.restaurantDetails.contactNumber}</div>` : ''}
                    <div class="restaurant-info">GST - 24AAYFT4562G1ZO</div>
                </div>

                <div class="divider"></div>
                <div class="info-row"><span>Name:</span> <span>${order.customerInfo?.name || 'Guest'}</span></div>
                ${order.customerInfo?.phone ? `<div class="info-row"><span>Tel:</span> <span>${order.customerInfo.phone}</span></div>` : ''}
                <div class="divider"></div>

                <div class="info-row">
                    <span>Date: ${new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>Dine In: ${order.tableNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span>Time: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="info-row">
                    <span>Cashier: Admin</span>
                    <span>Bill No: ${order.dailySequence ? String(order.dailySequence).padStart(3, '0') : order._id.slice(-4)}</span>
                </div>
                <div class="info-row">
                    <span>Payment:</span>
                    <span>${order.paymentMethod || 'Cash'}</span>
                </div>

                <div class="divider"></div>
                <div class="table-header">
                    <div style="flex: 1;">No.Item</div>
                    <div style="width: 30px; text-align: center;">Qty</div>
                    <div style="width: 60px; text-align: right;">Price</div>
                    <div style="width: 70px; text-align: right;">Amt</div>
                </div>
                <div class="divider"></div>

                ${itemsRows}

                <div class="divider"></div>
                <div class="info-row" style="font-weight: bold;">
                    <span>Total Qty: ${order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0)}</span>
                    <span>Sub Total: ${currencySymbol}${orderStats.subtotal.toFixed(2)}</span>
                </div>
                <div class="info-row">
                    <span>CGST@2.5%</span>
                    <span>${currencySymbol}${orderStats.cgst.toFixed(2)}</span>
                </div>
                <div class="info-row">
                    <span>SGST@2.5%</span>
                    <span>${currencySymbol}${orderStats.sgst.toFixed(2)}</span>
                </div>
                <div class="info-row">
                     <span>Total</span>
                     <span>${currencySymbol}${orderStats.totalRaw.toFixed(2)}</span>
                </div>
                 <div class="info-row">
                     <span>Round Off</span>
                     <span>${currencySymbol}${orderStats.roundOff.toFixed(2)}</span>
                </div>
                <div class="divider"></div>
                <div class="info-row" style="font-size: 16px; font-weight: bold;">
                    <span>Grand Total</span>
                    <span>${currencySymbol}${orderStats.grandTotal.toFixed(2)}</span>
                </div>
                <div class="divider"></div>

                <div class="footer">Thank You Visit Again</div>
            </body>
            <script>
                window.onload = () => { window.print(); window.close(); }
            </script>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-gradient-to-br from-gray-50 to-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative flex flex-col border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
                
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-11 h-11 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all z-50 border border-gray-100"
                >
                    <X className="w-6 h-6" />
                </button>

                 <div className="p-8 overflow-y-auto custom-scrollbar flex items-center justify-center bg-gray-100/50 h-full">
                    <div className="bg-white mx-auto shadow-sm border border-gray-200 p-8 font-mono text-black relative" style={{ width: '380px' }}>
                        <button
                            onClick={handlePrint}
                            className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors no-print"
                            title="Print Thermal Receipt"
                        >
                            <Printer className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold uppercase mb-2 tracking-tight">{restaurant?.name || 'EatGreet Restaurant'}</h2>
                            <p className="text-[12px] leading-tight mb-1 font-bold italic">{restaurant?.address || restaurant?.restaurantDetails?.address || 'Restaurant Address'}</p>
                            {(restaurant?.businessEmail || restaurant?.restaurantDetails?.businessEmail) && (
                                <p className="text-[11px] mb-0.5 opacity-80">Email: {restaurant.businessEmail || restaurant.restaurantDetails.businessEmail}</p>
                            )}
                            {(restaurant?.gstNumber || restaurant?.restaurantDetails?.gstNumber) && (
                                <p className="text-[11px] font-bold">GST: {restaurant.gstNumber || restaurant.restaurantDetails.gstNumber}</p>
                            )}
                            {(restaurant?.contactNumber || restaurant?.restaurantDetails?.contactNumber) && (
                                <p className="text-[11px] text-gray-500 mt-1">Tel: {restaurant.contactNumber || restaurant.restaurantDetails.contactNumber}</p>
                            )}
                        </div>

                        <div className="border-t border-dashed border-black my-4"></div>
                        <div className="flex justify-between text-[13px] mb-1">
                            <span>Name:</span>
                            <span className="font-bold">{order.customerInfo?.name || 'Guest'}</span>
                        </div>
                        {order.customerInfo?.phone && (
                            <div className="flex justify-between text-[13px] mb-1">
                                <span>Tel:</span>
                                <span className="font-bold">{order.customerInfo.phone}</span>
                            </div>
                        )}
                        <div className="border-t border-dashed border-black my-4"></div>

                        <div className="flex justify-between text-[13px] mb-1">
                            <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>Dine In: {order.tableNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-[13px] mb-1">
                            <span>Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between text-[13px] mb-1">
                            <span>Cashier: Admin</span>
                            <span>Bill No: {order.dailySequence ? String(order.dailySequence).padStart(3, '0') : order._id.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between text-[13px] mb-1">
                            <span>Payment:</span>
                            <span>{order.paymentMethod || 'Cash'}</span>
                        </div>

                        <div className="border-t border-dashed border-black my-4"></div>
                        <div className="flex justify-between font-bold text-[13px] mb-2 uppercase">
                            <span style={{ flex: 1 }}>No.Item</span>
                            <span style={{ width: '30px', textAlign: 'center' }}>Qty</span>
                            <span style={{ width: '60px', textAlign: 'right' }}>Price</span>
                            <span style={{ width: '70px', textAlign: 'right' }}>Amt</span>
                        </div>
                        <div className="border-t border-dashed border-black my-4"></div>

                        <div className="space-y-2 mb-4">
                            {(order.items || []).map((it, i) => (
                                <div key={i} className="flex justify-between text-[13px]">
                                    <span style={{ flex: 1 }}>{i + 1}.{it.name}</span>
                                    <span style={{ width: '30px', textAlign: 'center' }}>{it.quantity || 1}</span>
                                    <span style={{ width: '60px', textAlign: 'right' }}>{(it.price || 0).toFixed(2)}</span>
                                    <span style={{ width: '70px', textAlign: 'right' }}>{(it.price * (it.quantity || 1)).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-black my-4"></div>
                        <div className="flex justify-between font-bold text-[13px] mb-1">
                            <span>Total Qty: {order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0)}</span>
                            <span>Sub Total: {currencySymbol}{orderStats?.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[13px] mb-1">
                            <span>CGST@2.5%</span>
                            <span>{currencySymbol}{orderStats?.cgst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[13px] mb-1">
                            <span>SGST@2.5%</span>
                            <span>{currencySymbol}{orderStats?.sgst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[13px] mb-1">
                            <span>Total</span>
                            <span>{currencySymbol}{orderStats?.totalRaw.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[13px] mb-1">
                            <span>Round Off</span>
                            <span>{currencySymbol}{orderStats?.roundOff.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-dashed border-black my-4"></div>
                        <div className="flex justify-between font-bold text-lg mb-4">
                            <span>Grand Total</span>
                            <span>{currencySymbol}{orderStats?.grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-dashed border-black my-4"></div>
                        <div className="text-center font-bold text-[16px] uppercase tracking-widest mt-6">Thank You Visit Again</div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const AdminSales = () => {
    const { currencySymbol } = useSettings();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('All'); // 'All', 'Cash', 'Online'
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [restaurant, setRestaurant] = useState(null);

    // Fetch Restaurant Details on Mount
    useEffect(() => {
        const fetchRestaurantDetails = async () => {
             try {
                 const { data } = await restaurantAPI.getDetails();
                 setRestaurant(data);
             } catch (error) {
                 console.error('Failed to fetch restaurant details', error);
             }
        };
        fetchRestaurantDetails();
    }, []);

    // Default to current year/month/week logic
    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                // Fetching a large number of orders to calculate stats client-side 
                const res = await orderAPI.getOrders({ limit: 1000, status: 'completed,ready,delivered' });
                setOrders(res.data || []);
            } catch (error) {
                console.error("Error fetching orders for sales:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllOrders();
    }, []);

    // Memoized calculations
    const stats = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        let weekly = 0, monthly = 0, quarterly = 0, annual = 0;
        let weeklyVol = 0, monthlyVol = 0, quarterlyVol = 0, annualVol = 0;
        let weeklyEbitda = 0, monthlyEbitda = 0, quarterlyEbitda = 0, annualEbitda = 0;
        
        const TAX_RATE = 0.10; // 10%
        const EBITDA_MARGIN = 0.35; // 35%

        orders.forEach(order => {
            const d = new Date(order.createdAt);
            const amount = order.totalAmount || 0;
            const ebitda = amount * EBITDA_MARGIN;

            // Annual
            if (d.getFullYear() === currentYear) {
                annual += amount;
                annualVol++;
                annualEbitda += ebitda;

                // Monthly
                if (d.getMonth() === currentMonth) {
                    monthly += amount;
                    monthlyVol++;
                    monthlyEbitda += ebitda;
                }

                // Quarterly (Simple check)
                const q = Math.floor(d.getMonth() / 3);
                const currentQ = Math.floor(currentMonth / 3);
                if (q === currentQ) {
                    quarterly += amount;
                    quarterlyVol++;
                    quarterlyEbitda += ebitda;
                }
            }

            // Weekly
            if (d >= currentWeekStart) {
                weekly += amount;
                weeklyVol++;
                weeklyEbitda += ebitda;
            }
        });

        return {
            weekly: { sales: weekly, vol: weeklyVol, ebitda: weeklyEbitda },
            monthly: { sales: monthly, vol: monthlyVol, ebitda: monthlyEbitda },
            quarterly: { sales: quarterly, vol: quarterlyVol, ebitda: quarterlyEbitda },
            annual: { sales: annual, vol: annualVol, ebitda: annualEbitda },
        };
    }, [orders]);

    // Graph Data Preparation
    const graphData = useMemo(() => {
        // Group by Month (Last 12 months or Current Year)
        const groups = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        months.forEach(m => groups[m] = { name: m, sales: 0, volume: 0, tax: 0, ebitda: 0 });

        orders.forEach(order => {
            const d = new Date(order.createdAt);
            if (d.getFullYear() === new Date().getFullYear()) {
                const m = months[d.getMonth()];
                const amount = order.totalAmount || 0;
                groups[m].sales += amount;
                groups[m].volume += 1;
                groups[m].tax += amount * 0.1; // Mock 10%
                groups[m].ebitda += amount * 0.35; // Mock 35%
            }
        });

        return Object.values(groups);
    }, [orders]);

    // Filtered Orders Table
    const filteredOrders = useMemo(() => {
        let result = orders;

        // 1. Date Range Filter
        if (dateRange.start || dateRange.end) {
            const start = dateRange.start ? new Date(dateRange.start) : new Date('1970-01-01');
            const end = dateRange.end ? new Date(dateRange.end) : new Date();
            end.setHours(23, 59, 59, 999);
            result = result.filter(o => {
                const d = new Date(o.createdAt);
                return d >= start && d <= end;
            });
        } else {
             // By default show all, or maybe limit? Let's show all for "searchability" then slice later for initial view if needed
        }

        // 2. Search Filter (Dynamic)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(o => 
                (o.dailySequence && String(o.dailySequence).includes(lowerQuery)) ||
                (o._id && o._id.toLowerCase().includes(lowerQuery)) ||
                (o.customerInfo?.name && o.customerInfo.name.toLowerCase().includes(lowerQuery)) ||
                (o.tableNumber && String(o.tableNumber).includes(lowerQuery))
            );
        }

        // 3. Payment Mode Filter
        if (paymentFilter !== 'All') {
             result = result.filter(o => {
                 const mode = o.paymentMethod || 'Cash'; // Default to Cash if undefined
                 return mode.toLowerCase() === paymentFilter.toLowerCase();
             });
        }

        // Sort by date desc
        return result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [orders, dateRange, searchQuery, paymentFilter]);

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black tracking-tight">Sales Dashboard</h1>
                    <p className="text-gray-400 font-medium">Financial Overview & Analytics</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="bg-white border border-gray-100 text-gray-700 text-sm rounded-lg focus:ring-black focus:border-black block px-3 py-2 outline-none shadow-sm"
                    />
                    <span className="self-center text-gray-400">-</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="bg-white border border-gray-100 text-gray-700 text-sm rounded-lg focus:ring-black focus:border-black block px-3 py-2 outline-none shadow-sm"
                    />
                    <button className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* 5 Summary Tiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <SalesCard
                    title="Weekly Sales"
                    value={formatCurrency(stats.weekly.sales, currencySymbol)}
                    subValue={`${stats.weekly.vol} Orders`}
                    icon={DollarSign}
                    trend={12} // Mock trend
                />
                <SalesCard
                    title="Monthly Sales"
                    value={formatCurrency(stats.monthly.sales, currencySymbol)}
                    subValue={`${stats.monthly.vol} Orders`}
                    icon={Calendar}
                    trend={-5}
                />
                <SalesCard
                    title="Quarterly Sales"
                    value={formatCurrency(stats.quarterly.sales, currencySymbol)}
                    subValue={`${stats.quarterly.vol} Orders`}
                    icon={TrendingUp}
                    trend={8}
                />
                <SalesCard
                    title="Annual Sales"
                    value={formatCurrency(stats.annual.sales, currencySymbol)}
                    subValue={`${stats.annual.vol} Orders`}
                    icon={DollarSign}
                    trend={24}
                />
                
                {/* Dynamic EBITDA Card */}
                <DynamicEbitdaCard stats={stats} currencySymbol={currencySymbol} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph: Sales & EBITDA */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[1.5rem] shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-black">Revenue & EBITDA</h3>
                        <p className="text-sm text-gray-400">Monthly breakdown of sales and earnings</p>
                    </div>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorEbitda" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="sales" name="Sales" stroke="#000000" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                                <Area type="monotone" dataKey="ebitda" name="EBITDA" stroke="#22C55E" fillOpacity={1} fill="url(#colorEbitda)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Graph: Volume & Tax */}
                <div className="lg:col-span-1 bg-white p-6 rounded-[1.5rem] shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-black">Volume & Tax</h3>
                        <p className="text-sm text-gray-400">Transaction counts & tax collected</p>
                    </div>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="volume" name="Volume" fill="#000000" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="tax" name="Tax" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-[1.5rem] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-black">Transaction History</h3>
                        <p className="text-sm text-gray-400">Detailed list of past orders</p>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 sm:flex-none">
                            <input 
                                type="text" 
                                placeholder="Search Order ID..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-black transition-all"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-bold transition-all ${paymentFilter !== 'All' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>{paymentFilter === 'All' ? 'Filter' : paymentFilter}</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Mode</div>
                                        {['All', 'Cash', 'Online'].map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => {
                                                    setPaymentFilter(mode);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors ${paymentFilter === mode ? 'text-black bg-gray-50' : 'text-gray-600'}`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium text-center">Payment</th>
                                <th className="px-6 py-4 font-medium text-center">Quantity</th>
                                <th className="px-6 py-4 font-medium text-right">Tax (10%)</th>
                                <th className="px-6 py-4 font-medium text-right">Total Amount</th>
                                <th className="px-6 py-4 font-medium text-center">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-black">
                                            #{order.dailySequence || (order._id || '').slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                (order.paymentMethod || 'Cash') === 'Online' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                                {order.paymentMethod || 'Cash'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                                            {order.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 text-right">
                                            {formatCurrency((order.totalAmount || 0) * 0.10, currencySymbol)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-black text-right">
                                            {formatCurrency(order.totalAmount || 0, currencySymbol)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-all active:scale-95 shadow-md hover:shadow-lg mx-auto"
                                                title="View Invoice"
                                            >
                                                <FileText size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        No sales data found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Modal */}
            <InvoiceModal 
                order={selectedOrder} 
                isOpen={!!selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
                currencySymbol={currencySymbol}
                restaurant={restaurant} 
            />
        </div>
    );
};

export default AdminSales;
