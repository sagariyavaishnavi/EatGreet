import React from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Construction } from 'lucide-react';
import SuperAdminNavbar from '../../components/super-admin/SuperAdminNavbar';

export default function Users() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 backdrop-blur-sm p-12 rounded-[3.5rem] border border-white shadow-sm flex flex-col items-center text-center max-w-md"
            >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Construction className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">User Management Pending</h1>
                <p className="text-gray-500 font-medium leading-relaxed">
                    The User Management module is currently under development. This page will soon feature platform-wide user roles, permissions, and activity monitoring.
                </p>
                <div className="mt-8 px-6 py-2 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Coming Soon
                </div>
            </motion.div>
        </div>
    );
}
