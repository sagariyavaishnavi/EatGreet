import React, { useState } from 'react';
import {
    User, Store, ClipboardList, CreditCard, Users,
    Bell, Activity, Save, Upload, Plus, Minus,
    MapPin, Clock, Calendar, FileText, CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

const AdminSettings = () => {
    const { user, updateSettings } = useSettings();
    const [activeTab, setActiveTab] = useState('profile');

    const [profile, setProfile] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        restaurantName: user?.restaurantName || '',
        city: user?.city || '',
        currency: user?.currency || 'INR'
    });

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));

        // Live change: Update context immediately for currency selection
        if (name === 'currency') {
            updateSettings({ currency: value });
        }
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        const loadToast = toast.loading('Saving changes...');
        try {
            // Update Profile Info
            const profileResponse = await authAPI.updateProfile(profile);

            // Password update if filled
            if (passwords.newPassword) {
                if (passwords.newPassword !== passwords.confirmPassword) {
                    toast.error('Passwords do not match', { id: loadToast });
                    return;
                }

                // For a real app, we need current password. 
                // Since we don't have a field for it here yet, let's warn if we can't do it.
                // But let's assume we allow super admin or we added the field.
                // Let's add a prompt for current password if they try to change it.
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

            updateSettings(profileResponse.data);
            toast.success('Settings updated successfully!', { id: loadToast });
            setPasswords({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings', { id: loadToast });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-10 max-w-7xl mx-auto h-[calc(100vh-6rem)]">

            {/* Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Management</h3>
                    <div className="space-y-1">
                        <SidebarItem
                            icon={User}
                            label="Admin Profile"
                            isActive={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                        <SidebarItem
                            icon={Store}
                            label="Restaurant Details"
                            isActive={activeTab === 'restaurant'}
                            onClick={() => setActiveTab('restaurant')}
                        />
                        <SidebarItem
                            icon={ClipboardList}
                            label="Order Preferences"
                            isActive={activeTab === 'orders'}
                            onClick={() => setActiveTab('orders')}
                        />
                        <SidebarItem
                            icon={CreditCard}
                            label="Subscription Info"
                            isActive={activeTab === 'subscription'}
                            onClick={() => setActiveTab('subscription')}
                        />
                        <SidebarItem
                            icon={FileText}
                            label="Payment & Settlement"
                            isActive={activeTab === 'settlement'}
                            onClick={() => setActiveTab('settlement')}
                        />
                        <SidebarItem
                            icon={Users}
                            label="Staff Management"
                            isActive={activeTab === 'staff'}
                            onClick={() => setActiveTab('staff')}
                        />
                        <SidebarItem
                            icon={Bell}
                            label="Notifications"
                            isActive={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                        />

                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {activeTab === 'profile' && 'Admin Profile'}
                            {activeTab === 'restaurant' && 'Restaurant Details'}
                            {activeTab === 'orders' && 'Order Preferences'}
                            {activeTab === 'subscription' && 'Subscription Information'}
                            {activeTab === 'settlement' && 'Payment & Settlement'}
                            {activeTab === 'staff' && 'Staff Management'}
                            {activeTab === 'notifications' && 'Notification Preferences'}
                        </h1>
                        <p className="text-gray-500 text-sm">
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
                            className="bg-[#FD6941] hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
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
                                        <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Profile Picture</h4>
                                            <p className="text-xs text-gray-500 mb-2">Upload a clear photo of yourself</p>
                                            <button className="text-xs font-bold text-[#FD6941]">Upload New</button>
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
                                    <InputGroup label="Restaurant Name" name="restaurantName" value={profile.restaurantName} onChange={handleProfileChange} />
                                    <InputGroup label="Cuisine Type" defaultValue="Multi-Cuisine" />
                                    <InputGroup label="Contact Number" name="phone" value={profile.phone} onChange={handleProfileChange} />
                                    <InputGroup label="Business Email" defaultValue={user.email || ""} />
                                    <InputGroup label="GST Number" defaultValue="" />
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
                                        <InputGroup label="Address" name="city" value={profile.city} onChange={handleProfileChange} />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Live Location" icon={MapPin}>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="Latitude" defaultValue="23.0225" />
                                            <InputGroup label="Longitude" defaultValue="72.5714" />
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
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FD6941]">
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
                                    <InputGroup label="Opening Time" type="time" defaultValue="09:00" />
                                    <InputGroup label="Closing Time" type="time" defaultValue="23:00" />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Order Preferences */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <SectionCard title="Order Management" icon={ClipboardList}>
                                <div className="space-y-4">
                                    <ToggleItem title="Accept Orders" description="Enable receiving new orders from customers" />
                                    <ToggleItem title="Auto-Accept Orders" description="Automatically confirm incoming orders" />
                                    <ToggleItem title="Enable Order Cancellation" description="Allow customers to cancel orders within a window" />
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <InputGroup label="Average Preparation Time (Minutes)" defaultValue="25" />
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
                                    <InputGroup label="Account Holder Name" defaultValue="EatGreet Pvt Ltd" />
                                    <InputGroup label="Account Number" defaultValue="•••• •••• •••• 8899" />
                                    <InputGroup label="Bank Name" defaultValue="HDFC Bank" />
                                    <InputGroup label="IFSC / Swift Code" defaultValue="HDFC0001234" />
                                </div>
                            </SectionCard>

                            <SectionCard title="Settlement Preferences" icon={Calendar}>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-gray-800">Settlement Cycle</h4>
                                        <p className="text-xs text-gray-500">How often payouts are processed</p>
                                    </div>
                                    <select className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-700">
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
                            <div className="flex justify-end">
                                <button className="bg-[#FD6941] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm">
                                    <Plus className="w-4 h-4" /> Add New Staff
                                </button>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((staff) => (
                                    <div key={staff} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">KS</div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">Kitchen Staff {staff}</h4>
                                                <p className="text-xs text-gray-500">Chef • Active</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-xs font-bold text-gray-400 hover:text-gray-600">Edit</button>
                                            <button className="text-xs font-bold text-red-400 hover:text-red-500">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notification Preferences */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <SectionCard title="Alert Configuration" icon={Bell}>
                                <div className="space-y-4">
                                    <ToggleItem title="New Order Alerts" description="Sound and popup for incoming orders" />
                                    <ToggleItem title="Order Status Updates" description="Notify when order status changes" />
                                    <ToggleItem title="Low Stock Alerts" description="Warn when inventory is running low" />
                                    <ToggleItem title="Payment Received" description="Notify on successful payment" />
                                </div>
                            </SectionCard>
                        </div>
                    )}



                </div>
            </div>
        </div>
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
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-50 rounded-xl text-[#FD6941]">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
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

const ToggleItem = ({ title, description }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="w-12 h-6 bg-[#FD6941] rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
        </div>
    </div>
);

export default AdminSettings;
