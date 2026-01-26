const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Get restaurant details
// @route   GET /api/restaurant
// @access  Private (Admin)
const getRestaurantDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // req.user is set by auth middleware
        if (user && user.restaurantDetails) {
            // Transform to expected frontend format if needed, or return user structure
            res.json({
                ...user.restaurantDetails,
                name: user.restaurantName || user.name, // Mapping back
                // Any other mappings
            });
        } else {
            res.status(404).json({ message: 'Restaurant details not set' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update restaurant details
// @route   PUT /api/restaurant
// @access  Private (Admin)
const updateRestaurantDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Init details object if missing
            if (!user.restaurantDetails) user.restaurantDetails = {};

            user.restaurantName = req.body.name || user.restaurantName;

            user.restaurantDetails.description = req.body.description || user.restaurantDetails.description;
            user.restaurantDetails.address = req.body.address || user.restaurantDetails.address;
            user.restaurantDetails.contactNumber = req.body.contactNumber || user.restaurantDetails.contactNumber;
            user.restaurantDetails.logo = req.body.logo || user.restaurantDetails.logo;

            const updatedUser = await user.save();
            res.json({
                ...updatedUser.restaurantDetails,
                name: updatedUser.restaurantName
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create restaurant (Updates User with Restaurant Details)
// @route   POST /api/restaurant
// @access  Private (Admin)
const createRestaurant = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.restaurantDetails && user.restaurantDetails.isActive) {
            // Technically checking if they already 'have' a restaurant
            // For now we assume 1 user = 1 restaurant
            // return res.status(400).json({ message: 'Restaurant already exists' });
            // Actually, create might be treated as upsert or init
        }

        user.restaurantName = req.body.name;
        user.restaurantDetails = {
            description: req.body.description,
            address: req.body.address,
            contactNumber: req.body.contactNumber,
            logo: req.body.logo,
            isActive: true,
            joinedAt: new Date()
        };

        const updated = await user.save();
        res.status(201).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc Get public restaurant info by ID
const getRestaurantPublic = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).select('-owner -dbName');
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get public restaurant info by DB Name (or slug) - useful for domains
const getRestaurantByName = async (req, res) => {
    // Implementation depends on if we expose dbName or slug.
    // Skipping for now unless requested.
};

// @desc    Get all restaurants (Super Admin) - Now fetching from Users
const getAllRestaurants = async (req, res) => {
    try {
        // Find users who are admins (restaurant owners)
        const users = await User.find({ role: 'admin' }).select('-password');

        // Map users to the structure expected by frontend (simulating old Restaurant model structure)
        const restaurants = users.map(user => ({
            _id: user._id,
            name: user.name, // Owner Name
            email: user.email,
            restaurantName: user.restaurantName, // Business Name
            createdAt: user.restaurantDetails?.joinedAt || user.createdAt,
            isActive: user.restaurantDetails?.isActive ?? true,
            // Add other details if needed
        }));

        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRestaurantDetails, updateRestaurantDetails, createRestaurant, getRestaurantPublic, getAllRestaurants };
