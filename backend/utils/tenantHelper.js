const { getTenantConnection } = require('../config/db');
const CategorySchema = require('../models/Category');
const MenuItemSchema = require('../models/MenuItem');
const OrderSchema = require('../models/Order');

/**
 * Returns tenant-specific models.
 * Each restaurant gets its OWN database.
 * e.g. database: 'skyline' -> collections: 'categories', 'menuitems', 'orders'
 */
const getTenantModels = (restaurantName) => {
    if (!restaurantName) return null;

    // Use normalized restaurant name as Database Name
    // e.g. "Skyline Resto" -> "skyline_resto"
    const dbName = restaurantName.replace(/\s+/g, '_').toLowerCase();

    // Get connection to the specific tenant database
    const tenantConn = getTenantConnection(dbName);

    // 1. Category Model
    // Simple name 'Category', no prefix needed as connection is isolated
    let Category;
    if (tenantConn.models.Category) {
        Category = tenantConn.models.Category;
    } else {
        Category = tenantConn.model('Category', CategorySchema, 'categories');
    }

    // 2. MenuItem Model
    let MenuItem;
    if (tenantConn.models.MenuItem) {
        MenuItem = tenantConn.models.MenuItem;
    } else {
        // Clone schema to ensure refs point correctly within this connection context
        // default ref 'Category' in schema works because we registered 'Category' model on this conn above
        const tenantMenuSchema = MenuItemSchema.clone();

        // Explicitly force ref to be 'Category' (though it is default) to be safe
        tenantMenuSchema.path('category').options.ref = 'Category';

        MenuItem = tenantConn.model('MenuItem', tenantMenuSchema, 'menuitems');
    }

    // 3. Order Model
    let Order;
    if (tenantConn.models.Order) {
        Order = tenantConn.models.Order;
    } else {
        const tenantOrderSchema = OrderSchema.clone();
        tenantOrderSchema.path('items.menuItem').options.ref = 'MenuItem';

        Order = tenantConn.model('Order', tenantOrderSchema, 'orders');
    }

    return { Category, MenuItem, Order };
};

module.exports = { getTenantModels };
