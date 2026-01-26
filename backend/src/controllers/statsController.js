const getAdminStats = async (req, res) => {
    try {
        const { Order, MenuItem } = req.tenantModels;

        // Get total orders
        const totalOrders = await Order.countDocuments();

        // Get active orders (pending, preparing, ready)
        const activeOrders = await Order.countDocuments({
            status: { $in: ['pending', 'preparing', 'ready'] }
        });

        // Get dine-in orders count
        const dineIn = await Order.countDocuments({ tableNumber: { $exists: true, $ne: '' } });

        // Get total revenue
        const orders = await Order.find({ status: 'completed' });
        const revenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

        res.json({
            totalOrders,
            activeOrders,
            revenue,
            dineIn,
            takeaway: totalOrders - dineIn
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSuperAdminStats = async (req, res) => {
    try {
        const User = require('../models/User');

        // 1. Basic Counts (Fetching Users who are restaurant admins)
        const totalRestaurants = await User.countDocuments({ role: 'admin' });

        // Count active based on nested restaurantDetails
        const activeRestaurants = await User.countDocuments({
            role: 'admin',
            'restaurantDetails.isActive': true
        });

        const inactiveRestaurants = totalRestaurants - activeRestaurants;

        // 2. Financials (Simulated based on subscription model)
        const SUBSCRIPTION_FEE = 2999; // Example monthly fee
        const monthlyRevenue = activeRestaurants * SUBSCRIPTION_FEE;

        // 3. Payment Status Distribution
        const paymentStatusData = [
            { name: 'Paid', value: activeRestaurants, color: '#10B981' }, // Active assumed paid
            { name: 'Pending', value: 0, color: '#F59E0B' },
            { name: 'Overdue', value: inactiveRestaurants, color: '#EF4444' } // Inactive assumed overdue
        ];

        // 4. Monthly Growth (Revenue Trend)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        const growthStats = await User.aggregate([
            {
                $match: {
                    role: 'admin',
                    createdAt: {
                        $gte: new Date(new Date().setFullYear(currentYear - 1))
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        let revenueData = Array(12).fill(0).map((_, i) => ({
            name: months[i],
            value: 0
        }));

        growthStats.forEach(stat => {
            if (stat._id >= 1 && stat._id <= 12) {
                revenueData[stat._id - 1].value = stat.count * SUBSCRIPTION_FEE;
            }
        });

        res.json({
            totalRestaurants,
            activeSubscriptions: activeRestaurants,
            monthlyRevenue,
            unpaidRestaurants: inactiveRestaurants,
            revenueData,
            paymentStatusData
        });

    } catch (error) {
        console.error("Super Admin Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats, getSuperAdminStats };
