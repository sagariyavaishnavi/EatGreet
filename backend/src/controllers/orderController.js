// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer) or Public?
const createOrder = async (req, res) => {
    try {
        const { Order, Customer } = req.tenantModels;
        const { items, totalAmount, customerInfo, tableNumber, instruction } = req.body;

        // 1. INPUT VALIDATION
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        const resolvedCustomerInfo = customerInfo || {};

        // 2. SAVE/UPDATE CUSTOMER DATA (Scoped to eatgreet_customer DB)
        let customer = null;
        if (resolvedCustomerInfo.phone) {
            // Find existing customer by phone in the global pool
            customer = await Customer.findOne({ phone: resolvedCustomerInfo.phone });

            const visitData = {
                restaurantName: req.restaurantName || req.tenantDbName || 'unknown',
                tableNumber: tableNumber,
                lastVisit: Date.now()
            };

            if (customer) {
                // Update existing customer info
                customer.name = resolvedCustomerInfo.name || customer.name;
                customer.lastOrderAt = Date.now();

                // Track visit context with safety check
                const visits = customer.visits || [];
                const visitIndex = visits.findIndex(v => v.restaurantName === visitData.restaurantName);
                if (visitIndex !== -1) {
                    visits[visitIndex].tableNumber = tableNumber;
                    visits[visitIndex].lastVisit = Date.now();
                } else {
                    visits.push(visitData);
                }
                customer.visits = visits;
                await customer.save();
            } else {
                // Create new customer with strict QR form fields
                customer = await Customer.create({
                    name: resolvedCustomerInfo.name || 'Guest',
                    phone: resolvedCustomerInfo.phone,
                    visits: [visitData]
                });
            }
        }

        // 3. RUNNING ORDERS SUPPORT (Merge into active or RECENTLY COMPLETED session for the SAME customer at this table)
        let existingOrder = null;
        if (tableNumber) {
            const sessionsWindow = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4 hours
            existingOrder = await Order.findOne({
                tableNumber: tableNumber,
                createdAt: { $gte: sessionsWindow },
                status: { $in: ['pending', 'preparing', 'ready', 'completed'] },
                // Strict check: Only merge if it's the same person
                "customerInfo.name": resolvedCustomerInfo.name,
                "customerInfo.phone": resolvedCustomerInfo.phone
            }).sort({ createdAt: -1 });
        }

        if (existingOrder) {
            // Merge new items into existing order
            items.forEach(newItem => {
                const existingItem = existingOrder.items.find(it =>
                    it.menuItem && newItem.menuItem &&
                    it.menuItem.toString() === newItem.menuItem.toString() &&
                    it.price === newItem.price
                );

                if (existingItem) {
                    existingItem.quantity += (newItem.quantity || 1);
                    // Reset item status to pending if more are ordered
                    existingItem.status = 'pending';
                } else {
                    existingOrder.items.push(newItem);
                }
            });

            // Recalculate total amount correctly
            existingOrder.totalAmount = existingOrder.items.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);

            if (instruction) {
                existingOrder.instruction = existingOrder.instruction
                    ? `${existingOrder.instruction} | ${instruction}`
                    : instruction;
            }

            // Reset order status if new items are added to a ready/preparing order
            // This ensures the kitchen sees it as something needing attention
            existingOrder.status = 'pending';

            existingOrder.markModified('items');
            const updatedOrder = await existingOrder.save();

            const io = req.app.get('io');
            if (io && req.tenantDbName) {
                io.to(req.tenantDbName).emit('orderUpdated', { action: 'update', data: updatedOrder });
            }

            return res.status(200).json(updatedOrder);
        }

        // 4. CREATE NEW ORDER
        const order = new Order({
            customerInfo: resolvedCustomerInfo,
            tableNumber,
            items,
            totalAmount,
            instruction
        });

        const createdOrder = await order.save();

        const io = req.app.get('io');
        if (io && req.tenantDbName) {
            io.to(req.tenantDbName).emit('orderUpdated', { action: 'create', data: createdOrder });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
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
        const { id, itemIdx } = req.params;

        const order = await Order.findById(id);

        if (order) {
            // Case 1: Individual Item Status Update
            if (itemIdx !== undefined && status) {
                const idx = parseInt(itemIdx);
                if (order.items[idx]) {
                    order.items[idx].status = status;

                    // Automatically update main order status if all items are ready/served
                    const allReady = order.items.every(it => ['ready', 'served'].includes(it.status));
                    if (allReady) order.status = 'ready';
                }
            }
            // Case 2: Bulk Order Status Update
            else if (status === 'completed') {
                order.items.forEach(item => {
                    if (['ready', 'served'].includes(item.status)) item.status = 'completed';
                });
                const allDone = order.items.every(item => item.status === 'completed');
                order.status = allDone ? 'completed' : 'pending';
            }
            else if (status) {
                order.status = status;
                order.items.forEach(item => {
                    if (status === 'ready') {
                        item.status = 'ready';
                    } else if (status === 'preparing' && item.status === 'pending') {
                        item.status = 'preparing';
                    }
                });
            }
            if (paymentStatus) order.paymentStatus = paymentStatus;

            const updatedOrder = await order.save();
            const io = req.app.get('io');
            if (io && req.tenantDbName) {
                io.to(req.tenantDbName).emit('orderUpdated', { action: 'update', data: updatedOrder });
            }
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
