const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { resolveTenant } = require('../middleware/tenantMiddleware');

// Standard Admin/Customer Routes
router.route('/')
    .post(resolveTenant, createOrder)
    .get(protect, resolveTenant, getOrders);

router.route('/:id/status')
    .put(protect, admin, resolveTenant, updateOrderStatus);

// --- Public Kitchen Routes (No Auth, scoped by Restaurant Name) ---
// Middleware to inject tenant from URL param
const injectTenantParam = (req, res, next) => {
    if (req.params.restaurantName) {
        req.headers['x-restaurant-name'] = req.params.restaurantName;
    }
    next();
};

router.get('/kitchen/:restaurantName', injectTenantParam, resolveTenant, getOrders);
router.put('/kitchen/:restaurantName/:id/status', injectTenantParam, resolveTenant, updateOrderStatus);

module.exports = router;
