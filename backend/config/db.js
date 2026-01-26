const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

// Helper to construct URI with specific DB
const getURI = (dbName) => {
    try {
        const url = new URL(MONGO_URI);
        // Remove strictly the path, keep query params
        url.pathname = `/${dbName}`;
        return url.toString();
    } catch (e) {
        return `${MONGO_URI}/${dbName}`;
    }
};

/**
 * 1. Registry Database: 'restaurent'
 * Stores: 'resto_names' (User/Admin accounts)
 */
const mainConn = mongoose.createConnection(getURI('restaurent'), {
    serverSelectionTimeoutMS: 30000
});
mainConn.on('connected', () => console.log('DB Connected: restaurent (Registry)'));

/**
 * 2. Dynamic Tenant Connections
 * Maintains a cache of database connections for each restaurant.
 */
const connectionCache = {};

const getTenantConnection = (dbName) => {
    if (connectionCache[dbName]) {
        return connectionCache[dbName];
    }

    const conn = mongoose.createConnection(getURI(dbName), {
        serverSelectionTimeoutMS: 30000
    });

    conn.on('connected', () => console.log(`DB Connected: ${dbName} (Tenant)`));

    // Handle errors/disconnections to prevent stale connections in cache? 
    // For simple use case, we just cache.

    connectionCache[dbName] = conn;
    return conn;
};

module.exports = {
    mainConn,
    getTenantConnection
};
