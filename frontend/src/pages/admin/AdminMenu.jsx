import { useState } from 'react';
import { Search, Filter, Plus, Pencil, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react';

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
            setMenuItems(menuItems.filter(item => item.id !== id));
        }
    };

    const handleSave = () => {
        const itemData = {
            id: editingItem ? editingItem.id : Date.now().toString(),
            name: newItemName || 'New Item',
            category: newItemCategory.toUpperCase(),
            price: newItemPrice || 0,
            description: newItemDescription || 'No description provided.',
            image: mediaItems.length > 0 ? mediaItems[0].url : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            isAvailable: isActiveStatus,
            labels: selectedLabels,
            media: mediaItems
        };

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
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-[10px] font-bold text-gray-700 tracking-wide uppercase">{item.isAvailable ? 'Available' : 'Unavailable'}</span>
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
                    </div>

                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">

                            {/* Left Column: Image Upload */}
                            {/* Left Column: Media Upload */}
                            <div className="lg:col-span-5 bg-gray-50 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Item Media</h3>
                                <p className="text-sm text-gray-400 mb-4">Add up to 5 images or videos.</p>

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
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept="image/*,video/*"
                                                multiple
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
                                                        Select Files
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Form Details */}
                            <div className="lg:col-span-7 p-8 lg:p-10 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Tandoor Burger"
                                        className="w-full px-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white appearance-none cursor-pointer"
                                                value={newItemCategory}
                                                onChange={(e) => setNewItemCategory(e.target.value)}
                                            >
                                                <option>Main Course</option>
                                                <option>Starters</option>
                                                <option>Beverages</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                                value={newItemPrice}
                                                onChange={(e) => setNewItemPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Describe the ingredients, Preparation, and flavor profile..."
                                        className="w-full px-5 py-4 rounded-3xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white resize-none"
                                        value={newItemDescription}
                                        onChange={(e) => setNewItemDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800">Active Status</label>
                                        <p className="text-xs text-gray-400">Make this item visible on the digital menu immediately</p>
                                    </div>
                                    <div
                                        onClick={() => setIsActiveStatus(!isActiveStatus)}
                                        className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in cursor-pointer"
                                    >
                                        <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${isActiveStatus ? 'bg-black' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isActiveStatus ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Dietary Labels</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Vegetarian', 'Vegan', 'Non-veg', 'Gluten-Free', 'Spicy'].map((label) => (
                                            <button
                                                key={label}
                                                onClick={() => toggleLabel(label)}
                                                className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-2 
                                                    ${selectedLabels.includes(label)
                                                        ? 'border-[#FD6941] text-[#FD6941] bg-orange-50'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {label === 'Vegetarian' && <span className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-500 ring-offset-1"></span>}
                                                {label === 'Vegan' && <span className="w-3 h-3 text-green-600">🌿</span>}
                                                {label === 'Non-veg' && <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-red-500 ring-offset-1"></span>}
                                                {label === 'Gluten-Free' && <span className="w-3 h-3 text-orange-400">🍞</span>}
                                                {label === 'Spicy' && <span className="w-3 h-3 text-red-500">🌶️</span>}
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-8 py-3 rounded-full bg-[#FD6941] text-white text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
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
