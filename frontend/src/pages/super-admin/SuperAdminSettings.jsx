import React, { useState } from 'react';
import {
    Layout, CreditCard, Shield, Users,
    Bell, Activity, Lock, Database,
    Save, Upload, Eye, EyeOff, Plus, Trash2,
    CheckCircle, AlertCircle, Clock
} from 'lucide-react';

const SuperAdminSettings = () => {
    const [activeTab, setActiveTab] = useState('platform');
    const [showApiKey, setShowApiKey] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-10 max-w-7xl mx-auto h-[calc(100vh-6rem)]">

            {/* Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Global Settings</h3>
                    <div className="space-y-1">
                        <SidebarItem
                            icon={Layout}
                            label="Platform Settings"
                            isActive={activeTab === 'platform'}
                            onClick={() => setActiveTab('platform')}
                        />
                        <SidebarItem
                            icon={CreditCard}
                            label="Subscription & Plans"
                            isActive={activeTab === 'subscription'}
                            onClick={() => setActiveTab('subscription')}
                        />
                        <SidebarItem
                            icon={CreditCard}
                            label="Payment Gateway"
                            isActive={activeTab === 'payment'}
                            onClick={() => setActiveTab('payment')}
                        />
                        <SidebarItem
                            icon={Users}
                            label="User & Roles"
                            isActive={activeTab === 'users'}
                            onClick={() => setActiveTab('users')}
                        />
                        <SidebarItem
                            icon={Database}
                            label="System Config"
                            isActive={activeTab === 'system'}
                            onClick={() => setActiveTab('system')}
                        />
                        <SidebarItem
                            icon={Bell}
                            label="Notifications"
                            isActive={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                        />
                        <SidebarItem
                            icon={Shield}
                            label="Security & Logs"
                            isActive={activeTab === 'security'}
                            onClick={() => setActiveTab('security')}
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
                            {activeTab === 'platform' && 'Platform Settings'}
                            {activeTab === 'subscription' && 'Subscription & Plans'}
                            {activeTab === 'payment' && 'Payment Gateway'}
                            {activeTab === 'users' && 'User & Role Management'}
                            {activeTab === 'system' && 'System Configuration'}
                            {activeTab === 'notifications' && 'Notification Settings'}
                            {activeTab === 'security' && 'Security & Audit Logs'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {activeTab === 'platform' && 'Manage global branding and regional configurations'}
                            {activeTab === 'subscription' && 'Configure pricing tiers and plan features'}
                            {activeTab === 'payment' && 'Setup payment providers and API keys'}
                            {activeTab === 'users' && 'Manage administrator access and permissions'}
                            {activeTab === 'system' && 'Configure core system timeouts and limits'}
                            {activeTab === 'notifications' && 'Manage system-wide alerts and triggers'}
                            {activeTab === 'security' && 'Monitor security protocols and system activity'}
                        </p>
                    </div>
                    <button className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto pr-2 pb-6 space-y-6 no-scrollbar">

                    {/* Platform Settings */}
                    {activeTab === 'platform' && (
                        <div className="space-y-6">
                            <SectionCard title="Branding & Identity" icon={Layout}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Platform Name" defaultValue="EatGreet" />
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Platform Logo</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
                                                <Upload className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold text-gray-600 transition-colors">
                                                Upload New
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Regional Settings" icon={Clock}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Default Currency</label>
                                        <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-gray-700 text-sm font-bold focus:ring-0 cursor-pointer">
                                            <option>USD ($)</option>
                                            <option>EUR (€)</option>
                                            <option>INR (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Timezone</label>
                                        <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-gray-700 text-sm font-bold focus:ring-0 cursor-pointer">
                                            <option>UTC (GMT+00:00)</option>
                                            <option>EST (GMT-05:00)</option>
                                            <option>IST (GMT+05:30)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Date Format</label>
                                        <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-gray-700 text-sm font-bold focus:ring-0 cursor-pointer">
                                            <option>DD/MM/YYYY</option>
                                            <option>MM/DD/YYYY</option>
                                            <option>YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Subscription & Plans */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button className="flex items-center gap-2 text-[#FD6941] font-bold text-sm bg-orange-50 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors">
                                    <Plus className="w-4 h-4" /> Create New Plan
                                </button>
                            </div>

                            {/* Plan Card (Mock) */}
                            <SectionCard title="Active Plans" icon={CreditCard}>
                                <div className="space-y-4">
                                    <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-800">Premium Restaurant</h4>
                                                <p className="text-sm text-gray-500">Full access to all features</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">Active</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <InputGroup label="Monthly Price" defaultValue="$49.99" />
                                            <InputGroup label="Validity (Days)" defaultValue="30" />
                                            <InputGroup label="Grace Period (Days)" defaultValue="3" />
                                        </div>
                                        <div className="flex items-center justify-end gap-3">
                                            <button className="text-sm font-bold text-gray-500 hover:text-gray-700">Disable</button>
                                            <button className="text-sm font-bold text-[#FD6941] hover:text-orange-700">Edit Plan</button>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Payment Gateway */}
                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <SectionCard title="Provider Configuration" icon={CreditCard}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2">Payment Provider</label>
                                        <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-gray-700 text-sm font-bold focus:ring-0 cursor-pointer">
                                            <option>Stripe</option>
                                            <option>Razorpay</option>
                                            <option>PayPal</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end pb-3">
                                        <ToggleItem title="Test Mode (Sandbox)" description="Enable for testing payments" />
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-gray-100 pt-6">
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">API Key</label>
                                        <div className="relative">
                                            <input
                                                type={showApiKey ? "text" : "password"}
                                                defaultValue="pk_test_51Mz..."
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-gray-800 text-sm font-bold focus:ring-0"
                                            />
                                            <button
                                                onClick={() => setShowApiKey(!showApiKey)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <InputGroup label="Webhook Secret" defaultValue="whsec_..." />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* User & Role Management */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <SectionCard title="Role Definitions" icon={Users}>
                                <div className="space-y-3">
                                    {['Super Admin', 'Support Agent', 'Content Manager'].map((role) => (
                                        <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="font-bold text-gray-700">{role}</span>
                                            <button className="text-xs font-bold text-[#FD6941]">Manage Permissions</button>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard title="User Actions" icon={Lock}>
                                <div className="p-4 bg-orange-50 rounded-xl mb-4">
                                    <h4 className="font-bold text-orange-800 mb-1">Reset User Password</h4>
                                    <p className="text-xs text-orange-600 mb-3">Send a password reset link to a specific user.</p>
                                    <div className="flex gap-2">
                                        <input type="email" placeholder="Enter user email" className="flex-1 px-3 py-2 rounded-lg text-sm border-none focus:ring-1 focus:ring-orange-300" />
                                        <button className="px-4 py-2 bg-[#FD6941] text-white rounded-lg text-sm font-bold">Send Reset</button>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* System Configuration */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <SectionCard title="Timeouts & Limits" icon={Database}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Order Auto-Close (Minutes)" defaultValue="120" />
                                    <InputGroup label="Cancellation Window (Minutes)" defaultValue="5" />
                                    <InputGroup label="Session Timeout (Minutes)" defaultValue="30" />
                                    <InputGroup label="Max Login Attempts" defaultValue="5" />
                                    <InputGroup label="OTP Expiry (Seconds)" defaultValue="180" />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <SectionCard title="System Alerts" icon={Bell}>
                                <div className="space-y-4">
                                    <ToggleItem title="Email Notifications" description="Send system-wide emails" />
                                    <ToggleItem title="Payment Alerts" description="Notify on failed transactions" />
                                    <ToggleItem title="Order Alerts" description="Notify on new incoming orders" />
                                    <ToggleItem title="System Health Alerts" description="Notify on server downtime" />
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* Security & Audit Logs */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <SectionCard title="Access Control" icon={Shield}>
                                <div className="space-y-4">
                                    <ToggleItem title="Force Two-Factor Authentication (2FA)" description="Require 2FA for all admin accounts" />
                                    <button className="w-full py-3 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                        <Lock className="w-4 h-4" /> Force Logout All Users
                                    </button>
                                </div>
                            </SectionCard>

                            <SectionCard title="Recent Activity Logs" icon={Activity}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-bold">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Time</th>
                                                <th className="px-4 py-3">User</th>
                                                <th className="px-4 py-3">Action</th>
                                                <th className="px-4 py-3 rounded-r-lg">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            <tr>
                                                <td className="px-4 py-3 text-gray-500">10:42 AM</td>
                                                <td className="px-4 py-3 font-bold">superadmin</td>
                                                <td className="px-4 py-3 text-blue-500">Login</td>
                                                <td className="px-4 py-3 text-gray-400">Successful login from IP 192.168.1.1</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 text-gray-500">09:15 AM</td>
                                                <td className="px-4 py-3 font-bold">system</td>
                                                <td className="px-4 py-3 text-green-500">Backup</td>
                                                <td className="px-4 py-3 text-gray-400">Daily database backup completed</td>
                                            </tr>
                                        </tbody>
                                    </table>
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

const InputGroup = ({ label, defaultValue }) => (
    <div>
        <label className="block text-xs font-bold text-gray-400 mb-2">{label}</label>
        <input
            type="text"
            defaultValue={defaultValue}
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

export default SuperAdminSettings;
