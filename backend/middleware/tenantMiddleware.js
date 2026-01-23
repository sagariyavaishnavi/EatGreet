const User = require('../models/User');
const { getTenantModels } = require('../utils/tenantHelper');
const jwt = require('jsonwebtoken');

/**
 * Tenant Resolution Middleware
 * Resolves which restaurant database to use based on user session or request parameters.
 */
const resolveTenant = async (req, res, next) => {
    try {
        let restaurantName = '';

        // 1. Check if req.user is already attached (by protect middleware)
        if (req.user && req.user.restaurantName) {
            restaurantName = req.user.restaurantName;
        }
        // 2. If not, try to decode token manually if present (for cases where resolveTenant is called before protect)
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).lean();
                if (user) {
                    restaurantName = user.restaurantName;
                }
            } catch (err) {
                // Ignore decoding errors, let protect handle it
            }
        }

        // 3. If still no name, try restaurantId in query or body (for customers)
        if (!restaurantName) {
            const restaurantId = req.query.restaurantId || (req.body && (req.body.restaurant || req.body.restaurantId));
            if (restaurantId) {
                const user = await User.findById(restaurantId).lean();
                if (user) {
                    restaurantName = user.restaurantName;
                }
            }
        }

        if (restaurantName) {
            req.tenantModels = getTenantModels(restaurantName);
            req.restaurantName = restaurantName; // Useful for logging/debugging
        }

        next();
    } catch (error) {
        console.error('Tenant Resolution Error:', error);
        next();
    }
};

module.exports = { resolveTenant };
