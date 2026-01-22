const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
    try {
        let query = {};

        // If user is a customer (role 'user'), show ALL menu items (from all restaurants)
        // If user is admin, show only THEIR menu items (so they can manage them)
        // If super-admin, show all
        if (req.user.role === 'admin') {
            query = { restaurant: req.user._id };
        }

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
        console.error('Create Menu Item Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: Object.values(error.errors).map(val => val.message).join(', ') });
        }
        res.status(500).json({ message: 'Server Error: ' + error.message });
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
