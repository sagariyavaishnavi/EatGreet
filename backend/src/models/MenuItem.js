const mongoose = require('mongoose');

// We export the Schema, NOT the model
const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    isAvailable: { type: Boolean, default: true },
    calories: { type: String, default: '250 kcal' },
    time: { type: String, default: '15-20 min' },
    isVeg: { type: Boolean, default: true },
    labels: [String], // Array of strings e.g. ['Vegetarian', 'Spicy']
    media: [{
        name: { type: String },
        url: { type: String },
        type: { type: String },
        size: { type: String }
    }],
    models: [{
        name: { type: String },
        url: { type: String },
        type: { type: String },
        size: { type: String }
    }]
}, {
    timestamps: true,
    collection: 'menuitems' // Match user's DB structure
});

module.exports = menuItemSchema;
