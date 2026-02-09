import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { MENU_ITEMS_KEY, CATEGORIES_KEY } from '../../constants';
import {
    Search, Heart, Plus, Minus, ShoppingBag,
    ChevronRight, Star, Clock, Flame, UtensilsCrossed, X, Box, SlidersHorizontal
} from 'lucide-react';
import MediaSlider from '../../components/MediaSlider';
import sugarFreeIcon from '../../assets/suger-free.svg';
import jainIcon from '../../assets/jain.svg';
import spicyIcon from '../../assets/red-chilli.svg';
import seafoodIcon from '../../assets/seafood.svg';
import lowCalIcon from '../../assets/LOW-KCAL.svg';
import glutenFreeIcon from '../../assets/Wheat-Off--Streamline-Lucide.svg';
import eggIcon from '../../assets/Egg--Streamline-Rounded-Material-Symbols.svg';
import veganIcon from '../../assets/Plant-Thin--Streamline-Phosphor-Thin.svg';
import dairyIcon from '../../assets/Water-Bottle-Glass--Streamline-Ultimate.svg';
import ketoIcon from '../../assets/Pear--Streamline-Atlas.svg';
import vegIcon from '../../assets/veg.svg';
import nonVegIcon from '../../assets/non-veg.svg';
import arVideo from '../../assets/AR_Menu_Experience_Video_Generation.mp4';
import { useSocket } from '../../context/SocketContext';

const dietaryIcons = {
    'Sugar-Free': sugarFreeIcon,
    'Jain': jainIcon,
    'Spicy': spicyIcon,
    'Seafood': seafoodIcon,
    'Low-Calorie': lowCalIcon,
    'Gluten-Free': glutenFreeIcon,
    'Egg': eggIcon,
    'Vegan': veganIcon,
    'Dairy': dairyIcon,
    'Keto': ketoIcon,
    'Vegetarian': veganIcon,
    'Non-Vegetarian': seafoodIcon,
};

const orangeFilter = "brightness-0 saturate-100 invert(55%) sepia(85%) saturate(1600%) hue-rotate(335deg) brightness(101%) contrast(98%)";

const offers = [
    { id: 1, type: 'video', src: arVideo, bg: "bg-orange-600" },
    { id: 2, title: "50% OFF", subtitle: "On your first order", code: "WELCOME50", bg: "bg-gray-700", text: "text-white" },
    { id: 3, title: "FREE FRIES", subtitle: "Orders above 299", code: "FREEMEAL", bg: "bg-[#FD6941]", text: "text-white" },
];

const currencyMap = {
    'USD': '$',
    'EUR': '€',
    'INR': '₹',
    'GBP': '£',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$'
};

import { menuAPI, categoryAPI, orderAPI } from '../../utils/api';
import toast from 'react-hot-toast';

import { useSettings } from '../../context/SettingsContext';

const Menu = () => {
    const { user, currencySymbol: contextSymbol } = useSettings();
    const {
        cart, addToCart, removeFromCart, clearCart,
        favorites, toggleFavorite,
        showBill, setShowBill,
        tableNo, setTableNo,
        restaurantId,
        tenantName,
        currency
    } = useOutletContext();

    // Use context symbol as primary for live preview if current user is the admin owner
    const activeSymbol = (user && user.role === 'admin' && user.restaurantName?.toLowerCase() === tenantName?.toLowerCase())
        ? contextSymbol
        : (currencyMap[currency] || '₹');

    const isPreviewMode = tableNo === 'preview';

    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || "All";
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    // Update selected category if URL params change
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
    }, [searchParams]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(["All"]);

    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        phone: "",
        tableNo: tableNo,
        notes: ""
    });

    const [showFullForm, setShowFullForm] = useState(true);

    const [isTableOccupied, setIsTableOccupied] = useState(false);
    const [occupantInfo, setOccupantInfo] = useState(null);
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [verificationPhone, setVerificationPhone] = useState("");

    const socket = useSocket();

    useEffect(() => {
        if (tenantName) {
            fetchData();
        }
    }, [restaurantId, tenantName]);

    // Check Table Occupancy
    const checkStatus = React.useCallback(async () => {
        if (tenantName && tableNo && tableNo !== 'preview') {
            try {
                const res = await orderAPI.checkTableStatus(tableNo, tenantName);
                if (res.data.status === 'occupied') {
                    if (!customerDetails.phone || customerDetails.phone !== res.data.customer.phone) {
                        setIsTableOccupied(true);
                        setOccupantInfo(res.data.customer);
                    } else {
                        setIsTableOccupied(false);
                    }
                } else {
                    setIsTableOccupied(false);
                }
            } catch (e) {
                console.error("Occupancy Check Failed", e);
            }
        }
    }, [tenantName, tableNo, customerDetails.phone]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    // Socket Listener for Real-Time Menu & Category Updates
    useEffect(() => {
        if (!socket || !tenantName) return;

        socket.emit('joinRestaurant', tenantName);

        const handleMenuUpdate = () => {
            console.log("Real-time menu update received");
            fetchData();
        };

        const handleCategoryUpdate = () => {
            console.log("Real-time category update received");
            fetchData();
        };

        socket.on('menuUpdated', handleMenuUpdate);
        socket.on('categoryUpdated', handleCategoryUpdate);

        const handleOrderUpdate = (payload) => {
            if (payload.data && String(payload.data.tableNumber) === String(tableNo)) {
                console.log("Real-time occupancy update triggered");
                checkStatus();
            }
        };
        socket.on('orderUpdated', handleOrderUpdate);

        return () => {
            socket.off('menuUpdated', handleMenuUpdate);
            socket.off('categoryUpdated', handleCategoryUpdate);
            socket.off('orderUpdated', handleOrderUpdate);
        };
    }, [socket, tenantName, tableNo, checkStatus]);

    const fetchData = async () => {
        try {
            const params = {
                restaurantName: tenantName,
                restaurantId
            };
            const [menuRes, catRes] = await Promise.all([
                menuAPI.getAll(params),
                categoryAPI.getAll(params)
            ]);
            setMenuItems(menuRes.data || []);
            setCategories(["All", ...(catRes.data || []).map(c => c.name)]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        setCustomerDetails(prev => ({ ...prev, tableNo }));
    }, [tableNo]);

    // Body Scroll Lock for Modals
    useEffect(() => {
        if (showBill || selectedItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showBill, selectedItem]);

    // Update persistence when name/phone changes
    // Persistence disabled to force new entry every time

    const sliderRef = useRef(null);
    const videoRefs = useRef([]);
    const isVideoPlayingRef = useRef(false);
    const isInteractingRef = useRef(false);
    const interactionTimeoutRef = useRef(null);

    // Use only the 3 offers without duplication
    const extendedOffers = offers.map(offer => ({
        ...offer,
        uniqueId: `${offer.id}`
    }));

    // Interaction Handlers
    const handleInteractionStart = () => {
        isInteractingRef.current = true;
        if (interactionTimeoutRef.current) {
            clearTimeout(interactionTimeoutRef.current);
        }
    };

    const handleInteractionEnd = () => {
        if (interactionTimeoutRef.current) {
            clearTimeout(interactionTimeoutRef.current);
        }
        // Resume after 5 seconds of no interaction
        interactionTimeoutRef.current = setTimeout(() => {
            isInteractingRef.current = false;
        }, 5000);
    };

    // Auto-swipe offers
    useEffect(() => {
        const interval = setInterval(() => {
            if (isVideoPlayingRef.current || isInteractingRef.current) return;

            if (sliderRef.current) {
                const { clientWidth, scrollLeft, scrollWidth } = sliderRef.current;

                // For 3 items, if we are at the last one, go back to start
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    sliderRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
                }
            }
        }, 7000);
        return () => {
            clearInterval(interval);
            if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
        };
    }, []);

    // Play video when in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target;
                    if (entry.isIntersecting) {
                        if (video && video.paused) {
                            video.currentTime = 0;
                            video.play().catch(e => console.log("Autoplay prevented", e));
                        }
                    } else {
                        if (video && !video.paused) {
                            video.pause();
                        }
                    }
                });
            },
            { threshold: 0.6 }
        );

        videoRefs.current.forEach(video => {
            if (video) observer.observe(video);
        });

        return () => {
            observer.disconnect();
        };
    }, [extendedOffers]); // Re-run if offers change

    const handleVideoEnd = () => {
        if (sliderRef.current) {
            const { clientWidth } = sliderRef.current;
            sliderRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (Object.keys(cart).length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // STRICT VALIDATION: Name and Phone are compulsory for QR orders
        if (!customerDetails.name || !customerDetails.name.trim()) {
            toast.error("Please enter your full name");
            setShowFullForm(true); // Ensure form is visible
            return;
        }
        if (!customerDetails.phone || !customerDetails.phone.trim() || customerDetails.phone.length < 10) {
            toast.error("Please enter a valid phone number");
            setShowFullForm(true);
            return;
        }

        const orderData = {
            restaurantId, // The _id for reference
            restaurantName: tenantName, // Required for tenant resolution on backend
            customerInfo: {
                name: customerDetails.name,
                phone: customerDetails.phone,
                id: user?._id || null
            },
            tableNumber: customerDetails.tableNo,
            items: Object.values(cart).map(item => ({
                menuItem: item._id,
                name: item.name,
                quantity: item.qty,
                price: item.price
            })),
            totalAmount: grandTotal,
            instruction: customerDetails.notes
        };

        const loadToast = toast.loading('Placing your order...');
        try {
            await orderAPI.create(orderData, tenantName);
            toast.success('Order placed successfully!', { id: loadToast });
            setOrderPlaced(true);

            setTimeout(() => {
                setOrderPlaced(false);
                setShowBill(false);
                clearCart();
                setCustomerDetails(prev => ({
                    ...prev,
                    notes: ""
                }));
            }, 3000);
        } catch (error) {
            console.error('Order Error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order', { id: loadToast });
        }
    };

    const totalItems = Object.values(cart).reduce((acc, item) => acc + item.qty, 0);
    const subTotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = Math.round(subTotal * 0.05); // 5% Tax
    const grandTotal = subTotal + tax;

    // Use fetched items
    const itemsToDisplay = menuItems;

    const filteredItems = itemsToDisplay.filter(item => {
        const itemCategory = typeof item.category === 'object' ? item.category?.name : item.category;
        const matchesCategory = selectedCategory === "All" || (itemCategory && itemCategory.toUpperCase() === selectedCategory.toUpperCase());
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    }).map(item => ({
        ...item,
        time: item.time || "15-20 min",
        calories: item.calories || "450 kcal",
        isVeg: item.isVeg !== undefined ? item.isVeg : true
    }));

    return (
        <div className="bg-gray-50 min-h-screen pb-32 md:pb-0">
            {/* Daily Offers Slider */}
            <div
                ref={sliderRef}
                onTouchStart={handleInteractionStart}
                onTouchEnd={handleInteractionEnd}
                onMouseDown={handleInteractionStart}
                onMouseUp={handleInteractionEnd}
                onMouseEnter={handleInteractionStart}
                onMouseLeave={handleInteractionEnd}
                className="mt-4 md:mt-6 px-2 md:px-4 overflow-x-auto no-scrollbar flex gap-2 md:gap-4 snap-x snap-mandatory w-full touch-pan-x overscroll-x-contain cursor-grab active:cursor-grabbing"
            >
                {extendedOffers.map((offer, index) => (
                    <div key={offer.uniqueId} className={`snap-center shrink-0 w-full md:w-[350px] h-44 md:h-48 rounded-[2rem] flex flex-col justify-center relative shadow-lg overflow-hidden ${offer.bg} ${!offer.type ? 'p-5 md:p-6' : ''}`}>
                        {offer.type === 'video' ? (
                            <video
                                ref={el => videoRefs.current[index] = el}
                                src={offer.src}
                                className="w-full h-full object-cover rounded-[2rem]"
                                muted
                                autoPlay
                                playsInline
                                onPlay={() => isVideoPlayingRef.current = true}
                                onPause={() => isVideoPlayingRef.current = false}
                                onEnded={() => {
                                    isVideoPlayingRef.current = false;
                                    handleVideoEnd();
                                }}
                            />
                        ) : (
                            <>
                                <div className="relative z-10 block">
                                    <span className={`text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full mb-2 md:mb-3 inline-block ${offer.text === 'text-white' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>LIMITED TIME</span>
                                    <h3 className={`text-2xl md:text-3xl ${offer.text} leading-none mb-1`}>{offer.title}</h3>
                                    <p className={`text-xs md:text-sm ${offer.text} opacity-80 mb-2 md:mb-3`}>{offer.subtitle}</p>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-white/20 backdrop-blur-md px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs text-white border border-white/30 tracking-wider border-dashed">{offer.code}</code>
                                    </div>
                                </div>
                                {/* Decorative Circles */}
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl"></div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Search Bar */}
            <div className="px-4 py-4 flex gap-3 sticky top-[48px] z-30 bg-gray-50">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search for food..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD6941] focus:bg-white transition-all shadow-sm"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                </div>
                <button
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className={`p-3 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm aspect-square ${showCategoryFilter ? 'bg-[#FD6941] text-white' : 'bg-white text-gray-600'}`}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Categories Navigation */}
            {showCategoryFilter && (
                <div className="sticky top-[120px] md:top-0 z-20 bg-gray-50 pt-2 pb-4 px-4 overflow-x-auto no-scrollbar flex gap-3 animate-fade-in-down">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm transition-all shadow-sm ${selectedCategory === cat
                                ? 'bg-[#FD6941] text-white shadow-md transform scale-105'
                                : 'bg-white text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Menu Grid */}
            <div className="px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => setSelectedItem(item)}
                            className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative overflow-hidden flex flex-row md:flex-col gap-3 md:gap-0 h-40 md:h-auto cursor-pointer"
                        >

                            {/* Card Header / Image Slider */}
                            <div className="relative w-32 md:w-full h-full md:h-64 shrink-0 rounded-2xl md:rounded-[2rem] overflow-hidden md:mb-4 bg-gray-100">

                                {/* Veg/Non-Veg Symbol on Image - REMOVED */}{/* 
                                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 w-4 h-4 md:w-5 md:h-5 bg-white/90 backdrop-blur rounded-md shadow-sm p-0.5">
                                    <img
                                        src={item.isVeg ? vegIcon : nonVegIcon}
                                        alt={item.isVeg ? "Veg" : "Non-Veg"}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                */}


                                {/* AR Icon if Model Exists */}




                                {/* Media Slider if available, else Image */}
                                <MediaSlider
                                    media={[...(item.models || []), ...(item.media || []), { url: item.image, type: 'image' }]}
                                    className="w-full h-full object-cover"
                                    modelCheckId={`model-${item._id}`}
                                />

                                {/* Available Tag - Mobile: Top Left Dot, Desktop: Top Left Pill */}
                                {!item.isAvailable && (
                                    <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
                                        <div className="md:hidden w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm"></div>
                                        <div className="hidden md:flex bg-red-500/95 backdrop-blur-md text-white border border-red-400/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider items-center gap-1.5 shadow-lg">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                            Sold Out
                                        </div>
                                    </div>
                                )}
                                {/* AR Icon for Photo Corner */}
                                {item.models && item.models.length > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const viewer = document.getElementById(`model-${item._id}`);
                                            if (viewer) viewer.activateAR();
                                        }}
                                        disabled={isPreviewMode}
                                        className={`absolute top-2 right-2 md:top-4 md:right-4 z-10 w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all shadow-lg border bg-white border-white/50 text-blue-600 hover:bg-gray-50 ${isPreviewMode ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                        title="View in AR"
                                    >
                                        <Box className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col md:block justify-between md:px-2 md:pb-2 overflow-hidden relative">
                                <div className="flex justify-between items-start mb-1 md:mb-2 gap-2 md:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base md:text-xl text-gray-800 leading-tight font-semibold inline align-middle">
                                            {item.name}
                                        </h3>
                                        {item.labels && item.labels.length > 0 && (
                                            <span className="inline-flex items-center gap-1 ml-1.5 align-middle">
                                                {item.labels.map(label => dietaryIcons[label] && (
                                                    <img
                                                        key={label}
                                                        src={dietaryIcons[label]}
                                                        alt={label}
                                                        title={label}
                                                        className="w-3.5 h-3.5"
                                                        style={!['Spicy', 'Vegan'].includes(label) ? { filter: orangeFilter } : {}}
                                                    />
                                                ))}
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating & Price (Desktop) - Top Right Corner */}
                                    <div className="shrink-0 flex flex-col items-end gap-1">
                                        {/* Price - Top Right (Mobile & Desktop) */}
                                        <span className="text-lg md:text-xl font-bold text-gray-900 block">
                                            {activeSymbol}{item.price}
                                        </span>

                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1 md:gap-y-2 text-[10px] md:text-xs text-gray-500">
                                    {/* Veg/Non-Veg Icon */}
                                    <img
                                        src={item.isVeg ? vegIcon : nonVegIcon}
                                        alt={item.isVeg ? "Veg" : "Non-Veg"}
                                        className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0"
                                    />

                                    {/* Time */}
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {item.time}
                                    </span>

                                    {/* Calories */}
                                    <span className="flex items-center gap-1">
                                        <Flame className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#FD6941]" /> {item.calories}
                                    </span>

                                    {/* Rating - Desktop Only (Green, End of Row) */}
                                    <span className="hidden md:flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md font-medium text-xs">
                                        <Star className="w-3 h-3 fill-current" /> {item.rating || '4.5'}
                                    </span>

                                </div>

                                <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-2 md:h-10 overflow-hidden md:mb-6 text-balance hidden md:block">
                                    {item.description}
                                </p>
                                {/* Mobile-only description (shorter) */}
                                < p className="text-xs text-gray-400 line-clamp-2 mb-2 md:hidden" >
                                    {item.description}
                                </p>

                                {/* Add Button / Qty Control / Price (Mobile) */}
                                <div className="flex items-center justify-between md:justify-center mt-auto">
                                    {/* Mobile: Rating (Default) OR Like (In Cart) */}
                                    <div className="flex md:hidden items-center">
                                        {cart[item._id] ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(item);
                                                }}
                                                disabled={isPreviewMode}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm border ${favorites[item._id]
                                                    ? 'bg-red-50 border-red-100 text-red-500/90'
                                                    : 'bg-white border-gray-200 text-gray-400'
                                                    } ${isPreviewMode ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                            >
                                                <Heart className={`w-4 h-4 transition-transform duration-300 ${favorites[item._id] ? 'fill-current scale-110' : ''}`} />
                                            </button>
                                        ) : (
                                            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md font-medium text-[10px]">
                                                <Star className="w-2.5 h-2.5 fill-current" /> {item.rating || '4.5'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 justify-end">
                                        {/* Desktop Like Button OR Mobile Like (only if NOT in cart) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(item);
                                            }}
                                            disabled={isPreviewMode}
                                            className={`${cart[item._id] ? 'hidden md:flex' : 'flex'} w-8 h-8 md:w-14 md:h-14 rounded-full items-center justify-center transition-all shadow-sm border ${favorites[item._id]
                                                ? 'bg-red-50 border-red-100 text-red-500'
                                                : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:bg-gray-50'
                                                } ${isPreviewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Heart className={`w-4 h-4 md:w-7 md:h-7 transition-transform duration-300 ${favorites[item._id] ? 'fill-current scale-110' : ''}`} />
                                        </button>



                                        {item.isAvailable ? (
                                            cart[item._id] ? (
                                                <div className="flex items-center justify-center gap-1 bg-white/40 backdrop-blur-md border border-[#FFE4DE]/30 text-gray-900 px-0.5 h-7 md:h-12 rounded-full shadow-sm w-auto shrink-0 transition-all">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFromCart(item._id);
                                                        }}
                                                        className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-white border border-[#FFE4DE]/20 text-gray-400 flex items-center justify-center hover:bg-gray-50 transition-all shrink-0"
                                                    >
                                                        <Minus className="w-2.5 h-2.5 md:w-5 md:h-5" />
                                                    </button>
                                                    <span className="text-xs md:text-lg min-w-[1.2rem] text-center font-bold text-[#FD6941] px-0.5">{cart[item._id].qty}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart(item);
                                                        }}
                                                        className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-[#FD6941] text-white flex items-center justify-center hover:bg-orange-600 transition-all shrink-0 shadow-sm"
                                                    >
                                                        <Plus className="w-2.5 h-2.5 md:w-5 md:h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(item);
                                                    }}
                                                    className="w-8 h-8 md:w-14 md:h-14 bg-white text-[#FD6941] border border-[#FFE4DE] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm focus:outline-none"
                                                >
                                                    <Plus className="w-5 h-5 md:w-7 md:h-7" />
                                                </button>
                                            )
                                        ) : (
                                            <div className="text-center py-1 md:py-3 bg-gray-100 text-gray-400 rounded-lg md:rounded-xl text-[10px] md:text-sm px-2 md:w-full">
                                                <span className="md:hidden">N/A</span>
                                                <span className="hidden md:inline">Currently Unavailable</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                    }
                </div >
            </div >

            {/* Live Floating Cart/Bill */}
            {totalItems > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 lg:p-8 pointer-events-none overscroll-none touch-none">
                    <div className="max-w-[1400px] mx-auto flex justify-center md:justify-end">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-2 pl-4 rounded-full shadow-2xl flex items-center gap-4 pointer-events-auto animate-float-up overscroll-none">
                            {/* Decorative gradient */}
                            <div className="absolute -left-10 -top-10 w-32 h-32 bg-[#FD6941] rounded-full blur-3xl opacity-20"></div>

                            <div className="flex items-center gap-3 relative z-10 ms-1">
                                <div className="relative shrink-0">
                                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm relative">
                                        <ShoppingBag size={18} className="text-[#FD6941]" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FD6941] text-white rounded-full border border-white flex items-center justify-center shadow-sm">
                                        <span className="text-[8px] font-bold leading-none">{totalItems}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-medium tracking-widest leading-tight">Your Bag</p>
                                    <p className="text-lg font-medium text-gray-900 leading-tight">{activeSymbol}{grandTotal}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => isPreviewMode ? toast('Preview Mode: Checkout disabled') : setShowBill(true)}
                                className="flex items-center gap-2 bg-[#FD6941] text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg shadow-orange-200/50 hover:bg-orange-600 transition-all relative z-10 mr-1"
                            >
                                Checkout <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Checkout Modal */}
            {showBill && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 overscroll-none touch-none overflow-hidden">
                    <div className="bg-white w-full md:w-[500px] h-auto max-h-[92vh] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-float-up overscroll-none touch-pan-y relative bottom-0">

                        {/* Header */}
                        <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
                            <h2 className="text-xl font-medium text-gray-800">Your Order</h2>
                            <button
                                onClick={() => setShowBill(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Order Content */}
                        <div className="flex-1 flex flex-col overflow-hidden pt-2 px-6 pb-6 no-scrollbar">

                            {/* Order Success State */}
                            {orderPlaced ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
                                        <ShoppingBag className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl text-gray-800 mb-2">Order Places!</h3>
                                    <p className="text-gray-500">Kitchen is preparing your delicious meal.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items - Shows exactly 2 items before scrolling */}
                                    <div className="overflow-y-auto no-scrollbar pr-1 mb-4 space-y-4 max-h-[155px]">
                                        {Object.values(cart).map((item) => (
                                            <div key={item._id} className="flex gap-4 items-center px-1">
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-gray-800 text-[13px] font-medium leading-tight mb-1.5">{item.name}</h4>
                                                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 w-fit h-8 border border-gray-100">
                                                        <button onClick={() => removeFromCart(item._id)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-600 shadow-sm hover:bg-gray-100 transition-colors"><Minus className="w-3 h-3" /></button>
                                                        <span className="text-xs w-4 text-center font-medium text-gray-800">{item.qty}</span>
                                                        <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-[#FD6941] text-white rounded-full hover:bg-orange-600 transition-colors"><Plus className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                                <div className="text-right self-center">
                                                    <span className="text-[#FD6941] font-medium text-sm whitespace-nowrap">{activeSymbol}{item.price * item.qty}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Customer Details Form - Fixed below items */}
                                    <div className="flex-shrink-0 space-y-3 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Order Details</h3>
                                            {(customerDetails.name && customerDetails.phone) && (
                                                <button
                                                    onClick={() => setShowFullForm(!showFullForm)}
                                                    className="text-[10px] font-bold text-[#FD6941] bg-orange-50 px-3 py-1 rounded-full border border-orange-100"
                                                >
                                                    {showFullForm ? "View Summary" : "Change Info"}
                                                </button>
                                            )}
                                        </div>

                                        {!showFullForm ? (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase font-medium tracking-widest mb-0.5">Guest Information</p>
                                                        <p className="font-medium text-gray-800">{customerDetails.name}</p>
                                                        <p className="text-[10px] text-gray-400">{customerDetails.phone} • Table {customerDetails.tableNo}</p>
                                                    </div>
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#FD6941] shadow-sm border border-orange-50">
                                                        <Star className="w-5 h-5 fill-current" />
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-gray-200/50">
                                                    <label className="block text-[10px] text-gray-400 uppercase font-medium tracking-widest mb-2">Cooking Instructions</label>
                                                    <textarea
                                                        rows="2"
                                                        value={customerDetails.notes}
                                                        onChange={e => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white rounded-xl text-sm text-gray-800 focus:outline-none border border-gray-100 focus:border-orange-200 resize-none"
                                                        placeholder="Any special requests? (Optional)"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-12 gap-3">
                                                <div className="col-span-12">
                                                    <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-widest">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={customerDetails.name}
                                                        onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                                        className="w-full px-5 py-2.5 bg-gray-50 rounded-full text-sm text-gray-800 focus:outline-none border border-gray-100 focus:border-[#FD6941]"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                                <div className="col-span-8">
                                                    <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-widest">Phone</label>
                                                    <input
                                                        type="tel"
                                                        value={customerDetails.phone}
                                                        onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                                        className="w-full px-5 py-2.5 bg-gray-50 rounded-full text-sm text-gray-800 focus:outline-none border border-gray-100 focus:border-[#FD6941]"
                                                        placeholder="+91..."
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <label className="block text-[10px] text-gray-400 mb-1 text-center font-medium uppercase tracking-widest">Table</label>
                                                    <input
                                                        type="text"
                                                        value={customerDetails.tableNo}
                                                        readOnly
                                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-full text-sm text-gray-500 border border-gray-200 cursor-not-allowed outline-none font-medium text-center"
                                                    />
                                                </div>
                                                <div className="col-span-12">
                                                    <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-widest">Special Requests</label>
                                                    <textarea
                                                        rows="2"
                                                        value={customerDetails.notes}
                                                        onChange={e => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                                                        className="w-full px-5 py-3 bg-gray-50 rounded-2xl text-sm text-gray-800 focus:outline-none border border-gray-100 focus:border-[#FD6941] resize-none"
                                                        placeholder="Less spicy, extra cheese..."
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bill Summary - Compact Solid */}
                                    <div className="space-y-2 pt-4 border-t border-gray-100 flex-shrink-0">
                                        <div className="flex justify-between text-xs text-gray-400 font-medium uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span className="text-gray-700">{activeSymbol}{subTotal}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 font-medium uppercase tracking-widest">
                                            <span>Tax (5%)</span>
                                            <span className="text-gray-700">{activeSymbol}{tax}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-medium text-gray-900 pt-2.5 mt-1 border-t border-dashed border-gray-200">
                                            <span>Grand Total</span>
                                            <span className="text-[#FD6941]">{activeSymbol}{grandTotal}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer / Place Order Button */}
                        {!orderPlaced && (
                            <div className="p-5 border-t border-gray-100 bg-white shrink-0 safety-pb">
                                <button
                                    onClick={handlePlaceOrder}
                                    className="w-full bg-[#FD6941] text-white py-4 rounded-full text-base font-medium shadow-xl shadow-orange-200 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    Place Order <span className="text-white/40">•</span> {activeSymbol}{grandTotal}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Item Preview Modal */}
            {
                selectedItem && (
                    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Image Section */}
                            <div className="h-64 md:h-80 w-full bg-gray-100 shrink-0 relative">
                                {/* Top Left Badges - Status Only */}
                                {/* Top Left Badges - Status Only */}
                                <div className="absolute top-4 left-4 z-30">
                                    {/* Status Tag */}
                                    <div className={`px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-sm flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider ${selectedItem.isAvailable ? 'bg-white/90 text-green-600' : 'bg-red-500/90 text-white'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedItem.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-white'}`}></span>
                                        {selectedItem.isAvailable ? 'Available' : 'Sold Out'}
                                    </div>
                                </div>



                                <MediaSlider
                                    media={[...(selectedItem.models || []), ...(selectedItem.media || []), { url: selectedItem.image, type: 'image' }]}
                                    className="w-full h-full object-cover"
                                    showArButton={false}
                                    modelCheckId="preview-model-viewer"
                                />
                            </div>

                            {/* Details Section */}
                            <div className="flex-1 flex flex-col bg-white relative -mt-10 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                                {/* Fixed Header */}
                                <div className="shrink-0 px-6 pt-6 md:px-8 md:pt-8 bg-white z-10">
                                    <div className="mb-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-tight inline align-middle">
                                                        {selectedItem.name}
                                                    </h2>
                                                    {selectedItem.labels && selectedItem.labels.length > 0 && (
                                                        <span className="inline-flex items-center gap-2 ml-2 align-middle">
                                                            {selectedItem.labels.map(label => dietaryIcons[label] && (
                                                                <img
                                                                    key={label}
                                                                    src={dietaryIcons[label]}
                                                                    alt={label}
                                                                    title={label}
                                                                    className="w-5 h-5 md:w-6 md:h-6"
                                                                    style={!['Spicy', 'Vegan'].includes(label) ? { filter: orangeFilter } : {}}
                                                                />
                                                            ))}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-2xl md:text-3xl font-medium text-gray-900 whitespace-nowrap shrink-0">{activeSymbol}{selectedItem.price}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] md:text-xs font-medium tracking-wider text-[#FD6941] uppercase">
                                                    {typeof selectedItem.category === 'object' ? selectedItem.category?.name : selectedItem.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-3">
                                            <img
                                                src={selectedItem.isVeg ? vegIcon : nonVegIcon}
                                                alt={selectedItem.isVeg ? "Veg" : "Non-Veg"}
                                                className="w-6 h-6"
                                            />
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" /> {selectedItem.time}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Flame className="w-4 h-4 text-[#FD6941]" /> {selectedItem.calories}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">
                                                <Star className="w-4 h-4 fill-current" /> {selectedItem.rating || '4.5'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-32">
                                    <div className="prose prose-sm text-gray-500 mb-8">
                                        <p className="leading-relaxed text-base">{selectedItem.description}</p>
                                    </div>

                                    {/* Dietary Tags */}
                                    {selectedItem.labels && selectedItem.labels.length > 0 && (
                                        <div className="mb-8">
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Dietary Info</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedItem.labels.map(label => (
                                                    <span key={label} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700">
                                                        {dietaryIcons[label] && (
                                                            <img
                                                                src={dietaryIcons[label]}
                                                                alt={label}
                                                                className="w-4 h-4"
                                                                style={!['Spicy', 'Vegan'].includes(label) ? { filter: orangeFilter } : {}}
                                                            />
                                                        )}
                                                        {label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}


                                </div>

                                {/* Fixed Action Bar at Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-center gap-6 z-20">
                                    <button
                                        onClick={() => toggleFavorite(selectedItem)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors ${favorites[selectedItem._id] ? 'bg-red-100 text-red-500' : 'bg-white border border-gray-200 text-gray-400 group-hover:bg-red-50 group-hover:text-red-500'}`}>
                                            <Heart className={`w-6 h-6 md:w-7 md:h-7 ${favorites[selectedItem._id] ? 'fill-current' : ''}`} />
                                        </div>
                                    </button>

                                    { /* AR Button (Visible if models exist) */}
                                    {(selectedItem.models && selectedItem.models.length > 0) && (
                                        <button
                                            onClick={() => {
                                                const viewer = document.querySelector('#preview-model-viewer');
                                                if (viewer) viewer.activateAR();
                                            }}
                                            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm"
                                        >
                                            <Box className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                                        </button>
                                    )}

                                    {selectedItem.isAvailable ? (
                                        cart[selectedItem._id] ? (
                                            <div className="flex items-center justify-center gap-2.5 bg-white/40 backdrop-blur-md border border-[#FFE4DE]/30 text-gray-900 rounded-full shadow-sm h-9 md:h-12 px-1">
                                                <button
                                                    onClick={() => removeFromCart(selectedItem._id)}
                                                    className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white border border-[#FFE4DE]/20 text-gray-400 flex items-center justify-center hover:bg-gray-50 transition-all shrink-0"
                                                >
                                                    <Minus className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                                </button>
                                                <span className="text-base md:text-lg font-bold min-w-[1.2rem] text-center text-[#FD6941]">{cart[selectedItem._id].qty}</span>
                                                <button
                                                    onClick={() => addToCart(selectedItem)}
                                                    className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#FD6941] text-white flex items-center justify-center hover:bg-orange-600 transition-all shrink-0 shadow-sm"
                                                >
                                                    <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(selectedItem)}
                                                className="h-12 w-12 md:h-14 md:w-14 bg-[#FD6941] text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                                            >
                                                <Plus className="w-6 h-6 md:w-7 md:h-7" />
                                            </button>
                                        )
                                    ) : (
                                        <div className="flex-1 md:flex-none px-6 py-4 bg-gray-100 text-gray-400 rounded-full font-bold text-sm text-center">
                                            Currently Unavailable
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Occupied Table Blocker Modal */}
            {
                isTableOccupied && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-bounce-in">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <UtensilsCrossed className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Table Occupied</h3>
                            <p className="text-gray-500 mb-6 px-4">
                                You can't order here, this table is already occupied.
                                <br />Please check your table number and scan the QR Code again.
                            </p>

                            <div className="border-t border-gray-100 pt-6">
                                <p className="text-sm font-bold text-gray-800 mb-3">Is this your table?</p>
                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={verificationPhone}
                                        onChange={e => setVerificationPhone(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            if (occupantInfo && verificationPhone === occupantInfo.phone) {
                                                toast.success("Identity Verified! Welcome back.");
                                                setCustomerDetails(prev => ({ ...prev, phone: verificationPhone, name: occupantInfo.name }));
                                                setIsTableOccupied(false);
                                                setShowFullForm(false);
                                            } else {
                                                toast.error("Phone number does not match current order.");
                                            }
                                        }}
                                        className="bg-[#FD6941] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-100"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Menu;
