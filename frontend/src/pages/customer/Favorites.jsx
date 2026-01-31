import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Heart, Star, Clock, Flame, ChevronRight, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const CustomerFavorites = () => {
    const {
        favorites, toggleFavorite,
        cart, addToCart, removeFromCart,
        tenantName
    } = useOutletContext();

    const { user, currencySymbol: contextSymbol } = useSettings();
    const [fetchedSymbol, setFetchedSymbol] = React.useState('₹');

    // Use context symbol as primary for live preview if current user is the admin owner
    const activeSymbol = (user && user.role === 'admin' && user.restaurantName?.toLowerCase() === tenantName?.toLowerCase())
        ? contextSymbol
        : (fetchedSymbol || '₹');

    const currencyMap = {
        'USD': '$',
        'EUR': '€',
        'INR': '₹',
        'GBP': '£',
        'JPY': '¥',
        'AUD': 'A$',
        'CAD': 'C$'
    };

    React.useEffect(() => {
        const fetchCurrency = async () => {
            if (tenantName) {
                try {
                    const { restaurantAPI } = await import('../../utils/api');
                    const { data } = await restaurantAPI.getDetailsByTenant(tenantName);
                    if (data?.currency) {
                        setFetchedSymbol(currencyMap[data.currency] || '₹');
                    }
                } catch (error) {
                    console.error('Error fetching currency:', error);
                }
            }
        };
        fetchCurrency();
    }, [tenantName]);

    // Convert favorites object to array
    const favoriteItems = Object.values(favorites);

    return (
        <div className="bg-white min-h-[80vh]">
            <div className="mb-6 flex items-center gap-3">
                <Link to="../menu" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-black text-gray-800">Saved Items</h1>
                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {favoriteItems.length}
                </span>
            </div>

            {favoriteItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-10 h-10 text-red-500 fill-current" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Saved Items</h2>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Items you like will appear here for quick access.</p>
                    <Link to="../menu" className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                        Explore Menu
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteItems.map((item) => (
                        <div key={item._id || item.id} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative overflow-hidden">

                            {/* Simple Header without slider for fav view */}
                            <div className="relative h-48 rounded-[2rem] overflow-hidden mb-4 bg-gray-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />

                                {/* Like Button (to remove) */}
                                <button
                                    onClick={() => toggleFavorite(item)}
                                    className="absolute top-4 right-4 z-20 w-9 h-9 bg-red-50 text-red-500 backdrop-blur rounded-full flex items-center justify-center shadow-sm transition-all hover:bg-white"
                                >
                                    <Heart className="w-5 h-5 fill-current" />
                                </button>
                            </div>

                            <div className="px-2 pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-800 leading-tight mb-1">{item.name}</h3>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {item.rating}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Flame className="w-3 h-3 text-[#FD6941]" /> {item.calories}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xl font-black text-gray-800">{activeSymbol}{item.price}</span>
                                    </div>
                                </div>

                                {/* Add Button / Qty Control */}
                                <div className="flex items-center justify-center mt-4">
                                    {cart[item._id || item.id] ? (
                                        <div className="flex items-center gap-4 bg-black text-white px-2 py-2 rounded-full shadow-lg w-full max-w-[140px] justify-between">
                                            <button
                                                onClick={() => removeFromCart(item._id || item.id)}
                                                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-lg w-6 text-center">{cart[item._id || item.id].qty}</span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="w-8 h-8 rounded-full bg-[#FD6941] flex items-center justify-center hover:bg-orange-600 transition"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="w-full bg-black text-white py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all"
                                        >
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerFavorites;
