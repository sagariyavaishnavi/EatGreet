import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Check, Clock } from 'lucide-react';

export default function KitchenDashboard() {
    const { restaurantName } = useParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    // Fetch initial orders using Public API
    useEffect(() => {
        if (!restaurantName) return;

        const fetchOrders = async () => {
            try {
                const response = await orderAPI.getKitchenOrders(restaurantName);
                // Filter active: pending, preparing.
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
        
        // Join the specific restaurant room from URL param
        socket.emit('joinRestaurant', restaurantName);

        const handleOrderUpdate = (payload) => {
            const { action, data } = payload;
            if (!data) return;

            // Handle new orders
            if (action === 'create') {
                if (['pending', 'preparing'].includes(data.status)) {
                    setOrders(prev => {
                        if (prev.find(o => o._id === data._id)) return prev;
                        return [data, ...prev];
                    });
                    toast.success(`New Order #${data._id.slice(-4)}`);
                }
            } 
            // Handle updates
            else if (action === 'update') {
                setOrders(prev => {
                    // If status changed to non-active, remove it
                    if (!['pending', 'preparing'].includes(data.status)) {
                        return prev.filter(o => o._id !== data._id);
                    }
                    // Otherwise update 
                    return prev.map(o => o._id === data._id ? data : o);
                });
            }
        };

        socket.on('orderUpdated', handleOrderUpdate);

        return () => {
            socket.off('orderUpdated', handleOrderUpdate);
            // Optionally leave room? Socket usually handles disconnect.
        };
    }, [socket, restaurantName]);

    const handleStatusUpdate = async (orderId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'pending' ? 'preparing' : 'ready';
            await orderAPI.updateKitchenOrderStatus(restaurantName, orderId, newStatus);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading orders...</div>;

    return (
        <div className="w-full">
            <h1 className="text-3xl font-normal text-gray-800 mb-8 tracking-tight">Kitchen Dashboard</h1>
            
            <section>
                <h2 className="text-xl font-normal text-gray-800 mb-6">Active Order</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {orders.map((order) => (
                            <motion.div
                                key={order._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-3xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] min-h-[320px] flex flex-col relative group transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="font-bold text-lg text-gray-900 tracking-tight">Order #{order._id.slice(-3).toUpperCase()}</h3>
                                    {order.status === 'preparing' && (
                                        <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                                            <Clock size={12} strokeWidth={3} /> Cooking
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 w-full relative z-10">
                                    <div className="flex justify-between items-center text-xs text-gray-400 border-b border-gray-100 pb-3 mb-4 font-medium uppercase tracking-wider">
                                        <span>Order item</span>
                                        <span>Qty</span>
                                    </div>
                                    
                                    <ul className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-start text-[15px] text-gray-700 font-medium leading-relaxed">
                                                <span className="pr-4">{item.name || 'Unknown Item'}</span>
                                                <span className="font-bold text-gray-900">{item.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Interaction Area */}
                                <div className="mt-6 pt-2">
                                    <button 
                                        onClick={() => handleStatusUpdate(order._id, order.status)}
                                        className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-medium text-sm transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
                                    >
                                        {order.status === 'pending' ? 'Start Cooking' : 'Mark Ready'}
                                        <Check size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>


                    {orders.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center"
                        >
                            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Check size={24} />
                            </div>
                            <p className="text-gray-400 font-medium">All caught up! No active orders.</p>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
