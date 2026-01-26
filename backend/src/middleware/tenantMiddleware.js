const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getTenantConnection, getTenantModel } = require('../utils/tenantHelper');

// Models (Schemas)
const CategorySchema = require('../models/Category');
const MenuItemSchema = require('../models/MenuItem');
const OrderSchema = require('../models/Order');

/**
 * Middleware to resolve tenant DB based on user data or request params.
 */
const resolveTenant = async (req, res, next) => {
    try {
        let restaurantName = null;

        // 1. Get from Authenticated User (Admin/Staff)
        if (req.user && req.user.restaurantName) {
            restaurantName = req.user.restaurantName;
        }

        // 2. Get from Custom Header
        if (!restaurantName && req.headers['x-restaurant-name']) {
            restaurantName = req.headers['x-restaurant-name'];
        }

        // 3. Fallback: If no req.user, check for Token manually
        if (!restaurantName && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('restaurantName');
                if (user) {
                    restaurantName = user.restaurantName;
                }
            } catch (err) {
                // Ignore token errors here, might be a public request
            }
        }

        // 3. Get from Query Params (Public/Customer)
        if (!restaurantName && req.query.restaurantName) {
            restaurantName = req.query.restaurantName;
        }

        // 4. Fallback to Body (sometimes useful for certain POSTs)
        if (!restaurantName && req.body && req.body.restaurantName) {
            restaurantName = req.body.restaurantName;
        }

        if (!restaurantName) {
            return res.status(400).json({
                message: 'Restaurant Name is required to resolve database.'
            });
        }

        // Sanitize name for DB use
        const sanitized = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const dbName = `resto_details_${sanitized}`;

        const conn = getTenantConnection(dbName);
        req.tenantConnection = conn;

        // Attach Models to Request
        req.tenantModels = {
            Category: getTenantModel(conn, 'Category', CategorySchema),
            MenuItem: getTenantModel(conn, 'MenuItem', MenuItemSchema),
            Order: getTenantModel(conn, 'Order', OrderSchema)
        };

        next();
    } catch (error) {
        console.error('Tenant Resolution Error:', error);
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

module.exports = { resolveTenant };
