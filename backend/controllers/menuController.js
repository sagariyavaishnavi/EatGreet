// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
    try {
        if (!req.tenantModels) return res.json([]);
        const { MenuItem } = req.tenantModels;

        const menuItems = await MenuItem.find({}).populate('category');
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMenuItem = async (req, res) => {
    try {
        if (!req.tenantModels) return res.status(400).json({ message: 'Tenant resolution failed' });
        const { MenuItem } = req.tenantModels;

        // Validate required fields
        const { name, description, price, image, category, isVeg } = req.body;

        if (!name || !description || !price || !image || !category || isVeg === undefined) {
            return res.status(400).json({
                message: 'Please provide all required fields: name, description, price, image, category, isVeg'
            });
        }

        req.body.restaurant = req.user._id;
        const menuItem = await MenuItem.create(req.body);
        res.status(201).json(menuItem);
    } catch (error) {
        console.error('Create Menu Item Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
    try {
        if (!req.tenantModels) return res.status(400).json({ message: 'Tenant resolution failed' });
        const { MenuItem } = req.tenantModels;

        let menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

        menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res) => {
    try {
        if (!req.tenantModels) return res.status(400).json({ message: 'Tenant resolution failed' });
        const { MenuItem } = req.tenantModels;

        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

        await menuItem.deleteOne();
        res.json({ message: 'Menu item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
