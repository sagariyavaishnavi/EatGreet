// const express = require('express');
// const router = express.Router();
// const {
//     registerCustomer,
//     loginCustomer,
//     getCustomerProfile
// } = require('../controllers/customerController');
// const { protectCustomer } = require('../middleware/authMiddleware');

// router.post('/register', registerCustomer);
// router.post('/login', loginCustomer);
// router.get('/profile', protectCustomer, getCustomerProfile);

// module.exports = router;

const express = require("express");
const router = express.Router();

// Import controllers (names MUST match exports)
const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
} = require("../controllers/customerController");

// Import middleware
const { protectCustomer } = require("../middleware/authMiddleware");

/**
 * PUBLIC ROUTES
 * Tenant context is REQUIRED (resolveTenant runs before this route)
 */
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

/**
 * PRIVATE ROUTES
 */
router.get("/profile", protectCustomer, getCustomerProfile);

module.exports = router;

