// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');

// // Load env vars with absolute path and fallback
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// // Fallback for development if env fails
// if (!process.env.MONGO_URI) {
//     console.warn('Warning: MONGO_URI not found in .env, using default local URI');
//     process.env.MONGO_URI = 'mongodb://localhost:27017/eatgreet';
// }
// if (!process.env.PORT) {
//     process.env.PORT = 5000;
// }

// const { resolveTenant } = require('./middleware/tenantMiddleware');

// const app = express();

// // Body parser
// app.use(express.json());

// // Enable CORS
// app.use(cors({
//     origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
//     credentials: true
// }));

// // Request Logging
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));

// // Apply tenant resolution to data routes
// app.use('/api/menu', resolveTenant, require('./routes/menuRoutes'));
// app.use('/api/categories', resolveTenant, require('./routes/categoryRoutes'));
// app.use('/api/orders', resolveTenant, require('./routes/orderRoutes'));
// app.use('/api/customers', resolveTenant, require('./routes/customerRoutes')); // New Customer Routes
// app.use('/api/stats', require('./routes/statsRoutes'));
// app.use('/api/upload', require('./routes/uploadRoutes'));

// app.get('/', (req, res) => {
//     res.send('EatGreet API is running...');
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });

// Core imports
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Fallback
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb://localhost:27017/eatgreet";
}

const PORT = process.env.PORT || 5000;

// Init app
const app = express();

// Parse JSON
app.use(express.json());

// Enable CORS (this ALREADY handles OPTIONS)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Tenant middleware
const { resolveTenant } = require("./middleware/tenantMiddleware");

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/menu", resolveTenant, require("./routes/menuRoutes"));
app.use("/api/categories", resolveTenant, require("./routes/categoryRoutes"));
app.use("/api/orders", resolveTenant, require("./routes/orderRoutes"));
app.use("/api/customers", resolveTenant, require("./routes/customerRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// Health check
app.get("/", (req, res) => {
  res.send("EatGreet API is running...");
});

// Start server (LAST)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
