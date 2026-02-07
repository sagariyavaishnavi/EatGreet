const getAdminStats = async (req, res) => {
    try {
        const { Order, MenuItem } = req.tenantModels;
        const { startDate, endDate } = req.query;

        // 1. Determine Date Range
        const now = new Date();
        let start = new Date();
        start.setHours(0, 0, 0, 0);
        let end = new Date(now);

        const currentYearStart = new Date(now.getFullYear(), 0, 1);
        const currentYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

        if (startDate) {
            start = new Date(startDate);
        }
        if (endDate) {
            end = new Date(endDate);
            // If only date is provided, set to end of day
            if (endDate.length <= 10) {
                end.setHours(23, 59, 59, 999);
            }
        }

        // Shared Filter for Date-based queries
        const dateFilter = {
            status: 'completed',
            updatedAt: { $gte: start, $lte: end }
        };

        // 2. Calculate Occupied Tables (Live status, ignoring date range)
        const occupiedTablesResult = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['pending', 'preparing', 'ready'] },
                    tableNumber: { $regex: /^[0-9]+$/ }
                }
            },
            { $group: { _id: "$tableNumber" } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        const dineInCount = occupiedTablesResult.length > 0 ? occupiedTablesResult[0].count : 0;

        // 3. Parallel Stats Fetching
        const [
            totalOrders,
            activeOrders,
            rangeRevenueData,
            totalRevenueData,
            trendRevenueData,
            hourlyRevenueData,
            bestsellersData,
            allTimeOrdersCount,
            yearlyStatsData
        ] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
            Order.countDocuments({ status: { $in: ['pending', 'preparing', 'ready'] } }),
            Order.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Order.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
            ]),
            Order.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt", timezone: "Asia/Kolkata" } },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: { $hour: { date: "$updatedAt", timezone: "Asia/Kolkata" } },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: dateFilter },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.menuItem",
                        name: { $first: "$items.name" },
                        count: { $sum: "$items.quantity" },
                        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            Order.countDocuments({ status: 'completed' }),
            Order.aggregate([
                {
                    $match: {
                        status: 'completed',
                        updatedAt: { $gte: currentYearStart, $lte: currentYearEnd }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const rangeRevenue = rangeRevenueData.length > 0 ? rangeRevenueData[0].total : 0;
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;

        // Calculate All-Time AOV
        const allTimeOrders = allTimeOrdersCount || 0;
        const avgOrderValue = allTimeOrders > 0 ? totalRevenue / allTimeOrders : 0;

        // Yearly Stats
        const yearlyRevenue = yearlyStatsData.length > 0 ? yearlyStatsData[0].totalRevenue : 0;
        const yearlyEBITDA = yearlyRevenue * 0.30; // Estimated 30% margin

        // Calculate Cancellation Rate
        const cancelledOrders = await Order.countDocuments({
            status: 'cancelled',
            createdAt: { $gte: start, $lte: end }
        });
        const cancellationRate = totalOrders > 0 ? (cancelledOrders / (totalOrders + cancelledOrders)) * 100 : 0;

        const totalTables = req.user?.restaurantDetails?.totalTables || 0;

        res.json({
            summary: {
                totalOrders,
                activeOrders,
                totalRevenue,
                rangeRevenue,
                avgOrderValue,
                allTimeOrders,
                yearlyRevenue,
                yearlyEBITDA,
                cancellationRate,
                dineIn: dineInCount,
                totalTables,
                takeaway: totalOrders - dineInCount,
            },
            charts: {
                revenueTrend: trendRevenueData,
                hourlyAnalysis: hourlyRevenueData,
                bestsellers: bestsellersData
            }
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
