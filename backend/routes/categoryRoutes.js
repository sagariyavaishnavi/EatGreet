const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
    .route('/')
    .get(protect, getCategories)
    .post(protect, authorize('admin', 'super-admin'), createCategory);

router
    .route('/:id')
    .put(protect, authorize('admin', 'super-admin'), updateCategory)
    .delete(protect, authorize('admin', 'super-admin'), deleteCategory);

module.exports = router;
