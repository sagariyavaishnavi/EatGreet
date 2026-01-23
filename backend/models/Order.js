const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: [true, 'Please add a customer name']
    },
    tableNumber: {
        type: String,
        required: [true, 'Please add a table number']
    },
    items: [{
        menuItem: {
            type: mongoose.Schema.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = OrderSchema;
