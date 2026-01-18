import { useState } from 'react';
import { Search, Filter, Plus, Pencil, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react';

const AdminMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Modal Form State
    const [uploadedImage, setUploadedImage] = useState(null); // null or object { name, size, url }
    const [isActiveStatus, setIsActiveStatus] = useState(true);
    const [selectedLabels, setSelectedLabels] = useState(['Vegetarian']);
    
    // New Form State
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Main Course');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');

    const handleUpload = () => {
        // Simulate upload
        setUploadedImage({
            name: 'Margherita-Pizza.jpg',
            size: '1.2 MB',
            url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
        });
    };

    const toggleLabel = (label) => {
        if (selectedLabels.includes(label)) {
            setSelectedLabels(selectedLabels.filter(l => l !== label));
        } else {
            setSelectedLabels([...selectedLabels, label]);
        }
    };
    
    // Mock Data mimicking the screenshot
    const [menuItems, setMenuItems] = useState(Array(8).fill({
        id: '1',
        name: 'Margherita Pizza',
        category: 'MAIN COURSE',
        price: 199,
        description: 'Fresh Mozzarella, Tomato sauce, and Basil on our signature wood-fire crust.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Pizza image
        isAvailable: true
    }));

    const handleSave = () => {
        const newItem = {
            id: Date.now().toString(), // Simple unique ID
            name: newItemName || 'New Item',
            category: newItemCategory.toUpperCase(),
            price: newItemPrice || 0,
            description: newItemDescription || 'No description provided.',
            image: uploadedImage ? uploadedImage.url : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Default image if none uploaded
            isAvailable: isActiveStatus,
            labels: selectedLabels
        };

        setMenuItems([...menuItems, newItem]);
        setIsModalOpen(false);
        
        // Reset Form
        setUploadedImage(null);
        setIsActiveStatus(true);
        setSelectedLabels([]);
        setNewItemName('');
        setNewItemCategory('Main Course');
        setNewItemPrice('');
        setNewItemDescription('');
    };

    const openModal = () => {
        setIsModalOpen(true);
        setUploadedImage(null); // Reset on open
        setIsActiveStatus(true);
        setSelectedLabels([]);
        setNewItemName('');
        setNewItemCategory('Main Course');
        setNewItemPrice('');
        setNewItemDescription('');
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
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">
                
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    
                    {/* Menu Items */}
                    {menuItems.map((item, index) => (
                        <div key={index} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
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
                                <div className="flex items-center gap-2">
                                     <span className="text-[10px] text-gray-400 font-medium uppercase">Available</span>
                                     <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input 
                                            type="checkbox" 
                                            name="toggle" 
                                            id={`toggle-${index}`} 
                                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-900 transition-transform duration-200 ease-in-out translate-x-5"
                                            checked={item.isAvailable}
                                            readOnly 
                                        />
                                        <label htmlFor={`toggle-${index}`} className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${item.isAvailable ? 'bg-[#FD6941]' : 'bg-gray-900'}`}></label>
                                    </div>
                                    <style>{`
                                        .toggle-checkbox:checked {
                                            right: 0;
                                            border-color: #FD6941;
                                        }
                                        .toggle-checkbox:checked + .toggle-label {
                                            background-color: #FD6941;
                                        }
                                    `}</style>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Item Card */}
                    <div 
                        onClick={openModal}
                        className="border-2 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all min-h-[350px] group"
                    >
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Plus className="w-10 h-10 text-gray-400 group-hover:text-[#FD6941]" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">Add New Menu Item</h3>
                        <p className="text-sm text-gray-500 max-w-[200px]">Fill Details and Upload Images</p>
                    </div>

                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
                            
                            {/* Left Column: Image Upload */}
                            <div className="lg:col-span-5 bg-gray-50 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Item Media</h3>
                                
                                {!uploadedImage ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-white mb-6 min-h-[300px]">
                                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-[#FD6941]">
                                            <ImageIcon className="w-8 h-8" />
                                            <Plus className="w-4 h-4 absolute ml-4 -mt-4 text-[#FD6941]" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-2">Upload Food Images</h4>
                                        <p className="text-sm text-gray-400 mb-6 max-w-[200px]">
                                            Drag and Drop or click to browse.
                                            JPG, PNG, MP4, STPE.
                                        </p>
                                        <button 
                                            onClick={handleUpload}
                                            className="bg-[#FD6941] hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-sm w-full max-w-[200px]"
                                        >
                                            Select file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in zoom-in-95">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                                                <img 
                                                    src={uploadedImage.url}
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{uploadedImage.name}</p>
                                                <p className="text-[10px] text-gray-400">{uploadedImage.size} Completed</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setUploadedImage(null)}
                                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
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
                                </div> // End Actions Footer
                            </div> // End Right Column
                        </div> // End Grid
                    </div> // End Modal Content
                </div> // End Backdrop
            )}
        </div>
    );
};

export default AdminMenu;
