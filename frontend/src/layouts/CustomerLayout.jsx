import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { restaurantAPI } from '../utils/api';
import DynamicNavbar from '../components/DynamicNavbar';

const CustomerLayout = () => {
    const location = useLocation();
    const { restaurantId, restaurantName, tableNo: paramTableNo } = useParams();

    // -- Shared State --
    const [cart, setCart] = useState({});
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('eatgreet_favorites');
        return saved ? JSON.parse(saved) : {};
    });
    const [tableNo, setTableNo] = useState(() => {
        // High priority: Params -> LocalStorage -> Default
        return paramTableNo || localStorage.getItem('eatgreet_table') || '4';
    });
    const [showBill, setShowBill] = useState(false);
    const [resolvedRestaurantId, setResolvedRestaurantId] = useState(restaurantId);
    const [tenantName, setTenantName] = useState(restaurantName || '');
    const [businessName, setBusinessName] = useState('');
    const [currency, setCurrency] = useState('INR');

    const [isResolving, setIsResolving] = useState(!!(restaurantName || restaurantId));
    const [resolveError, setResolveError] = useState(null);

    // Clear state when restaurant changes to prevent "Resto B menu in Resto A" issues
    useEffect(() => {
        setCart({});
        setResolvedRestaurantId(restaurantId);
        setTenantName(restaurantName || '');
        setResolveError(null);
    }, [restaurantName, restaurantId]);

    // Resolve Restaurant Name to ID if needed
    useEffect(() => {
        const fetchRestaurant = async () => {
            if (restaurantName) {
                // Immediate State Sync
                setTenantName(restaurantName);
                setIsResolving(true);
                setResolveError(null);
                setResolvedRestaurantId(null); // Clear ID to prevent stale item fetches
                setBusinessName('');

                try {
                    const { data } = await restaurantAPI.getBySlug(restaurantName);
                    if (data) {
                        setResolvedRestaurantId(data._id);
                        setBusinessName(data.name || '');
                        if (data.currency) setCurrency(data.currency);
                    } else {
                        setResolveError("Restaurant not found");
                    }
                } catch (error) {
                    console.error("Failed to find restaurant", error);
                    setResolveError("Invalid Restaurant Link");
                } finally {
                    setIsResolving(false);
                }
            } else if (restaurantId) {
                setIsResolving(true);
                setResolveError(null);
                try {
                    const { data } = await restaurantAPI.getPublicDetails(restaurantId);
                    if (data) {
                        setResolvedRestaurantId(data._id);
                        setTenantName(data.restaurantName || '');
                        setBusinessName(data.name || '');
                        if (data.currency) setCurrency(data.currency);
                    } else {
                        setResolveError("Restaurant not found");
                    }
                } catch (error) {
                    setResolveError("Invalid link");
                } finally {
                    setIsResolving(false);
                }
            }
        };
        fetchRestaurant();
    }, [restaurantName, restaurantId]);

    // Persist Favorites
    useEffect(() => {
        localStorage.setItem('eatgreet_favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Persist Table No
    useEffect(() => {
        if (paramTableNo) {
            setTableNo(paramTableNo);
        }
        localStorage.setItem('eatgreet_table', tableNo);
    }, [tableNo, paramTableNo]);

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
        if (restaurantName && paramTableNo) return `/${restaurantName}/table/${paramTableNo}`;
        return resolvedRestaurantId ? `/r/${resolvedRestaurantId}` : '/customer';
    };

    const baseUrl = getBaseUrl();

    return (
        <div className="min-h-screen bg-white pb-20 md:pb-0">
            {/* Loading/Error States */}
            {isResolving && (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD6941]"></div>
                </div>
            )}

            {resolveError && !isResolving && (
                <div className="flex flex-col items-center justify-center h-screen text-center p-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-500">{resolveError}</p>
                    <Link to="/" className="mt-4 text-[#FD6941] font-bold hover:underline">Go Home</Link>
                </div>
            )}

            {!isResolving && !resolveError && (
                <>
                    {/* Global Dynamic Navbar */}
                    <DynamicNavbar customerProps={{
                        cart,
                        favorites,
                        tableNo,
                        setShowBill,
                        totalItems,
                        baseUrl
                    }} />

                    {/* Content - key={tenantName} forces a clean remount when switching restaurants */}
                    <main key={tenantName} className="max-w-7xl mx-auto md:px-4 md:py-6">
                        <Outlet context={{
                            cart, addToCart, removeFromCart, clearCart,
                            favorites, toggleFavorite,
                            showBill, setShowBill,
                            tableNo, setTableNo,
                            restaurantId: resolvedRestaurantId,
                            tenantName: tenantName,
                            businessName: businessName,
                            currency: currency
                        }} />
                    </main>


                </>
            )}
        </div>
    );
};

export default CustomerLayout;
