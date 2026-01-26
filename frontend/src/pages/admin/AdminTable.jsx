import { useState } from 'react';

const AdminTable = () => {
    // This is a placeholder for the Table management page.
    // For now, it will look like a blank workable page waiting for content.
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>
                <button className="bg-[#FD6941] text-white px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-orange-600 transition-colors">
                    Add Table
                </button>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🪑</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No Tables Added</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                    Manage your restaurant tables, QR codes, and seating arrangements here.
                </p>
            </div>
        </div>
    );
};

export default AdminTable;
