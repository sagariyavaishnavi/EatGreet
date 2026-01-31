import React, { createContext, useContext, useState, useEffect } from 'react';

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

    return (
        <SettingsContext.Provider value={{ user, currency, currencySymbol, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
