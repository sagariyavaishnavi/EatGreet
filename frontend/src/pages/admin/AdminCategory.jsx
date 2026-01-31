import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Utensils, Coffee, Pizza, Salad, Cake, Sandwich, X, Filter, Leaf, Wheat, Flame, Egg, Fish, Milk, Droplet, Image as ImageIcon } from 'lucide-react';

import { categoryAPI, uploadAPI } from '../../utils/api';
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
    const [categoryImage, setCategoryImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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
        setCategoryImage(category.image || '');

        if (category.image) {
            setSelectedIcon(null);
        } else {
            const matchedOption = iconOptions.find(opt => opt.label === category.icon);
            setSelectedIcon(matchedOption ? matchedOption.icon : Utensils);
        }
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const uploadToast = toast.loading('Uploading image...');

        try {
            const res = await uploadAPI.uploadDirect(file, (percent) => {
                toast.loading(`Uploading: ${percent}%`, { id: uploadToast });
            });
            setCategoryImage(res.data.secure_url);
            setSelectedIcon(null); // Clear icon logic
            toast.success('Image uploaded successfully', { id: uploadToast });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image', { id: uploadToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Please enter a category name.");
            return;
        }

        if (!categoryImage && !selectedIcon) {
            toast.error("Please select an image OR an icon to represent the category.");
            return;
        }

        try {
            const selectedOpt = iconOptions.find(opt => opt.icon === selectedIcon);
            const iconLabel = selectedOpt ? selectedOpt.label : '';

            const categoryData = {
                name: newCategoryName,
                icon: iconLabel,
                status: newCategoryStatus ? 'ACTIVE' : 'INACTIVE',
                image: categoryImage
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
        setCategoryImage('');
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
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
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
                        // Find the icon component based on the label, or default to Utensils
                        const matchedOption = iconOptions.find(opt => opt.label === category.icon) || iconOptions[0];
                        const DisplayIcon = matchedOption.icon;

                        return (
                            <div key={category._id}
                                onClick={() => navigate(`/customer/menu?category=${encodeURIComponent(category.name)}`)}
                                className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full cursor-pointer hover:border-[#FD6941]">
                                {category.image ? (
                                    <div className="relative h-40 rounded-2xl overflow-hidden mb-4 bg-gray-50 border border-gray-100">
                                        <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                        {/* Overlay Actions for Image Mode */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                                                className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(category._id); }}
                                                className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Icon Mode Layout */
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 bg-opacity-10 flex items-center justify-center`}>
                                            <DisplayIcon className="w-7 h-7" />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    </div>
                                )}

                                {/* Middle: Title */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{category.name}</h3>
                                    <p className="text-gray-400 text-sm font-medium">{category.count || 0} Items Available</p>
                                </div>

                                {/* Bottom: Status & Toggle */}
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Status</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${category.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {category.status || 'INACTIVE'}
                                        </span>
                                    </div>

                                    <label
                                        className="flex items-center cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={category.status === 'ACTIVE'}
                                                onChange={() => toggleStatus(category._id)}
                                            />
                                            <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${category.status === 'ACTIVE' ? 'bg-[#FD6941]' : 'bg-gray-300'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${category.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        ); // Closing the return statement of map
                    })}

                    {/* Add New Category Card */}
                    <div
                        onClick={() => { setEditingCategory(null); setNewCategoryName(''); setIsModalOpen(true); }}
                        className="border-2 border-dashed border-gray-200 rounded-[1.5rem] flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all min-h-[150px] sm:min-h-[200px] group bg-gray-50/50"
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[#FD6941]" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-700">Add New Category</h3>
                    </div>
                </div>
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 w-screen h-screen top-0 left-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-[9999] px-4">
                    <div className="fixed inset-0" onClick={closeModal} />
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* SVG Icon Upload & Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category Image</label>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                        {categoryImage ? (
                                            <img src={categoryImage} alt="cat" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="cat-image"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                        <label
                                            htmlFor="cat-image"
                                            className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold cursor-pointer transition-colors"
                                        >
                                            {isUploading ? 'Uploading...' : 'Choose Image'}
                                        </label>
                                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>

                                <label className="block text-sm font-bold text-gray-700 mb-2">Icon</label>

                                {/* Icon Selection Grid */}
                                <div className="grid grid-cols-6 gap-2 mb-4">
                                    {iconOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setSelectedIcon(opt.icon); setCategoryImage(''); }} // Choose icon, clear image
                                            className={`p-2 rounded-xl flex items-center justify-center transition-all ${selectedIcon === opt.icon ? 'bg-[#FD6941] text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            title={opt.label}
                                        >
                                            <opt.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>

                                {/* Active Icon Preview */}
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${selectedIcon ? 'bg-orange-100 text-[#FD6941]' : 'bg-gray-100 text-gray-400'}`}>
                                        {ActiveIcon ? <ActiveIcon className="w-5 h-5" /> : <span className="text-[10px]">None</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Selected Icon</p>
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
                                className="w-full py-3 sm:py-4 rounded-full bg-[#FD6941] text-white text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all mt-4"
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
