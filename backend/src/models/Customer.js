const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    visits: {
        type: [{
            restaurantName: String,
            tableNumber: String,
            lastVisit: { type: Date, default: Date.now }
        }],
        default: []
    },
    lastOrderAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    collection: 'customers'
});


module.exports = customerSchema;
