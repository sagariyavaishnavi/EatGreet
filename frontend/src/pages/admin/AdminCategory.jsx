import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Utensils, Coffee, Pizza, Salad, Cake, Sandwich, X, Filter, Leaf, Wheat, Flame, Egg, Fish, Milk, Droplet } from 'lucide-react';

import { categoryAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminCategory = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryStatus, setNewCategoryStatus] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [selectedIcon, setSelectedIcon] = useState(Utensils);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const iconOptions = [
        { icon: Utensils, label: 'Utensils' },
        { icon: Leaf, label: 'Vegan/Veg' },
        { icon: Coffee, label: 'Coffee' },
        { icon: Pizza, label: 'Pizza' },
        { icon: Salad, label: 'Healthy' },
        { icon: Cake, label: 'Dessert' },
        { icon: Sandwich, label: 'Sandwich' },
        { icon: Wheat, label: 'Grain' },
        { icon: Flame, label: 'Spicy' },
        { icon: Egg, label: 'Egg' },
        { icon: Fish, label: 'Seafood' },
        { icon: Milk, label: 'Dairy' },
        { icon: Droplet, label: 'Liquid' },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const { data } = await categoryAPI.getAll();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to fetch categories');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryStatus(category.status === 'ACTIVE');

        const matchedOption = iconOptions.find(opt => opt.label === category.icon);
        setSelectedIcon(matchedOption ? matchedOption.icon : Utensils);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Please enter a category name.");
            return;
        }

        if (!selectedIcon) {
            toast.error("Please select an icon to represent the category.");
            return;
        }

        try {
            const selectedOpt = iconOptions.find(opt => opt.icon === selectedIcon);
            const iconLabel = selectedOpt ? selectedOpt.label : '';

            const categoryData = {
                name: newCategoryName,
                icon: iconLabel,
                status: newCategoryStatus ? 'ACTIVE' : 'INACTIVE',
                image: '' // Ensure image is cleared if it existed
            };

            if (editingCategory) {
                await categoryAPI.update(editingCategory._id, categoryData);
                toast.success('Category updated');
            } else {
                await categoryAPI.create(categoryData);
                toast.success('Category created');
            }
            fetchCategories();
            closeModal();
        } catch (error) {
            toast.error('Failed to save category');
            console.error(error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryStatus(true);
        setSelectedIcon(Utensils);
    };

    const toggleStatus = async (id) => {
        const cat = categories.find(c => c._id === id);
        if (!cat) return;

        const newStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await categoryAPI.update(id, { status: newStatus });
            toast.success(`Category is now ${newStatus === 'ACTIVE' ? 'Available' : 'Not Available'}`);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-800 text-sm">Delete this category? Items will be uncategorized.</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await categoryAPI.delete(id);
                                toast.success('Category deleted successfully');
                                fetchCategories();
                            } catch (error) {
                                toast.error('Failed to delete category');
                            }
                        }}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const ActiveIcon = selectedIcon;

    return (
        <div className="space-y-6 relative">
            {/* Header Section */}
            {/* Header Section */}
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-[20px] sm:text-[24px] lg:text-[30px] font-medium text-black tracking-tight leading-none">Category Management</h1>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => { setEditingCategory(null); setNewCategoryName(''); setIsModalOpen(true); }}
                        className="bg-[#FD6941] hover:bg-orange-600 text-white p-2.5 sm:p-3 rounded-full font-medium flex items-center justify-center gap-0 group transition-all duration-300 shadow-sm text-sm overflow-hidden h-10 w-10 sm:h-12 sm:w-12 sm:hover:w-auto sm:hover:px-6 sm:hover:gap-2"
                    >
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <span className="max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden hidden sm:block">
                            Add Category
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">

                {/* Search & Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
                    <h2 className="text-[16px] sm:text-[22px] font-medium text-black w-full sm:w-auto">All Categories</h2>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] transition-all"
                            />
                        </div>
                        <button className="p-2.5 sm:p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {/* Category Cards */}
                    {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((category) => {
                        // Find the icon component based on the label, or default to Utensils
                        const matchedOption = iconOptions.find(opt => opt.label === category.icon) || iconOptions[0];
                        const DisplayIcon = matchedOption.icon;

                        return (
                            <div key={category._id}
                                onClick={() => navigate(`/customer/menu?category=${encodeURIComponent(category.name)}`)}
                                className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-row sm:flex-col h-40 sm:h-full cursor-pointer hover:border-[#FD6941] gap-4 sm:gap-0 relative overflow-hidden">

                                {/* Mobile ONLY: Status Badge at top right corner */}
                                <div className="sm:hidden absolute top-3 right-3 z-10">
                                    <span className={`text-[9px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider ${category.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {category.status || 'INACTIVE'}
                                    </span>
                                </div>

                                {/* Desktop ONLY: Hover actions at top right */}
                                <div className="hidden sm:flex absolute top-6 right-6 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(category._id); }}
                                        className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Left Column (Mobile) / Top Area (Desktop) */}
                                <div className="flex flex-col justify-between shrink-0 mb-0 sm:mb-6">
                                    <div className={`w-14 h-14 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 text-orange-500 bg-opacity-10 flex items-center justify-center shrink-0`}>
                                        <DisplayIcon className="w-7 h-7 sm:w-7 sm:h-7" />
                                    </div>

                                    {/* Mobile ONLY: Actions at bottom-left */}
                                    <div className="flex sm:hidden gap-1.5 mt-auto">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(category._id); }}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column (Mobile) / Middle Area (Desktop) */}
                                <div className="flex-1 flex flex-col justify-between sm:justify-start py-0 sm:py-1 sm:mb-8">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-0.5 sm:mb-1 line-clamp-1">{category.name}</h3>
                                        <p className="text-gray-400 text-[10px] sm:text-sm font-medium">{category.count || 0} Items Available</p>
                                    </div>

                                    {/* Mobile ONLY: Toggle at bottom-right of this column */}
                                    <div className="flex sm:hidden justify-end mt-auto scale-90 origin-right" onClick={(e) => e.stopPropagation()}>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={category.status === 'ACTIVE'}
                                                onChange={() => toggleStatus(category._id)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Desktop ONLY Bottom Section: Status & Toggle */}
                                <div className="hidden sm:flex flex-row items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Status</span>
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider ${category.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {category.status || 'INACTIVE'}
                                        </span>
                                    </div>

                                    <div className="origin-center" onClick={(e) => e.stopPropagation()}>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={category.status === 'ACTIVE'}
                                                onChange={() => toggleStatus(category._id)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Category Card */}
                    <div
                        onClick={() => { setEditingCategory(null); setNewCategoryName(''); setIsModalOpen(true); }}
                        className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-row sm:flex-col items-center justify-center p-4 sm:p-6 text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all h-40 sm:h-full group bg-gray-50/50 gap-4"
                    >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                            <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-[#FD6941]" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-700">Add New Category</h3>
                    </div>
                </div>
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 w-screen h-screen top-0 left-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-[99999] px-4">
                    <div className="fixed inset-0" onClick={closeModal} />
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Icon Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">Choose Category Icon</label>

                                {/* Icon Selection Grid */}
                                <div className="grid grid-cols-5 gap-3 mb-6">
                                    {iconOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedIcon(opt.icon)}
                                            className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${selectedIcon === opt.icon ? 'bg-[#FD6941] text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                            title={opt.label}
                                        >
                                            <opt.icon className="w-6 h-6" />
                                        </button>
                                    ))}
                                </div>

                                {/* Active Icon Preview */}
                                <div className="bg-orange-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-orange-100/50 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 text-[#FD6941]">
                                        {ActiveIcon ? <ActiveIcon className="w-8 h-8" /> : <Utensils className="w-8 h-8" />}
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium">Preview Icon</p>
                                    <p className="text-xs text-gray-400 mt-1">This icon will represent the category</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Breakfast Specials"
                                    className="w-full px-5 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white
"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-800">Active Status</label>
                                    <p className="text-xs text-gray-400">Visible on menu immediately</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={newCategoryStatus}
                                        onChange={() => setNewCategoryStatus(!newCategoryStatus)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                </label>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-4 rounded-full bg-[#FD6941] text-white text-sm font-medium hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all mt-4"
                            >
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminCategory;