const cloudinary = require('cloudinary').v2;

// Helper to extract Cloudinary Public ID
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
        const parts = url.split('/');
        const filename = parts.pop();
        const publicId = filename.split('.')[0];
        const folder = parts.slice(parts.indexOf('upload') + 2).join('/'); // get folder path after /upload/v<version>/
        return folder ? `${folder}/${publicId}` : publicId;
    } catch (e) {
        return null;
    }
};

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
// @desc    Create menu item
// @route   POST /api/menu
// @access  Private (Admin)
const createMenuItem = async (req, res) => {
    try {
        console.log("Create Menu Item Request Body:", JSON.stringify(req.body, null, 2));
        const { MenuItem } = req.tenantModels;
        const menuItem = await MenuItem.create(req.body);
        console.log("Menu Item Created in DB:", menuItem._id);

        const io = req.app.get('io');
        if (io && req.tenantDbName) {
            io.to(req.tenantDbName).emit('menuUpdated', { action: 'create', data: menuItem });
        }

        res.status(201).json(menuItem);
    } catch (error) {
        console.error("Create Menu Item Error:", error);
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
        if (io && req.tenantDbName) {
            io.to(req.tenantDbName).emit('menuUpdated', { action: 'update', data: updatedItem });
        }

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

        // CLEANUP: Delete media from Cloudinary
        if (menuItem.media && menuItem.media.length > 0) {
            for (const media of menuItem.media) {
                const publicId = getPublicIdFromUrl(media.url);
                if (publicId) {
                    const resourceType = media.type && media.type.startsWith('video') ? 'video' : 'image';
                    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                }
            }
        } else if (menuItem.image) {
            // Legacy/Single image fallback
            const publicId = getPublicIdFromUrl(menuItem.image);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await menuItem.deleteOne();

        const io = req.app.get('io');
        if (io && req.tenantDbName) {
            io.to(req.tenantDbName).emit('menuUpdated', { action: 'delete', id: req.params.id });
        }

        res.json({ message: 'Item removed' });
    } catch (error) {
        console.error("Delete Error", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
