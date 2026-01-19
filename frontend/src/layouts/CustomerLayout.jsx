import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { User, Settings, ShoppingBag, UtensilsCrossed, Heart } from 'lucide-react';

const CustomerLayout = () => {
    const location = useLocation();
    const { restaurantId } = useParams();

    // -- Shared State --
    const [cart, setCart] = useState({});
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('eatgreet_favorites');
        return saved ? JSON.parse(saved) : {};
    });
    const [showBill, setShowBill] = useState(false);

    // Persist Favorites
    useEffect(() => {
        localStorage.setItem('eatgreet_favorites', JSON.stringify(favorites));
    }, [favorites]);

    // -- Handlers --
    const addToCart = (item) => {
        setCart(prev => ({
            ...prev,
            [item.id]: {
                ...item,
                qty: (prev[item.id]?.qty || 0) + 1
            }
        }));
    };

    const removeFromCart = (itemId) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId]?.qty > 1) {
                newCart[itemId].qty -= 1;
            } else {
                delete newCart[itemId];
            }
            return newCart;
        });
    };

    const clearCart = () => setCart({});

    const toggleFavorite = (item) => {
        setFavorites(prev => {
            const newFavs = { ...prev };
            if (newFavs[item.id]) {
                delete newFavs[item.id];
            } else {
                newFavs[item.id] = item;
            }
            return newFavs;
        });
    };

    const totalItems = Object.values(cart).reduce((acc, item) => acc + item.qty, 0);

    const getBaseUrl = () => {
        return restaurantId ? `/r/${restaurantId}` : '/customer';
    };

    const baseUrl = getBaseUrl();

    return (
        <div className="min-h-screen bg-white pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to={`${baseUrl}/menu`} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                            <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800">EatGreet</h1>
                    </Link>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden md:flex items-center gap-1 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                            Table #4
                        </div>

                        <Link to={`${baseUrl}/profile`} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group">
                            <User className="w-5 h-5 text-gray-600 group-hover:text-black" />
                        </Link>

                        <Link to={`${baseUrl}/favorites`} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group">
                            <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
                        </Link>

                        {!restaurantId && (
                            <Link to={`${baseUrl}/settings`} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group">
                                <Settings className="w-5 h-5 text-gray-600 group-hover:text-black" />
                            </Link>
                        )}

                        <button onClick={() => setShowBill(true)} className="relative p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                            <ShoppingBag className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border border-white">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <Outlet context={{
                    cart, addToCart, removeFromCart, clearCart,
                    favorites, toggleFavorite,
                    showBill, setShowBill
                }} />
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
                <Link to={`${baseUrl}/menu`} className={`flex flex-col items-center gap-1 ${location.pathname.includes('menu') || location.pathname === baseUrl ? 'text-black' : 'text-gray-400'}`}>
                    <UtensilsCrossed className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Menu</span>
                </Link>
                <Link to={`${baseUrl}/profile`} className={`flex flex-col items-center gap-1 ${location.pathname.includes('profile') ? 'text-black' : 'text-gray-400'}`}>
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Profile</span>
                </Link>
                <Link to={`${baseUrl}/favorites`} className={`flex flex-col items-center gap-1 ${location.pathname.includes('favorites') ? 'text-black' : 'text-gray-400'}`}>
                    <Heart className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Saved</span>
                </Link>
                {!restaurantId && (
                    <Link to={`${baseUrl}/settings`} className={`flex flex-col items-center gap-1 ${location.pathname.includes('settings') ? 'text-black' : 'text-gray-400'}`}>
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Settings</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default CustomerLayout;
