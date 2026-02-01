import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Check, Clock, Utensils } from 'lucide-react';

export default function KitchenDashboard() {
    const { restaurantName } = useParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    // Fetch initial orders
    useEffect(() => {
        if (!restaurantName) return;

        const fetchOrders = async () => {
            try {
                const response = await orderAPI.getKitchenOrders(restaurantName);
                const active = response.data.filter(o => ['pending', 'preparing'].includes(o.status));
                setOrders(active);
            } catch (error) {
                console.error("Failed to fetch orders", error);
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [restaurantName]);

    // Socket Listener
    useEffect(() => {
        if (!socket || !restaurantName) return;
        socket.emit('joinRestaurant', restaurantName);

        const handleOrderUpdate = (payload) => {
            const { action, data } = payload;
            if (!data) return;

            if (action === 'create') {
                if (['pending', 'preparing'].includes(data.status)) {
                    setOrders(prev => {
                        if (prev.find(o => o._id === data._id)) return prev;
                        return [data, ...prev];
                    });
                    toast.success(`Order #${data._id.slice(-3).toUpperCase()} received!`);
                }
            }
            else if (action === 'update') {
                setOrders(prev => {
                    if (!['pending', 'preparing'].includes(data.status)) {
                        return prev.filter(o => o._id !== data._id);
                    }
                    return prev.map(o => o._id === data._id ? data : o);
                });
            }
        };

        socket.on('orderUpdated', handleOrderUpdate);
        return () => socket.off('orderUpdated', handleOrderUpdate);
    }, [socket, restaurantName]);

    const handleStatusUpdate = async (orderId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'pending' ? 'preparing' : 'ready';
            await orderAPI.updateKitchenOrderStatus(restaurantName, orderId, newStatus);
            toast.success(`Order updated to ${newStatus}`);
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Clock className="w-10 h-10 text-gray-200 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Getting kitchen ready...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto pb-6 sm:pb-12">
            <header className="mb-6 sm:mb-10 pl-2">
                <h1 className="text-[32px] sm:text-[44px] font-bold text-gray-900 tracking-tight leading-tight mb-1 sm:mb-2">Kitchen Dashboard</h1>
            </header>

            <div className="bg-white rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-12 shadow-sm border border-gray-100 min-h-[70vh] sm:min-h-[80vh]">
                <div className="mb-6 sm:mb-10 pl-1 sm:pl-2">
                    <h2 className="text-[22px] sm:text-[28px] font-bold text-gray-900 tracking-tight">Active Order</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {orders.map((order) => (
                            <motion.div
                                key={order._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#F8F8F8] rounded-[1.8rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col relative group overflow-hidden border border-transparent hover:border-gray-200 transition-all duration-300 min-h-[380px] sm:min-h-[420px]"
                            >
                                {/* Order ID Header */}
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Order #{order._id.slice(-3).toUpperCase()}</h3>
                                    <div className="h-[1px] bg-gray-200 mt-3 sm:mt-4 w-full opacity-60"></div>
                                </div>

                                {/* Items Table Area */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-5 px-1">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Order item</span>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Qty</span>
                                    </div>

                                    <ul className="space-y-5">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-start group/item px-1">
                                                <span className="text-[16px] font-bold text-gray-800 line-clamp-2 pr-4">{item.name}</span>
                                                <span className="text-[16px] font-bold text-gray-900 min-w-[24px] text-right">{item.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Cooking Instructions Divider & Section */}
                                <div className="mt-6 sm:mt-8">
                                    <div className="h-[1px] bg-gray-200 w-full opacity-60 mb-4 sm:mb-6"></div>
                                    <div className="px-1">
                                        <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2 sm:mb-3">Cooking Instruction</h4>
                                        <p className="text-[12px] sm:text-[13px] text-gray-500 leading-relaxed font-medium">
                                            {order.instruction || "No specific instructions provided."}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Pulse Badge (Always Visible when preparing) */}
                                {order.status === 'preparing' && (
                                    <div className="absolute top-8 right-8 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Cooking</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {orders.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-32">
                            <div className="w-24 h-24 bg-[#F8F8F8] rounded-full flex items-center justify-center mb-6 text-gray-300 shadow-inner">
                                <Check size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">No active orders</h3>
                            <p className="text-gray-400 font-medium">The kitchen is all caught up!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
