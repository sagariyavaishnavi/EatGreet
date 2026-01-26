const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
    phone: { type: String },
    city: { type: String },
    restaurantName: { type: String }, // Added to derive tenant database name

    // Embed Restaurant Details (Merged 'resto_names' into Users)
    restaurantDetails: {
        description: { type: String },
        address: { type: String },
        contactNumber: { type: String },
        logo: { type: String },
        isActive: { type: Boolean, default: true },
        joinedAt: { type: Date, default: Date.now }
    },

    // Embed Payments (Merged 'payments' into Users)
    payments: [{
        transactionId: { type: String },
        amount: { type: Number },
        status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
        method: { type: String },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
