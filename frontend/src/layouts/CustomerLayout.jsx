import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { ShoppingBag, Heart, UtensilsCrossed } from 'lucide-react';
import logo from '../assets/logo-full.png';

const CustomerLayout = () => {
    const location = useLocation();
    const { restaurantId } = useParams();

    // -- Shared State --
    const [cart, setCart] = useState({});
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('eatgreet_favorites');
        return saved ? JSON.parse(saved) : {};
    });
    const [tableNo, setTableNo] = useState(() => localStorage.getItem('eatgreet_table') || '4');
    const [showBill, setShowBill] = useState(false);

    // Persist Favorites
    useEffect(() => {
        localStorage.setItem('eatgreet_favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Persist Table No
    useEffect(() => {
        localStorage.setItem('eatgreet_table', tableNo);
    }, [tableNo]);

    // -- Handlers --
    const addToCart = (item) => {
        const itemId = item._id || item.id;
        setCart(prev => ({
            ...prev,
            [itemId]: {
                ...item,
                qty: (prev[itemId]?.qty || 0) + 1
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
        const itemId = item._id || item.id;
        setFavorites(prev => {
            const newFavs = { ...prev };
            if (newFavs[itemId]) {
                delete newFavs[itemId];
            } else {
                newFavs[itemId] = item;
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
                        <img src={logo} alt="EatGreet" className="h-8 w-auto object-contain" />
                    </Link>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden md:flex items-center gap-1 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                            Table #{tableNo}
                        </div>

                        <Link to={`${baseUrl}/favorites`} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group">
                            <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
                        </Link>

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
                    showBill, setShowBill,
                    tableNo, setTableNo,
                    restaurantId
                }} />
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 justify-around">
                <Link to={`${baseUrl}/menu`} className={`flex flex-col items-center gap-1 ${location.pathname.includes('menu') || location.pathname === baseUrl ? 'text-black' : 'text-gray-400'}`}>
                    <UtensilsCrossed className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Menu</span>
                </Link>
                <Link to={`${baseUrl}/favorites`} className={`flex flex-col items-center gap-1 ${location.pathname.includes('favorites') ? 'text-black' : 'text-gray-400'}`}>
                    <Heart className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Saved</span>
                </Link>
            </div>
        </div>
    );
};

export default CustomerLayout;
