// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//     let token;

//     if (
//         req.headers.authorization &&
//         req.headers.authorization.startsWith('Bearer')
//     ) {
//         try {
//             // Get token from header
//             token = req.headers.authorization.split(' ')[1];

//             // Verify token
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             // Get user from the token
//             req.user = await User.findById(decoded.id).select('-password');

//             if (!req.user) {
//                 return res.status(401).json({ message: 'User not found' });
//             }

//             next();
//         } catch (error) {
//             console.error('Auth Error:', error);
//             res.status(401).json({ message: 'Not authorized' });
//         }
//     }

//     if (!token) {
//         res.status(401).json({ message: 'Not authorized, no token' });
//     }
// };

// const authorize = (...roles) => {
//     return (req, res, next) => {
//         if (!req.user || !roles.includes(req.user.role)) {
//             return res.status(403).json({
//                 message: `User role ${req.user ? req.user.role : 'none'} is not authorized to access this route`
//             });
//         }
//         next();
//     };
// };

// const protectCustomer = async (req, res, next) => {
//     let token;

//     if (
//         req.headers.authorization &&
//         req.headers.authorization.startsWith('Bearer')
//     ) {
//         try {
//             // Get token
//             token = req.headers.authorization.split(' ')[1];

//             // Verify
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             // Check if tenant context exists
//             if (!req.tenantModels || !req.tenantModels.Customer) {
//                 return res.status(500).json({ message: 'Tenant context missing in auth' });
//             }

//             // Get customer
//             req.user = await req.tenantModels.Customer.findById(decoded.id).select('-password');

//             if (!req.user) {
//                 return res.status(401).json({ message: 'Customer not found' });
//             }

//             next();
//         } catch (error) {
//             console.error('Customer Auth Error:', error);
//             res.status(401).json({ message: 'Not authorized' });
//         }
//     } else {
//         res.status(401).json({ message: 'Not authorized, no token' });
//     }
// };

// module.exports = { protect, authorize, protectCustomer };

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * ADMIN / STAFF AUTH
 */
const protect = async (req, res, next) => {
  // ✅ VERY IMPORTANT: allow preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

/**
 * CUSTOMER AUTH (TENANT AWARE)
 */
const protectCustomer = async (req, res, next) => {
  // ✅ VERY IMPORTANT: allow preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!req.tenantModels?.Customer) {
        return res.status(500).json({ message: "Tenant context missing" });
      }

      req.user = await req.tenantModels.Customer
        .findById(decoded.id)
        .select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Customer not found" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

const authorize = (...roles) => (req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};

module.exports = { protect, protectCustomer, authorize };
