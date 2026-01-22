import { useOutletContext } from 'react-router-dom';

export const useRemoveFromCart = () => {
    try {
        const context = useOutletContext();
        return context?.removeFromCart || (() => console.warn('removeFromCart context not found'));
    } catch (e) {
        console.warn('useRemoveFromCart must be used within a valid Outlet context', e);
        return () => {};
    }
};

export const useOrders = () => {
    return {
        orders: [],
        isLoading: false
    };
};
