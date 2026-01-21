const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
    try {
        // If user is super-admin, maybe show all? For now, let's filter by the logged-in restaurant owner
        // to support the requirement "every new restaurant new menu" (data isolation).
        const query = { restaurant: req.user._id };

        // If you want to allow Public access (e.g. for customers), you'd need a different route or logic.
        // But this is likely the Admin API.

        const menuItems = await MenuItem.find(query).populate('category');
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = async (req, res) => {
    try {
        req.body.restaurant = req.user._id;
        const menuItem = await MenuItem.create(req.body);
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
    try {
        let menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Check if user is owner
        if (menuItem.restaurant.toString() !== req.user._id.toString() && req.user.role !== 'super-admin') {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

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
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Check if user is owner
        if (menuItem.restaurant.toString() !== req.user._id.toString() && req.user.role !== 'super-admin') {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await menuItem.deleteOne();
        res.json({ message: 'Menu item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
