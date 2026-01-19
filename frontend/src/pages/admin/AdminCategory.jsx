import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Utensils, Coffee, Pizza, Salad, Cake, Sandwich, X, Filter } from 'lucide-react';

import { CATEGORIES_KEY } from '../../constants';

// Icon Map for Serialization
const ICON_MAP = {
    'Utensils': Utensils,
    'Coffee': Coffee,
    'Pizza': Pizza,
    'Salad': Salad,
    'Cake': Cake,
    'Sandwich': Sandwich
};

const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Main Course', count: 0, status: 'ACTIVE', icon: 'Utensils', color: 'bg-blue-50 text-blue-500' },
    { id: 2, name: 'Starters', count: 0, status: 'ACTIVE', icon: 'Sandwich', color: 'bg-orange-50 text-orange-500' },
    { id: 3, name: 'Beverages', count: 0, status: 'ACTIVE', icon: 'Coffee', color: 'bg-purple-50 text-purple-500' },
    { id: 4, name: 'Desserts', count: 0, status: 'ACTIVE', icon: 'Cake', color: 'bg-pink-50 text-pink-500' },
    { id: 5, name: 'Pizza', count: 0, status: 'ACTIVE', icon: 'Pizza', color: 'bg-yellow-50 text-yellow-500' },
    { id: 6, name: 'Sides', count: 0, status: 'ACTIVE', icon: 'Salad', color: 'bg-green-50 text-green-500' },
];

const AdminCategory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryStatus, setNewCategoryStatus] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [selectedIconName, setSelectedIconName] = useState('Utensils');

    const iconOptions = Object.keys(ICON_MAP).map(key => ({ icon: ICON_MAP[key], label: key, name: key }));

    // Initialize from LocalStorage
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem(CATEGORIES_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    });

    // Validated Update Helper
    const updateCategories = (newCats) => {
        setCategories(newCats);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCats));
        // Dispatch event for other tabs
        window.dispatchEvent(new Event('storage'));
        // Dispatch custom event for same-tab components (like AdminMenu)
        window.dispatchEvent(new Event('category-update'));
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryStatus(category.status === 'ACTIVE');
        setSelectedIconName(category.icon || 'Utensils');
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!newCategoryName) return;

        const iconName = selectedIconName;
        // Simple color logic based on icon/random could go here, keeping existing simple
        const colorClass = 'bg-gray-50 text-gray-500';

        if (editingCategory) {
            const updated = categories.map(cat =>
                cat.id === editingCategory.id
                    ? { ...cat, name: newCategoryName, status: newCategoryStatus ? 'ACTIVE' : 'INACTIVE', icon: iconName }
                    : cat
            );
            updateCategories(updated);
        } else {
            const newCategory = {
                id: Date.now(),
                name: newCategoryName,
                count: 0, // In a real app we'd calc this
                status: newCategoryStatus ? 'ACTIVE' : 'INACTIVE',
                icon: iconName,
                color: colorClass
            };
            updateCategories([...categories, newCategory]);
        }

        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryStatus(true);
        setSelectedIconName('Utensils');
    };

    const toggleStatus = (id) => {
        const updated = categories.map(cat =>
            cat.id === id ? { ...cat, status: cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : cat
        );
        updateCategories(updated);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            const updated = categories.filter(cat => cat.id !== id);
            updateCategories(updated);
        }
    };

    const ActiveIcon = ICON_MAP[selectedIconName] || Utensils;

    return (
        <div className="space-y-6 relative">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
                <button
                    onClick={() => { setEditingCategory(null); setNewCategoryName(''); setIsModalOpen(true); }}
                    className="bg-[#FD6941] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">

                {/* Search & Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">All Categories</h2>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] transition-all"
                            />
                        </div>
                        <button className="p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Category Cards */}
                    {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => {
                        const IconComponent = ICON_MAP[category.icon] || Utensils;
                        return (
                            <div key={category.id} className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                                {/* Top: Icon and Actions */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${category.color} bg-opacity-10 flex items-center justify-center`}>
                                        <IconComponent className="w-7 h-7 text-gray-500" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Middle: Title */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{category.name}</h3>
                                    <p className="text-gray-400 text-sm font-medium">{category.count} Items Available</p>
                                </div>

                                {/* Bottom: Status & Toggle */}
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Status</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${category.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {category.status}
                                        </span>
                                    </div>

                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={category.status === 'ACTIVE'}
                                                onChange={() => toggleStatus(category.id)}
                                            />
                                            <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${category.status === 'ACTIVE' ? 'bg-[#FD6941]' : 'bg-gray-300'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${category.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )
                    })}

                    {/* Add New Category Card */}
                    <div
                        onClick={() => { setEditingCategory(null); setNewCategoryName(''); setIsModalOpen(true); }}
                        className="border-2 border-dashed border-gray-200 rounded-[1.5rem] flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all min-h-[200px] group bg-gray-50/50"
                    >
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-[#FD6941]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Add New Category</h3>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* SVG Icon Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Icon</label>

                                {/* Icon Selection Grid */}
                                <div className="grid grid-cols-6 gap-2 mb-4">
                                    {iconOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedIconName(opt.name)}
                                            className={`p-2 rounded-xl flex items-center justify-center transition-all ${selectedIconName === opt.name ? 'bg-[#FD6941] text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            title={opt.label}
                                        >
                                            <opt.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>

                                {/* File Upload Area */}
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-colors group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${selectedIconName ? 'bg-orange-100 text-[#FD6941]' : 'bg-gray-100 text-gray-400'}`}>
                                        <ActiveIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Click to upload SVG</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Recommended 24x24px</p>
                                    <input type="file" className="hidden" accept=".svg" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Breakfast Specials"
                                    className="w-full px-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <label className="block text-sm font-bold text-gray-800">Active Status</label>
                                    <p className="text-xs text-gray-400">Visible on menu immediately</p>
                                </div>
                                <div
                                    onClick={() => setNewCategoryStatus(!newCategoryStatus)}
                                    className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${newCategoryStatus ? 'bg-[#FD6941]' : 'bg-gray-200'}`}></div>
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${newCategoryStatus ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-3 rounded-full bg-[#FD6941] text-white text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all mt-4"
                            >
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategory;
