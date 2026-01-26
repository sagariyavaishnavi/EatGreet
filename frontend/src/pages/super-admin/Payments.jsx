import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Download, Calendar } from 'lucide-react';

const MOCK_TRANSACTIONS = [
    { id: "TXN10239", restaurant: "Pizza Heaven", amount: "₹4,500", date: "Jan 24, 2024", status: "Completed", method: "Razorpay" },
    { id: "TXN10240", restaurant: "Burger King", amount: "₹2,100", date: "Jan 24, 2024", status: "Pending", method: "UPI" },
    { id: "TXN10241", restaurant: "Subway Outlet", amount: "₹1,850", date: "Jan 23, 2024", status: "Completed", method: "Card" },
    { id: "TXN10242", restaurant: "Taco Bell", amount: "₹3,200", date: "Jan 23, 2024", status: "Failed", method: "NetBanking" },
    { id: "TXN10243", restaurant: "KFC Downtown", amount: "₹5,600", date: "Jan 22, 2024", status: "Completed", method: "Razorpay" },
];

export default function Payments() {
    return (
        <div className="h-screen bg-[#F0F2F4] p-4 md:p-6 flex flex-col overflow-hidden">
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col space-y-6 min-h-0">
                {/* Header */}
                <div className="flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">Track revenue and subscription payments.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-bold shadow-lg hover:bg-gray-800 transition-colors">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-bold">Total Revenue</span>
                            <div className="p-2 bg-green-50 text-green-600 rounded-full"><DollarSign className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900">₹8.4M</h3>
                        <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1">↑ 12.5% <span className="text-gray-400 font-medium">vs last month</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-bold">Pending</span>
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-full"><Calendar className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900">₹42K</h3>
                        <p className="text-orange-600 text-xs font-bold mt-2">Due this week</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-bold">Subscriptions</span>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><CreditCard className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900">856</h3>
                        <p className="text-blue-600 text-xs font-bold mt-2 flex items-center gap-1">↑ 5 new <span className="text-gray-400 font-medium">today</span></p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                    </div>
                    <div className="overflow-y-auto no-scrollbar flex-1">
                        <table className="w-full">
                            <thead className="bg-white sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Restaurant</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {MOCK_TRANSACTIONS.map((txn, idx) => (
                                    <motion.tr
                                        key={txn.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-gray-500">{txn.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 text-sm">{txn.restaurant}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 font-medium">{txn.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-4 rounded bg-gray-200"></div>
                                                <span className="text-xs text-gray-600 font-bold">{txn.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-gray-900">{txn.amount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${txn.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    txn.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
