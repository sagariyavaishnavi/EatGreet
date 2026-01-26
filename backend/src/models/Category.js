const mongoose = require('mongoose');

// We export the Schema, NOT the model
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, default: 'Utensils' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    image: { type: String }
}, {
    timestamps: true,
    collection: 'catagories' // Match user's DB structure
});

module.exports = categorySchema;
