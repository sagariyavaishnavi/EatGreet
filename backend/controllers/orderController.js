// @desc    Get all orders (scoped)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        if (!req.tenantModels) return res.json([]);
        const { Order } = req.tenantModels;

        const orders = await Order.find({}).populate('items.menuItem').sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Customer)
exports.createOrder = async (req, res) => {
    try {
        if (!req.tenantModels) return res.status(400).json({ message: 'Tenant resolution failed' });
        const { Order } = req.tenantModels;

        const { customerName, tableNumber, items, totalAmount, restaurant } = req.body;

        // Validate required fields
        if (!customerName || !tableNumber || !items || !items.length || !totalAmount || !restaurant) {
            return res.status(400).json({
                message: 'Please provide all required fields: customerName, tableNumber, items, totalAmount, restaurant'
            });
        }

        // Validate each item has required fields
        for (const item of items) {
            if (!item.menuItem || !item.name || !item.price || !item.quantity) {
                return res.status(400).json({
                    message: 'Each item must have: menuItem, name, price, quantity'
                });
            }
        }

        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        if (!req.tenantModels) return res.status(400).json({ message: 'Tenant resolution failed' });
        const { Order } = req.tenantModels;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = req.body.status || order.status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
