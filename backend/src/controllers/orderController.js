// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer) or Public?
const createOrder = async (req, res) => {
    try {
        const { Order } = req.tenantModels;
        const { items, totalAmount, customerInfo, tableNumber, instruction } = req.body;

        if (items && items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Auto-resolve customer info from logged in user if available
        let resolvedCustomerInfo = customerInfo;
        if (req.user) {
            resolvedCustomerInfo = {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                id: req.user._id.toString()
            };
        }

        const order = new Order({
            customerInfo: resolvedCustomerInfo,
            tableNumber,
            items,
            totalAmount,
            instruction
        });

        const createdOrder = await order.save();

        // Emit detailed event for Kitchen/Admin Dashboards
        const io = req.app.get('io');
        if (io) io.emit('orderUpdated', { action: 'create', data: createdOrder });

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const { Order } = req.tenantModels;

        // If Customer, filter by their ID (stored in customerInfo.id)
        let filter = {};
        if (req.user && req.user.role === 'customer') {
            filter['customerInfo.id'] = req.user._id.toString();
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Kitchen)
const updateOrderStatus = async (req, res) => {
    try {
        const { Order } = req.tenantModels;
        const { status, paymentStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (order) {
            if (status) order.status = status;
            if (paymentStatus) order.paymentStatus = paymentStatus;

            const updatedOrder = await order.save();

            const io = req.app.get('io');
            if (io) io.emit('orderUpdated', { action: 'update', data: updatedOrder });

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
