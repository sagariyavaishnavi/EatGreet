// @desc    Get all categories for the resolved tenant
// @route   GET /api/categories
// @access  Public/Private
const getCategories = async (req, res) => {
    try {
        const { Category, MenuItem } = req.tenantModels;

        const categories = await Category.find({}).sort({ createdAt: -1 });

        // Calculate item counts dynamically for each category
        // Utilizing a Promise.all to do it in parallel
        const categoriesWithCounts = await Promise.all(categories.map(async (cat) => {
            const count = await MenuItem.countDocuments({
                category: cat._id, // LINK FIX: MenuItem schema uses ObjectId referenece, not name string
                isAvailable: true
            });
            return {
                ...cat.toObject(),
                count
            };
        }));

        res.json(categoriesWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
    try {
        const { Category } = req.tenantModels;
        const category = await Category.create(req.body);

        // Auto live update
        const io = req.app.get('io');
        if (io && req.tenantDbName) {
            io.to(req.tenantDbName).emit('categoryUpdated', { action: 'create', data: category });
        }

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
    try {
        const { Category } = req.tenantModels;

        // Re-query using the correct model
        const foundCategory = await Category.findById(req.params.id);

        if (!foundCategory) return res.status(404).json({ message: 'Category not found' });

        foundCategory.name = req.body.name || foundCategory.name;
        foundCategory.icon = req.body.icon || foundCategory.icon;
        foundCategory.status = req.body.status || foundCategory.status;
        foundCategory.image = req.body.image || foundCategory.image;

        const updatedCategory = await foundCategory.save();

        const io = req.app.get('io');
        if (io && req.tenantDbName) {
            io.to(req.tenantDbName).emit('categoryUpdated', { action: 'update', data: updatedCategory });
        }

        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
    try {
        const { Category } = req.tenantModels;
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await category.deleteOne();

        const io = req.app.get('io');
        if (io && req.tenantDbName) {
            io.to(req.tenantDbName).emit('categoryUpdated', { action: 'delete', id: req.params.id });
        }

        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
