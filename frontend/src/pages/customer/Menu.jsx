import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MENU_ITEMS_KEY, CATEGORIES_KEY } from '../../constants';
import {
    Search, Heart, Plus, Minus, ShoppingBag,
    ChevronRight, Star, Clock, Flame
} from 'lucide-react';
import MediaSlider from '../../components/MediaSlider';

const mockMenuData = [
    {
        id: "1",
        name: "Double Whopper",
        price: 249,
        description: "Two flame-grilled beef patties topped with juicy tomatoes, fresh cut lettuce, creamy mayonnaise, ketchup, crunchy pickles, and sliced white onions on a soft sesame seed bun.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        time: "15-20 min",
        calories: "850 kcal",
        category: "Burgers",
        isVeg: false,
        isAvailable: true,
        images: [
            { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", type: "image/jpeg" },
            { url: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80", type: "image/jpeg" }
        ]
    },
    {
        id: "2",
        name: "Paneer Royale Pizza",
        price: 399,
        description: "Rich tomato sauce, mozzarella cheese, spiced paneer cubes, red paprika, and golden corn.",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        time: "20-25 min",
        calories: "1200 kcal",
        category: "Pizza",
        isVeg: true,
        isAvailable: true,
        images: [
            { url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80", type: "image/jpeg" },
            { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80", type: "image/jpeg" }
        ]
    },
    {
        id: "3",
        name: "Crispy Chicken Tacos",
        price: 189,
        description: "Crispy fried chicken strips, fresh lettuce, cheddar cheese, and spicy chipotle sauce in a soft tortilla.",
        image: "https://images.unsplash.com/photo-1565299585323-38d68c8e1297?auto=format&fit=crop&w=800&q=80",
        rating: 4.3,
        time: "10-15 min",
        calories: "450 kcal",
        category: "Mexican",
        isVeg: false,
        isAvailable: true,
        images: [
            { url: "https://images.unsplash.com/photo-1565299585323-38d68c8e1297?auto=format&fit=crop&w=800&q=80", type: "image/jpeg" }
        ]
    },
    {
        id: "4",
        name: "Fries (Large)",
        price: 109,
        description: "Classic salted french fries, crispy on the outside and fluffy on the inside.",
        image: "https://images.unsplash.com/photo-1573080496987-a199f8cd75ec?auto=format&fit=crop&w=800&q=80",
        rating: 4.6,
        time: "5-10 min",
        calories: "380 kcal",
        category: "Sides",
        isVeg: true,
        isAvailable: true,
        images: [
            { url: "https://images.unsplash.com/photo-1573080496987-a199f8cd75ec?auto=format&fit=crop&w=800&q=80", type: "image/jpeg" }
        ]
    }
];

const offers = [
    { id: 1, title: "50% OFF", subtitle: "On your first order", code: "WELCOME50", bg: "bg-black", text: "text-white" },
    { id: 2, title: "FREE FRIES", subtitle: "Orders above ₹299", code: "FREEMEAL", bg: "bg-[#FD6941]", text: "text-white" }, // Orange
    { id: 3, title: "FLAT ₹100", subtitle: "On gourmet pizzas", code: "PIZZAPARTY", bg: "bg-green-600", text: "text-white" },
];

// Initial like counts are no longer needed since we are not showing counts

const Menu = () => {
    const {
        cart, addToCart, removeFromCart, clearCart,
        favorites, toggleFavorite,
        showBill, setShowBill
    } = useOutletContext();

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Live Menu Data
    const [menuItems, setMenuItems] = useState(() => {
        const saved = localStorage.getItem(MENU_ITEMS_KEY);
        // Normalize IDs to string in mock data to ensure consistency
        const defaultWithStringIds = mockMenuData.map(item => ({ ...item, id: String(item.id) }));
        return saved ? JSON.parse(saved) : defaultWithStringIds;
    });

    useEffect(() => {
        const handleMenuUpdate = () => {
            const saved = localStorage.getItem(MENU_ITEMS_KEY);
            if (saved) setMenuItems(JSON.parse(saved));
        };

        window.addEventListener('storage', handleMenuUpdate);
        window.addEventListener('menu-update', handleMenuUpdate);
        return () => {
            window.removeEventListener('storage', handleMenuUpdate);
            window.removeEventListener('menu-update', handleMenuUpdate);
        };
    }, []);

    // Customer Details State
    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        phone: "",
        tableNo: "4", // Defaulting to 4 as per header
        notes: ""
    });

    // Dynamic Categories State
    const [categories, setCategories] = useState(["All", "Burgers", "Pizza", "Mexican", "Sides", "Beverages", "Desserts"]);

    useEffect(() => {
        const loadCategories = () => {
            const saved = localStorage.getItem(CATEGORIES_KEY);
            if (saved) {
                const activeWrapper = JSON.parse(saved);
                const activeNames = activeWrapper
                    .filter(c => c.status === 'ACTIVE')
                    .map(c => c.name);
                // Ensure 'All' is always first
                if (activeNames.length > 0) {
                    setCategories(['All', ...activeNames]);
                }
            }
        };

        loadCategories();
        window.addEventListener('storage', loadCategories);
        // Also listen for category-update if running in same context/window
        window.addEventListener('category-update', loadCategories);

        return () => {
            window.removeEventListener('storage', loadCategories);
            window.removeEventListener('category-update', loadCategories);
        };
    }, []);

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        setOrderPlaced(true);
        // Reset after 3 seconds for demo
        setTimeout(() => {
            setOrderPlaced(false);
            setShowBill(false);
            clearCart();
            setCustomerDetails({ name: "", phone: "", tableNo: "4", notes: "" });
        }, 3000);
    };

    const totalItems = Object.values(cart).reduce((acc, item) => acc + item.qty, 0);
    const subTotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = Math.round(subTotal * 0.05); // 5% Tax
    const grandTotal = subTotal + tax;

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === "All" || (item.category && item.category.toUpperCase() === selectedCategory.toUpperCase());
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-32 md:pb-0">
            {/* Search Bar */}
            <div className="sticky top-0 z-30 bg-white px-4 py-3 shadow-sm md:static md:shadow-none">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for food, category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-2xl text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FD6941] focus:bg-white transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Daily Offers Slider */}
            <div className="mt-4 px-4 overflow-x-auto no-scrollbar flex gap-4 snap-x">
                {offers.map(offer => (
                    <div key={offer.id} className={`snap-center shrink-0 w-[85%] md:w-[350px] h-40 rounded-[2rem] p-6 flex flex-col justify-center relative shadow-lg ${offer.bg}`}>
                        <div className="relative z-10">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block ${offer.text === 'text-white' ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}`}>LIMITED TIME</span>
                            <h3 className={`text-3xl font-black ${offer.text} leading-none mb-1`}>{offer.title}</h3>
                            <p className={`text-sm font-medium ${offer.text} opacity-80 mb-3`}>{offer.subtitle}</p>
                            <div className="flex items-center gap-2">
                                <code className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/30 tracking-wider border-dashed">{offer.code}</code>
                            </div>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                ))}
            </div>

            {/* Categories Navigation */}
            <div className="sticky top-[72px] md:top-0 z-20 bg-gray-50 pt-6 pb-4 px-4 overflow-x-auto no-scrollbar flex gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${selectedCategory === cat
                            ? 'bg-black text-white shadow-md transform scale-105'
                            : 'bg-white text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="px-4 pb-20">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    {selectedCategory}
                    <span className="text-sm font-medium text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{filteredItems.length}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative overflow-hidden">

                            {/* Card Header / Image Slider */}
                            <div className="relative h-64 rounded-[2rem] overflow-hidden mb-4 bg-gray-100">
                                {/* Veg/Non-Veg Indicator */}
                                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                    <div className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    </div>
                                    <span className={`text-[10px] font-bold ${item.isVeg ? 'text-green-700' : 'text-red-700'}`}>{item.isVeg ? 'VEG' : 'NON-VEG'}</span>
                                </div>

                                {/* Like Button */}
                                {/* Like Button & Count */}
                                {/* Like Button */}
                                <button
                                    onClick={() => toggleFavorite(item)}
                                    className={`absolute top-4 right-4 z-20 w-9 h-9 backdrop-blur rounded-full flex items-center justify-center shadow-sm transition-all ${favorites[item.id]
                                        ? 'bg-red-50 text-red-500'
                                        : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${favorites[item.id] ? 'fill-current' : ''}`} />
                                </button>

                                {/* Media Slider if available, else Image */}
                                {item.images && item.images.length > 0 ? (
                                    <MediaSlider media={item.images} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                )}

                                {/* Available Tag */}
                                <div className="absolute bottom-4 left-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    Available
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-2 pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-800 leading-tight mb-1">{item.name}</h3>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md">
                                                <Star className="w-3 h-3 fill-current" /> {item.rating}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {item.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Flame className="w-3 h-3 text-[#FD6941]" /> {item.calories}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-black text-gray-800">₹{item.price}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2 mb-6 text-balance">
                                    {item.description}
                                </p>

                                {/* Add Button / Qty Control */}
                                <div className="flex items-center justify-center">
                                    {cart[item.id] ? (
                                        <div className="flex items-center gap-4 bg-black text-white px-2 py-2 rounded-full shadow-lg w-full max-w-[140px] justify-between">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-lg w-6 text-center">{cart[item.id].qty}</span>
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
                                            className="w-16 h-16 bg-[#FD6941] text-white rounded-full shadow-lg shadow-orange-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
                                        >
                                            <Plus className="w-8 h-8" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live Floating Cart/Bill */}
            {totalItems > 0 && (
                <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-96 z-50">
                    <div className="bg-black text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between border border-gray-800 relative overflow-hidden backdrop-blur-xl bg-opacity-95">
                        {/* Decorative gradient */}
                        <div className="absolute -left-10 -top-10 w-32 h-32 bg-[#FD6941] rounded-full blur-3xl opacity-20"></div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-white/10 relative">
                                <ShoppingBag className="w-5 h-5 text-[#FD6941]" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FD6941] rounded-full text-[10px] font-bold flex items-center justify-center border border-black">
                                    {totalItems}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Bill</p>
                                <p className="text-xl font-bold">₹{totalPrice}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowBill(true)}
                            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors relative z-10"
                        >
                            View Cart <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Order Checkout Modal */}
            {showBill && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white w-full md:w-[500px] h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-float-up">

                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
                            <h2 className="text-xl font-black text-gray-800">Your Order</h2>
                            <button
                                onClick={() => setShowBill(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                            >
                                <Minus className="w-5 h-5 rotate-45" /> {/* Close Icon */}
                            </button>
                        </div>

                        {/* Order Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">

                            {/* Order Success State */}
                            {orderPlaced ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
                                        <ShoppingBag className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-800 mb-2">Order Places!</h3>
                                    <p className="text-gray-500">Kitchen is preparing your delicious meal.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <div className="space-y-4">
                                        {Object.values(cart).map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                                                        <span className="font-bold text-gray-800">₹{item.price * item.qty}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 h-7">
                                                            <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 flex items-center justify-center bg-white rounded-full text-gray-600 shadow-sm text-xs"><Minus className="w-3 h-3" /></button>
                                                            <span className="text-xs font-bold w-3 text-center">{item.qty}</span>
                                                            <button onClick={() => addToCart(item)} className="w-5 h-5 flex items-center justify-center bg-black text-white rounded-full shadow-sm text-xs"><Plus className="w-3 h-3" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Customer Details Form */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Required Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={customerDetails.name}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FD6941]"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={customerDetails.phone}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FD6941]"
                                                    placeholder="+91..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Table No.</label>
                                                <input
                                                    type="text"
                                                    value={customerDetails.tableNo}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, tableNo: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FD6941]"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Cooking Instructions (Optional)</label>
                                                <textarea
                                                    rows="2"
                                                    value={customerDetails.notes}
                                                    onChange={e => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FD6941] resize-none"
                                                    placeholder="Less spicy, extra cheese..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bill Summary */}
                                    <div className="space-y-2 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                                            <span>Subtotal</span>
                                            <span>₹{subTotal}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                                            <span>Tax (5%)</span>
                                            <span>₹{tax}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-dashed border-gray-200 mt-2">
                                            <span>Grand Total</span>
                                            <span>₹{grandTotal}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer / Place Order Button */}
                        {!orderPlaced && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 safety-pb">
                                <button
                                    onClick={handlePlaceOrder}
                                    className="w-full bg-[#FD6941] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Place Order <span className="text-white/60">•</span> ₹{grandTotal}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
