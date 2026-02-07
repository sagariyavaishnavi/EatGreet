import React, { useState } from 'react';
import {
    User, Store, ClipboardList, CreditCard, Users,
    Bell, Activity, Save, Upload, Plus, Minus,
    MapPin, Clock, Calendar, FileText, CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, restaurantAPI, uploadAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

const AdminSettings = () => {
    const settings = useSettings();
    const user = settings?.user;
    const updateSettings = settings?.updateSettings;
    const [activeTab, setActiveTab] = useState('profile');
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

    if (!settings) return null;

    const [profile, setProfile] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        restaurantName: user?.restaurantName || '',
        city: user?.city || '',
        currency: user?.currency || 'INR',
        profilePicture: user?.profilePicture || ''
    });

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [restoDetails, setRestoDetails] = useState({
        name: user?.restaurantName || '',
        description: '',
        address: user?.restaurantDetails?.address || user?.city || '',
        contactNumber: user?.restaurantDetails?.contactNumber || user?.phone || '',
        gstNumber: user?.restaurantDetails?.gstNumber || '',
        logo: user?.restaurantDetails?.logo || '',
        cuisineType: user?.restaurantDetails?.cuisineType || '',
        businessEmail: user?.restaurantDetails?.businessEmail || user?.email || '',
        location: { lat: 23.0225, lng: 72.5714 },
        operatingHours: { open: '09:00', close: '23:00' }
    });

    const [orderPreferences, setOrderPreferences] = useState({
        acceptOrders: true,
        autoAccept: false,
        cancelEnabled: true,
        avgPrepTime: 25
    });

    const [bankDetails, setBankDetails] = useState({
        accountHolder: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        settlementCycle: 'Daily (T+1)'
    });

    const [notificationPreferences, setNotificationPreferences] = useState({
        newOrder: true,
        statusUpdates: true,
        lowStock: true,
        paymentReceived: true
    });

    const [staff, setStaff] = useState([]);
    const [newStaff, setNewStaff] = useState({ name: '', role: 'Chef', email: '' });

    const [uploadingLogo, setUploadingLogo] = useState(false);

    React.useEffect(() => {
        const fetchResto = async () => {
            try {
                const { data } = await restaurantAPI.getDetails();
                if (data) {
                    setRestoDetails({
                        name: data.name || user?.restaurantName || '',
                        description: data.description || '',
                        address: data.address || user?.city || '',
                        contactNumber: data.contactNumber || user?.phone || '',
                        gstNumber: data.gstNumber || '',
                        logo: data.logo || '',
                        cuisineType: data.cuisineType || '',
                        businessEmail: data.businessEmail || user?.email || '',
                        location: data.location || { lat: 23.0225, lng: 72.5714 },
                        operatingHours: data.operatingHours || { open: '09:00', close: '23:00' }
                    });
                    if (data.orderPreferences) setOrderPreferences(data.orderPreferences);
                    if (data.bankDetails) setBankDetails(data.bankDetails);
                    if (data.notificationPreferences) setNotificationPreferences(data.notificationPreferences);
                    if (data.staff) setStaff(data.staff);
                }
            } catch (err) {
                console.error("Failed to fetch resto details", err);
            }
        };
        fetchResto();
    }, []); // Only fetch once on mount to avoid overwriting edits

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));

        // Sync with restoDetails if it's the restaurant name or phone
        if (name === 'restaurantName') {
            setRestoDetails(prev => ({ ...prev, name: value }));
        }
        if (name === 'phone') {
            setRestoDetails(prev => ({ ...prev, contactNumber: value }));
        }

        // Live change: Update context immediately for currency selection
        if (name === 'currency') {
            updateSettings({ currency: value });
        }
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleRestoChange = (e) => {
        const { name, value } = e.target;
        setRestoDetails(prev => ({ ...prev, [name]: value }));

        // Sync with profile if it's the restaurant name or contact number
        if (name === 'name') {
            setProfile(prev => ({ ...prev, restaurantName: value }));
        }
        if (name === 'contactNumber') {
            setProfile(prev => ({ ...prev, phone: value }));
        }
    };

    const handleNestedChange = (category, field, value) => {
        if (category === 'location') {
            setRestoDetails(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
        } else if (category === 'hours') {
            setRestoDetails(prev => ({ ...prev, operatingHours: { ...prev.operatingHours, [field]: value } }));
        } else if (category === 'orders') {
            setOrderPreferences(prev => ({ ...prev, [field]: value }));
        } else if (category === 'bank') {
            setBankDetails(prev => ({ ...prev, [field]: value }));
        } else if (category === 'notifications') {
            setNotificationPreferences(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleAddStaff = () => {
        if (!newStaff.name) return toast.error("Staff name is required");
        setStaff(prev => [...prev, { ...newStaff, _id: Date.now().toString(), isActive: true }]);
        setNewStaff({ name: '', role: 'Chef', email: '' });
        toast.success("Staff added locally. Click 'Save Changes' to persist.");
    };

    const handleRemoveStaff = (id) => {
        setStaff(prev => prev.filter(s => s._id !== id));
        toast.success("Staff removed. Click 'Save Changes' to persist.");
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingLogo(true);
        const loadToast = toast.loading('Uploading logo...');
        try {
            const res = await uploadAPI.uploadDirect(file);
            const logoUrl = res.data.secure_url;
            setRestoDetails(prev => ({ ...prev, logo: logoUrl }));
            toast.success('Logo uploaded!', { id: loadToast });
        } catch (error) {
            toast.error('Logo upload failed', { id: loadToast });
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingProfilePic(true);
        const loadToast = toast.loading('Uploading profile picture...');
        try {
            const res = await uploadAPI.uploadDirect(file);
            const picUrl = res.data.secure_url;
            setProfile(prev => ({ ...prev, profilePicture: picUrl }));
            toast.success('Profile picture updated!', { id: loadToast });
        } catch (error) {
            toast.error('Upload failed', { id: loadToast });
        } finally {
            setUploadingProfilePic(false);
        }
    };

    const handleSaveProfile = async () => {
        const loadToast = toast.loading('Saving changes...');
        try {
            // Update Profile Info
            const profileResponse = await authAPI.updateProfile(profile);

            // Update Restaurant Details + New Settings
            const updatePayload = {
                ...restoDetails,
                orderPreferences,
                bankDetails,
                notificationPreferences,
                staff
            };
            const restoResponse = await restaurantAPI.updateDetails(updatePayload);

            // Password update if filled
            if (passwords.newPassword) {
                if (passwords.newPassword !== passwords.confirmPassword) {
                    toast.error('Passwords do not match', { id: loadToast });
                    return;
                }

                const currentPassword = window.prompt("Please enter your current password to confirm changes:");
                if (!currentPassword) {
                    toast.error('Current password is required to change password', { id: loadToast });
                    return;
                }

                await authAPI.updatePassword({
                    currentPassword,
                    newPassword: passwords.newPassword
                });
            }

            // Merge updated data for context
            const updatedUserData = {
                ...profileResponse.data,
                restaurantDetails: restoResponse.data.restaurantDetails || restoResponse.data // Backend might return it nested or spread
            };

            updateSettings(updatedUserData);
            toast.success('Settings updated successfully!', { id: loadToast });
            setPasswords({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings', { id: loadToast });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 pb-10 max-w-7xl mx-auto h-auto lg:h-[calc(100vh-6rem)]">

            {/* Sidebar / Tabs */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0 gap-2 lg:gap-6">
                    <div className="hidden lg:block lg:mb-4 px-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Management</h3>
                    </div>
                    <div className="flex lg:flex-col gap-1 sm:gap-2 min-w-max lg:min-w-0">
                        <SidebarItem
                            icon={User}
                            label="Profile"
                            isActive={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                        <SidebarItem
                            icon={Store}
                            label="Restaurant"
                            isActive={activeTab === 'restaurant'}
                            onClick={() => setActiveTab('restaurant')}
                        />
                        <SidebarItem
                            icon={ClipboardList}
                            label="Orders"
                            isActive={activeTab === 'orders'}
                            onClick={() => setActiveTab('orders')}
                        />
                        <SidebarItem
                            icon={CreditCard}
                            label="Subscription"
                            isActive={activeTab === 'subscription'}
                            onClick={() => setActiveTab('subscription')}
                        />
                        <SidebarItem
                            icon={FileText}
                            label="Payments"
                            isActive={activeTab === 'settlement'}
                            onClick={() => setActiveTab('settlement')}
                        />
                        <SidebarItem
                            icon={Users}
                            label="Staff"
                            isActive={activeTab === 'staff'}
                            onClick={() => setActiveTab('staff')}
                        />
                        <SidebarItem
                            icon={Bell}
                            label="Alerts"
                            isActive={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-[20px] sm:text-[24px] lg:text-[30px] font-medium text-black tracking-tight leading-none">
                            {activeTab === 'profile' && 'Admin Profile'}
                            {activeTab === 'restaurant' && 'Restaurant Details'}
                            {activeTab === 'orders' && 'Order Preferences'}
                            {activeTab === 'subscription' && 'Subscription Information'}
                            {activeTab === 'settlement' && 'Payment & Settlement'}
                            {activeTab === 'staff' && 'Staff Management'}
                            {activeTab === 'notifications' && 'Notification Preferences'}
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm">
                            {activeTab === 'profile' && 'Manage your personal account details'}
                            {activeTab === 'restaurant' && 'Update restaurant information and branding'}
                            {activeTab === 'orders' && 'Configure order acceptance and timing'}
                            {activeTab === 'subscription' && 'View your current plan and features'}
                            {activeTab === 'settlement' && 'Manage banking details and view payouts'}
                            {activeTab === 'staff' && 'Manage kitchen staff and permissions'}
                            {activeTab === 'notifications' && 'Customize your alert preferences'}
                        </p>
                    </div>
                    {activeTab !== 'subscription' && (
                        <button
                            onClick={handleSaveProfile}
                            className="bg-[#FD6941] hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full sm:w-auto text-sm sm:text-base"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    )}
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6 no-scrollbar">

                    {/* Admin Profile */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <SectionCard title="Personal Information" icon={User}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center relative">
                                            {profile.profilePicture ? (
                                                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-gray-400" />
                                            )}
                                            {uploadingProfilePic && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Activity className="w-4 h-4 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Profile Picture</h4>
                                            <p className="text-xs text-gray-500 mb-2">Upload a clear photo of yourself</p>
                                            <input
                                                type="file"
                                                id="profile-pic-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleProfilePicUpload}
                                            />
                                            <button
                                                onClick={() => document.getElementById('profile-pic-upload').click()}
                                                disabled={uploadingProfilePic}
                                                className="text-xs font-bold text-[#FD6941] hover:underline"
                                            >
                                                {uploadingProfilePic ? 'Uploading...' : 'Upload New'}
                                            </button>
                                        </div>
                                    </div>
                                    <InputGroup label="Full Name" name="name" value={profile.name} onChange={handleProfileChange} />
                                    <InputGroup label="Phone Number" name="phone" value={profile.phone} onChange={handleProfileChange} />
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Email (Read-Only)</label>
                                        <div className="w-full px-4 py-3 rounded-xl bg-gray-100 border-none text-gray-500 text-sm font-bold">
                                            {user.email || ""}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                                        <h4 className="font-bold text-gray-800 mb-4">Change Password</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputGroup label="New Password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} type="password" placeholder="••••••••" />
                                            <InputGroup label="Confirm Password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} type="password" placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Restaurant Details */}
                    {activeTab === 'restaurant' && (
                        <div className="space-y-6">
                            <SectionCard title="General Information" icon={Store}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 flex items-center gap-6 mb-2">
                                        <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center relative shadow-inner">
                                            {restoDetails.logo ? (
                                                <img src={restoDetails.logo} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Store className="w-8 h-8 text-gray-400" />
                                            )}
                                            {uploadingLogo && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                                    <Activity className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">Restaurant Logo</h4>
                                            <p className="text-sm text-gray-500 mb-3">Your logo will appear on menu and invoices</p>
                                            <input
                                                type="file"
                                                id="logo-upload-resto"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                            />
                                            <button
                                                onClick={() => document.getElementById('logo-upload-resto').click()}
                                                disabled={uploadingLogo}
                                                className="bg-gray-100 text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {uploadingLogo ? 'Uploading...' : 'Update Logo'}
                                            </button>
                                        </div>
                                    </div>
                                    <InputGroup label="Restaurant Name" name="name" value={restoDetails.name} onChange={handleRestoChange} />
                                    <InputGroup label="Cuisine Type" name="cuisineType" value={restoDetails.cuisineType} onChange={handleRestoChange} placeholder="e.g. Italian, Fast Food" />
                                    <InputGroup label="Contact Number" name="contactNumber" value={restoDetails.contactNumber} onChange={handleRestoChange} />
                                    <InputGroup label="Business Email" name="businessEmail" value={restoDetails.businessEmail} onChange={handleRestoChange} placeholder="business@example.com" />
                                    <InputGroup label="GST Number" name="gstNumber" value={restoDetails.gstNumber} onChange={handleRestoChange} />
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Currency</label>
                                        <div className="relative">
                                            <select
                                                name="currency"
                                                value={profile.currency}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-gray-800 text-sm font-bold focus:ring-0 focus:bg-white focus:shadow-sm transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="INR">INR (₹)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="JPY">JPY (¥)</option>
                                                <option value="AUD">AUD (A$)</option>
                                                <option value="CAD">CAD (C$)</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputGroup label="Address" name="address" value={restoDetails.address} onChange={handleRestoChange} />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Live Location" icon={MapPin}>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Latitude" name="lat" value={restoDetails.location.lat} onChange={(e) => handleNestedChange('location', 'lat', e.target.value)} />
                                            <InputGroup label="Longitude" name="lng" value={restoDetails.location.lng} onChange={(e) => handleNestedChange('location', 'lng', e.target.value)} />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Enter the precise coordinates of your restaurant to help customers seeking directions and for delivery optimization.
                                        </p>
                                    </div>

                                    {/* Mock Map */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Map Preview</label>
                                        <div className="h-48 bg-gray-100 rounded-2xl relative overflow-hidden border border-gray-100 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
                                            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-gray-600">Location Active</span>
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black">
                                                <MapPin className="w-8 h-8 fill-current drop-shadow-md" />
                                            </div>
                                            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                                                <button className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                                                <button className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Operating Hours" icon={Clock}>
                                <div className="grid grid-cols-2 gap-6">
                                    <InputGroup label="Opening Time" type="time" name="open" value={restoDetails.operatingHours.open} onChange={(e) => handleNestedChange('hours', 'open', e.target.value)} />
                                    <InputGroup label="Closing Time" type="time" name="close" value={restoDetails.operatingHours.close} onChange={(e) => handleNestedChange('hours', 'close', e.target.value)} />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Order Preferences */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <SectionCard title="Order Management" icon={ClipboardList}>
                                <div className="space-y-4">
                                    <ToggleItem
                                        title="Accept Orders"
                                        description="Enable receiving new orders from customers"
                                        enabled={orderPreferences.acceptOrders}
                                        onClick={() => handleNestedChange('orders', 'acceptOrders', !orderPreferences.acceptOrders)}
                                    />
                                    <ToggleItem
                                        title="Auto-Accept Orders"
                                        description="Automatically confirm incoming orders"
                                        enabled={orderPreferences.autoAccept}
                                        onClick={() => handleNestedChange('orders', 'autoAccept', !orderPreferences.autoAccept)}
                                    />
                                    <ToggleItem
                                        title="Enable Order Cancellation"
                                        description="Allow customers to cancel orders within a window"
                                        enabled={orderPreferences.cancelEnabled}
                                        onClick={() => handleNestedChange('orders', 'cancelEnabled', !orderPreferences.cancelEnabled)}
                                    />
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <InputGroup
                                        label="Average Preparation Time (Minutes)"
                                        type="number"
                                        value={orderPreferences.avgPrepTime}
                                        onChange={(e) => handleNestedChange('orders', 'avgPrepTime', parseInt(e.target.value))}
                                    />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Subscription Information */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-[#FD6941] to-orange-500 rounded-[2rem] p-8 text-white shadow-lg">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-orange-100 text-sm font-medium mb-1">Current Plan</p>
                                        <h2 className="text-3xl font-bold">Premium Enterprise</h2>
                                    </div>
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold border border-white/30">
                                        Active
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                    <div>
                                        <p className="text-orange-100 text-xs mb-1">Price</p>
                                        <p className="font-bold text-xl">$199<span className="text-sm font-normal text-orange-200">/mo</span></p>
                                    </div>
                                    <div>
                                        <p className="text-orange-100 text-xs mb-1">Expiry Date</p>
                                        <p className="font-bold text-xl">Dec 31, 2026</p>
                                    </div>
                                    <div>
                                        <p className="text-orange-100 text-xs mb-1">Next Billing</p>
                                        <p className="font-bold text-xl">Jan 01, 2027</p>
                                    </div>
                                </div>
                                <button className="bg-white text-[#FD6941] px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm">
                                    Renew / Upgrade Plan
                                </button>
                            </div>

                            <SectionCard title="Plan Features" icon={CheckCircle}>
                                <ul className="space-y-3">
                                    {['Unlimited Orders', 'Advanced Analytics', 'Priority Support', 'Custom Branding', 'Multiple Locations'].map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </SectionCard>
                        </div>
                    )}

                    {/* Payment & Settlement */}
                    {activeTab === 'settlement' && (
                        <div className="space-y-6">
                            <SectionCard title="Bank Account Details" icon={CreditCard}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Account Holder Name" value={bankDetails.accountHolder} onChange={(e) => handleNestedChange('bank', 'accountHolder', e.target.value)} />
                                    <InputGroup label="Account Number" value={bankDetails.accountNumber} onChange={(e) => handleNestedChange('bank', 'accountNumber', e.target.value)} />
                                    <InputGroup label="Bank Name" value={bankDetails.bankName} onChange={(e) => handleNestedChange('bank', 'bankName', e.target.value)} />
                                    <InputGroup label="IFSC / Swift Code" value={bankDetails.ifscCode} onChange={(e) => handleNestedChange('bank', 'ifscCode', e.target.value)} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Settlement Preferences" icon={Calendar}>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-gray-800">Settlement Cycle</h4>
                                        <p className="text-xs text-gray-500">How often payouts are processed</p>
                                    </div>
                                    <select
                                        value={bankDetails.settlementCycle}
                                        onChange={(e) => handleNestedChange('bank', 'settlementCycle', e.target.value)}
                                        className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-700 outline-none"
                                    >
                                        <option>Daily (T+1)</option>
                                        <option>Weekly (Monday)</option>
                                        <option>Monthly (1st)</option>
                                    </select>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Staff Management */}
                    {activeTab === 'staff' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 mb-6">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-black" /> Add New Staff
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <InputGroup placeholder="Name" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
                                    <InputGroup placeholder="Email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} />
                                    <div className="relative">
                                        <select
                                            value={newStaff.role}
                                            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-gray-800 text-sm font-bold outline-none appearance-none"
                                        >
                                            <option>Chef</option>
                                            <option>Captain</option>
                                            <option>Waiter</option>
                                            <option>Manager</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleAddStaff}
                                        className="bg-[#FD6941] text-white rounded-xl font-bold py-3 hover:bg-orange-600 transition-colors"
                                    >
                                        Add Staff
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {staff.length > 0 ? staff.map((member) => (
                                    <div key={member._id || member.name} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-orange-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-black">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{member.name}</h4>
                                                <p className="text-xs text-gray-500">{member.role} • {member.email || 'No email'} • {member.isActive ? 'Active' : 'Inactive'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleRemoveStaff(member._id)}
                                                className="text-xs font-bold text-red-400 hover:text-red-500 px-3 py-1 rounded-lg hover:bg-red-50"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-400 text-sm font-medium">No staff members added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notification Preferences */}
                    {
                        activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <SectionCard title="Alert Configuration" icon={Bell}>
                                    <div className="space-y-4">
                                        <ToggleItem
                                            title="New Order Alerts"
                                            description="Sound and popup for incoming orders"
                                            enabled={notificationPreferences.newOrder}
                                            onClick={() => handleNestedChange('notifications', 'newOrder', !notificationPreferences.newOrder)}
                                        />
                                        <ToggleItem
                                            title="Order Status Updates"
                                            description="Notify when order status changes"
                                            enabled={notificationPreferences.statusUpdates}
                                            onClick={() => handleNestedChange('notifications', 'statusUpdates', !notificationPreferences.statusUpdates)}
                                        />
                                        <ToggleItem
                                            title="Low Stock Alerts"
                                            description="Warn when inventory is running low"
                                            enabled={notificationPreferences.lowStock}
                                            onClick={() => handleNestedChange('notifications', 'lowStock', !notificationPreferences.lowStock)}
                                        />
                                        <ToggleItem
                                            title="Payment Received"
                                            description="Notify on successful payment"
                                            enabled={notificationPreferences.paymentReceived}
                                            onClick={() => handleNestedChange('notifications', 'paymentReceived', !notificationPreferences.paymentReceived)}
                                        />
                                    </div>
                                </SectionCard>
                            </div>
                        )
                    }



                </div >
            </div >
        </div >
    );
};

// Reusable Components
const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
            ? 'bg-[#FD6941] text-white shadow-md shadow-orange-200'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
        <span className="text-sm font-bold">{label}</span>
    </button>
);

const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gray-100 rounded-xl text-black">
                <Icon className="w-5 h-5 sm:w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">{title}</h3>
        </div>
        {children}
    </div>
);

const InputGroup = ({ label, value, onChange, name, type = "text", placeholder }) => (
    <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-gray-800 text-sm font-bold focus:ring-0 focus:bg-white focus:shadow-sm transition-all outline-none placeholder-gray-300"
        />
    </div>
);

const ToggleItem = ({ title, description, enabled, onClick }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div
            onClick={onClick}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${enabled ? 'bg-black' : 'bg-gray-200'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-200 ${enabled ? 'right-1' : 'left-1'}`}></div>
        </div>
    </div>
);

export default AdminSettings;
