const getAdminStats = async (req, res) => {
    try {
        const { Order } = req.tenantModels;

        // 1. Calculate Occupied Tables (Unique NUMERIC tableNumbers with active orders)
        // We use a regex to ensure only real table numbers are counted, avoiding trash or "takeaway"
        const occupiedTablesResult = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['pending', 'preparing', 'ready'] },
                    tableNumber: { $regex: /^[0-9]+$/ } // Only count numeric table numbers
                }
            },
            { $group: { _id: "$tableNumber" } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        const dineInCount = occupiedTablesResult.length > 0 ? occupiedTablesResult[0].count : 0;

        // 2. Today's Revenue & Total Stats
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // 3. Last 7 Days Revenue for Graph
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const [totalOrders, activeOrders, todayRevenueData, totalRevenueData, weeklyRevenueData, hourlyRevenueData] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: { $in: ['pending', 'preparing', 'ready'] } }),
            Order.aggregate([
                { $match: { status: 'completed', updatedAt: { $gte: startOfToday } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Order.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
            ]),
            Order.aggregate([
                {
                    $match: {
                        status: 'completed',
                        updatedAt: { $gte: sevenDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                {
                    $match: {
                        status: 'completed',
                        updatedAt: { $gte: startOfToday }
                    }
                },
                {
                    $group: {
                        _id: { $hour: "$updatedAt" },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const todayRevenue = todayRevenueData.length > 0 ? todayRevenueData[0].total : 0;
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;

        // Note: totalTables fallback
        const totalTables = req.user?.restaurantDetails?.totalTables || 0;

        res.json({
            totalOrders,
            activeOrders,
            revenue: totalRevenue,
            todayRevenue,
            dineIn: dineInCount,
            totalTables,
            takeaway: totalOrders - dineInCount,
            weeklyRevenue: weeklyRevenueData,
            hourlyRevenue: hourlyRevenueData
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
