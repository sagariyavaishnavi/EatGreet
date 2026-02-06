const mongoose = require('mongoose');

// We export the Schema, NOT the model
const orderSchema = new mongoose.Schema({
    // Customer might still be global ID, but stored locally for reference.
    // Or we store detailed snapshot of customer since they are in a different DB.
    customerInfo: {
        name: String,
        email: String,
        phone: String,
        id: String // Reference to Global User ID
    },
    tableNumber: { type: String }, // For dine-in
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: String,
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'preparing', 'ready', 'served', 'completed'], default: 'pending' },
        addedAt: { type: Date, default: Date.now }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    instruction: { type: String },
    dailySequence: { type: Number } // Sequential daily order number (e.g. 1, 2, 3...)
}, {
    timestamps: true,
    collection: 'orders' // Match user's DB structure
});

module.exports = orderSchema;
