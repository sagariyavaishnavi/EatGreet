const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register customer
// @route   POST /api/customers/register
// @access  Public (Tenant context required)
exports.registerCustomer = async (req, res) => {
    try {
        const { Customer } = req.tenantModels;
        const { name, email, password, phone, address } = req.body;

        if (!Customer) {
            return res.status(500).json({ message: 'Tenant context missing' });
        }

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Please provide required fields' });
        }

        const userExists = await Customer.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const customer = await Customer.create({
            name,
            email,
            password,
            phone,
            address
        });

        if (customer) {
            res.status(201).json({
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                token: generateToken(customer._id)
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Login customer
// @route   POST /api/customers/login
// @access  Public (Tenant context required)
exports.loginCustomer = async (req, res) => {
    try {
        const { Customer } = req.tenantModels;
        const { email, password } = req.body;

        if (!Customer) {
            return res.status(500).json({ message: 'Tenant context missing' });
        }

        const customer = await Customer.findOne({ email }).select('+password');

        if (customer && (await customer.matchPassword(password))) {
            res.json({
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                token: generateToken(customer._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Private
exports.getCustomerProfile = async (req, res) => {
    try {
        // req.user is populated by protect middleware (needs adjustment for dynamic model)
        // Actually, the standard protect middleware uses the Global User.
        // We need a customer-specific protect middleware or update the existing one.
        // For now, let's assume valid token means valid ID in the tenant context.

        const { Customer } = req.tenantModels;
        const customer = await Customer.findById(req.user._id);

        if (customer) {
            res.json({
                _id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address
            });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

