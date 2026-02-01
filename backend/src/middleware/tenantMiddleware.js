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

        // --- AUTHENTICATED USER (Admin/Staff/Customer with account) ---
        // If user is logged in, their authorized restaurantName MUST take precedence for security.
        // This prevents an admin of Resto A from seeing/writing data of Resto B via query params.
        if (req.user && req.user.restaurantName && req.user.role !== 'superadmin') {
            restaurantName = req.user.restaurantName;
        }

        // --- PUBLIC / OVERRIDE CASES ---
        if (!restaurantName) {
            // 1. Get from Custom Header (Explicit overrides used by frontend for specific flows)
            if (req.headers['x-restaurant-name']) {
                restaurantName = req.headers['x-restaurant-name'];
            }
            // 2. Get from Query Params (Public/Customer URLs)
            else if (req.query.restaurantName) {
                restaurantName = req.query.restaurantName;
            }
            // 3. Get from Body
            else if (req.body && req.body.restaurantName) {
                restaurantName = req.body.restaurantName;
            }
            // 4. Token Fallback (If protect middleware wasn't used but token is present)
            else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                try {
                    const token = req.headers.authorization.split(' ')[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.id).select('restaurantName');
                    if (user) {
                        restaurantName = user.restaurantName;
                    }
                } catch (err) { }
            }
        }

        if (!restaurantName) {
            return res.status(400).json({
                message: 'Restaurant Name is required to resolve database.'
            });
        }

        // Sanitize name for DB use
        const sanitized = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const dbName = `resto_details_${sanitized}`;
        req.tenantDbName = sanitized; // Store for socket rooms

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
