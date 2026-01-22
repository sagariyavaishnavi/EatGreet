const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const seedData = async () => {
    try {
        // Fallback if env vars fail
        if (!process.env.MONGO_URI) { 
             process.env.MONGO_URI = 'mongodb://localhost:27017/eatgreet';
        }
        
        console.log(`Connecting to: ${process.env.MONGO_URI}`);
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 }).catch(err => {
            console.error('Failed to connect to primary URI, attempting fallback to local...');
            return mongoose.connect('mongodb://localhost:27017/eatgreet');
        });
        console.log('MongoDB Connected...');

        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await MenuItem.deleteMany();

        // Create Super Admin
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'admin@eatgreet.com',
            password: 'password123', // Must be at least 6 characters
            role: 'super-admin'
        });

        // Create Restaurant Admin
        const restaurantAdmin = await User.create({
            name: 'John Doe',
            email: 'admin@gmail.com',
            password: 'password123', // Must be at least 6 characters
            role: 'admin',
            restaurantName: "John's Kitchen"
        });

        // Create Categories
        const categories = await Category.insertMany([
            { name: 'Breakfast', icon: 'Egg', createdBy: superAdmin._id },
            { name: 'Lunch', icon: 'Utensils', createdBy: superAdmin._id },
            { name: 'Dinner', icon: 'Moon', createdBy: superAdmin._id },
            { name: 'Drinks', icon: 'Coffee', createdBy: superAdmin._id },
            { name: 'Main Course', icon: 'UtensilsCrossed', createdBy: superAdmin._id },
            { name: 'Desserts', icon: 'IceCream', createdBy: superAdmin._id }
        ]);

        // Create Menu Items
        await MenuItem.insertMany([
            {
                name: 'Classic Burger',
                description: 'Juicy beef patty with cheese and lettuce',
                price: 299,
                category: categories[4]._id,
                restaurant: restaurantAdmin._id
            },
            {
                name: 'Pancakes',
                description: 'Fluffy pancakes with maple syrup',
                price: 199,
                category: categories[0]._id,
                restaurant: restaurantAdmin._id
            }
        ]);

        console.log('✅ Data Seeded Successfully!');
        console.log('Categories created:', categories.map(c => c.name).join(', '));
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
