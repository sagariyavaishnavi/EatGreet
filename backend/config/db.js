const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to primary URI: ${error.message}`);
        console.log('Attempting fallback to local MongoDB...');
        try {
            const conn = await mongoose.connect('mongodb://localhost:27017/eatgreet');
            console.log(`MongoDB Connected (Fallback): ${conn.connection.host}`);
        } catch (fallbackError) {
             console.error(`Fallback Error: ${fallbackError.message}`);
             process.exit(1);
        }
    }
};

module.exports = connectDB;
