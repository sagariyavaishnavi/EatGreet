import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
    Settings, Bell, Menu as MenuIcon, X, LogOut, ChevronDown, 
    ShoppingBag, Heart, ChefHat 
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import logo from '../assets/logo-full.png';

const DynamicNavbar = ({ customerProps }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { restaurantName: paramRestName } = useParams();
    const { user, logout } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    // Determine Role & View Type
    const role = user?.role || 'customer';
    const path = location.pathname;

    let viewType = 'CUSTOMER';
    if (path.startsWith('/super-admin')) viewType = 'SUPER_ADMIN';
    else if (path.includes('/admin') && role !== 'superadmin') viewType = 'ADMIN'; // Ensure superadmin doesn't see admin view by mistake
    else if (path.includes('/kitchen')) viewType = 'KITCHEN';
    
    // --- Admin Notification Logic ---
    const { 
        notifications, unreadCount, markAsRead, markAllRead, clearAll 
    } = useAdminNotifications();

    // --- Navigation Items ---
    const restaurantSlug = user?.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || paramRestName || 'restaurant';

    const getNavItems = () => {
        switch (viewType) {
            case 'SUPER_ADMIN':
                return [
                    { label: 'Dashboard', path: '/super-admin' },
                    { label: 'Restaurants', path: '/super-admin/restaurants' },
                    { label: 'Payment', path: '/super-admin/payments' },
                    { label: 'Reports', path: '/super-admin/reports' },
                    { label: 'Users', path: '/super-admin/users' },
                ];
            case 'ADMIN':
                return [
                    { label: 'Dashboard', path: `/${restaurantSlug}/admin` },
                    { label: 'Menu', path: `/${restaurantSlug}/admin/menu` },
                    { label: 'Category', path: `/${restaurantSlug}/admin/category` },
                    { label: 'Order', path: `/${restaurantSlug}/admin/orders` },
                    { label: 'Table', path: `/${restaurantSlug}/admin/table` },
                    { label: 'Sales', path: `/${restaurantSlug}/admin/sales` },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    const handleLogout = () => {
        logout();
        if (viewType === 'SUPER_ADMIN') navigate('/super-admin/login');
        else navigate('/admin/login');
    };

    const isActive = (path) => {
        return location.pathname === path || (path !== '/' && location.pathname.endsWith(path)) 
            ? 'bg-black text-white shadow-md' 
            : 'text-gray-500 hover:text-black hover:bg-gray-50';
    };

    // --- Customer Logic Helper ---
    // If we are in customer view, we rely on props passed from CustomerLayout because state is managed there.
    const { 
        cart, favorites, tableNo, setShowBill, totalItems, baseUrl 
    } = customerProps || {};

    // --- Render ---

    // 1. KITCHEN VIEW (Simplified)
    if (viewType === 'KITCHEN') {
        return (
            <nav className="bg-[#F5F5F5] px-10 py-8 flex justify-between items-center sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                    <img src="/nav-logo.svg" alt="EatGreet" className="h-10 w-auto" onError={(e) => e.target.src = logo} />
                </Link>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <button className="bg-white rounded-full pl-2 pr-6 py-2 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 transition-all hover:shadow-md group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 p-[2px] shadow-inner">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                     <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Kitchen'}&background=FD6941&color=fff`} alt="Kitchen" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-gray-800 tracking-tight">{user?.name || 'Kitchen'}</span>
                                <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                            </div>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    // 2. CUSTOMER VIEW
    if (viewType === 'CUSTOMER') {
        return (
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
                    <Link to={`${baseUrl}/menu`} className="flex items-center gap-2">
                        <img src={logo} alt="EatGreet" className="h-8 w-auto object-contain" />
                    </Link>

                    <div className="flex items-center gap-2 md:gap-4">
                        {tableNo && (
                            <div className="hidden md:flex items-center gap-1 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                                Table #{tableNo}
                            </div>
                        )}

                        <Link to={`${baseUrl}/favorites`} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group">
                            <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
                            {favorites && Object.keys(favorites).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FD6941] rounded-full text-[10px] text-white flex items-center justify-center border border-white">
                                    {Object.keys(favorites).length}
                                </span>
                            )}
                        </Link>

                        <button onClick={() => setShowBill && setShowBill(true)} className="relative p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                            <ShoppingBag className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border border-white">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>
        );
    }

    // 3. ADMIN & SUPER_ADMIN VIEW (Unified)
    return (
        <header className="px-4 sm:px-[30px] py-3 flex items-center justify-between sticky top-0 z-[100] bg-white/80 backdrop-blur-md transition-all border-b border-gray-100">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button
                    className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </button>

                <Link to={viewType === 'SUPER_ADMIN' ? '/super-admin' : `/${restaurantSlug}/admin`} className="block">
                    <img src={logo} alt="EatGreet" className="h-7 sm:h-9 w-auto object-contain" />
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 gap-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive(item.path)}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Settings Link */}
                <Link 
                    to={viewType === 'SUPER_ADMIN' ? '/super-admin/settings' : `/${restaurantSlug}/admin/settings`} 
                    className="w-9 h-9 sm:w-11 sm:h-11 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-100 text-gray-600 hover:text-black"
                >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>

                {/* Notifications (Admin Only) */}
                {viewType === 'ADMIN' && (
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="hidden sm:flex w-11 h-11 bg-white hover:bg-gray-50 rounded-full items-center justify-center transition-all shadow-sm border border-gray-100 text-gray-600 hover:text-black relative"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-medium text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        
                        {/* Notification Dropdown (Copied from AdminHeader) */}
                         {isNotificationOpen && (
                            <>
                              <div className="fixed inset-0 z-[100] bg-transparent" onClick={() => setIsNotificationOpen(false)}></div>
                              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[1.5rem] shadow-xl border border-gray-100 z-[101] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                  <h3 className="font-medium text-gray-800">Notifications</h3>
                                  {notifications.length > 0 && (
                                    <button onClick={clearAll} className="text-xs font-medium text-red-500 hover:text-red-600">Clear all</button>
                                  )}
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                  {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                      <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.read ? 'bg-orange-50/30' : ''}`}>
                                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${notif.type === 'newOrder' ? 'bg-green-100 text-green-600' : notif.type === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                          <Bell className="w-5 h-5 fill-current" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">{notif.title}</h4>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                                          </div>
                                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{notif.message}</p>
                                        </div>
                                        {!notif.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0"></div>}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3"><Bell className="w-6 h-6 text-gray-300" /></div>
                                      <p className="text-sm">No new notifications</p>
                                    </div>
                                  )}
                                </div>
                                {notifications.length > 0 && (
                                  <div className="p-3 border-t border-gray-50 bg-gray-50/30 text-center">
                                    <button onClick={markAllRead} className="text-xs font-medium text-gray-600 hover:text-black transition-colors">Mark all as read</button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                    </div>
                )}

                {/* Super Admin Notifications (Simplified) */}
                {viewType === 'SUPER_ADMIN' && (
                     <button className="w-11 h-11 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-100 text-gray-600 hover:text-black relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                )}

                {/* Profile / Logout */}
                <div className="relative group">
                    <div className="flex items-center gap-3 pl-1.5 pr-1.5 sm:pr-4 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-50">
                             <img src={`https://ui-avatars.com/api/?name=${user?.name || (viewType === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin')}&background=FD6941&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{user?.name || (viewType === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin')}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </div>
                    </div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
                        <Link 
                            to={viewType === 'SUPER_ADMIN' ? '/super-admin/profile' : `/${restaurantSlug}/admin/profile`} 
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <Settings className="w-4 h-4" /> Profile Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
             {isMenuOpen && (
                <>
                  <div className="fixed inset-0 top-[65px] bg-black/5 z-[90] lg:hidden" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-2xl p-4 lg:hidden animate-in slide-in-from-top-4 z-[100] ring-1 ring-black/5">
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`px-5 py-4 rounded-2xl text-[17px] font-medium transition-all ${isActive(item.path)}`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </>
              )}
        </header>
    );
};

export default DynamicNavbar;
