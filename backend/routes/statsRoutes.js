const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const { resolveTenant } = require('../middleware/tenantMiddleware');

// Get stats for Admin (Restaurant Manager)
router.get('/admin', protect, authorize('admin'), resolveTenant, async (req, res) => {
    try {
        if (!req.tenantModels) {
            return res.status(400).json({ message: 'Tenant context required' });
        }
        const { MenuItem, Category, Order } = req.tenantModels;

        const menuCount = await MenuItem.countDocuments({});
        const categoryCount = await Category.countDocuments({});

        // Real Order Stats
        const totalOrders = await Order.countDocuments({});

        // Calculate Revenue
        const revenueAgg = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // Active Orders (Pending, Preparing, Ready)
        const activeOrders = await Order.countDocuments({
            status: { $in: ['pending', 'preparing', 'ready'] }
        });

        // Order Types
        const dineIn = await Order.countDocuments({ orderType: 'dine-in' });
        const takeaway = await Order.countDocuments({ orderType: 'takeaway' });

        res.json({
            menuItems: menuCount,
            categories: categoryCount,
            totalOrders,
            revenue,
            activeOrders,
            dineIn,
            takeaway
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get stats for Super Admin
router.get('/super-admin', protect, authorize('super-admin'), async (req, res) => {
    try {
        const totalRestaurants = await User.countDocuments({ role: 'admin' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });

        res.json({
            totalRestaurants,
            totalCustomers,
            activeSubscriptions: totalRestaurants,
            monthlyRevenue: totalRestaurants * 1200,
            unpaidRestaurants: Math.floor(totalRestaurants * 0.1),
            revenueData: [
                { name: 'Jan', value: totalRestaurants * 1000 },
                { name: 'Feb', value: totalRestaurants * 1100 },
                { name: 'Mar', value: totalRestaurants * 1200 },
                { name: 'Apr', value: totalRestaurants * 1150 },
                { name: 'May', value: totalRestaurants * 1300 },
                { name: 'Jun', value: totalRestaurants * 1400 },
                { name: 'Jul', value: totalRestaurants * 1350 },
                { name: 'Aug', value: totalRestaurants * 1500 },
                { name: 'Sep', value: totalRestaurants * 1450 },
                { name: 'Oct', value: totalRestaurants * 1600 },
                { name: 'Nov', value: totalRestaurants * 1550 },
                { name: 'Dec', value: totalRestaurants * 1700 },
            ],
            paymentStatusData: [
                { name: 'Paid', value: Math.ceil(totalRestaurants * 0.8), color: '#10B981' },
                { name: 'Pending', value: Math.floor(totalRestaurants * 0.15), color: '#F59E0B' },
                { name: 'Overdue', value: Math.ceil(totalRestaurants * 0.05), color: '#EF4444' },
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
