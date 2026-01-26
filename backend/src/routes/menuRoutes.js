const express = require('express');
const router = express.Router();
const { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');
const { resolveTenant } = require('../middleware/tenantMiddleware');

router.route('/')
    .get(resolveTenant, getMenuItems)
    .post(protect, admin, resolveTenant, createMenuItem);

router.route('/:id')
    .put(protect, admin, resolveTenant, updateMenuItem)
    .delete(protect, admin, resolveTenant, deleteMenuItem);

module.exports = router;
