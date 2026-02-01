import { Clock, Loader2, UtensilsCrossed, X, ChevronLeft, ChevronRight, Printer, FileText, User, Calendar, Hash } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import PropTypes from 'prop-types';
import clockIcon from '../../assets/clock.svg';
import chefHatIcon from '../../assets/Chef-Toque-Hat--Streamline-Flex.svg';
import bellIcon from '../../assets/Bell--Streamline-Flex.svg';
import diningIcon from '../../assets/Dining-Room--Streamline-Atlas.svg';
import userIcon from '../../assets/User--Streamline-Font-Awesome.svg';
import groupIcon from '../../assets/Group--Streamline-Sharp-Material.svg';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { orderAPI, statsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

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
    const { currencySymbol } = useSettings();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'cards'
    const [searchQuery, setSearchQuery] = useState('');
    const [historyFilter, setHistoryFilter] = useState('today'); // 'today', 'yesterday', 'lastWeek'
    const [timers, setTimers] = useState({});
    const [restaurant, setRestaurant] = useState(null);
    const socket = useSocket();
    const { user } = useSettings();

    // Socket Listener for real-time updates
    useEffect(() => {
        if (!socket || !user?.restaurantName) return;

        // Join restaurant room
        socket.emit('joinRestaurant', user.restaurantName);

        const handleUpdate = (payload) => {
            console.log("Order Update Received:", payload.action);
            fetchOrders(); // Refresh everything for simplicity and consistency
            if (payload.action === 'create') {
                toast.success('New order received!', { duration: 5000, icon: '🔔' });
            }
        };

        socket.on('orderUpdated', handleUpdate);
        return () => {
            socket.off('orderUpdated', handleUpdate);
        };
    }, [socket, user?.restaurantName]);

    const fetchRestaurantDetails = async () => {
        try {
            const { restaurantAPI } = await import('../../utils/api');
            const { data } = await restaurantAPI.getDetails();
            setRestaurant(data);
        } catch (error) {
            console.error('Failed to fetch restaurant details', error);
        }
    };

    useEffect(() => {
        fetchRestaurantDetails();
    }, []);

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
        orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).forEach(order => {
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

    const filteredActiveOrders = orders.filter(o => {
        const isActive = ['pending', 'preparing', 'ready'].includes(o.status);
        if (!isActive) return false;
        if (!searchQuery) return true;

        const q = searchQuery.toLowerCase();
        return (
            o._id.toLowerCase().includes(q) ||
            (o.tableNumber && String(o.tableNumber).includes(q)) ||
            (o.customerInfo?.name && o.customerInfo.name.toLowerCase().includes(q))
        );
    });

    const filteredHistoryOrders = orders.filter(o => {
        if (o.status !== 'completed') return false;

        const orderDate = new Date(o.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (historyFilter === 'today') {
            return orderDate >= today;
        } else if (historyFilter === 'yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate >= yesterday && orderDate < today;
        } else if (historyFilter === 'lastWeek') {
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            return orderDate >= lastWeek;
        }
        return true;
    });

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
            default: return 'Update';
        }
    };

    const getNextStatus = (status) => {
        switch (status) {
            case 'pending': return 'preparing';
            case 'preparing': return 'ready';
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

            const subtotal = order.items?.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0) || 0;
            const cgst = subtotal * 0.025;
            const sgst = subtotal * 0.025;
            const grandTotal = subtotal + cgst + sgst;

            const itemsRows = (order.items || []).map(it => `
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
                    <div style="flex: 1;">${it.name}</div>
                    <div style="width: 30px; text-align: center;">${it.quantity || 1}</div>
                    <div style="width: 60px; text-align: right;">${currencySymbol}${(it.price || 0).toFixed(2)}</div>
                    <div style="width: 70px; text-align: right;">${currencySymbol}${(it.price * (it.quantity || 1)).toFixed(2)}</div>
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
                        <div class="restaurant-info">${restaurant?.restaurantDetails?.address || 'Restaurant Address'}</div>
                        ${restaurant?.restaurantDetails?.contactNumber ? `<div class="restaurant-info">Tel: ${restaurant.restaurantDetails.contactNumber}</div>` : ''}
                        <div class="restaurant-info">GST - 24AAYFT4562G1ZO</div>
                    </div>

                    <div class="divider"></div>
                    <div class="info-row"><span>Name:</span> <span>${order.customerInfo?.name || 'Guest'}</span></div>
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
                        <span>Bill No: ${order._id.slice(-4)}</span>
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
                        <span>Sub Total: ${currencySymbol}${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="info-row">
                        <span>CGST@2.5%</span>
                        <span>${currencySymbol}${cgst.toFixed(2)}</span>
                    </div>
                    <div class="info-row">
                        <span>SGST@2.5%</span>
                        <span>${currencySymbol}${sgst.toFixed(2)}</span>
                    </div>
                    <div class="divider"></div>
                    <div class="info-row" style="font-size: 16px; font-weight: bold;">
                        <span>Grand Total</span>
                        <span>${currencySymbol}${grandTotal.toFixed(2)}</span>
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
        } catch (e) {
            console.error('Print failed', e);
        }
    };

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
            <div className="mb-8">
                <h1 className="text-3xl text-gray-800">Orders</h1>
                <p className="text-gray-500">Manage your restaurant active orders</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={clockIcon} alt="Pending" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl text-gray-900">{stats.pending}</span>
                    </div>
                    <p className="text-gray-400 text-sm pl-1">Total Pending Orders</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={chefHatIcon} alt="Preparing" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl text-gray-900">{stats.preparing}</span>
                    </div>
                    <p className="text-gray-400 text-sm pl-1">Preparing Orders</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={bellIcon} alt="Ready" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl text-gray-900">{stats.ready}</span>
                    </div>
                    <p className="text-gray-400 text-sm pl-1">Ready to serve</p>
                </div>

                <div className={`p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden bg-gradient-to-b from-white to-[#F9FAFB] flex flex-col justify-between h-40 lg:col-span-2`}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-800 text-lg font-medium leading-tight max-w-[50%]">Today Orders Complete</p>
                        <div className="text-right">
                            <span className="text-4xl font-normal text-gray-900">{stats.completed}</span>
                            <span className="text-2xl font-light text-gray-400">/{stats.total}</span>
                        </div>
                    </div>

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

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl text-gray-800">Active Order</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by Table, ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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

                {filteredActiveOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredActiveOrders.map(order => {
                            const statusTextColor = order.status === 'pending' ? 'text-red-600' : order.status === 'preparing' ? 'text-yellow-600' : 'text-green-600';
                            const statusBgColor = order.status === 'pending' ? 'bg-red-100' : order.status === 'preparing' ? 'bg-yellow-100' : 'bg-green-100';

                            return (
                                <div key={order._id} className="relative flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
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

            {stats.completed > 0 && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl text-gray-800">Order History</h2>
                        <select
                            value={historyFilter}
                            onChange={(e) => setHistoryFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-100 text-gray-600 text-sm rounded-full focus:ring-primary focus:border-primary block p-2.5 px-6 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="lastWeek">Last Week</option>
                        </select>
                    </div>

                    {filteredHistoryOrders.length > 0 ? (
                        <div className="space-y-4">
                            {filteredHistoryOrders.map(order => (
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
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 hover:shadow-sm transition-all hover:bg-gray-50 text-gray-400 hover:text-[#FD6941]"
                                            title="View Invoice"
                                        >
                                            <FileText className="w-5 h-5" />
                                        </button>
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

            {selectedOrder && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            {selectedOrder.status === 'completed' ? (
                                <div className="bg-white mx-auto shadow-sm border border-gray-200 p-8 font-mono text-black relative mb-8" style={{ width: '380px' }}>
                                    <button
                                        onClick={() => handlePrint(selectedOrder)}
                                        className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors no-print"
                                        title="Print Thermal Receipt"
                                    >
                                        <Printer className="w-5 h-5" />
                                    </button>

                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-bold uppercase mb-1 tracking-tight">{restaurant?.name || 'EatGreet Restaurant'}</h2>
                                        <p className="text-[12px] leading-tight mb-0.5">{restaurant?.restaurantDetails?.address || 'Restaurant Address'}</p>
                                        {restaurant?.restaurantDetails?.contactNumber && (
                                            <p className="text-[12px] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Tel: {restaurant.restaurantDetails.contactNumber}</p>
                                        )}
                                        <p className="text-[12px]">GST - 24AAYFT4562G1ZO</p>
                                    </div>

                                    <div className="border-t border-dashed border-black my-4"></div>
                                    <div className="flex justify-between text-[13px] mb-1">
                                        <span>Name:</span>
                                        <span className="font-bold">{selectedOrder.customerInfo?.name || 'Guest'}</span>
                                    </div>
                                    <div className="border-t border-dashed border-black my-4"></div>

                                    <div className="flex justify-between text-[13px] mb-1">
                                        <span>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                                        <span>Dine In: {selectedOrder.tableNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px] mb-1">
                                        <span>Time: {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px] mb-1">
                                        <span>Cashier: Admin</span>
                                        <span>Bill No: {selectedOrder._id.slice(-4)}</span>
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
                                        {(selectedOrder.items || []).map((it, i) => (
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
                                        <span>Total Qty: {selectedOrder.items?.reduce((acc, it) => acc + (it.quantity || 1), 0)}</span>
                                        <span>Sub Total: {currencySymbol}{(selectedOrder.items?.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0) || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px] mb-1">
                                        <span>CGST@2.5%</span>
                                        <span>{currencySymbol}{((selectedOrder.items?.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0) || 0) * 0.025).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[13px] mb-1">
                                        <span>SGST@2.5%</span>
                                        <span>{currencySymbol}{((selectedOrder.items?.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0) || 0) * 0.025).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-dashed border-black my-4"></div>
                                    <div className="flex justify-between font-bold text-lg mb-4">
                                        <span>Grand Total</span>
                                        <span>{currencySymbol}{(selectedOrder.totalAmount || (selectedOrder.items?.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0) * 1.05)).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-dashed border-black my-4"></div>
                                    <div className="text-center font-bold text-[16px] uppercase tracking-widest mt-6">Thank You Visit Again</div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <h2 className="text-3xl text-gray-900 mb-2 font-bold tracking-tight">Order #{selectedOrder._id.slice(-4)}</h2>
                                            <p className="text-gray-500 font-medium">Order details and active items</p>
                                        </div>
                                        <span className={`px-5 py-2 rounded-full text-xs uppercase font-bold tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <img src={diningIcon} alt="Table" className="w-6 h-6 opacity-60" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Table</p>
                                                <p className="text-lg text-gray-900 font-bold">{selectedOrder.tableNumber || 'Self'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <img src={userIcon} alt="Customer" className="w-6 h-6 opacity-60" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Guest</p>
                                                <p className="text-lg text-gray-900 font-bold">{(selectedOrder.customerInfo?.name || 'User').split(' ')[0]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <img src={clockIcon} alt="Time" className="w-6 h-6 opacity-60" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Time</p>
                                                <p className="text-lg text-gray-900 font-bold">{getOrderTime(selectedOrder.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <img src={groupIcon} alt="Items" className="w-6 h-6 opacity-60" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Items</p>
                                                <p className="text-lg text-gray-900 font-bold">{selectedOrder.items?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mb-10">
                                        <div className="relative w-36 h-36 flex items-center justify-center bg-white rounded-full shadow-inner border-4 border-gray-50">
                                            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="46" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                                                <circle
                                                    cx="50" cy="50" r="46" fill="none"
                                                    stroke={selectedOrder.status === 'pending' ? '#FD6941' : selectedOrder.status === 'preparing' ? '#EAB308' : '#22C55E'}
                                                    strokeWidth="4"
                                                    strokeDasharray={`${(timers[selectedOrder._id] / 900) * 289} 289`}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000"
                                                />
                                            </svg>
                                            <div className="text-center z-10">
                                                <div className="text-4xl font-bold text-gray-900 leading-none">{formatTime(timers[selectedOrder._id] || 0)}</div>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Remaining</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                        <h3 className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-4">Order Items</h3>
                                        <div className="space-y-4">
                                            {(selectedOrder.items || []).map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-gray-400 border border-gray-100 shadow-sm">
                                                            {item.quantity}x
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-900 font-bold">{item.name}</p>
                                                            <p className="text-xs text-gray-400 font-medium">{currencySymbol}{item.price.toFixed(2)} / unit</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-gray-900 font-bold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-gray-900 rounded-[2rem] text-white mb-8 shadow-xl">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 opacity-60">Grand Total Amount</p>
                                            <p className="text-4xl font-bold leading-none">{currencySymbol}{(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                                            <Hash className="w-6 h-6 text-white opacity-40" />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            disabled={selectedOrder.status === 'ready'}
                                            onClick={() => {
                                                updateOrderStatus(selectedOrder._id, getNextStatus(selectedOrder.status));
                                                setSelectedOrder(null);
                                            }}
                                            className={`flex-1 ${getStatusButtonColor(selectedOrder.status)} text-white py-5 rounded-[1.8rem] transition-all text-lg font-bold shadow-lg hover:shadow-xl active:scale-[0.98] outline-none ${selectedOrder.status === 'ready' ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                                        >
                                            {getNextStatusLabel(selectedOrder.status)}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminOrders;
