const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Fail after 5 seconds
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        // Do not exit process immediately in dev so we can see the error? 
        // Actually exiting is fine if we can see output, but we can't.
        // Let's Log and Retrow so startup fails but we might see it in a log file if we had one.
        process.exit(1);
    }
};

module.exports = { connectDB };
