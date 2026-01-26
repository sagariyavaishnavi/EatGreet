const mongoose = require('mongoose');

// This remains a GLOBAL model in the Main DB
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Dynamic DB Name for this tenant
    dbName: { type: String, required: true, unique: true },

    description: { type: String },
    address: { type: String },
    contactNumber: { type: String },
    logo: { type: String },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    collection: 'resto_names' // Explicitly set collection name
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
