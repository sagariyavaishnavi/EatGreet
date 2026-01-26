// import { useState, useEffect } from 'react';
// import { Search, Filter, Plus, Pencil, Trash2, Image as ImageIcon, X } from 'lucide-react';
// import MediaSlider from '../../components/MediaSlider';
// import { menuAPI, categoryAPI } from '../../utils/api';
// import toast from 'react-hot-toast';

// const AdminMenu = () => {
//     const [isTableLoading, setIsTableLoading] = useState(false);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');

//     // Modal Form State
//     const [mediaItems, setMediaItems] = useState([]);
//     const [isActiveStatus, setIsActiveStatus] = useState(true);
//     const [selectedLabels, setSelectedLabels] = useState(['Vegetarian']);

//     // New Form State
//     const [newItemName, setNewItemName] = useState('');
//     const [newItemCategory, setNewItemCategory] = useState('');
//     const [newItemPrice, setNewItemPrice] = useState('');
//     const [newItemDescription, setNewItemDescription] = useState('');
//     const [newItemCalories, setNewItemCalories] = useState('250 kcal');
//     const [newItemTime, setNewItemTime] = useState('15-20 min');
//     const [newItemIsVeg, setNewItemIsVeg] = useState(true);

//     const [categories, setCategories] = useState([]);
//     const [menuItems, setMenuItems] = useState([]);
//     const [editingItem, setEditingItem] = useState(null);

//     // Initial Load
//     useEffect(() => {
//         fetchData();
//     }, []);

//     const fetchData = async () => {
//         setIsTableLoading(true);
//         try {
//             const [menuRes, catRes] = await Promise.all([
//                 menuAPI.getAll(),
//                 categoryAPI.getAll()
//             ]);
//             setMenuItems(menuRes.data);
//             setCategories(catRes.data);
//             if (catRes.data.length > 0) {
//                 setNewItemCategory(catRes.data[0]._id);
//             }
//         } catch (error) {
//             console.error('Error fetching data:', error);
//         } finally {
//             setIsTableLoading(false);
//         }
//     };

//     const toggleStatus = async (id) => {
//         const item = menuItems.find(i => i._id === id);
//         try {
//             await menuAPI.update(id, { isAvailable: !item.isAvailable });
//             toast.success(`Item is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
//             fetchData();
//         } catch (error) {
//             toast.error('Failed to update status');
//         }
//     };

//     const handleEdit = (item) => {
//         setEditingItem(item);
//         setNewItemName(item.name);
//         setNewItemCategory(item.category?._id || item.category);
//         setNewItemPrice(item.price);
//         setNewItemDescription(item.description);
//         setNewItemCalories(item.calories || '250 kcal');
//         setNewItemTime(item.time || '15-20 min');
//         setNewItemIsVeg(item.isVeg === undefined ? true : item.isVeg);
//         setIsActiveStatus(item.isAvailable);
//         setSelectedLabels(item.labels || []);
//         setMediaItems(item.media || (item.image ? [{ name: 'Image', url: item.image, type: 'image/jpeg' }] : []));
//         setIsModalOpen(true);
//     };

//     const handleDelete = async (id) => {
//         toast((t) => (
//             <div className="flex flex-col gap-3">
//                 <p className="font-medium text-gray-800">Are you sure you want to delete this item?</p>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={async () => {
//                             toast.dismiss(t.id);
//                             try {
//                                 await menuAPI.delete(id);
//                                 toast.success('Item deleted successfully');
//                                 fetchData();
//                             } catch (error) {
//                                 toast.error('Failed to delete item');
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

//     const handleSave = async () => {
//         if (!newItemName.trim() || !newItemPrice || !newItemCategory) {
//             toast.error("Please fill in all required fields (Name, Category, Price).");
//             return;
//         }

//         const itemData = {
//             name: newItemName,
//             category: newItemCategory,
//             price: Number(newItemPrice),
//             description: newItemDescription,
//             calories: newItemCalories,
//             time: newItemTime,
//             isVeg: newItemIsVeg,
//             image: mediaItems.length > 0 ? mediaItems[0].url : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
//             isAvailable: isActiveStatus,
//             labels: selectedLabels,
//             media: mediaItems
//         };

//         const loadToast = toast.loading(editingItem ? 'Updating item...' : 'Creating item...');

//         try {
//             if (editingItem) {
//                 await menuAPI.update(editingItem._id, itemData);
//                 toast.success('Item updated successfully', { id: loadToast });
//             } else {
//                 await menuAPI.create(itemData);
//                 toast.success('Item created successfully', { id: loadToast });
//             }
//             fetchData();
//             setIsModalOpen(false);
//             setEditingItem(null);
//             resetForm();
//         } catch (error) {
//             toast.error('Failed to save item: ' + (error.response?.data?.message || error.message), { id: loadToast });
//         }
//     };

//     const toggleLabel = (label) => {
//         setSelectedLabels(prev =>
//             prev.includes(label)
//                 ? prev.filter(l => l !== label)
//                 : [...prev, label]
//         );
//     };

//     const removeMedia = (index) => {
//         setMediaItems(prev => prev.filter((_, i) => i !== index));
//     };

//     const handleFileUpload = (e) => {
//         const files = Array.from(e.target.files);
//         files.forEach(file => {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setMediaItems(prev => [...prev, { name: file.name, url: reader.result, type: file.type }].slice(0, 5));
//             };
//             reader.readAsDataURL(file);
//         });
//     };

//     const resetForm = () => {
//         setMediaItems([]);
//         setIsActiveStatus(true);
//         setSelectedLabels([]);
//         setNewItemName('');
//         setNewItemCategory('Main Course');
//         setNewItemPrice('');
//         setNewItemDescription('');
//         setNewItemCalories('250 kcal');
//         setNewItemTime('15-20 min');
//         setNewItemIsVeg(true);
//     };

//     const openModal = () => {
//         resetForm();
//         setEditingItem(null);
//         setIsModalOpen(true);
//     };

//     const filteredItems = menuItems.filter(item =>
//         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.category.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//         <div className="space-y-6 relative">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
//                 <button
//                     onClick={openModal}
//                     className="bg-[#FD6941] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 transition-colors shadow-sm"
//                 >
//                     <Plus className="w-5 h-5" />
//                     Add Menu
//                 </button>
//             </div>

//             {/* Main Content Area */}
//             <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">
//                 {/* Filter and Search Bar */}
//                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//                     <h2 className="text-xl font-bold text-gray-800">All Menu</h2>
//                     <div className="flex items-center gap-3 w-full md:w-auto">
//                         <div className="relative flex-1 md:w-80">
//                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Search menu..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] transition-all"
//                             />
//                         </div>
//                         <button className="p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
//                             <Filter className="w-5 h-5" />
//                         </button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
//                     {filteredItems.map((item) => (
//                         <div key={item._id} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
//                             {/* Image Container */}
//                             <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
//                                 <MediaSlider
//                                     media={item.media && item.media.length > 0 ? item.media : [{ url: item.image, type: 'image/jpeg' }]}
//                                 />
//                                 <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm z-10">
//                                     <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                                     <span className="text-[10px] font-bold text-gray-700 tracking-wide uppercase">{item.isAvailable ? 'Available' : 'Unavailable'}</span>
//                                 </div>
//                                 <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm z-10">
//                                     <div className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
//                                         <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Content */}
//                             <div className="space-y-2 px-1 flex-grow">
//                                 <span className="text-[10px] font-bold text-[#FD6941] tracking-wider uppercase">
//                                     {item.category?.name || 'Uncategorized'}
//                                 </span>
//                                 <div className="flex justify-between items-start">
//                                     <h3 className="font-bold text-gray-800 text-lg leading-tight w-2/3">{item.name}</h3>
//                                     <span className="font-bold text-xl text-gray-800">₹{item.price}</span>
//                                 </div>
//                                 <div className="flex gap-2 text-[10px] font-bold text-gray-400">
//                                     <span>{item.calories}</span>
//                                     <span>•</span>
//                                     <span>{item.time}</span>
//                                 </div>
//                                 <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 h-10">
//                                     {item.description}
//                                 </p>
//                             </div>

//                             {/* Actions Footer */}
//                             <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
//                                 <label className="flex items-center cursor-pointer">
//                                     <div className="relative">
//                                         <input
//                                             type="checkbox"
//                                             className="sr-only"
//                                             checked={item.isAvailable}
//                                             onChange={() => toggleStatus(item._id)}
//                                         />
//                                         <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${item.isAvailable ? 'bg-[#FD6941]' : 'bg-gray-300'}`}></div>
//                                         <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${item.isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
//                                     </div>
//                                 </label>
//                                 <div className="flex gap-2">
//                                     <button onClick={() => handleEdit(item)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
//                                         <Pencil className="w-4 h-4" />
//                                     </button>
//                                     <button onClick={() => handleDelete(item._id)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
//                                         <Trash2 className="w-4 h-4" />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}

//                     {/* Add New Item Card */}
//                     <div onClick={openModal} className="border-2 border-dashed border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all min-h-[350px] group bg-gray-50">
//                         <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
//                             <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-[#FD6941]" />
//                         </div>
//                         <h3 className="font-bold text-base sm:text-lg text-gray-800">Add New Item</h3>
//                     </div>
//                 </div>
//             </div>

//             {/* Modal */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
//                     <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[95vh]">
//                         <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
//                             <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
//                             <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//                                 <X className="w-6 h-6 text-gray-500" />
//                             </button>
//                         </div>

//                         <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto no-scrollbar">
//                             {/* Media Section */}
//                             <div className="lg:col-span-4 bg-gray-50 p-6 border-r border-gray-200">
//                                 <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Item Media</h3>
//                                 <div className="space-y-4">
//                                     <div className="grid grid-cols-2 gap-3">
//                                         {mediaItems.map((media, idx) => (
//                                             <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 group">
//                                                 <img src={media.url} alt="Media" className="w-full h-full object-cover" />
//                                                 <button onClick={() => removeMedia(idx)} className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
//                                                     <X className="w-3.5 h-3.5" />
//                                                 </button>
//                                             </div>
//                                         ))}
//                                         {mediaItems.length < 5 && (
//                                             <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all">
//                                                 <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
//                                                 <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
//                                                 <span className="text-[10px] font-bold text-gray-500">Add Media</span>
//                                             </label>
//                                         )}
//                                     </div>
//                                     <p className="text-[10px] text-gray-400 text-center">Max 5 images. Recommended 800x600px.</p>
//                                 </div>
//                             </div>

//                             {/* Details Section */}
//                             <div className="lg:col-span-8 p-6 space-y-4">
//                                 <div>
//                                     <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Item Name</label>
//                                     <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Spicy Paneer Tikka" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-[#FD6941] outline-none transition-all" />
//                                 </div>

//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Category</label>
//                                         <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-[#FD6941] outline-none transition-all appearance-none bg-white">
//                                             <option value="">Select Category</option>
//                                             {categories.map((cat) => (
//                                                 <option key={cat._id} value={cat._id}>{cat.name}</option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Price</label>
//                                         <div className="relative">
//                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
//                                             <input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-[#FD6941] outline-none" />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Calories</label>
//                                         <input type="text" value={newItemCalories} onChange={(e) => setNewItemCalories(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-[#FD6941] outline-none" />
//                                     </div>
//                                     <div>
//                                         <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Prep Time</label>
//                                         <input type="text" value={newItemTime} onChange={(e) => setNewItemTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-[#FD6941] outline-none" />
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Item Type</label>
//                                     <div className="flex gap-3">
//                                         <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${newItemIsVeg ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
//                                             <input type="radio" checked={newItemIsVeg} onChange={() => setNewItemIsVeg(true)} className="hidden" />
//                                             <div className="w-3 h-3 border border-green-600 rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div></div>
//                                             <span className="text-xs font-bold">Veg</span>
//                                         </label>
//                                         <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${!newItemIsVeg ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'}`}>
//                                             <input type="radio" checked={!newItemIsVeg} onChange={() => setNewItemIsVeg(false)} className="hidden" />
//                                             <div className="w-3 h-3 border border-red-600 rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div></div>
//                                             <span className="text-xs font-bold">Non-Veg</span>
//                                         </label>
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Description</label>
//                                     <textarea rows="3" value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-[#FD6941] outline-none resize-none" placeholder="Brief description of the item..."></textarea>
//                                 </div>

//                                 <div className="flex flex-wrap gap-2">
//                                     {['Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Chef Special'].map(lbl => (
//                                         <button key={lbl} onClick={() => toggleLabel(lbl)} className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all ${selectedLabels.includes(lbl) ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
//                                             {lbl}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
//                             <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-bold hover:bg-white transition-all">Cancel</button>
//                             <button onClick={handleSave} className="px-8 py-2.5 rounded-full bg-[#FD6941] text-white text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all">Save Item</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AdminMenu;


import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Plus, Pencil, Trash2, Image as ImageIcon, X, Upload, Eye } from 'lucide-react';
import MediaSlider from '../../components/MediaSlider';
import { MENU_ITEMS_KEY } from '../../constants';
import { menuAPI, categoryAPI, uploadAPI } from '../../utils/api';
import toast from 'react-hot-toast';

// Dietary Icons
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
    'Vegetarian': veganIcon, // reused plant icon
    'Non-Vegetarian': seafoodIcon, // reused seafood icon as proxy for meat
};

// Filter to make icons orange (#FD6941)
const orangeFilter = "brightness-0 saturate-100 invert(55%) sepia(85%) saturate(1600%) hue-rotate(335deg) brightness(101%) contrast(98%)";

// Default mock data if storage is empty
const DEFAULT_MENU_ITEMS = [
    {
        _id: '101',
        name: 'Truffle Mushroom Risotto',
        category: 'Main Course',
        price: 450,
        description: 'Creamy arborio rice cooked to perfection with mixed wild mushrooms, finished with premium black truffle oil and a crispy parmesan tuile.',
        calories: '420 kcal',
        time: '25-30 min',
        isVeg: true,
        rating: 4.8,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
        labels: ['Chef Special']
    },
    {
        _id: '102',
        name: 'Spicy Peri-Peri Chicken',
        category: 'Main Course',
        price: 380,
        description: 'Succulent chicken breast marinated for 24 hours in our house-special peri-peri spice blend, grilled over open flame and served with roasted veggies.',
        calories: '350 kcal',
        time: '20-25 min',
        isVeg: false,
        rating: 4.6,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
        labels: ['Spicy']
    },
    {
        _id: '103',
        name: 'Classic Gourmet Burger',
        category: 'Burgers',
        price: 299,
        description: 'A juicy handmade patty topped with melting sharp cheddar, caramelized onions, fresh lettuce, and our secret signature sauce on a toasted brioche bun.',
        calories: '550 kcal',
        time: '15-20 min',
        isVeg: false,
        rating: 4.9,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        labels: ['Bestseller']
    }
];

const AdminMenu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    // Close filter when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [itemsLoading, setItemsLoading] = useState(true);

    // Sync Helper: Removed complex sync logic for now to ensure stability. 
    // If you want offline sync, restore it later. For now, trust the API.

    const fetchData = async () => {
        setItemsLoading(true);
        try {
            const [menuRes, catRes] = await Promise.all([
                menuAPI.getAll(),
                categoryAPI.getAll()
            ]);

            // Check if response has data property (axios)
            const menuData = menuRes.data || [];
            const catData = catRes.data || [];

            setMenuItems((Array.isArray(menuData) && menuData.length > 0) ? menuData : DEFAULT_MENU_ITEMS);
            setCategories(Array.isArray(catData) ? catData : []);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load data');
            setMenuItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = menuItems;
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item => {
                const catName = typeof item.category === 'object' ? item.category?.name : item.category;
                return item.name.toLowerCase().includes(lowerTerm) ||
                    (catName && catName.toLowerCase().includes(lowerTerm));
            });
        }
        if (selectedCategoryFilter) {
            result = result.filter(item => {
                const catId = typeof item.category === 'object' ? item.category?._id : item.category;
                return catId === selectedCategoryFilter;
            });
        }
        setFilteredItems(result);
    }, [menuItems, searchTerm, selectedCategoryFilter]);
    const [editingItem, setEditingItem] = useState(null);

    const toggleStatus = async (id) => {
        const item = menuItems.find(i => i._id === id);
        if (!item) return;

        try {
            await menuAPI.update(id, { isAvailable: !item.isAvailable });
            toast.success(`Item is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItemName(item.name);
        setNewItemCategory(item.category?._id || item.category);
        setNewItemPrice(item.price);
        setNewItemDescription(item.description);
        setNewItemCalories(item.calories || '250 kcal');
        setNewItemTime(item.time || '15-20 min');
        setNewItemIsVeg(item.isVeg === undefined ? true : item.isVeg);
        setIsActiveStatus(item.isAvailable);
        setSelectedLabels(item.labels || []);
        setMediaItems(item.media || (item.image ? [{ name: 'Image', url: item.image, type: 'image/jpeg' }] : []));
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        let files = Array.from(e.target.files);

        // Calculate remaining slots
        const maxSlots = 5;
        const remainingSlots = maxSlots - mediaItems.length;

        if (remainingSlots <= 0) {
            toast.error("You have reached the maximum limit of 5 media items.");
            return;
        }

        if (files.length > remainingSlots) {
            toast(
                `Only the first ${remainingSlots} file(s) will be uploaded due to the 5-item limit.`,
                { icon: '⚠️' }
            );
            files = files.slice(0, remainingSlots);
        }

        const uploadToast = toast.loading(`Starting upload of ${files.length} media item(s)...`);
        let successCount = 0;
        let failCount = 0;

        try {
            const uploadPromises = files.map(async (file) => {
                try {
                    // Check file size (100MB limit)
                    if (file.size > 100 * 1024 * 1024) {
                        throw new Error(`File ${file.name} exceeds 100MB limit`);
                    }

                    // Check video duration (30s limit)
                    if (file.type.startsWith('video/')) {
                        const duration = await new Promise((resolve, reject) => {
                            const video = document.createElement('video');
                            video.preload = 'metadata';
                            video.onloadedmetadata = () => {
                                window.URL.revokeObjectURL(video.src);
                                resolve(video.duration);
                            };
                            video.onerror = () => reject(new Error("Invalid video file"));
                            video.src = window.URL.createObjectURL(file);
                        });

                        if (duration > 30) {
                            throw new Error(`Video ${file.name} exceeds the 30-second limit`);
                        }
                    }

                    // Direct Upload to Cloudinary with Progress
                    const res = await uploadAPI.uploadDirect(file, (percent) => {
                        toast.loading(`Uploading ${successCount}/${files.length} items...\n${file.name}: ${percent}%`, { id: uploadToast });
                    });

                    const newItem = {
                        name: file.name,
                        url: res.data.secure_url, // Cloudinary returns secure_url
                        type: file.type,
                        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
                    };

                    // Update state immediately upon success
                    setMediaItems(prev => [...prev, newItem].slice(0, 5));
                    successCount++;
                    toast.loading(`Uploaded ${successCount}/${files.length} media item(s)...`, { id: uploadToast });

                } catch (error) {
                    console.error('File Upload failed:', error);
                    failCount++;
                    toast.error(`Failed ${file.name}: ${error.message}`, { duration: 4000 });
                }
            });

            await Promise.all(uploadPromises);

            if (failCount === 0) {
                toast.success(`Successfully uploaded ${successCount} item(s)`, { id: uploadToast });
            } else {
                toast.error(`Completed with ${failCount} error(s)`, { id: uploadToast });
            }

        } catch (error) {
            console.error('Batch Upload Error:', error);
            toast.error('Unexpected error during upload', { id: uploadToast });
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-medium text-gray-800 text-sm">Delete this item?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await menuAPI.delete(id);
                                toast.success('Item deleted successfully');
                                fetchData();
                            } catch (error) {
                                toast.error('Failed to delete item');
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

    const handleSave = async () => {
        if (!newItemName.trim() || !newItemPrice || !newItemCategory) {
            toast.error("Please fill in all required fields (Name, Category, Price).");
            return;
        }

        const itemData = {
            name: newItemName,
            category: newItemCategory,
            price: Number(newItemPrice),
            description: newItemDescription,
            calories: newItemCalories,
            time: newItemTime,
            isVeg: newItemIsVeg,
            image: mediaItems.length > 0 ? mediaItems[0].url : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
            isAvailable: isActiveStatus,
            labels: selectedLabels,
            media: mediaItems
        };

        const loadToast = toast.loading(editingItem ? 'Updating item...' : 'Creating item...');

        try {
            if (editingItem) {
                await menuAPI.update(editingItem._id, itemData);
                toast.success('Item updated successfully', { id: loadToast });
            } else {
                await menuAPI.create(itemData);
                toast.success('Item created successfully', { id: loadToast });
            }
            fetchData();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error('Failed to save item: ' + (error.response?.data?.message || 'Error occurred'), { id: loadToast });
        }
    };

    const resetForm = () => {
        setMediaItems([]);
        setIsActiveStatus(true);
        setSelectedLabels([]);
        setNewItemName('');
        setNewItemCategory(categories.length > 0 ? categories[0]._id : '');
        setNewItemPrice('');
        setNewItemDescription('');
        setNewItemCalories('250 kcal');
        setNewItemTime('15-20 min');
        setNewItemIsVeg(true);
        setEditingItem(null);
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
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors shadow-sm text-sm"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>
                    <button
                        onClick={openModal}
                        className="bg-[#FD6941] hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors shadow-sm text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">All Menu</h2>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] transition-all"
                            />
                        </div>

                        {/* Custom Category Filter */}
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-3 rounded-full transition-colors border ${selectedCategoryFilter ? 'bg-orange-50 border-[#FD6941] text-[#FD6941]' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                title="Filter Categories"
                            >
                                <Filter className="w-5 h-5" />
                            </button>

                            {/* Dropdown */}
                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                                        <button
                                            onClick={() => {
                                                setSelectedCategoryFilter('');
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${selectedCategoryFilter === '' ? 'text-[#FD6941] bg-orange-50/50' : 'text-gray-700'}`}
                                        >
                                            All Categories
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat._id}
                                                onClick={() => {
                                                    setSelectedCategoryFilter(cat._id);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${selectedCategoryFilter === cat._id ? 'text-[#FD6941] bg-orange-50/50' : 'text-gray-700'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">

                    {/* Menu Items */}
                    {/* Loading State */}
                    {itemsLoading && (
                        <div className="col-span-full flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD6941]"></div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!itemsLoading && filteredItems.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">No items found</h3>
                            <p className="text-sm">Try adding a new item or changing filters.</p>
                        </div>
                    )}

                    {/* Menu Items */}
                    {!itemsLoading && filteredItems.map((item) => {
                        const catId = item.category?._id || item.category;
                        const catObj = categories.find(c => c._id === catId);
                        const categoryName = catObj ? catObj.name : 'Uncategorized';

                        return (
                            <div key={item._id} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                                {/* Image Container */}
                                <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                                    <MediaSlider
                                        media={item.media && item.media.length > 0 ? item.media : [{ url: item.image || 'https://via.placeholder.com/150', type: 'image/jpeg' }]}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Availability Tag */}
                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                        <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-[10px] font-bold text-gray-700 tracking-wide uppercase">{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                                    </div>

                                    {/* Veg/Non-Veg Symbol - Top Left */}
                                    <div className="absolute top-3 left-3 z-10 w-5 h-5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm p-0.5">
                                        <img
                                            src={item.isVeg ? vegIcon : nonVegIcon}
                                            alt={item.isVeg ? "Veg" : "Non-Veg"}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                </div>

                                {/* Content */}
                                <div className="space-y-2 px-1">
                                    <span className="text-[10px] font-bold text-[#FD6941] tracking-wider uppercase">
                                        {categoryName}
                                    </span>

                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800 text-lg leading-tight w-2/3">{item.name || 'Unnamed'}</h3>
                                        <span className="font-bold text-xl text-gray-800">₹{item.price || 0}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold text-gray-400">
                                        <span>{item.calories || '- kcal'}</span>
                                        <span>•</span>
                                        <span>{item.time || '- min'}</span>

                                        {/* Dietary Labels in Description */}
                                        {item.labels && item.labels.length > 0 && (
                                            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-gray-200">
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
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 h-10">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    {/* Toggle Switch */}
                                    <div>
                                        <label className="flex items-center cursor-pointer relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={item.isAvailable}
                                                onChange={() => toggleStatus(item._id)}
                                            />
                                            <div className="block w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-[#FD6941] transition-colors duration-300"></div>
                                            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${item.isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
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
                                            onClick={() => handleDelete(item._id)}
                                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Item Card */}
                    <div
                        onClick={openModal}
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
                                        <div className={`border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center bg-white aspect-square hover:border-[#FD6941] hover:bg-orange-50/10 transition-colors cursor-pointer ${mediaItems.length === 0 ? 'col-span-2 aspect-auto min-h-[120px] sm:min-h-[180px]' : ''}`}>
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept="image/*,video/*"
                                                multiple
                                                onChange={handleFileUpload}
                                            />
                                            <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
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
                                                className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white appearance-none cursor-pointer"
                                                value={newItemCategory}
                                                onChange={(e) => setNewItemCategory(e.target.value)}
                                            >
                                                <option value="" disabled>Select Category</option>
                                                {categories
                                                    .filter(cat => cat.status !== 'INACTIVE')
                                                    .map((cat) => (
                                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                    ))}
                                                {categories.length === 0 && <option value="">No categories found</option>}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Price</label>
                                        <div className="relative">
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
                                        {['Vegan', 'Gluten-Free', 'Spicy', 'Egg', 'Seafood', 'Dairy', 'Sugar-Free', 'Low-Calorie', 'Keto', 'Jain'].map((label) => (
                                            <button
                                                key={label}
                                                onClick={() => toggleLabel(label)}
                                                className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all flex items-center gap-1.5 
                                                    ${selectedLabels.includes(label)
                                                        ? 'border-[#FD6941] text-[#FD6941] bg-orange-50'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {dietaryIcons[label] && (
                                                    <img
                                                        src={dietaryIcons[label]}
                                                        alt={label}
                                                        className="w-3 h-3"
                                                        style={!['Spicy', 'Vegan'].includes(label) ? { filter: orangeFilter } : {}}
                                                    />
                                                )}
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

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

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="relative w-full max-w-[380px] h-[80vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-900 flex flex-col">
                        {/* Phone Notch/Header */}
                        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FD6941] font-bold text-xs">EG</div>
                                <span className="font-bold text-gray-800 text-sm">EatGreet</span>
                            </div>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Phone Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
                            {/* Hero/Banner Area */}
                            <div className="h-40 bg-[#FD6941] relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <h2 className="font-bold text-xl">Delicious Menu</h2>
                                    <p className="text-xs opacity-90">Fresh & Hot</p>
                                </div>
                            </div>

                            {/* Menu List */}
                            <div className="p-4 space-y-6">
                                {categories.map(cat => {
                                    const catItems = menuItems.filter(item => {
                                        const cId = item.category?._id || item.category;
                                        return cId === cat._id && item.isAvailable;
                                    });

                                    if (catItems.length === 0) return null;

                                    return (
                                        <div key={cat._id} className="space-y-3">
                                            <h3 className="font-bold text-gray-800 text-lg sticky top-0 bg-gray-50 py-2 z-0">{cat.name}</h3>
                                            <div className="space-y-4">
                                                {catItems.map(item => (
                                                    <div key={item._id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
                                                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={item.image || (item.media && item.media[0]?.url) || 'https://via.placeholder.com/150'}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <h4 className="font-bold text-gray-800 text-sm truncate pr-2">{item.name}</h4>
                                                                <div className={`w-3 h-3 border border-gray-300 rounded-[2px] flex items-center justify-center flex-shrink-0 mt-0.5 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 mb-2">{item.description}</p>
                                                            <div className="flex justify-between items-end">
                                                                <span className="font-bold text-gray-800 text-sm">₹{item.price}</span>
                                                                <button className="px-3 py-1 bg-orange-50 text-[#FD6941] text-[10px] font-bold rounded-full uppercase">Add</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Phone Footer/Nav */}
                        <div className="bg-white px-6 py-3 border-t border-gray-100 flex justify-around text-gray-400">
                            <div className="flex flex-col items-center gap-1 text-[#FD6941]">
                                <div className="w-5 h-5 rounded-full bg-orange-100"></div>
                                <span className="text-[9px] font-bold">Home</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-5 h-5 rounded-full bg-gray-100"></div>
                                <span className="text-[9px]">Cart</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsPreviewOpen(false)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminMenu;
