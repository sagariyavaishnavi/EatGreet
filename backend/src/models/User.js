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
    currency: { type: String, default: 'INR' },
    profilePicture: { type: String },

    // Embed Restaurant Details (Merged 'resto_names' into Users)
    restaurantDetails: {
        description: { type: String },
        address: { type: String },
        contactNumber: { type: String },
        logo: { type: String },
        gstNumber: { type: String },
        cuisineType: { type: String },
        businessEmail: { type: String },
        location: {
            lat: { type: Number, default: 23.0225 },
            lng: { type: Number, default: 72.5714 }
        },
        operatingHours: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '23:00' }
        },
        isActive: { type: Boolean, default: true },
        totalTables: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now }
    },

    orderPreferences: {
        acceptOrders: { type: Boolean, default: true },
        autoAccept: { type: Boolean, default: false },
        cancelEnabled: { type: Boolean, default: true },
        avgPrepTime: { type: Number, default: 25 }
    },

    bankDetails: {
        accountHolder: { type: String },
        accountNumber: { type: String },
        bankName: { type: String },
        ifscCode: { type: String },
        settlementCycle: { type: String, default: 'Daily (T+1)' }
    },

    notificationPreferences: {
        newOrder: { type: Boolean, default: true },
        statusUpdates: { type: Boolean, default: true },
        lowStock: { type: Boolean, default: true },
        paymentReceived: { type: Boolean, default: true }
    },

    staff: [{
        name: { type: String },
        role: { type: String },
        email: { type: String },
        isActive: { type: Boolean, default: true }
    }],

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
