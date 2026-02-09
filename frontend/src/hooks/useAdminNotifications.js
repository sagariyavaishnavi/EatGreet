import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

export const useAdminNotifications = () => {
    const socket = useSocket();
    const { user } = useSettings();
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

    const clearAll = () => {
        setNotifications([]);
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

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        clearAll
    };
};
