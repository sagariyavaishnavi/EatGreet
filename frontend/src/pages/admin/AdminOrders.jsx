import { Clock, Loader2, UtensilsCrossed } from 'lucide-react';
import PropTypes from 'prop-types';
import clockIcon from '../../assets/clock.svg';
import chefHatIcon from '../../assets/Chef-Toque-Hat--Streamline-Flex.svg';
import bellIcon from '../../assets/Bell--Streamline-Flex.svg';
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

    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));

    // Calculate completion percentage
    const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Dashboard Main Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
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
                        <span className="text-4xl font-bold text-gray-900">{stats.pending}</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Total Pending Orders</p>
                </div>

                {/* Preparing Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={chefHatIcon} alt="Preparing" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl font-bold text-gray-900">{stats.preparing}</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Preparing Orders</p>
                </div>

                {/* Ready Orders */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center h-40 relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={bellIcon} alt="Ready" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-4xl font-bold text-gray-900">{stats.ready}</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium pl-1">Ready to serve</p>
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
                                className={`h-full rounded-full transition-all duration-1000 ease-out bg-green-500`}
                                style={{ width: `${completionPercentage}%` }}
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
                        {activeOrders.map(order => (
                            <div key={order._id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100">
                                        <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Order #{order._id.slice(-4)}</h4>
                                        <p className="text-sm text-gray-500">{order.items.length} Items • <span className="capitalize">{order.tableNumber ? `Table #${order.tableNumber}` : 'Takeaway'}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold">₹{order.totalAmount}</span>
                                    <span className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase">{order.status}</span>
                                </div>
                            </div>
                        ))}
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
        </div>
    );
};

export default AdminOrders;
