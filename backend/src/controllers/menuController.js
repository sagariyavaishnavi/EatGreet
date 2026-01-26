// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
    try {
        const { MenuItem } = req.tenantModels;
        // Allow filtering by category ID
        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Populate is tricky across DBs if Category is in same DB (it is).
        // If it was in a different DB, populate wouldnt work.
        // Here Category and MenuItem are in the SAME tenant DB.
        const items = await MenuItem.find(filter).populate('category');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private (Admin)
const createMenuItem = async (req, res) => {
    try {
        const { MenuItem } = req.tenantModels;
        const menuItem = await MenuItem.create(req.body);

        const io = req.app.get('io');
        if (io) io.emit('menuUpdated', { action: 'create', data: menuItem });

        res.status(201).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin)
const updateMenuItem = async (req, res) => {
    try {
        const { MenuItem } = req.tenantModels;
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) return res.status(404).json({ message: 'Menu Item not found' });

        Object.assign(menuItem, req.body);
        const updatedItem = await menuItem.save();

        const io = req.app.get('io');
        if (io) io.emit('menuUpdated', { action: 'update', data: updatedItem });

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin)
const deleteMenuItem = async (req, res) => {
    try {
        const { MenuItem } = req.tenantModels;
        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) return res.status(404).json({ message: 'Menu Item not found' });

        await menuItem.deleteOne();

        const io = req.app.get('io');
        if (io) io.emit('menuUpdated', { action: 'delete', id: req.params.id });

        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
