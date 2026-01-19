import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Construction } from 'lucide-react';


export default function Reports() {
    return (
        <div className="h-screen bg-[#F0F2F4] p-4 md:p-6 flex flex-col overflow-hidden">


            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/60 backdrop-blur-sm p-12 rounded-[3.5rem] border border-white shadow-sm flex flex-col items-center text-center max-w-md"
                >
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <Construction className="w-12 h-12 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Reports Pending</h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        The Analytics & Reports module is currently under development. This page will soon feature deep-dive platform metrics and automated financial insights.
                    </p>
                    <div className="mt-8 px-6 py-2 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Coming Soon
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
