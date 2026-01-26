const express = require('express');
const router = express.Router();
const { getAdminStats, getSuperAdminStats } = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');
const { resolveTenant } = require('../middleware/tenantMiddleware');

router.get('/admin', protect, admin, resolveTenant, getAdminStats);
router.get('/super-admin', protect, getSuperAdminStats); // Add superadmin middleware if needed

module.exports = router;
