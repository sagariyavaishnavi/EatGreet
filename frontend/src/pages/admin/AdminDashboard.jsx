import { Clock, Loader2, UtensilsCrossed } from 'lucide-react';
import PropTypes from 'prop-types';


const activeOrders = [
    {
        id: "#002",
        table: "001",
        waiter: "John Patel",
        time: "7:38 PM",
        guests: 6,
        status: "PREPARING",
        timer: "08:12",
        statusColor: "bg-orange-100 text-orange-600",
        timerColor: "border-orange-400 text-gray-800",
        items: [
            { name: "Margarita pizza", qty: 2, price: 199.00 },
            { name: "Paneer Tandoor pizza", qty: 1, price: 249.00 },
            { name: "cock", qty: 2, price: 20.00 }
        ],
        total: 687.00
    },
    {
        id: "#001",
        table: "001",
        waiter: "John Patel",
        time: "7:38 PM",
        guests: 6,
        status: "READY",
        timer: "12:09",
        statusColor: "bg-green-100 text-green-600",
        timerColor: "border-green-400 text-gray-800",
        items: [
            { name: "Margarita pizza", qty: 2, price: 199.00 },
            { name: "Paneer Tandoor pizza", qty: 1, price: 249.00 },
            { name: "cock", qty: 2, price: 20.00 }
        ],
        total: 687.00
    },
    {
        id: "#003",
        table: "001",
        waiter: "John Patel",
        time: "7:38 PM",
        guests: 6,
        status: "PENDING",
        timer: "03:33",
        statusColor: "bg-gray-100 text-gray-600",
        timerColor: "border-gray-300 text-gray-800",
        items: [
            { name: "Margarita pizza", qty: 2, price: 199.00 },
            { name: "Paneer Tandoor pizza", qty: 1, price: 249.00 },
            { name: "cock", qty: 2, price: 20.00 }
        ],
        total: 687.00
    }
];

// eslint-disable-next-line no-unused-vars
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

const AdminDashboard = () => {
    return (
        <div className="space-y-8">
             {/* Dashboard Main Title */}
             <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Welcome back, Admin</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Clock} value="122" title="Total Pending Orders" />
                <StatCard icon={Loader2} value="96" title="Preparing Orders" />
                <StatCard icon={UtensilsCrossed} value="96" title="Ready to serve" />
                
                {/* Special Card for Completed Orders */}
                <div className="bg-[#F3EFE0] p-6 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <p className="text-gray-700 font-medium">Today Orders Complete</p>
                        <p className="text-3xl font-bold text-gray-800">
                            70<span className="text-gray-400 text-xl font-normal">/136</span>
                        </p>
                    </div>
                    
                    {/* Progress Bar Simulation */}
                    <div className="relative h-12 mt-4">
                        <div className="flex justify-between text-xs text-gray-500 px-1 mb-1">
                            <span>0%</span>
                            <span>33%</span>
                            <span>60%</span>
                            <span>100%</span>
                        </div>
                        <div className="h-8 w-full bg-orange-100/50 rounded-full overflow-hidden flex">
                            <div className="w-1/3 h-full bg-gradient-to-r from-orange-300 to-orange-400 rounded-l-full"></div>
                            <div className="w-1/3 h-full bg-gradient-to-r from-orange-200 to-orange-300"></div>
                            <div className="w-1/3 h-full bg-orange-100/30 rounded-r-full"></div>
                        </div>
                        {/* Markers */}
                        <div className="absolute top-5 left-1/3 w-0.5 h-8 bg-gray-400/30"></div>
                        <div className="absolute top-5 left-2/3 w-0.5 h-8 bg-gray-400/30"></div>
                    </div>
                </div>
            </div>

            {/* Active Orders Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Active Order</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeOrders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">Order {order.id}</h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Table no. {order.table}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>{order.waiter}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>Time: {order.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>Guests: {order.guests}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.statusColor}`}>
                                        {order.status}
                                    </span>
                                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-bold ${order.timerColor}`}>
                                        {order.timer}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-xs text-gray-400 uppercase font-medium">
                                    <span>Order Item</span>
                                    <span>Amount</span>
                                </div>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty {item.qty}</p>
                                        </div>
                                        <span className="font-bold text-gray-800">₹{item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-6">
                                <span className="font-bold text-lg text-gray-800">Total Amount</span>
                                <span className="font-bold text-lg text-gray-800">₹{order.total.toFixed(2)}</span>
                            </div>

                            <div className="flex gap-3">
                                {order.status === 'PREPARING' && (
                                    <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition-colors">
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'READY' && (
                                    <button className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors">
                                        Mark Complete
                                    </button>
                                )}
                                {order.status === 'PENDING' && (
                                    <button className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
                                        Accept
                                    </button>
                                )}
                                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
