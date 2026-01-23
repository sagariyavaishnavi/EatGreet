const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getTenantModels } = require('../utils/tenantHelper');

// Create Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, restaurantName, phone, city } = req.body;

        // Validate all required fields
        if (!name || !email || !password || !restaurantName || !phone || !city) {
            return res.status(400).json({
                message: 'Please provide all required fields: name, email, password, restaurantName, phone, city'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            restaurantName,
            phone,
            city,
            role: 'admin'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantName: user.restaurantName,
                phone: user.phone,
                city: user.city,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantName: user.restaurantName,
                phone: user.phone,
                city: user.city,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantName: user.restaurantName,
                phone: user.phone,
                city: user.city
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get all restaurants (admins)
// @route   GET /api/auth/restaurants
// @access  Private/SuperAdmin
exports.getRestaurants = async (req, res) => {
    try {
        const restaurants = await User.find({ role: 'admin' }).select('-password');
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.restaurantName = req.body.restaurantName || user.restaurantName;
            user.city = req.body.city || user.city;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                restaurantName: updatedUser.restaurantName,
                phone: updatedUser.phone,
                city: updatedUser.city,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (user && (await user.matchPassword(req.body.currentPassword))) {
            user.password = req.body.newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
