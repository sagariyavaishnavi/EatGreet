import { Clock, Loader2, UtensilsCrossed, X, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import PropTypes from 'prop-types';
import clockIcon from '../../assets/clock.svg';
import chefHatIcon from '../../assets/Chef-Toque-Hat--Streamline-Flex.svg';
import bellIcon from '../../assets/Bell--Streamline-Flex.svg';
import diningIcon from '../../assets/Dining-Room--Streamline-Atlas.svg';
import userIcon from '../../assets/User--Streamline-Font-Awesome.svg';
import groupIcon from '../../assets/Group--Streamline-Sharp-Material.svg';
// receipt icon removed from order history per request
import { useState, useEffect } from 'react';
import { orderAPI, statsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

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

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        preparing: 0,
        ready: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'cards'
    const [timers, setTimers] = useState({});

    const fetchOrders = async () => {
        try {
            const { data } = await orderAPI.getOrders();
            setOrders(data || []);

            // Calculate stats from orders
            const newStats = {
                total: data.length,
                pending: data.filter(o => o.status === 'pending').length,
                preparing: data.filter(o => o.status === 'preparing').length,
                ready: data.filter(o => o.status === 'ready').length,
                completed: data.filter(o => o.status === 'completed').length
            };
            setStats(newStats);
        } catch (error) {
            console.error('Failed to fetch orders', error);
            // toast.error('Failed to update orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    // Timer effect for order preparation time
    useEffect(() => {
        const timer = setInterval(() => {
            setTimers(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(orderId => {
                    if (updated[orderId] > 0) {
                        updated[orderId]--;
                    }
                });
                return updated;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Initialize timers for orders
    useEffect(() => {
        activeOrders.forEach(order => {
            if (!timers[order._id]) {
                // Calculate time elapsed
                const createdAt = new Date(order.createdAt);
                const now = new Date();
                const elapsedSeconds = Math.floor((now - createdAt) / 1000);
                const estimatedTime = 900; // 15 minutes default
                const remainingTime = Math.max(0, estimatedTime - elapsedSeconds);
                setTimers(prev => ({ ...prev, [order._id]: remainingTime }));
            }
        });
    }, [orders]);

    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));

    // Calculate completion percentage
    const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getOrderTime = (createdAt) => {
        if (!createdAt) return 'N/A';
        const date = new Date(createdAt);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-red-100 text-red-600';
            case 'preparing': return 'bg-yellow-100 text-yellow-600';
            case 'ready': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusButtonColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-[#FD6941] hover:bg-orange-600';
            case 'preparing': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'ready': return 'bg-green-500 hover:bg-green-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    const getNextStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Mark Preparing';
            case 'preparing': return 'Mark Ready';
            case 'ready': return 'Mark Complete';
            default: return 'Update';
        }
    };

    const getNextStatus = (status) => {
        switch (status) {
            case 'pending': return 'preparing';
            case 'preparing': return 'ready';
            case 'ready': return 'completed';
            default: return status;
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        const loadToast = toast.loading('Updating order status...');
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            toast.success('Order status updated!', { id: loadToast });
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status', { id: loadToast });
        }
    };

    const handlePrint = (order) => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            const itemsRows = (order.items || []).map(it => `<tr><td>${it.name}</td><td style="text-align:center">${it.qty || 1}</td><td style="text-align:right">₹${(it.price||0).toFixed(2)}</td></tr>`).join('');
            const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title><style>body{font-family:Urbanist,Arial,sans-serif;color:#111;padding:20px}h1{font-size:18px;margin-bottom:6px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{padding:8px;border-bottom:1px solid #eee}</style></head><body>` +
                `<h1>Invoice - Order #${order._id.slice(-4)}</h1>` +
                `<p>Table: ${order.tableNumber || 'N/A'}</p>` +
                `<table><thead><tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${itemsRows}</tbody></table>` +
                `<p style="text-align:right;font-weight:600;margin-top:12px">Total: ₹${(order.totalAmount||0).toFixed(2)}</p>` +
                `</body></html>`;
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        } catch (e) {
            console.error('Print failed', e);
        }
    };

    // calculator removed per request

    // show full-page loader while initial data is being fetched
    if (loading && (!orders || orders.length === 0)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
                    <p className="text-gray-500">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Dashboard Main Title */}
            <div className="mb-8">
                <h1 className="text-3xl text-gray-800">Orders</h1>
                <p className="text-gray-500">Manage your restaurant active orders</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Pending Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={clockIcon} alt="Pending" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl text-gray-900">{stats.pending}</span>
                    </div>
                    <p className="text-gray-400 text-sm pl-1">Total Pending Orders</p>
                </div>

                {/* Preparing Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={chefHatIcon} alt="Preparing" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl text-gray-900">{stats.preparing}</span>
                    </div>
                    <p className="text-gray-400 text-sm pl-1">Preparing Orders</p>
                </div>

                {/* Ready Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={bellIcon} alt="Ready" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl text-gray-900">{stats.ready}</span>
                    </div>
                    <p className="text-gray-400 text-sm pl-1">Ready to serve</p>
                </div>

                {/* Today Orders Complete Card */}
                <div className={`p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden bg-gradient-to-b from-white to-[#F9FAFB] flex flex-col justify-between h-40 lg:col-span-2`}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-800 text-lg font-medium leading-tight max-w-[50%]">Today Orders Complete</p>
                        <div className="text-right">
                            <span className="text-4xl font-normal text-gray-900">{stats.completed}</span>
                            <span className="text-2xl font-light text-gray-400">/{stats.total}</span>
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
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${completionPercentage}%`,
                                    background: completionPercentage < 33 
                                        ? `linear-gradient(90deg, #FBBF24, #FCD34D)`
                                        : completionPercentage < 60
                                        ? `linear-gradient(90deg, #FCD34D, #84CC16)`
                                        : `linear-gradient(90deg, #84CC16, #22C55E)`
                                }}
                            ></div>
                            <div className="absolute top-0 left-[33%] w-0.5 h-full bg-white/80"></div>
                            <div className="absolute top-0 left-[60%] w-0.5 h-full bg-white/80"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Orders Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl text-gray-800">Active Order</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-3 bg-gray-50 rounded-full text-sm w-80 focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-400"
                            />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <button
                            onClick={fetchOrders}
                            className={`p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}
                        >
                            <Loader2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {activeOrders.length > 0 ? (
                    <div className="space-y-4">
                        {activeOrders.map(order => {
                            const statusTextColor = order.status === 'pending'
                                ? 'text-red-600'
                                : order.status === 'preparing'
                                ? 'text-yellow-600'
                                : 'text-green-600';

                            const statusBgColor = order.status === 'pending'
                                ? 'bg-red-100'
                                : order.status === 'preparing'
                                ? 'bg-yellow-100'
                                : 'bg-green-100';

                            return (
                                <div key={order._id} className="relative flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                    {/* Card corner actions */}
                                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                                        <button
                                            onClick={() => handlePrint(order)}
                                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:shadow-sm transition"
                                            title="Print Invoice"
                                        >
                                            <Printer className="w-4 h-4 text-gray-600" />
                                        </button>
                                        
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100">
                                            <UtensilsCrossed className={`w-5 h-5 ${statusTextColor}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 text-lg">Order #{order._id.slice(-4)}</h4>
                                            <p className="text-sm text-gray-500"><span className="capitalize">{order.tableNumber ? `Table #${order.tableNumber}` : 'Takeaway'}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-5 py-2 bg-[#FD6941] text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
                                        >
                                            View Details
                                        </button>
                                        <span className={`px-4 py-1.5 rounded-full text-xs uppercase font-medium ${statusTextColor} ${statusBgColor}`}>{order.status}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <UtensilsCrossed className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">No Active Orders</h3>
                        <p className="text-gray-400 text-sm max-w-[200px]">New orders will appear here in real-time once placed by customers.</p>
                    </div>
                )}
            </div>

            {/* Order History Section */}
            {stats.completed > 0 && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl text-gray-800">Order History</h2>
                    </div>

                    {orders.filter(o => o.status === 'completed').length > 0 ? (
                        <div className="space-y-4">
                            {orders.filter(o => o.status === 'completed').map(order => (
                                <div key={order._id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100">
                                            <UtensilsCrossed className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 text-lg">Order #{order._id.slice(-4)}</h4>
                                            <p className="text-sm text-gray-500"><span className="capitalize">{order.tableNumber ? `Table #${order.tableNumber}` : 'Takeaway'}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-4 py-1.5 rounded-full text-xs uppercase font-medium text-green-600 bg-green-100">Completed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <UtensilsCrossed className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">No Completed Orders</h3>
                            <p className="text-gray-400 text-sm max-w-[200px]">Completed orders will appear here once marked complete.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal - Card View */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                        {/* Print Button */}
                        <button
                            onClick={() => handlePrint(selectedOrder)}
                            className="absolute top-6 right-16 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
                        >
                            <Printer className="w-4 h-4" />
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Card Content */}
                        <div className="p-8">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl text-gray-900 mb-2">Order #{selectedOrder._id.slice(-3)}</h2>
                                    <p className="text-gray-500">Order details and items</p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm uppercase ${getStatusColor(selectedOrder.status)}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        <img src={diningIcon} alt="Table" className="w-6 h-6 opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Table no.</p>
                                        <p className="text-lg text-gray-900">{selectedOrder.tableNumber || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        <img src={userIcon} alt="Customer" className="w-6 h-6 opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Customer</p>
                                        <p className="text-lg text-gray-900">{(selectedOrder.customerInfo?.name || 'Guest').split(' ')[0]}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        <img src={clockIcon} alt="Time" className="w-6 h-6 opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Time</p>
                                        <p className="text-lg text-gray-900">{getOrderTime(selectedOrder.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        <img src={groupIcon} alt="Guests" className="w-6 h-6 opacity-40" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">Guests</p>
                                        <p className="text-lg text-gray-900">{selectedOrder.items?.length || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timer Section */}
                            <div className="flex justify-center mb-8">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke={selectedOrder.status === 'pending' ? '#ef4444' : selectedOrder.status === 'preparing' ? '#eab308' : '#22c55e'}
                                            strokeWidth="3"
                                            strokeDasharray={`${(timers[selectedOrder._id] / 900) * 282.7} 282.7`}
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="text-center">
                                        <div className="text-3xl text-gray-900">{formatTime(timers[selectedOrder._id] || 0)}</div>
                                        <p className="text-xs text-gray-400 mt-1">Minutes</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Section */}
                            <div className="mb-8 pb-8 border-b border-gray-200">
                                <h3 className="text-sm text-gray-400 uppercase mb-4">Order Item</h3>
                                <div className="space-y-4">
                                    {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Amount Section */}
                            <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-200">
                                <h3 className="text-lg text-gray-900">Total Amount</h3>
                                <p className="text-3xl text-gray-900">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        updateOrderStatus(selectedOrder._id, getNextStatus(selectedOrder.status));
                                        setSelectedOrder(null);
                                    }}
                                    className={`flex-1 ${getStatusButtonColor(selectedOrder.status)} text-white py-4 rounded-2xl transition-colors text-lg`}
                                >
                                    {getNextStatusLabel(selectedOrder.status)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
