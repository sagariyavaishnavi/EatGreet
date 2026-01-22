const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Fallback logic
if (!process.env.MONGO_URI) { 
    process.env.MONGO_URI = 'mongodb://localhost:27017/eatgreet';
}

const restoreUser = async () => {
    try {
        console.log(`Connecting to primary DB: ${process.env.MONGO_URI}`);
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 }).catch(err => {
            console.error('Failed to connect to primary URI, attempting fallback to local...');
            return mongoose.connect('mongodb://localhost:27017/eatgreet');
        });
        console.log('MongoDB Connected...');

        const email = 'Khu@gmail.com';
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists, updating password...');
            userExists.password = '789456';
            userExists.role = 'admin'; // Ensure admin privileges
            await userExists.save();
            console.log('User updated successfully');
        } else {
            console.log('User not found, creating new user...');
            await User.create({
                name: 'Restored Admin',
                email: email,
                password: '789456',
                role: 'admin',
                restaurantName: "Restored Kitchen",
                phone: "1234567890",
                city: "New York",
                currency: "USD"
            });
            console.log('User created successfully');
        }

        console.log('✅ Account restored: Khu@gmail.com / 789456');
        process.exit();
    } catch (error) {
        console.error('Error restoring user:', error);
        process.exit(1);
    }
};

restoreUser();
