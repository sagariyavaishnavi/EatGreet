const express = require('express');
const router = express.Router();
const {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
    .route('/')
    .get(protect, getMenuItems)
    .post(protect, authorize('admin', 'super-admin'), createMenuItem);

router
    .route('/:id')
    .put(protect, authorize('admin', 'super-admin'), updateMenuItem)
    .delete(protect, authorize('admin', 'super-admin'), deleteMenuItem);

module.exports = router;
