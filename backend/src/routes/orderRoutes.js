const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { resolveTenant } = require('../middleware/tenantMiddleware');

router.route('/')
    .post(resolveTenant, createOrder) // Public or Protected Customer
    .get(protect, resolveTenant, getOrders);

router.route('/:id/status')
    .put(protect, admin, resolveTenant, updateOrderStatus);

module.exports = router;
