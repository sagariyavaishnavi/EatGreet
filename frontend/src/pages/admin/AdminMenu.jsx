import { useState, useEffect, useRef } from 'react';
import '@google/model-viewer';
import { createPortal } from 'react-dom';
import { Search, Filter, Plus, Pencil, Trash2, Image as ImageIcon, X, Upload, Eye, Box, Camera, Clock, Flame } from 'lucide-react';
import MediaSlider from '../../components/MediaSlider';
import { MENU_ITEMS_KEY } from '../../constants';
import { menuAPI, categoryAPI, uploadAPI, restaurantAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import { useSocket } from '../../context/SocketContext';

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
// Default mock data removed per live data requirement

const AdminMenu = () => {
    const { currencySymbol, user } = useSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [restaurantName, setRestaurantName] = useState('');
    const filterRef = useRef(null);

    const [catSearchTerm, setCatSearchTerm] = useState('');
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
    const catDropdownRef = useRef(null);

    // Close filter and category dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
            if (catDropdownRef.current && !catDropdownRef.current.contains(event.target)) {
                setIsCatDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Modal Form State
    const [mediaItems, setMediaItems] = useState([]); // Array of { name, size, url, type }
    const [modelItems, setModelItems] = useState([]); // Array of { name, size, url, type } for 3D models
    const [isActiveStatus, setIsActiveStatus] = useState(true);
    const [selectedLabels, setSelectedLabels] = useState(['Vegetarian']);

    // New Form State
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Main Course');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    // New Fields
    const [newItemCalories, setNewItemCalories] = useState('250');
    const [newItemTime, setNewItemTime] = useState('15-20');
    const [newItemIsVeg, setNewItemIsVeg] = useState(true);

    const removeMedia = (indexToRemove) => {
        setMediaItems(mediaItems.filter((_, index) => index !== indexToRemove));
    };

    const removeModel = (indexToRemove) => {
        setModelItems(modelItems.filter((_, index) => index !== indexToRemove));
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

            setMenuItems(Array.isArray(menuData) ? menuData : []);
            setCategories(Array.isArray(catData) ? catData : []);

            // Fetch Restaurant Details for Preview Link
            const { data: restData } = await restaurantAPI.getDetails();
            setRestaurantName(restData.name || 'restaurant');

        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load data');
            setMenuItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    const socket = useSocket();

    // Socket Listener for Real-Time Updates
    useEffect(() => {
        if (!socket || !user?.restaurantName) return;

        socket.emit('joinRestaurant', user.restaurantName);

        socket.on('menuUpdated', (payload) => {
            console.log("Real-time menu update received", payload.action);
            fetchData(); // Simple refresh for now
        });

        return () => socket.off('menuUpdated');
    }, [socket, user?.restaurantName]);

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


    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItemName(item.name);
        setNewItemCategory(item.category?._id || item.category);
        setNewItemPrice(item.price);
        setNewItemDescription(item.description);
        setNewItemCalories(item.calories ? item.calories.replace(/\s*kcal/i, '') : '250');
        setNewItemTime(item.time ? item.time.replace(/\s*min/i, '') : '15-20');
        setNewItemIsVeg(item.isVeg === undefined ? true : item.isVeg);
        setIsActiveStatus(item.isAvailable);
        setSelectedLabels(item.labels || []);

        // Separate media and models
        const existingMedia = item.media || (item.image ? [{ name: 'Image', url: item.image, type: 'image/jpeg' }] : []);
        setMediaItems(existingMedia);
        setModelItems(item.models || []);

        setIsModalOpen(true);
    };

    const handleFileSelection = async (e) => {
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
                `Only the first ${remainingSlots} file(s) will be added due to the 5-item limit.`,
                { icon: '⚠️' }
            );
            files = files.slice(0, remainingSlots);
        }

        const newItems = [];

        for (const file of files) {
            try {
                // Check if file is 3D model - reject it here as this is for images/videos
                if (file.name.match(/\.(glb|gltf|obj)$/i)) {
                    toast.error(`Please upload 3D models in the designated section.`);
                    continue;
                }

                // Check file size (100MB limit)
                if (file.size > 100 * 1024 * 1024) {
                    toast.error(`File ${file.name} exceeds 100MB limit`);
                    continue;
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
                        toast.error(`Video ${file.name} exceeds the 30-second limit`);
                        continue;
                    }
                }

                // Create Preview URL
                const previewUrl = URL.createObjectURL(file);

                newItems.push({
                    name: file.name,
                    url: previewUrl, // Temporary blob URL for preview
                    type: file.type,
                    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    file: file // Store actual file for later upload
                });

            } catch (error) {
                console.error("File selection error", error);
                toast.error(`Error processing ${file.name}`);
            }
        }

        setMediaItems(prev => [...prev, ...newItems].slice(0, 5));
    };

    const handleModelSelection = async (e) => {
        let files = Array.from(e.target.files);

        // Calculate remaining slots
        const maxSlots = 1;
        const remainingSlots = maxSlots - modelItems.length;

        if (remainingSlots <= 0) {
            toast.error("You have reached the maximum limit of 1 3D model.");
            return;
        }

        if (files.length > remainingSlots) {
            toast(
                `Only the first ${remainingSlots} model(s) will be added due to the 1-item limit.`,
                { icon: '⚠️' }
            );
            files = files.slice(0, remainingSlots);
        }

        const newItems = [];

        for (const file of files) {
            try {
                // Check 3D Model Extension
                const is3D = file.name.match(/\.(glb|gltf|obj)$/i);
                if (!is3D) {
                    toast.error(`File ${file.name} is not a supported 3D model.`);
                    continue;
                }

                // Create Preview URL
                const previewUrl = URL.createObjectURL(file);

                newItems.push({
                    name: file.name,
                    url: previewUrl, // Temporary blob URL for preview
                    type: is3D ? 'model/gltf-binary' : file.type, // Force model type for 3D files
                    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    file: file // Store actual file for later upload
                });

            } catch (error) {
                console.error("Model selection error", error);
                toast.error(`Error processing ${file.name}`);
            }
        }

        setModelItems(prev => [...prev, ...newItems].slice(0, 1));
    };

    const handleCaptureThumbnail = async (index) => {
        try {
            const viewer = document.getElementById(`model-viewer-${index}`);
            if (viewer) {
                const blob = await viewer.toBlob({ idealAspectRatio: true });
                const file = new File([blob], `model-thumb-${Date.now()}.png`, { type: 'image/png' });

                // Create Item for Media List
                const newItem = {
                    name: file.name,
                    url: URL.createObjectURL(file),
                    type: file.type,
                    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    file: file
                };

                // Add to media items (if space allows)
                setMediaItems(prev => {
                    if (prev.length >= 5) {
                        toast.error('Cannot add thumbnail: Media limit (5) reached.');
                        return prev;
                    }
                    return [newItem, ...prev]; // Add to front
                });
                toast.success('Snapshot captured and added to images!');
            }
        } catch (error) {
            console.error('Snapshot failed:', error);
            toast.error('Failed to capture snapshot.');
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
                            const previousItems = [...menuItems];
                            // Optimistic Update
                            setMenuItems(prev => prev.filter(item => item._id !== id));

                            try {
                                await menuAPI.delete(id);
                                toast.success('Item deleted successfully');
                            } catch (error) {
                                toast.error('Failed to delete item');
                                setMenuItems(previousItems); // Rollback
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

    const toggleStatus = async (id) => {
        const item = menuItems.find(i => i._id === id);
        if (!item) return;

        const newStatus = !item.isAvailable;
        const previousItems = [...menuItems];

        // Optimistic Update
        setMenuItems(prev => prev.map(i =>
            i._id === id ? { ...i, isAvailable: newStatus } : i
        ));

        try {
            await menuAPI.update(id, { isAvailable: newStatus });
            toast.success(`Item is now ${newStatus ? 'Available' : 'Unavailable'}`);
        } catch (error) {
            toast.error('Failed to update status');
            setMenuItems(previousItems); // Rollback
        }
    };



    const abortControllerRef = useRef(null); // Ref to hold the current upload controller
    const uploadedPublicIdsRef = useRef([]); // Track IDs for cleanup on cancel

    // Cancel uploads if component unmounts
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const resetForm = () => {
        // Abort any ongoing uploads
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // Cleanup orphaned files
        if (uploadedPublicIdsRef.current.length > 0) {
            const idsToClean = [...uploadedPublicIdsRef.current];
            uploadAPI.cleanupFiles(idsToClean).catch(err => console.error("Cleanup error", err));
            uploadedPublicIdsRef.current = [];
        }

        setMediaItems([]);
        setModelItems([]);
        setIsActiveStatus(true);
        setSelectedLabels([]);
        setNewItemName('');
        setNewItemCategory(categories.length > 0 ? categories[0]._id : '');
        setNewItemPrice('');
        setNewItemDescription('');
        setNewItemCalories('250');
        setNewItemTime('15-20');
        setNewItemIsVeg(true);
        setEditingItem(null);
    };

    const handleSave = async () => {
        if (!newItemName.trim() || !newItemPrice || !newItemCategory) {
            toast.error("Please fill in all required fields (Name, Category, Price).");
            return;
        }

        if (mediaItems.length === 0) {
            toast.error("Please upload at least one image.");
            return;
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        uploadedPublicIdsRef.current = []; // Reset tracking for this batch

        const loadToast = toast.loading('Initiating upload...', { duration: Infinity });

        try {
            // Count items that need uploading
            const filesToUploadIndices = mediaItems.map((item, idx) => item.file ? idx : -1).filter(idx => idx !== -1);
            const totalUploads = filesToUploadIndices.length;

            let uploadedCount = 0;
            const progressMap = {}; // idx -> percent

            if (totalUploads > 0) {
                toast.loading(`Uploading 0/${totalUploads} (0%)...`, { id: loadToast });
            }

            const uploadPromises = mediaItems.map(async (item, index) => {
                if (item.file) {
                    try {
                        const res = await uploadAPI.uploadDirectNew(item.file, (percent) => {
                            progressMap[index] = percent;

                            // Calculate Average
                            const currentTotal = Object.values(progressMap).reduce((a, b) => a + b, 0);
                            const avgAsync = Math.round(currentTotal / totalUploads);
                            const doneAsync = Object.values(progressMap).filter(p => p === 100).length;

                            toast.loading(`Uploading ${doneAsync}/${totalUploads} (${avgAsync}%)...`, { id: loadToast });

                        }, { signal });

                        uploadedCount++;

                        // Track ID for potential cleanup
                        if (res.data.public_id) {
                            uploadedPublicIdsRef.current.push(res.data.public_id);
                        }

                        return {
                            name: item.name,
                            url: res.data.secure_url,
                            type: item.type,
                            size: item.size
                        };
                    } catch (err) {
                        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                            throw err;
                        }
                        throw new Error(`Failed to upload ${item.name}`);
                    }
                } else {
                    return item;
                }
            });

            // Upload Logic for 3D Models
            const modelFilesToUploadIndices = modelItems.map((item, idx) => item.file ? idx : -1).filter(idx => idx !== -1);
            // We can reuse the total uploads concept or just do them in parallel with media
            // Simple approach: Concat promises

            const modelUploadPromises = modelItems.map(async (item, index) => {
                if (item.file) {
                    try {
                        const res = await uploadAPI.uploadDirectNew(item.file, null, { signal }, 'raw'); // Use 'raw' for 3D models to ensure compatibility

                        // Track ID for potential cleanup
                        if (res.data.public_id) {
                            uploadedPublicIdsRef.current.push(res.data.public_id);
                        }

                        return {
                            name: item.name,
                            url: res.data.secure_url,
                            type: item.type,
                            size: item.size
                        };
                    } catch (err) {
                        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') throw err;
                        throw new Error(`Failed to upload model ${item.name}`);
                    }
                } else {
                    return item;
                }
            });

            const finalMediaItems = await Promise.all(uploadPromises);
            const finalModelItems = await Promise.all(modelUploadPromises);

            // 2. Save Item Data
            toast.loading('Saving item details...', { id: loadToast });

            const itemData = {
                name: newItemName,
                category: newItemCategory,
                price: Number(newItemPrice),
                description: newItemDescription,
                calories: newItemCalories ? `${newItemCalories} kcal` : '',
                time: newItemTime ? `${newItemTime} min` : '',
                isVeg: newItemIsVeg,
                image: finalMediaItems.length > 0 ? finalMediaItems[0].url : '',
                isAvailable: isActiveStatus,
                labels: selectedLabels,
                media: finalMediaItems,
                models: finalModelItems
            };

            if (editingItem) {
                await menuAPI.update(editingItem._id, itemData);
                toast.success('Item updated successfully', { id: loadToast, duration: 2000 });
            } else {
                await menuAPI.create(itemData);
                toast.success('Item created successfully', { id: loadToast, duration: 2000 });
            }

            // Success! Clear cleanup tracking because these files are now valid/saved.
            uploadedPublicIdsRef.current = [];

            fetchData();
            setIsModalOpen(false);
            resetForm();

        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                toast.dismiss(loadToast);
                toast('Upload cancelled', { icon: '🛑' });
                // resetForm() will be called manually or via close, which cleans up files
                // But here we might want to ensure immediate cleanup?
                // resetForm is sufficient if we call it, or if we rely on handleCloseModal calling it.
                // But if error is cancellation, we usually came from abort() which means resetForm might have been called?
                // Actually handleSave logic runs AFTER abort if we cancel... wait.
                // If I click 'Cancel', handleCloseModal -> resetForm -> abort.
                // handleSave's await throws. Catch block runs.
                // We show 'Upload cancelled'.
                // resetForm (called by Cancel) already triggered cleanup of whatever was in ref.
                // But what if we just cancelled via some other way? Safe to call explicit cleanup here?
                // Yes, duplicate cleanup is harmless (idempotent-ish).

                if (uploadedPublicIdsRef.current.length > 0) {
                    const ids = [...uploadedPublicIdsRef.current];
                    uploadAPI.cleanupFiles(ids);
                    uploadedPublicIdsRef.current = [];
                }

            } else {
                console.error("Save Error", error);
                toast.error('Failed: ' + (error.message || 'Unknown error'), { id: loadToast });

                // On error (e.g. backend failed), we SHOULD cleanup the images we just uploaded.
                if (uploadedPublicIdsRef.current.length > 0) {
                    const ids = [...uploadedPublicIdsRef.current];
                    uploadAPI.cleanupFiles(ids); // Fire and forget
                    uploadedPublicIdsRef.current = [];
                }
            }
        } finally {
            abortControllerRef.current = null;
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
        setEditingItem(null);
        resetForm();
    };

    const handleCloseModal = () => {
        resetForm(); // Triggers abort logic and state cleanup
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4 relative">
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
                <h1 className="text-[20px] sm:text-[24px] lg:text-[30px] font-medium text-black tracking-tight leading-none">Menu Management</h1>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => {
                            if (restaurantName) {
                                const url = `${window.location.origin}/${encodeURIComponent(restaurantName)}/table/preview/menu`;
                                window.open(url, '_blank');
                            } else {
                                toast.error("Restaurant details not loaded yet");
                            }
                        }}
                        className="bg-white hover:bg-gray-50 text-gray-600 hover:text-black p-2.5 sm:p-3 rounded-full font-medium flex items-center justify-center gap-0 group/preview transition-all duration-300 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-sm overflow-hidden h-10 w-10 sm:h-12 sm:w-12 sm:hover:w-auto sm:hover:px-6 sm:hover:gap-2"
                        title="Preview"
                    >
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <span className="max-w-0 opacity-0 group-hover/preview:max-w-[120px] group-hover/preview:opacity-100 transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden hidden sm:block">
                            Preview
                        </span>
                    </button>
                    <button
                        onClick={openModal}
                        className="bg-[#FD6941] hover:bg-orange-600 text-white p-2.5 sm:p-3 rounded-full font-medium flex items-center justify-center gap-0 group transition-all duration-300 shadow-sm text-sm overflow-hidden h-10 w-10 sm:h-12 sm:w-12 sm:hover:w-auto sm:hover:px-6 sm:hover:gap-2"
                    >
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <span className="max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden hidden sm:block">
                            Add Item
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 shadow-sm border border-gray-100 min-h-[calc(100vh-12rem)]">

                {/* Filter and Search Bar */}
                <div className="flex flex-row items-center mb-5 gap-2 sm:gap-4 justify-between">
                    <h2 className="text-[14px] sm:text-[22px] font-medium text-black shrink-0">All Menu</h2>

                    <div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-end min-w-0">
                        <div className="relative flex-1 sm:flex-none max-w-[200px] sm:w-64">
                            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 sm:pl-12 pr-3 py-2 sm:py-3 bg-gray-50 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] transition-all"
                            />
                        </div>

                        {/* Custom Category Filter */}
                        <div className="relative shrink-0" ref={filterRef}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-2 sm:p-3 rounded-full transition-colors border ${selectedCategoryFilter ? 'bg-orange-50 border-[#FD6941] text-[#FD6941]' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                title="Filter Categories"
                            >
                                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4">

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
                            <h3 className="text-lg font-medium text-gray-800 mb-1">No items found</h3>
                            <p className="text-sm">Try adding a new item or changing filters.</p>
                        </div>
                    )}

                    {/* Menu Items */}
                    {!itemsLoading && filteredItems.map((item) => {
                        const catId = item.category?._id || item.category;
                        const catObj = categories.find(c => c._id === catId);
                        const categoryName = catObj ? catObj.name : 'Uncategorized';

                        return (
                            <div key={item._id} className="bg-white rounded-[1.5rem] sm:rounded-3xl p-2 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative flex flex-row sm:flex-col gap-2.5 sm:gap-0 h-[150px] sm:h-auto overflow-hidden">
                                {/* Image Container */}
                                <div className="relative w-32 sm:w-full h-full sm:h-52 shrink-0 rounded-[1.2rem] sm:rounded-2xl overflow-hidden sm:mb-1 bg-gray-50">
                                    <MediaSlider
                                        media={[...(item.models || []), ...(item.media || [])].length > 0 ? [...(item.models || []), ...(item.media || [])] : [{ url: item.image || 'https://via.placeholder.com/150', type: 'image/jpeg' }]}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Availability Tag */}
                                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-sm">
                                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-[8px] sm:text-[10px] font-medium text-gray-700 tracking-wide uppercase">{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                                    </div>

                                    {/* Veg/Non-Veg Symbol - Top Left */}
                                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 w-4 h-4 sm:w-5 sm:h-5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm p-0.5">
                                        <img
                                            src={item.isVeg ? vegIcon : nonVegIcon}
                                            alt={item.isVeg ? "Veg" : "Non-Veg"}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col pt-1 sm:pt-1.5 pr-1 sm:px-4 sm:pb-3">
                                    <div className="flex flex-col gap-0">
                                        <span className="text-[8px] sm:text-[10px] font-medium text-[#FD6941] tracking-wider uppercase leading-none mb-1">
                                            {categoryName}
                                        </span>

                                        <div className="flex justify-between items-start gap-1">
                                            <h3 className="font-medium text-gray-900 text-xs sm:text-lg leading-tight w-2/3 line-clamp-1 sm:line-clamp-none">{item.name || 'Unnamed'}</h3>
                                            <span className="font-medium text-sm sm:text-xl text-gray-900 whitespace-nowrap leading-tight">{currencySymbol}{item.price || 0}</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0 text-[8px] sm:text-[10px] font-medium text-gray-400 mt-1 mb-1">
                                            <span className="flex items-center gap-0.5">
                                                <Flame className="w-2 h-2 sm:w-3 sm:h-3 text-[#FD6941]" />
                                                {item.calories || '- kcal'}
                                            </span>
                                            <span className="flex items-center gap-0.5">
                                                <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                                                {item.time || '- min'}
                                            </span>
                                        </div>

                                        <p className="text-[9px] sm:text-xs text-gray-400 leading-tight line-clamp-2 mt-auto">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between pb-1 sm:pb-0">
                                        {/* Toggle Switch */}
                                        <div>
                                            <label className="relative inline-flex items-center cursor-pointer scale-90 sm:scale-100">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={item.isAvailable}
                                                    onChange={() => toggleStatus(item._id)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            </label>
                                        </div>

                                        <div className="flex gap-1.5 sm:gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="w-8 h-8 sm:w-8 sm:h-8 bg-gray-50 sm:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 sm:text-gray-500 hover:bg-black sm:hover:bg-gray-200 hover:text-white sm:hover:text-black transition-all shadow-sm sm:shadow-none border border-gray-100 sm:border-none"
                                            >
                                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="w-8 h-8 sm:w-8 sm:h-8 bg-gray-50 sm:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 sm:text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm sm:shadow-none border border-gray-100 sm:border-none"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Item Card */}
                    <div
                        onClick={openModal}
                        className="border-2 border-dashed border-gray-200 rounded-[1.5rem] sm:rounded-3xl p-2.5 sm:p-8 flex flex-row sm:flex-col items-center justify-center text-center cursor-pointer hover:border-[#FD6941] hover:bg-orange-50/10 transition-all h-[150px] sm:h-full group bg-gray-50 gap-3"
                    >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0">
                            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-[#FD6941]" />
                        </div>
                        <h3 className="font-medium text-base sm:text-lg text-gray-800">Add New Item</h3>
                    </div>

                </div>
            </div>

            {isModalOpen && createPortal(<>
                <div className="fixed inset-0 w-screen h-screen top-0 left-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-[99999] px-2">
                    <div className="fixed inset-0" onClick={handleCloseModal} />
                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-6xl h-[92vh] lg:h-auto lg:max-h-[95vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative z-10 flex flex-col">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200 text-gray-500 rounded-full transition-all duration-200 hover:rotate-90"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">

                                {/* Left Column: Media Upload */}
                                <div className="lg:col-span-4 bg-gray-50 p-4 sm:p-6 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
                                    <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2 sm:mb-4">Item Media</h3>
                                    <p className="text-xs sm:text-sm text-gray-400 mb-3">Add up to 5 images or videos.</p>

                                    {/* Uploaded Media Items Grid - or Empty State */}
                                    {mediaItems.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
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
                                                        <p className="text-xs text-white truncate">{media.name}</p>
                                                        <p className="text-[10px] text-gray-300">{media.size}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {mediaItems.length < 5 && (
                                                <div className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center bg-white aspect-square hover:border-[#FD6941] hover:bg-orange-50/10 transition-colors cursor-pointer">
                                                    <input
                                                        type="file"
                                                        id="file-upload-small"
                                                        className="hidden"
                                                        accept="image/*,video/*"
                                                        multiple
                                                        onChange={handleFileSelection}
                                                    />
                                                    <label htmlFor="file-upload-small" className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                                        <div className="bg-orange-100 rounded-full w-8 h-8 flex items-center justify-center text-[#FD6941] mb-2">
                                                            <ImageIcon className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="text-gray-800 font-medium text-xs mb-0.5">Add More</h4>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Large Empty State Board */
                                        <div className="border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-center bg-white w-full aspect-square hover:border-[#FD6941] hover:bg-orange-50/10 transition-colors cursor-pointer group">
                                            <input
                                                type="file"
                                                id="file-upload-large"
                                                className="hidden"
                                                accept="image/*,video/*"
                                                multiple
                                                onChange={handleFileSelection}
                                            />
                                            <label htmlFor="file-upload-large" className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                                <div className="bg-orange-50 rounded-full w-12 h-12 flex items-center justify-center text-[#FD6941] mb-3 group-hover:scale-110 transition-transform duration-300">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                                <h4 className="text-gray-800 font-medium text-base sm:text-lg mb-2">Upload Media</h4>
                                                <p className="text-sm text-gray-400 mb-6 max-w-[200px]">Browse images or videos</p>
                                                <span className="bg-[#FD6941] text-white px-6 py-2.5 rounded-full font-medium text-sm sm:text-base shadow-md shadow-orange-200 group-hover:shadow-lg group-hover:translate-y-[-2px] transition-all">
                                                    Select Files
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    {/* 3D Models Upload Section */}
                                    <div className="mt-4">
                                        <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2 sm:mb-4">3D Models</h3>
                                        <p className="text-xs sm:text-sm text-gray-400 mb-3">Add 3D model (.glb, .gltf, .obj).</p>

                                        {modelItems.length > 0 ? (
                                            <div className="flex flex-col gap-4">
                                                {modelItems.map((model, index) => (
                                                    <div key={index} className="relative group aspect-video bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                                                        <model-viewer
                                                            id={`model-viewer-${index}`}
                                                            src={model.url}
                                                            alt={model.name}
                                                            camera-controls
                                                            auto-rotate
                                                            ar
                                                            shadow-intensity="1"
                                                            style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb' }}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute top-2 right-2 flex gap-1 transform translate-y-[-10px] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleCaptureThumbnail(index);
                                                                }}
                                                                className="p-1.5 bg-white/90 text-blue-600 rounded-full shadow-sm hover:bg-blue-50"
                                                                title="Use as Item Image"
                                                            >
                                                                <Camera className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => removeModel(index)}
                                                                className="p-1.5 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50"
                                                                title="Remove Model"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <p className="text-xs text-white truncate">{model.name}</p>
                                                            <p className="text-[10px] text-gray-300">{model.size}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Small Add Button for Models */}
                                                {modelItems.length < 1 && (
                                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center bg-white aspect-square hover:border-[#FD6941] hover:bg-orange-50/10 transition-colors cursor-pointer">
                                                        <input
                                                            type="file"
                                                            id="model-upload-small"
                                                            className="hidden"
                                                            accept=".glb,.gltf,.obj"
                                                            onChange={handleModelSelection}
                                                        />
                                                        <label htmlFor="model-upload-small" className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                                            <div className="bg-orange-100 rounded-full w-8 h-8 flex items-center justify-center text-[#FD6941] mb-2">
                                                                <Box className="w-4 h-4" />
                                                            </div>
                                                            <h4 className="text-gray-800 font-medium text-xs mb-0.5">Add More</h4>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Large Empty State for Models */
                                            <div className="border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-center bg-white w-full aspect-video hover:border-[#FD6941] hover:bg-orange-50/10 transition-colors cursor-pointer group">
                                                <input
                                                    type="file"
                                                    id="model-upload-large"
                                                    className="hidden"
                                                    accept=".glb,.gltf,.obj"
                                                    onChange={handleModelSelection}
                                                />
                                                <label htmlFor="model-upload-large" className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                                    <div className="bg-orange-50 rounded-full w-12 h-12 flex items-center justify-center text-[#FD6941] mb-3 group-hover:scale-110 transition-transform duration-300">
                                                        <Box className="w-6 h-6" />
                                                    </div>
                                                    <h4 className="text-gray-800 font-medium text-base sm:text-lg mb-2">Upload 3D Model</h4>
                                                    <p className="text-sm text-gray-400 mb-6 max-w-[200px]">Browse .glb, .gltf files</p>
                                                    <span className="bg-[#FD6941] text-white px-6 py-2.5 rounded-full font-medium text-sm sm:text-base shadow-md shadow-orange-200 group-hover:shadow-lg group-hover:translate-y-[-2px] transition-all">
                                                        Select Models
                                                    </span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Form Details */}
                                <div className="lg:col-span-8 p-4 sm:p-6 lg:p-6 flex flex-col gap-4 sm:gap-6 h-full">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xl font-medium text-gray-800">Item Details</h3>
                                        <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden">
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Tandoor Burger"
                                                className="w-full px-5 py-3 rounded-full border border-gray-200 text-base focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                                value={newItemName}
                                                onChange={(e) => setNewItemName(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                                <div className="relative" ref={catDropdownRef}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                                                        className="w-full px-5 py-3 rounded-full border border-gray-200 text-base flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white cursor-pointer"
                                                    >
                                                        <span className={newItemCategory ? "text-gray-900" : "text-gray-400"}>
                                                            {newItemCategory
                                                                ? (categories.find(c => c._id === newItemCategory)?.name || "Select Category")
                                                                : "Select Category"}
                                                        </span>
                                                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </button>

                                                    {isCatDropdownOpen && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="p-3 border-b border-gray-50">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search category..."
                                                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FD6941] transition-all"
                                                                        value={catSearchTerm}
                                                                        onChange={(e) => setCatSearchTerm(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-60 overflow-y-auto no-scrollbar py-1">
                                                                {categories
                                                                    .filter(cat => cat.status !== 'INACTIVE' && cat.name.toLowerCase().includes(catSearchTerm.toLowerCase()))
                                                                    .map((cat) => (
                                                                        <button
                                                                            key={cat._id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setNewItemCategory(cat._id);
                                                                                setIsCatDropdownOpen(false);
                                                                                setCatSearchTerm('');
                                                                            }}
                                                                            className={`w-full text-left px-5 py-3 text-sm hover:bg-orange-50 transition-colors flex items-center justify-between ${newItemCategory === cat._id ? 'bg-orange-50 text-[#FD6941] font-medium' : 'text-gray-700'}`}
                                                                        >
                                                                            {cat.name}
                                                                            {newItemCategory === cat._id && (
                                                                                <svg className="w-4 h-4 text-[#FD6941]" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                {categories.filter(cat => cat.status !== 'INACTIVE' && cat.name.toLowerCase().includes(catSearchTerm.toLowerCase())).length === 0 && (
                                                                    <div className="px-5 py-4 text-center text-sm text-gray-400">
                                                                        No categories found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-base">{currencySymbol}</span>
                                                    <input
                                                        type="text"
                                                        placeholder="0.00"
                                                        className="w-full pl-9 pr-5 py-3 rounded-full border border-gray-200 text-base focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white"
                                                        value={newItemPrice}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                                setNewItemPrice(val);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="e.g 350"
                                                        className="w-full px-5 py-3 rounded-full border border-gray-200 text-base focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white pr-16"
                                                        value={newItemCalories}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                                            setNewItemCalories(val);
                                                        }}
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">kcal</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="e.g 15-20"
                                                        className="w-full px-5 py-3 rounded-full border border-gray-200 text-base focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white pr-14"
                                                        value={newItemTime}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9-]/g, '');
                                                            setNewItemTime(val);
                                                        }}
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">min</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Item Type (Veg / Non-Veg)</label>
                                            <div className="flex gap-4">
                                                <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${newItemIsVeg ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <input type="radio" name="isVeg" className="hidden" checked={newItemIsVeg} onChange={() => setNewItemIsVeg(true)} />
                                                    <div className="w-4 h-4 border-2 border-green-600 rounded-sm flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                    </div>
                                                    <span className="text-sm font-medium">Veg</span>
                                                </label>
                                                <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${!newItemIsVeg ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <input type="radio" name="isVeg" className="hidden" checked={!newItemIsVeg} onChange={() => setNewItemIsVeg(false)} />
                                                    <div className="w-4 h-4 border-2 border-red-600 rounded-sm flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                    </div>
                                                    <span className="text-sm font-medium">Non-Veg</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Describe the ingredients..."
                                                className="w-full px-5 py-3 rounded-2xl border border-gray-200 text-base focus:outline-none focus:ring-1 focus:ring-[#FD6941] focus:border-[#FD6941] transition-all bg-white resize-none"
                                                value={newItemDescription}
                                                onChange={(e) => setNewItemDescription(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="flex items-center justify-between py-1">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-800">Active Status</label>
                                                <p className="text-xs text-gray-400">Make this item visible on the menu</p>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Labels</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['Vegan', 'Gluten-Free', 'Spicy', 'Egg', 'Seafood', 'Dairy', 'Sugar-Free', 'Low-Calorie', 'Keto', 'Jain'].map((label) => (
                                                    <button
                                                        key={label}
                                                        onClick={() => toggleLabel(label)}
                                                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 
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
                                    </div>

                                    <div className="mt-auto pt-4 flex justify-end gap-3 border-t border-gray-100">
                                        <button
                                            onClick={handleCloseModal}
                                            className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 text-base font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-8 py-2.5 rounded-full bg-[#FD6941] text-white text-base font-medium shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-105 transition-all"
                                        >
                                            Save Item
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>, document.body)}


        </div >
    );
};

export default AdminMenu;
