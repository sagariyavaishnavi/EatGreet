// import { useState, useEffect } from 'react';
// import { Search, Plus, ListFilter, Trash2, Camera, User, Pizza, Coffee, Utensils, IceCream, Beef, Egg, Wine, Cake, Sandwich, ChevronRight, Pencil, CheckCircle, XCircle } from 'lucide-react';
// import { categoryAPI } from '../../utils/api';
// import toast from 'react-hot-toast';

// const ICON_MAP = {
//     Pizza: Pizza,
//     Coffee: Coffee,
//     Utensils: Utensils,
//     IceCream: IceCream,
//     Beef: Beef,
//     Egg: Egg,
//     Wine: Wine,
//     Cake: Cake,
//     Sandwich: Sandwich,
//     ListFilter: ListFilter
// };

// const iconOptions = Object.keys(ICON_MAP);

// const AdminCategory = () => {
//     const [categories, setCategories] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingCategory, setEditingCategory] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     // Form state
//     const [name, setName] = useState('');
//     const [selectedIcon, setSelectedIcon] = useState('Utensils');
//     const [status, setStatus] = useState('ACTIVE');

//     useEffect(() => {
//         fetchCategories();
//     }, []);

//     const fetchCategories = async () => {
//         setIsLoading(true);
//         try {
//             const response = await categoryAPI.getAll();
//             setCategories(response.data);
//         } catch (error) {
//             console.error('Error fetching categories:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleSave = async () => {
//         if (!name.trim()) {
//             toast.error('Please enter a category name');
//             return;
//         }

//         const loadToast = toast.loading(editingCategory ? 'Updating category...' : 'Creating category...');

//         try {
//             const categoryData = {
//                 name,
//                 icon: selectedIcon
//             };

//             if (editingCategory) {
//                 await categoryAPI.update(editingCategory._id, categoryData);
//                 toast.success('Category updated successfully!', { id: loadToast });
//             } else {
//                 await categoryAPI.create(categoryData);
//                 toast.success('Category created successfully!', { id: loadToast });
//             }

//             fetchCategories();
//             closeModal();
//         } catch (error) {
//             const errorMsg = error.response?.data?.message || error.message || 'Failed to save category';
//             toast.error(errorMsg, { id: loadToast });
//         }
//     };

//     const handleDelete = async (id) => {
//         toast((t) => (
//             <div className="flex flex-col gap-3">
//                 <p className="font-medium text-gray-800 text-sm">Delete this category? Items will become uncategorized.</p>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={async () => {
//                             toast.dismiss(t.id);
//                             try {
//                                 await categoryAPI.delete(id);
//                                 toast.success('Category deleted successfully!');
//                                 fetchCategories();
//                             } catch (error) {
//                                 toast.error('Failed to delete category');
//                             }
//                         }}
//                         className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
//                     >
//                         Delete
//                     </button>
//                     <button
//                         onClick={() => toast.dismiss(t.id)}
//                         className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
//                     >
//                         Cancel
//                     </button>
//                 </div>
//             </div>
//         ), { duration: 5000 });
//     };

//     const openModal = (cat = null) => {
//         if (cat) {
//             setEditingCategory(cat);
//             setName(cat.name);
//             setSelectedIcon(cat.icon || 'Utensils');
//         } else {
//             setEditingCategory(null);
//             setName('');
//             setSelectedIcon('Utensils');
//         }
//         setIsModalOpen(true);
//     };

//     const closeModal = () => {
//         setIsModalOpen(false);
//         setEditingCategory(null);
//     };

//     const filteredCategories = categories.filter(cat =>
//         cat.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//         <div className="space-y-6">
//             <div className="flex justify-between items-center">
//                 <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
//                 <button
//                     onClick={() => openModal()}
//                     className="bg-[#FD6941] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm"
//                 >
//                     <Plus className="w-5 h-5" />
//                     Add Category
//                 </button>
//             </div>

//             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">
//                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//                     <h2 className="text-xl font-bold text-gray-800">All Categories</h2>
//                     <div className="relative w-full md:w-80">
//                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                         <input
//                             type="text"
//                             placeholder="Search categories..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] transition-all"
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                     {filteredCategories.map((cat) => {
//                         const IconComponent = ICON_MAP[cat.icon] || Utensils;
//                         return (
//                             <div key={cat._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
//                                 <div className="flex justify-between items-start mb-4">
//                                     <div className="p-4 rounded-2xl bg-orange-50 text-[#FD6941]">
//                                         <IconComponent className="w-8 h-8" />
//                                     </div>
//                                     <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600">
//                                         ACTIVE
//                                     </span>
//                                 </div>
//                                 <h3 className="font-bold text-lg text-gray-800 mb-1">{cat.name}</h3>
//                                 <p className="text-sm text-gray-500 mb-6">Category for menu items</p>

//                                 <div className="flex items-center justify-between pt-4 border-t border-gray-50">
//                                     <div className="flex gap-2">
//                                         <button
//                                             onClick={() => openModal(cat)}
//                                             className="px-3 py-2 hover:bg-gray-100 rounded-xl text-gray-600 font-bold text-sm transition-colors flex items-center gap-1.5"
//                                         >
//                                             <Pencil className="w-3.5 h-3.5" />
//                                             Edit
//                                         </button>
//                                         <button
//                                             onClick={() => handleDelete(cat._id)}
//                                             className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>

//             {/* Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
//                         <div className="p-8 border-b border-gray-100">
//                             <h2 className="text-2xl font-bold text-gray-800">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
//                             <p className="text-gray-500 text-sm mt-1">Configure your menu category details</p>
//                         </div>

//                         <div className="p-8 space-y-6">
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Category Name</label>
//                                 <input
//                                     type="text"
//                                     value={name}
//                                     onChange={(e) => setName(e.target.value)}
//                                     className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none text-gray-800 text-sm font-bold focus:ring-1 focus:ring-[#FD6941] transition-all"
//                                     placeholder="e.g. Italian Pizza"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">Choose Icon</label>
//                                 <div className="grid grid-cols-5 gap-3">
//                                     {iconOptions.map((iconName) => {
//                                         const IconOpt = ICON_MAP[iconName];
//                                         return (
//                                             <button
//                                                 key={iconName}
//                                                 onClick={() => setSelectedIcon(iconName)}
//                                                 className={`p-3 rounded-2xl border transition-all flex items-center justify-center ${selectedIcon === iconName ? 'border-[#FD6941] bg-orange-50 text-[#FD6941]' : 'border-gray-100 hover:border-gray-200 text-gray-400'
//                                                     }`}
//                                             >
//                                                 <IconOpt className="w-6 h-6" />
//                                             </button>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="p-8 bg-gray-50 flex gap-4">
//                             <button
//                                 onClick={closeModal}
//                                 className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleSave}
//                                 className="flex-1 py-4 rounded-2xl font-bold bg-[#FD6941] text-white hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
//                             >
//                                 {editingCategory ? 'Update Category' : 'Create Category'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AdminCategory;


import { useState, useEffect } from 'react';
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
        // Note: Icon string to component mapping logic might be needed if backend stores icon name as string
        // For now assuming backend might not store icon, or we default. 
        // If backend stores 'Utensils', we need to map back. 
        // Simplification: just reset to default or keep current if valid.
        setSelectedIcon(Utensils);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!newCategoryName.trim()) return;

        try {
            // Find the label for the selected icon component
            const selectedOpt = iconOptions.find(opt => opt.icon === selectedIcon);
            const iconLabel = selectedOpt ? selectedOpt.label : 'Utensils';

            const categoryData = {
                name: newCategoryName,
                icon: iconLabel,
                status: newCategoryStatus ? 'ACTIVE' : 'INACTIVE'
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
        // Optimistic update or wait for API? Let's wait for API for safety.
        // Assuming current status.
        const cat = categories.find(c => c._id === id);
        if (!cat) return;

        const newStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await categoryAPI.update(id, { status: newStatus });
            toast.success('Status updated');
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

    const ActiveIcon = selectedIcon || Utensils;

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
                                {/* Top: Icon and Actions */}
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* SVG Icon Upload & Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Icon</label>

                                {/* Icon Selection Grid */}
                                <div className="grid grid-cols-6 gap-2 mb-4">
                                    {iconOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedIcon(opt.icon)} // We select the component for visual feedback
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
                                        <ActiveIcon className="w-5 h-5" />
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
                </div>
            )}
        </div>
    );
};

export default AdminCategory;
