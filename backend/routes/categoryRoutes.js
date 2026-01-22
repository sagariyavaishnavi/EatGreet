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

// Temp Seed Route
const Category = require('../models/Category');
router.get('/seed', async (req, res) => {
    try {
        const categories = [
            { name: 'Starters', icon: 'Utensils' },
            { name: 'Main Course', icon: 'Utensils' },
            { name: 'Breads', icon: 'Grain' },
            { name: 'Rice & Biryani', icon: 'Utensils' },
            { name: 'Pizza', icon: 'Pizza' },
            { name: 'Burgers', icon: 'Sandwich' },
            { name: 'Beverages', icon: 'Coffee' },
            { name: 'Desserts', icon: 'Cake' },
            { name: 'Vegetarian', icon: 'Vegan/Veg' },
            { name: 'Non-Vegetarian', icon: 'Seafood' },
            { name: 'Vegan', icon: 'Vegan/Veg' },
            { name: 'Healthy', icon: 'Healthy' },
            { name: 'Breakfast', icon: 'Coffee' },
            { name: 'Soups', icon: 'Utensils' }
        ];
        
        const results = [];
        for (const cat of categories) {
             // Check if exists to avoid duplicates
             let existing = await Category.findOne({ name: cat.name });
             if (!existing) {
                 // Find an admin user to attribute this to
                 const adminUser = await require('../models/User').findOne({ role: 'admin' });
                 const userId = adminUser ? adminUser._id : '000000000000000000000000'; // Fallback dummy ID

                 const newCat = await Category.create({ ...cat, createdBy: userId });
                 results.push(newCat);
             }
        }
        res.json({ success: true, count: results.length, data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
