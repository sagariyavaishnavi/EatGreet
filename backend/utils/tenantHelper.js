const { restoInfoConn } = require('../config/db');
const CategorySchema = require('../models/Category');
const MenuItemSchema = require('../models/MenuItem');
const OrderSchema = require('../models/Order');

/**
 * Returns tenant-specific models.
 * All restaurants share the 'resto_info' database.
 * Isolation is achieved by prefixing collection names.
 * e.g., 'cestro_categories', 'cestro_menu_items', 'cestro_orders'
 */
const getTenantModels = (restaurantName) => {
    if (!restaurantName) return null;

    // Prefix for namespacing collections within the single database
    const prefix = restaurantName.replace(/\s+/g, '_').toLowerCase();

    // Model names must be unique per restaurant to avoid Mongoose collisions
    const catModelName = `${prefix}_Category`;
    const menuModelName = `${prefix}_MenuItem`;
    const orderModelName = `${prefix}_Order`;

    const Category = restoInfoConn.models[catModelName] ||
        restoInfoConn.model(catModelName, CategorySchema, `${prefix}_categories`);

    let MenuItem;
    if (restoInfoConn.models[menuModelName]) {
        MenuItem = restoInfoConn.models[menuModelName];
    } else {
        const tenantMenuSchema = MenuItemSchema.clone();
        tenantMenuSchema.path('category').options.ref = catModelName;
        MenuItem = restoInfoConn.model(menuModelName, tenantMenuSchema, `${prefix}_menu_items`);
    }

    let Order;
    if (restoInfoConn.models[orderModelName]) {
        Order = restoInfoConn.models[orderModelName];
    } else {
        const tenantOrderSchema = OrderSchema.clone();
        tenantOrderSchema.path('items.menuItem').options.ref = menuModelName;
        Order = restoInfoConn.model(orderModelName, tenantOrderSchema, `${prefix}_orders`);
    }

    return { Category, MenuItem, Order };
};

module.exports = { getTenantModels };
