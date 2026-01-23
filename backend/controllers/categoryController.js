// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        if (!req.tenantModels) return res.json([]);
        const { Category } = req.tenantModels;

        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        if (!req.tenantModels) return res.status(400).json({ message: 'Tenant resolution failed' });
        const { Category } = req.tenantModels;

        const { name, icon } = req.body;

        // Validate required fields
        if (!name || !icon) {
            return res.status(400).json({
                message: 'Please provide all required fields: name, icon'
            });
        }

        const category = await Category.create({
            name,
            icon,
            createdBy: req.user._id
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        if (!req.tenantModels) return res.status(400).json({ message: 'Tenant resolution failed' });
        const { Category } = req.tenantModels;

        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        if (!req.tenantModels) return res.status(400).json({ message: 'Tenant resolution failed' });
        const { Category } = req.tenantModels;

        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
