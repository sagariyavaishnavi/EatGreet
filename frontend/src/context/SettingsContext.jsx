import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    // Derive currency from user object, with fallback
    const currency = user?.currency || 'INR';

    const currencySymbol = {
        'USD': '$',
        'EUR': '€',
        'INR': '₹',
        'GBP': '£',
        'JPY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
    }[currency] || '₹';

    const updateSettings = (newData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const fetchProfile = async () => {
        try {
            const { data } = await authAPI.getProfile();
            if (data) {
                // Keep the token from localStorage
                const savedUser = JSON.parse(localStorage.getItem('user'));
                const updatedUser = { ...data, token: savedUser?.token };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Error refreshing profile:", error);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('user')) {
            fetchProfile();
        }
    }, []);

    const [impersonatedRestaurant, setImpersonatedRestaurant] = useState(() => {
        const saved = localStorage.getItem('impersonatedRestaurant');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const impersonate = (restaurant) => {
        const data = {
            id: restaurant._id,
            name: restaurant.restaurantName,
            slug: restaurant.restaurantName?.toLowerCase()?.replace(/\s+/g, '-')
        };
        localStorage.setItem('impersonatedRestaurant', JSON.stringify(data));
        setImpersonatedRestaurant(data);
    };

    const stopImpersonating = () => {
        localStorage.removeItem('impersonatedRestaurant');
        setImpersonatedRestaurant(null);
    };

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', userData.role);
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setImpersonatedRestaurant(null);
    };

    const [isLocked, setIsLocked] = useState(false);
    const [lockType, setLockType] = useState('expiry'); // 'expiry' or 'ban'

    // Global Subscription & Account Monitor
    useEffect(() => {
        if (user && user.role === 'admin') {
            const isBanned = user.restaurantDetails?.isActive === false;

            const endDate = user.subscription?.endDate ? new Date(user.subscription.endDate) : null;
            const now = new Date();
            const daysLeft = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : null;
            const isPlanExpired = (daysLeft !== null && daysLeft <= 0) || user.subscription?.status === 'Expired';

            if (isBanned) {
                setIsLocked(true);
                setLockType('ban');
            } else if (isPlanExpired) {
                setIsLocked(true);
                setLockType('expiry');
                if (user.subscription.status !== 'Expired') {
                    updateSettings({
                        subscription: { ...user.subscription, status: 'Expired' }
                    });
                }
            } else {
                setIsLocked(false);
                if (daysLeft !== null && daysLeft <= 3) {
                    toast("Subscription expiring soon!", {
                        id: 'sub-warning-toast',
                        icon: '⚠️',
                        duration: 10000,
                        description: `Your ${user.subscription.plan} plan expires in ${daysLeft} days.`,
                        style: { borderRadius: '15px', border: '1px solid #FD6941', color: '#FD6941' }
                    });
                }
            }
        } else {
            setIsLocked(false);
        }
    }, [user?.subscription?.endDate, user?.subscription?.status, user?.restaurantDetails?.isActive]);

    return (
        <SettingsContext.Provider value={{ user, currency, currencySymbol, updateSettings, login, logout, isLocked, lockType, impersonatedRestaurant, impersonate, stopImpersonating }}>
            {children}
        </SettingsContext.Provider>
    );
};
