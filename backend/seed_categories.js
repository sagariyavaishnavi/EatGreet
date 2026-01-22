const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
const Category = require('./models/Category');

dotenv.config();
connectDB();

const categories = [
    { name: 'Vegan/Veg', icon: 'Vegan/Veg' },
    { name: 'Gluten-Free', icon: 'Grain' },
    { name: 'Spicy', icon: 'Spicy' },
    { name: 'Egg', icon: 'Egg' },
    { name: 'Seafood', icon: 'Seafood' },
    { name: 'Dairy', icon: 'Dairy' },
    { name: 'Sugar-Free', icon: 'Healthy' },
    { name: 'Low-Calorie', icon: 'Healthy' },
    { name: 'Keto', icon: 'Healthy' },
    { name: 'Jain', icon: 'Utensils' },
    { name: 'Vegetarian', icon: 'Vegan/Veg' },
    { name: 'Non-Vegetarian', icon: 'Seafood' },
    { name: 'Nut-Free', icon: 'Healthy' },
    { name: 'Soy-Free', icon: 'Healthy' },
    { name: 'Halal', icon: 'Utensils' },
    { name: 'Kosher', icon: 'Utensils' }
];

const seedCategories = async () => {
    try {
        console.log('Seeding Categories...'.yellow.bold);
        
        // We do NOT delete existing categories, only add new ones if they don't exist
        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`Created category: ${cat.name}`.green);
            } else {
                console.log(`Category exists: ${cat.name}`.blue);
            }
        }

        console.log('Category Seeding Complete!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

seedCategories();
