import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Pencil, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react';
import MediaSlider from '../../components/MediaSlider';
import { CATEGORIES_KEY, MENU_ITEMS_KEY } from '../../constants';

// Default mock data if storage is empty
const DEFAULT_MENU_ITEMS = [
    {
        id: '1',
        name: 'Margherita Pizza',
        category: 'MAIN COURSE',
        price: 199,
        description: 'Fresh Mozzarella, Tomato sauce, and Basil on our signature wood-fire crust.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        rating: 4.5,
        time: '15-20 min',
        calories: '850 kcal',
        isVeg: true,
        isAvailable: true
    },
    // ... (Adding a few more to match customer view initial state roughly if needed, or stick to simple admin defaults)
    // For simplicity, let's trust the admin to add more, or use the ones from customer view as default?
    // Let's use a robust default compatible with both views.
    {
        id: '2',
        name: "Double Whopper",
        price: 249,
        description: "Two flame-grilled beef patties topped with juicy tomatoes, fresh cut lettuce, creamy mayonnaise, ketchup, crunchy pickles, and sliced white onions on a soft sesame seed bun.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        time: "15-20 min",
        calories: "850 kcal",
        category: "BURGERS",
        isVeg: false,
        isAvailable: true
    }
];

const AdminMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal Form State
    const [mediaItems, setMediaItems] = useState([]); // Array of { name, size, url, type }
    const [isActiveStatus, setIsActiveStatus] = useState(true);
    const [selectedLabels, setSelectedLabels] = useState(['Vegetarian']);

    // New Form State
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Main Course');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    // New Fields
    const [newItemCalories, setNewItemCalories] = useState('250 kcal');
    const [newItemTime, setNewItemTime] = useState('15-20 min');
    const [newItemIsVeg, setNewItemIsVeg] = useState(true);

    const removeMedia = (indexToRemove) => {
        setMediaItems(mediaItems.filter((_, index) => index !== indexToRemove));
    };

    const toggleLabel = (label) => {
        if (selectedLabels.includes(label)) {
            setSelectedLabels(selectedLabels.filter(l => l !== label));
        } else {
            setSelectedLabels([...selectedLabels, label]);
        }
    };

    // Live Data State
    // Category Data State
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = () => {
            const saved = localStorage.getItem(CATEGORIES_KEY);
            if (saved) {
                setCategories(JSON.parse(saved).filter(c => c.status === 'ACTIVE'));
            } else {
                // Fallback default categories if none in storage
                setCategories([
                    { name: 'Main Course' }, { name: 'Starters' }, { name: 'Beverages' },
                    { name: 'Desserts' }, { name: 'Pizza' }, { name: 'Sides' }
                ]);
            }
        };
        loadCategories();

        window.addEventListener('storage', loadCategories);
        window.addEventListener('category-update', loadCategories);
        return () => {
            window.removeEventListener('storage', loadCategories);
            window.removeEventListener('category-update', loadCategories);
        };
    }, []);

    // Menu Item State
    const [menuItems, setMenuItems] = useState(() => {
        const saved = localStorage.getItem(MENU_ITEMS_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
    });

    // Sync Helper
    const updateMenu = (newItems) => {
        setMenuItems(newItems);
        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(newItems));
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('menu-update'));
    };

    // Listen for external updates
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem(MENU_ITEMS_KEY);
            if (saved) setMenuItems(JSON.parse(saved));
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('menu-update', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('menu-update', handleStorageChange);
        };
    }, []);
    // Mock Data mimicking the screenshot
    const [menuItems, setMenuItems] = useState(Array.from({ length: 8 }, (_, i) => ({
        id: (i + 1).toString(),
        name: 'Margherita Pizza',
        category: 'MAIN COURSE',
        price: 199,
        description: 'Fresh Mozzarella, Tomato sauce, and Basil on our signature wood-fire crust.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Pizza image
        isAvailable: true
    })));

    const [editingItem, setEditingItem] = useState(null);

    const toggleStatus = (id) => {
        const updatedItems = menuItems.map(item =>
            item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
        );
        updateMenu(updatedItems);
        setMenuItems(menuItems.map(item =>
            item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
        ));
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItemName(item.name);
        setNewItemCategory(item.category);
        setNewItemPrice(item.price);
        setNewItemDescription(item.description);
        setNewItemCalories(item.calories || '250 kcal');
        setNewItemTime(item.time || '15-20 min');
        setNewItemIsVeg(item.isVeg === undefined ? true : item.isVeg);

        setIsActiveStatus(item.isAvailable);
        setSelectedLabels(item.labels || []);

        if (item.media && item.media.length > 0) {
            setMediaItems(item.media);
        } else if (item.image) {
            // Fallback for legacy items with single image string
            setMediaItems([{
                name: 'Image',
                size: 'Unknown',
                url: item.image,
                type: 'image/jpeg'
            }]);
        } else {
            setMediaItems([]);
        }

        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const updatedItems = menuItems.filter(item => item.id !== id);
            updateMenu(updatedItems);
            setMenuItems(menuItems.filter(item => item.id !== id));
        }
    };

    const handleSave = () => {
        if (!newItemName.trim() || !newItemPrice || !newItemCategory) {
            alert("Please fill in all required fields (Name, Category, Price).");
            return;
        }

        const itemData = {
            id: editingItem ? editingItem.id : Date.now().toString(),
            name: newItemName || 'New Item',
            category: newItemCategory.toUpperCase(),
            price: newItemPrice || 0,
            description: newItemDescription || 'No description provided.',
            calories: newItemCalories,
            time: newItemTime,
            isVeg: newItemIsVeg,

            image: mediaItems.length > 0 ? mediaItems[0].url : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            isAvailable: isActiveStatus,
            labels: selectedLabels,
            media: mediaItems
        };

        let updatedItems;
        if (editingItem) {
            updatedItems = menuItems.map(item => item.id === editingItem.id ? itemData : item);
        } else {
            updatedItems = [...menuItems, itemData];
        }
        updateMenu(updatedItems);
        if (editingItem) {
            setMenuItems(menuItems.map(item => item.id === editingItem.id ? itemData : item));
        } else {
            setMenuItems([...menuItems, itemData]);
        }

        setIsModalOpen(false);
        setEditingItem(null);
        resetForm();
    };

    const resetForm = () => {
        setMediaItems([]);
        setIsActiveStatus(true);
        setSelectedLabels([]);
        setNewItemName('');
        setNewItemCategory('Main Course');
        setNewItemPrice('');
        setNewItemDescription('');
        setNewItemCalories('250 kcal');
        setNewItemTime('15-20 min');
        setNewItemIsVeg(true);
    };

    const openModal = () => {
        setIsModalOpen(true);
        setEditingItem(null);
        resetForm();
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
                <button
                    onClick={openModal}
                    className="bg-[#FD6941] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Menu
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">All Menu</h2>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] transition-all"
                            />
                        </div>
                        <button className="p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">

                    {/* Menu Items */}
                    {menuItems.map((item, index) => (
                        <div key={item.id || index} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            {/* Image Container */}
                            <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                                <MediaSlider
                                    media={item.media && item.media.length > 0 ? item.media : [{ url: item.image, type: 'image/jpeg' }]}
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-[10px] font-bold text-gray-700 tracking-wide uppercase">{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                                </div>
                                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <div className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2 px-1">
                                <span className="text-[10px] font-bold text-[#FD6941] tracking-wider uppercase">
                                    {item.category}
                                </span>

                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight w-2/3">{item.name}</h3>
                                    <span className="font-bold text-xl text-gray-800">₹{item.price}</span>
                                </div>

                                <div className="flex gap-2 text-[10px] font-bold text-gray-400">
                                    <span>{item.calories}</span>
                                    <span>•</span>
                                    <span>{item.time}</span>
                                </div>

                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 h-10">
                                    {item.description}
                                </p>
                            </div>

                            {/* Actions Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                {/* Toggle Switch */}
                                <div>
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={item.isAvailable}
                                                onChange={() => toggleStatus(item.id)}
                                            />
                                            <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${item.isAvailable ? 'bg-[#FD6941]' : 'bg-gray-300'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${item.isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Item Card */}
                    <div
                        onClick={openModal}
                        className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all min-h-[350px] group bg-gray-50"
                    >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Plus className="w-8 h-8 text-[#FD6941]" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">Add New Item</h3>
                        className="border-2 border-dashed border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all min-h-[200px] sm:min-h-[350px] group bg-gray-50"
                    >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-[#FD6941]" />
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-gray-800">Add New Item</h3>
                    </div>

                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">

                            {/* Left Column: Image Upload */}
                            {/* Left Column: Media Upload */}
                            <div className="lg:col-span-5 bg-gray-50 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Item Media</h3>
                                <p className="text-sm text-gray-400 mb-4">Add up to 5 images or videos.</p>
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[95vh] lg:max-h-none overflow-y-auto lg:overflow-visible no-scrollbar">

                            {/* Left Column: Media Upload */}
                            <div className="lg:col-span-4 bg-gray-50 p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
                                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-4">Item Media</h3>
                                <p className="text-[10px] sm:text-xs text-gray-400 mb-3">Add up to 5 images or videos.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Uploaded Media Items */}
                                    {mediaItems.map((media, index) => (
                                        <div key={index} className="relative group aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                                            {media.type.startsWith('video') ? (
                                                <video src={media.url} className="w-full h-full object-cover" controls />
                                            ) : (
                                                <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                                            )}
                                            <button
                                                onClick={() => removeMedia(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[10px] text-white truncate">{media.name}</p>
                                                <p className="text-[8px] text-gray-300">{media.size}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Upload Card (Show if limit not reached) */}
                                    {mediaItems.length < 5 && (
                                        <div className={`border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center bg-white aspect-square hover:border-[#FD6941] hover:bg-orange-50/10 transition-colors cursor-pointer ${mediaItems.length === 0 ? 'col-span-2 aspect-auto min-h-[300px]' : ''}`}>
                                        <div className={`border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center bg-white aspect-square hover:border-[#FD6941] hover:bg-orange-50/10 transition-colors cursor-pointer ${mediaItems.length === 0 ? 'col-span-2 aspect-auto min-h-[120px] sm:min-h-[180px]' : ''}`}>
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept="image/*,video/*"
                                                multiple
                                                onChange={async (e) => {
                                                    const files = Array.from(e.target.files);
                                                    const newMedia = [];

                                                    for (const file of files) {
                                                        if (file.type.startsWith('video')) {
                                                            const duration = await new Promise((resolve) => {
                                                                const video = document.createElement('video');
                                                                video.preload = 'metadata';
                                                                video.onloadedmetadata = function () {
                                                                    window.URL.revokeObjectURL(video.src);
                                                                    resolve(video.duration);
                                                                }
                                                                video.src = URL.createObjectURL(file);
                                                            });

                                                            if (duration > 30) {
                                                                alert(`Video ${file.name} exceeds 30 seconds limit.`);
                                                                continue;
                                                            }
                                                        }

                                                        newMedia.push({
                                                            name: file.name,
                                                            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                                                            url: URL.createObjectURL(file),
                                                            type: file.type
                                                        });
                                                    }

                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    const newMedia = files.map(file => ({
                                                        name: file.name,
                                                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                                                        url: URL.createObjectURL(file),
                                                        type: file.type
                                                    }));

                                                    // Determine how many can be added
                                                    const remainingSlots = 5 - mediaItems.length;
                                                    const itemsToAdd = newMedia.slice(0, remainingSlots);

                                                    if (itemsToAdd.length > 0) {
                                                        setMediaItems([...mediaItems, ...itemsToAdd]);
                                                    }
                                                }}
                                            />
                                            <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                                <div className={`bg-orange-100 rounded-full flex items-center justify-center text-[#FD6941] mb-3 ${mediaItems.length === 0 ? 'w-20 h-20' : 'w-10 h-10'}`}>
                                                    <ImageIcon className={mediaItems.length === 0 ? 'w-8 h-8' : 'w-5 h-5'} />
                                                </div>
                                                <h4 className={`text-gray-800 font-bold ${mediaItems.length === 0 ? 'text-lg mb-2' : 'text-xs mb-1'}`}>
                                                    {mediaItems.length === 0 ? 'Upload Media' : 'Add More'}
                                                </h4>
                                                {mediaItems.length === 0 && (
                                                    <p className="text-sm text-gray-400 mb-6 max-w-[200px]">Browse images or videos</p>
                                                )}
                                                {mediaItems.length === 0 && (
                                                    <span className="bg-[#FD6941] text-white px-6 py-2 rounded-full font-medium text-sm shadow-sm">

                                                <div className={`bg-orange-100 rounded-full flex items-center justify-center text-[#FD6941] mb-2 ${mediaItems.length === 0 ? 'w-12 h-12' : 'w-8 h-8'}`}>
                                                    <ImageIcon className={mediaItems.length === 0 ? 'w-6 h-6' : 'w-4 h-4'} />
                                                </div>
                                                <h4 className={`text-gray-800 font-bold ${mediaItems.length === 0 ? 'text-sm mb-1' : 'text-[10px] mb-0.5'}`}>
                                                    {mediaItems.length === 0 ? 'Upload Media' : 'Add More'}
                                                </h4>
                                                {mediaItems.length === 0 && (
                                                    <p className="text-[10px] text-gray-400 mb-3 max-w-[150px]">Browse images or videos</p>
                                                )}
                                                {mediaItems.length === 0 && (
                                                    <span className="bg-[#FD6941] text-white px-4 py-1.5 rounded-full font-medium text-xs shadow-sm">
                                                        Select Files
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Form Details */}
                            <div className="lg:col-span-8 p-4 sm:p-6 lg:p-8 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Item Details</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Tandoor Burger"
                                        className="w-full px-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Tandoor Burger"
                                        className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white appearance-none cursor-pointer"

                                                className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white appearance-none cursor-pointer"
                                                value={newItemCategory}
                                                onChange={(e) => setNewItemCategory(e.target.value)}
                                            >
                                                <option disabled value="">Select Category</option>
                                                {categories.map((cat, idx) => (
                                                    <option key={cat.id || idx} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                                value={newItemPrice}
                                                onChange={(e) => setNewItemPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Calories</label>
                                        <input
                                            type="text"
                                            placeholder="e.g 350 kcal"
                                            className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                            value={newItemCalories}
                                            onChange={(e) => setNewItemCalories(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Time</label>
                                        <input
                                            type="text"
                                            placeholder="e.g 15-20 min"
                                            className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                            value={newItemTime}
                                            onChange={(e) => setNewItemTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Item Type (Veg / Non-Veg)</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${newItemIsVeg ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="isVeg" className="hidden" checked={newItemIsVeg} onChange={() => setNewItemIsVeg(true)} />
                                            <div className="w-4 h-4 border-2 border-green-600 rounded-sm flex items-center justify-center">
                                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                            </div>
                                            <span className="text-xs font-bold">Veg</span>
                                        </label>
                                        <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${!newItemIsVeg ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="isVeg" className="hidden" checked={!newItemIsVeg} onChange={() => setNewItemIsVeg(false)} />
                                            <div className="w-4 h-4 border-2 border-red-600 rounded-sm flex items-center justify-center">
                                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                            </div>
                                            <span className="text-xs font-bold">Non-Veg</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Describe the ingredients, Preparation, and flavor profile..."
                                        className="w-full px-5 py-4 rounded-3xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white resize-none"
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Describe the ingredients..."
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white resize-none"
                                        value={newItemDescription}
                                        onChange={(e) => setNewItemDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-between py-1">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-800">Active Status</label>
                                        <p className="text-[10px] text-gray-400">Make this item visible on the menu</p>
                                    </div>
                                    <div
                                        onClick={() => setIsActiveStatus(!isActiveStatus)}
                                        className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in cursor-pointer"
                                    >
                                        <div className={`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${isActiveStatus ? 'bg-black' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isActiveStatus ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Dietary Labels</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['Vegetarian', 'Vegan', 'Non-veg', 'Gluten-Free', 'Spicy'].map((label) => (
                                            <button
                                                key={label}
                                                onClick={() => toggleLabel(label)}
                                                className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2 

                                                className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all flex items-center gap-1.5 
                                                    ${selectedLabels.includes(label)
                                                        ? 'border-[#FD6941] text-[#FD6941] bg-orange-50'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {label === 'Vegetarian' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ring-1 ring-green-500 ring-offset-1"></span>}
                                                {label === 'Vegan' && <span className="w-2.5 h-2.5 text-green-600">🌿</span>}
                                                {label === 'Non-veg' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-red-500 ring-offset-1"></span>}
                                                {label === 'Gluten-Free' && <span className="w-2.5 h-2.5 text-orange-400">🍞</span>}
                                                {label === 'Spicy' && <span className="w-2.5 h-2.5 text-red-500">🌶️</span>}
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 rounded-full border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 rounded-full bg-[#FD6941] text-white text-xs font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
                                    >
                                        Save Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMenu;
