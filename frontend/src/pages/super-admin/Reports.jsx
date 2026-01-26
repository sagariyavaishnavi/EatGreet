import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, BarChart, PieChart } from 'lucide-react';

const REPORTS = [
    { title: "Monthly Revenue Report", type: "Financial", date: "Jan 2024", size: "2.4 MB" },
    { title: "User Growth Analysis", type: "Analytics", date: "Q4 2023", size: "1.8 MB" },
    { title: "Restaurant Performance", type: "Operational", date: "Dec 2023", size: "5.1 MB" },
    { title: "Subscription Renewal Forecast", type: "Financial", date: "2024", size: "850 KB" },
    { title: "Platform Usage Metrics", type: "Analytics", date: "Jan 2024", size: "3.2 MB" },
    { title: "Support Ticket Summary", type: "Operational", date: "Last 30 Days", size: "1.1 MB" },
];

export default function Reports() {
    return (
        <div className="h-screen bg-[#F0F2F4] p-4 md:p-6 flex flex-col overflow-hidden">
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col space-y-6 min-h-0">
                {/* Header */}
                <div className="flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">Download and view platform insights.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50">
                            <Calendar className="w-4 h-4" />
                            Select Date
                        </button>
                    </div>
                </div>

                {/* Report Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-200">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold">Financials</h3>
                        <p className="opacity-80 text-sm mt-1">Revenue, Taxes, Payouts</p>
                        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                            <span className="text-xs font-bold">12 Reports available</span>
                            <button className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center hover:scale-110 transition-transform"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-[2rem] text-white shadow-lg shadow-gray-200">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                            <PieChart className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold">Analytics</h3>
                        <p className="opacity-80 text-sm mt-1">User behavior, Traffic</p>
                        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                            <span className="text-xs font-bold">8 Reports available</span>
                            <button className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-6 rounded-[2rem] text-white shadow-lg shadow-orange-200">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                            <BarChart className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold">Operational</h3>
                        <p className="opacity-80 text-sm mt-1">System health, performance</p>
                        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                            <span className="text-xs font-bold">5 Reports available</span>
                            <button className="w-8 h-8 rounded-full bg-white text-pink-500 flex items-center justify-center hover:scale-110 transition-transform"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Available Reports List */}
                <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Generated Reports</h3>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"><Filter className="w-4 h-4" /></button>
                    </div>
                    <div className="overflow-y-auto no-scrollbar flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {REPORTS.map((report, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-4 rounded-[1.5rem] border border-gray-100 hover:shadow-md transition-all flex items-start gap-4 group cursor-pointer"
                            >
                                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors text-gray-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm mb-1">{report.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{report.type} • {report.date}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold">{report.size}</span>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-300 hover:text-blue-500 transition-colors">
                                    <Download className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
