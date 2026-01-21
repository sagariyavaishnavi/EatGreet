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
        default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
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
    labels: {
        type: [String],
        default: []
    },
    media: [{
        name: String,
        url: String,
        type: String,
        size: String
    }],
    calories: {
        type: String,
        default: ''
    },
    time: {
        type: String,
        default: ''
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Admin/Manager user
        required: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    reviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
