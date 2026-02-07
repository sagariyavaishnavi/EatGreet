const mongoose = require('mongoose');
require('dotenv').config();

const orderSchema = new mongoose.Schema({
    status: String,
    totalAmount: Number,
    items: Array,
    tableNumber: String,
    customerInfo: Object,
    active: { type: Boolean, default: true },
    dailySequence: Number,
}, { timestamps: true });

// Tenant aware model access simulation
// In real controller it uses req.tenantModels
// Here we just access the collection directly if possible or simulate
// The collection name is likely 'orders' in 'eatgreet_main' database or specific to tenant?
// The .env indicates 'eatgreet_main'.
// The code uses `req.tenantModels`. We need to know how tenants are handled.
// `statsController.js`: `const { Order, MenuItem } = req.tenantModels;`
// Middleware sets this up. Usually implies different collections or DBs.
// Let's assume for this specific user/test, it references a specific tenant.
// I will check `middleware/tenantMiddleware.js` (implied name) or similar if I can.
// But wait, the user is running `npm run dev` and `npm start`.
// I can just try to count orders in the default connection for now.

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // We need to guess the collection name.
        // If multitenancy is by DB, checking 'eatgreet_main' might not find tenant data?
        // Let's list collections.
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Let's try to query 'orders' if it exists
        if (collections.find(c => c.name === 'orders')) {
            const Order = mongoose.model('Order', orderSchema, 'orders');

            // Check counts
            const total = await Order.countDocuments({});
            const completed = await Order.countDocuments({ status: 'completed' });

            // Check today (IST)
            const now = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0); // Local time execution environment

            const todayAll = await Order.countDocuments({ createdAt: { $gte: start } });
            const todayCompleted = await Order.countDocuments({ status: 'completed', createdAt: { $gte: start } });

            console.log('Total Orders:', total);
            console.log('Total Completed:', completed);
            console.log('Orders Today (All):', todayAll);
            console.log('Orders Today (Completed):', todayCompleted);

            // Check Aggregation with Timezone
            const agg = await Order.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: start } } },
                {
                    $group: {
                        _id: { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            console.log('Hourly Aggregation (Asia/Kolkata):', agg);
        } else {
            console.log('Orders collection not found in default DB. Tenant DBs might be used.');
            // Accessing tenant DB logic might be complex from script without middleware context.
            // But we can guess the tenant name from a recent conversation or default?
            // User's active document is /Users/bhattmanav/Documents/GitHub/EatGreet/frontend/src/pages/customer/Menu.jsx
            // User ID might be needed.
            // Skip detailed checking if collection not found.
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
};

run();
