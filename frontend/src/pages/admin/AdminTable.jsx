import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { restaurantAPI } from '../../utils/api';

const AdminTable = () => {
    const [tables, setTables] = useState(() => {
        const saved = localStorage.getItem('admin_tables');
        let initialTables = saved ? JSON.parse(saved) : [1, 2, 3, 4, 5];
        // Ensure unique and sorted
        initialTables = [...new Set(initialTables.map(Number))].sort((a, b) => a - b);
        return initialTables;
    });

    const [restaurantName, setRestaurantName] = useState('');

    useEffect(() => {
        localStorage.setItem('admin_tables', JSON.stringify(tables));
        fetchRestaurantDetails();
    }, [tables]);

    const fetchRestaurantDetails = async () => {
        try {
            const { data } = await restaurantAPI.getDetails();
            // Use restaurant business name and fallback to owner name, sanitize for URL if needed
            // Currently assuming restaurantName is stored in user object properly
            setRestaurantName(data.name || 'restaurant');
        } catch (error) {
            console.error("Failed to fetch restaurant details", error);
        }
    };

    const addTable = () => {
        const numericTables = tables.map(Number);
        const nextTableNo = numericTables.length > 0 ? Math.max(...numericTables) + 1 : 1;

        // Ensure unique and sorted
        const newTables = [...new Set([...numericTables, nextTableNo])].sort((a, b) => a - b);
        setTables(newTables);
        toast.success(`Table ${nextTableNo} added`);
    };

    const removeTable = (table) => {
        setTables(tables.filter(t => t !== table));
        toast.success(`Table ${table} removed`);
    };

    const getTableUrl = (tableNo) => {
        // Sanitize restaurant name for URL safe string if it has spaces? 
        // For now assume user knows or simple replace. 
        // Ideally backend enforces slug. Let's do simple encoding or replacement.
        const slug = encodeURIComponent(restaurantName);
        return `${window.location.origin}/${slug}/table/${tableNo}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>

                <button
                    onClick={addTable}
                    className="bg-[#FD6941] text-white px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Table
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map(table => {
                    const url = getTableUrl(table);
                    return (
                        <div key={table} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-[#FD6941]/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#FD6941] font-bold text-xl">
                                    {table}
                                </div>
                                <button
                                    onClick={() => removeTable(table)}
                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 break-all text-xs text-gray-500 font-mono">
                                    {url}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(url)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        <Copy className="w-4 h-4" /> Copy Link
                                    </button>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {tables.length === 0 && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🪑</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No Tables Added</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                        Add tables to generate unique menu links for your customers.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminTable;
