const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a dish name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    image: {
        type: String,
        required: [true, 'Please add an image']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isVeg: {
        type: Boolean,
        required: [true, 'Please specify if the item is vegetarian']
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = MenuItemSchema;
