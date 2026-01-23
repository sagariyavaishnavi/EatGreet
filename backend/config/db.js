const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

// Helper to construct URI with specific DB
const getURI = (dbName) => {
    try {
        const url = new URL(MONGO_URI);
        url.pathname = `/${dbName}`;
        return url.toString();
    } catch (e) {
        return `${MONGO_URI}/${dbName}`;
    }
};

/**
 * 1. Registry Database: 'restaurent'
 * Stores: 'resto_names'
 */
const mainConn = mongoose.createConnection(getURI('restaurent'), {
    serverSelectionTimeoutMS: 5000
});
mainConn.on('connected', () => console.log('DB Connected: restaurent (Registry)'));

/**
 * 2. Business Database: 'resto_info'
 * Single database containing all restaurant data.
 * Collections are prefixed by restaurant name for isolation.
 * e.g., 'cestro_categories', 'cestro_menu_items', 'cestro_orders'
 */
const restoInfoConn = mongoose.createConnection(getURI('resto_info'), {
    serverSelectionTimeoutMS: 5000
});
restoInfoConn.on('connected', () => console.log('DB Connected: resto_info (Business)'));

module.exports = {
    mainConn,
    restoInfoConn
};
