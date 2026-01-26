const mongoose = require('mongoose');

// Cache for tenant connections
const connections = {};

/**
 * Gets or creates a database connection for a specific tenant
 * @param {string} dbName - The name of the tenant's database
 * @returns {mongoose.Connection}
 */
const getTenantConnection = (dbName) => {
    if (connections[dbName]) {
        return connections[dbName];
    }

    // Create new connection using the same URI base but different DB name
    // Note: MongoURI typically looks like mongodb://localhost:27017/default
    // We need to parse it or append if it's Atlas
    let uri = process.env.MONGO_URI;

    try {
        // Robustly replace database name in connection string
        if (uri.includes('?')) {
            // Format: mongodb+srv://host/dbname?options or mongodb+srv://host/?options
            const [base, query] = uri.split('?');
            if (base.endsWith('/')) {
                // Case: ...host/?options (no db name)
                uri = `${base}${dbName}?${query}`;
            } else {
                // Case: ...host/dbname?options OR ...host (no slash? rare with options)
                const lastSlash = base.lastIndexOf('/');
                if (lastSlash !== -1 && !base.substring(lastSlash).includes('.')) {
                    // Assumes host doesn't have slash, but 'mongodb.net' does not. 
                    // We strip the existing DB name (if any) and append new one
                    const hostPart = base.substring(0, lastSlash + 1);
                    uri = `${hostPart}${dbName}?${query}`;
                } else {
                    // Fallback if structure is weird, just append/replace?
                    // If no slash at all in base (unlikely for valid URI), just append /dbName
                    uri = `${base}/${dbName}?${query}`;
                }
            }
        } else {
            // No query params
            const lastSlash = uri.lastIndexOf('/');
            if (lastSlash !== -1) {
                const hostPart = uri.substring(0, lastSlash + 1);
                uri = `${hostPart}${dbName}`;
            } else {
                uri = `${uri}/${dbName}`;
            }
        }
    } catch (err) {
        console.error("Error constructing tenant URI", err);
        // Fallback
        return mongoose.connection.useDb(dbName, { useCache: true });
    }

    const conn = mongoose.createConnection(uri);
    connections[dbName] = conn;

    return conn;
};

/**
 * Helper to get models attached to a connection
 * @param {mongoose.Connection} connection 
 * @param {string} modelName 
 * @param {mongoose.Schema} schema 
 */
const getTenantModel = (connection, modelName, schema) => {
    // Prevent model overwrite error if it already exists on this connection
    if (connection.models[modelName]) {
        return connection.models[modelName];
    }
    return connection.model(modelName, schema);
};

module.exports = { getTenantConnection, getTenantModel };
