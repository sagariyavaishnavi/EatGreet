import React, { useState, useEffect } from 'react';
import { Bell, Settings, Menu, X, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

import logo from '../../assets/logo-full.png';

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();

  // Safe user data parsing
  const getUserData = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Error parsing user data in header", e);
      return null;
    }
  };

  const user = getUserData();
  const restaurantSlug = user?.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || 'restaurant';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    // Exact match or matches if it ignores the dynamic slug part
    return location.pathname === path || (path !== '/' && location.pathname.endsWith(path)) ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black hover:bg-gray-50';
  };

  const navItems = [
    { label: 'Dashboard', path: `/${restaurantSlug}/admin` },
    { label: 'Menu', path: `/${restaurantSlug}/admin/menu` },
    { label: 'Category', path: `/${restaurantSlug}/admin/category` },
    { label: 'Order', path: `/${restaurantSlug}/admin/orders` },
    { label: 'Table', path: `/${restaurantSlug}/admin/table` },
    { label: 'Sales', path: `/${restaurantSlug}/admin/sales` },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Also show toast
    if (type === 'newOrder') toast.success(message, { icon: '🔔' });
    else if (type === 'completed') toast.success(message, { icon: '✅' });
    else toast(message, { icon: 'ℹ️' });
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    if (!socket || !user?.restaurantName) return;

    // Join restaurant room
    socket.emit('joinRestaurant', user.restaurantName);

    const handleOrderUpdate = ({ action, data }) => {
      if (action === 'create') {
        addNotification('New Order', `Order #${data.dailySequence ? String(data.dailySequence).padStart(3, '0') : data._id.slice(-4)} received`, 'newOrder');
      } else if (action === 'update') {
        addNotification('Order Updated', `Order #${data.dailySequence ? String(data.dailySequence).padStart(3, '0') : data._id.slice(-4)} is now ${data.status}`, 'update');
      }
    };

    socket.on('orderUpdated', handleOrderUpdate);

    // Call Waiter
    socket.on('callWaiter', (data) => {
      addNotification('Waiter Called', `Table ${data.tableNumber} needs assistance`, 'alert');
    });

    // Bill Request
    socket.on('requestBill', (data) => {
      addNotification('Bill Requested', `Table ${data.tableNumber} requested the bill`, 'alert');
    });

    return () => {
      socket.off('orderUpdated', handleOrderUpdate);
      socket.off('callWaiter');
      socket.off('requestBill');
    };
  }, [socket, user?.restaurantName]);

  return (
    <header className="px-4 sm:px-[30px] py-3 flex items-center justify-between sticky top-0 z-[100] bg-transparent transition-all">
      {/* Logo Section */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to={`/${restaurantSlug}/admin`} className="block">
          <img src={logo} alt="EatGreet" className="h-7 sm:h-9 w-auto object-contain" />
        </Link>
      </div>

      {/* Center Navigation Pills (Desktop) */}
      <nav className="hidden lg:flex items-center bg-white p-1.5 rounded-full shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border border-gray-100 gap-1">
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
        <Link to={`/${restaurantSlug}/admin/settings`} className="w-9 h-9 sm:w-11 sm:h-11 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-600 hover:text-black">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="hidden sm:flex w-11 h-11 bg-white hover:bg-gray-50 rounded-full items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-600 hover:text-black relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-[100] bg-transparent" onClick={() => setIsNotificationOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[1.5rem] shadow-xl border border-gray-100 z-[101] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-medium text-gray-800">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.read ? 'bg-orange-50/30' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${notif.type === 'newOrder' ? 'bg-green-100 text-green-600' :
                          notif.type === 'completed' ? 'bg-blue-100 text-blue-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                          <Bell className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{notif.title}</h4>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{notif.message}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm">No new notifications</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-50 bg-gray-50/30 text-center">
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-gray-600 hover:text-black transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-white hover:bg-red-50 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 text-gray-400 hover:text-red-500"
          title="Logout"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Profile Capsule */}
        <Link to={`/${restaurantSlug}/admin/profile`} className="flex items-center gap-3 pl-1.5 pr-1.5 sm:pr-4 py-1.5 bg-white rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-md transition-all">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-50">
            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=FD6941&color=fff`} alt={user?.name || 'Admin'} className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop Click-off */}
          <div className="fixed inset-0 top-[65px] bg-black/5 z-[90] lg:hidden" onClick={() => setIsMenuOpen(false)}></div>

          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-2xl p-4 lg:hidden animate-in slide-in-from-top-4 z-[100] ring-1 ring-black/5">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-5 py-4 rounded-2xl text-[17px] font-medium transition-all ${location.pathname === item.path
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                    }`}
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

AdminHeader.propTypes = {
  title: PropTypes.string,
};

export default AdminHeader;
