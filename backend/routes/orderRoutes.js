const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getOrders);
router.post('/', createOrder);
router.put('/:id', protect, updateOrderStatus);

module.exports = router;
