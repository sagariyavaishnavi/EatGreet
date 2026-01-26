const express = require('express');
const router = express.Router();
const { getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPayments);

module.exports = router;
