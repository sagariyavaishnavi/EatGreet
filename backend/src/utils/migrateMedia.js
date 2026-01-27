const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const User = require('../models/User'); // For finding tenants/DBs
const menuItemSchema = require('../models/MenuItem'); // For Menu Items

dotenv.config({ path: '../../.env' }); // Adjust path if needed

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Migration');
    } catch (err) {
        console.error('DB Connection error', err);
        process.exit(1);
    }
};

const migrate = async () => {
    await connectDB();

    try {
        // 1. Get all Users (Potential Restaurant Owners)
        const users = await User.find({ role: { $in: ['admin', 'superadmin'] } });

        console.log(`Found ${users.length} potential tenants.`);

        for (const user of users) {
             const tenantId = user.restaurantName 
                ? user.restaurantName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() 
                : `user_${user._id}`;
            
            console.log(`Processing Tenant: ${tenantId} (${user.restaurantName || 'Unnamed'})`);

            // Switch to Tenant DB
            const dbName = `resto_details_${tenantId}`;
            const tenantDb = mongoose.connection.useDb(dbName, { useCache: true });
            const MenuItem = tenantDb.model('MenuItem', menuItemSchema);

            const items = await MenuItem.find({});
            console.log(`Found ${items.length} items in ${dbName}`);

            for (const item of items) {
                let modified = false;

                // Helper to upload
                const uploadToCloudinary = async (urlOrData, type = 'image') => {
                    if (!urlOrData) return null;
                    if (urlOrData.includes('cloudinary.com')) return urlOrData; // Already migrated

                    try {
                        console.log(`Uploading media for item: ${item.name}...`);
                        const result = await cloudinary.uploader.upload(urlOrData, {
                            folder: `eatgreet_main/${tenantId}`,
                            resource_type: 'auto'
                        });
                        return result.secure_url;
                    } catch (e) {
                        console.error(`Failed to upload media for ${item.name}: ${e.message}`);
                        return urlOrData; // Keep original on fail
                    }
                };

                // Migrate 'image' field (Legacy)
                if (item.image && !item.image.includes('cloudinary.com')) {
                   const newUrl = await uploadToCloudinary(item.image);
                   if (newUrl !== item.image) {
                       item.image = newUrl;
                       modified = true;
                   }
                }

                // Migrate 'media' array
                if (item.media && item.media.length > 0) {
                    for (let i = 0; i < item.media.length; i++) {
                        const mediaItem = item.media[i];
                        if (mediaItem.url && !mediaItem.url.includes('cloudinary.com')) {
                            const newUrl = await uploadToCloudinary(mediaItem.url, mediaItem.type);
                             if (newUrl !== mediaItem.url) {
                                item.media[i].url = newUrl;
                                modified = true;
                            }
                        }
                    }
                }

                if (modified) {
                    await item.save();
                    console.log(`Updated item: ${item.name}`);
                }
            }
        }

        console.log('Migration Complete!');
        process.exit();

    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

migrate();
