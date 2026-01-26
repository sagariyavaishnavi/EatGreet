// @desc    Get all payments (Aggregated from Users)
// @route   GET /api/payments
// @access  Private (Super Admin)
const getPayments = async (req, res) => {
    try {
        const User = require('../models/User');

        // 1. Fetch all admins (restaurant owners)
        const users = await User.find({ role: 'admin' }).select('name restaurantName payments');

        let allPayments = [];

        // 2. Flatten payments from all users
        users.forEach(user => {
            if (user.payments && user.payments.length > 0) {
                const userPayments = user.payments.map(p => ({
                    ...p.toObject(),
                    _id: p._id, // Ensure ID is present
                    restaurant: { name: user.restaurantName || user.name } // Format for frontend
                }));
                allPayments.push(...userPayments);
            }
        });

        // Add demo data if empty (for visualization until real payments happen)
        if (allPayments.length === 0) {
            users.forEach(user => {
                const demo = {
                    _id: `demo_${Math.random()}`,
                    transactionId: `TXN${Math.floor(Math.random() * 10000)}`,
                    amount: Math.floor(Math.random() * 4000) + 1000,
                    status: 'Completed',
                    method: 'Razorpay',
                    date: new Date(),
                    restaurant: { name: user.restaurantName || user.name }
                };
                allPayments.push(demo);
            });
        }

        // Sort by date desc
        allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 3. Calculate Stats
        const totalRevenue = allPayments
            .filter(p => p.status === 'Completed')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const pendingAmount = allPayments
            .filter(p => p.status === 'Pending')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        res.json({
            transactions: allPayments,
            stats: {
                totalRevenue,
                pendingAmount,
                totalTransactions: allPayments.length
            }
        });
    } catch (error) {
        console.error("Payment Fetch Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPayments };
