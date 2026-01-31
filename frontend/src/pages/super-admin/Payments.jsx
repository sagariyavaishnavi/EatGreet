import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Download, Calendar } from 'lucide-react';
import { paymentAPI, statsAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

export default function Payments() {
    const { currencySymbol } = useSettings();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingAmount: 0,
        activeSubscriptions: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [paymentsRes, statsRes] = await Promise.all([
                    paymentAPI.getAll(),
                    statsAPI.getSuperAdminStats()
                ]);

                setTransactions(paymentsRes.data.transactions);
                setStats({
                    totalRevenue: paymentsRes.data.stats.totalRevenue,
                    pendingAmount: paymentsRes.data.stats.pendingAmount,
                    activeSubscriptions: statsRes.data.activeSubscriptions
                });
            } catch (error) {
                console.error("Failed to load payment data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="h-screen bg-[#F0F2F4] p-4 md:p-6 flex flex-col overflow-hidden">
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col space-y-6 min-h-0">
                {/* Header */}
                <div className="flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-3xl font-medium text-gray-900">Payments</h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">Track revenue and subscription payments.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Total Revenue</span>
                            <div className="p-2 bg-green-50 text-green-600 rounded-full"><DollarSign className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-3xl font-medium text-gray-900">{currencySymbol}{stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-green-600 text-xs font-medium mt-2 flex items-center gap-1">↑ 12.5% <span className="text-gray-400 font-normal">vs last month</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Pending</span>
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-full"><Calendar className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-3xl font-medium text-gray-900">{currencySymbol}{stats.pendingAmount.toLocaleString()}</h3>
                        <p className="text-orange-600 text-xs font-medium mt-2">Due this week</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 text-sm font-medium">Subscriptions</span>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><CreditCard className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-3xl font-medium text-gray-900">{stats.activeSubscriptions}</h3>
                        <p className="text-blue-600 text-xs font-medium mt-2 flex items-center gap-1">Active Accounts</p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-medium text-gray-800">Recent Transactions</h3>
                    </div>
                    <div className="overflow-y-auto no-scrollbar flex-1">
                        <table className="w-full">
                            <thead className="bg-white sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Restaurant</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-500">Loading transactions...</td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-500">No transactions found</td>
                                    </tr>
                                ) : (
                                    transactions.map((txn, idx) => (
                                        <motion.tr
                                            key={txn._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-medium text-gray-500">{txn.transactionId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900 text-sm">{txn.restaurant?.name || 'Unknown Restaurant'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-gray-500 font-medium">{formatDate(txn.date)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-4 rounded bg-gray-200"></div>
                                                    <span className="text-xs text-gray-600 font-medium">{txn.method}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-medium text-gray-900">{currencySymbol}{txn.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide border ${txn.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    txn.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
