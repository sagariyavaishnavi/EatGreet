const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');
const { resolveTenant } = require('../middleware/tenantMiddleware');

// Check auth, then resolve tenant
// For public GET, we might not have protect?
// BUT resolveTenant needs a hint.
// If public, resolveTenant looks for query or body.
// If private, resolveTenant looks at User's restaurant.

router.route('/')
    .get(resolveTenant, getCategories)
    .post(protect, admin, resolveTenant, createCategory);

router.route('/:id')
    .put(protect, admin, resolveTenant, updateCategory)
    .delete(protect, admin, resolveTenant, deleteCategory);

module.exports = router;
