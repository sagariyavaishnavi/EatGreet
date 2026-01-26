const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
    method: { type: String, enum: ['Razorpay', 'UPI', 'Card', 'NetBanking'], default: 'Razorpay' },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
