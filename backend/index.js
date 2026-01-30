require('dotenv').config();
const dns = require('dns');
// Set Google DNS to bypass local network DNS issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./src/db/db');
const seedSuperAdmin = require('./src/utils/seedSuperAdmin');

const app = express();
const server = http.createServer(app);

// Update CORS to allow Socket.io and Frontend
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-restaurant-name']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Socket.io Setup
const io = new Server(server, {
    cors: corsOptions
});

// Store io instance in app to use in controllers
app.set('io', io);

io.on('connection', (socket) => {
    // Join a specific restaurant room for updates
    socket.on('joinRestaurant', (restaurantId) => {
        socket.join(restaurantId);
    });
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/restaurant', require('./src/routes/restaurantRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/menu', require('./src/routes/menuRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/stats', require('./src/routes/statsRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const cloudinary = require('cloudinary').v2;
const { protect } = require('./src/middleware/authMiddleware'); // Import protect middleware

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Signature Route for Direct Upload
app.get('/api/upload/signature', protect, (req, res) => {
    try {
        const timestamp = Math.round((new Date).getTime() / 1000);

        // Tenant Isolation: Create folder path
        const tenantName = req.user.restaurantName
            ? req.user.restaurantName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
            : `user_${req.user._id}`;
        const folder = `eatgreet_main/${tenantName}`;

        // Parameters to sign (Must match what frontend sends EXACTLY)
        const paramsToSign = {
            timestamp: timestamp,
            folder: folder,
        };

        const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

        res.json({
            signature,
            timestamp,
            folder,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        console.error('Signature Error:', error);
        res.status(500).json({ message: 'Could not generate signature' });
    }
});

// Cleanup Route for Cancelled Uploads
app.post('/api/upload/cleanup', protect, async (req, res) => {
    try {
        const { publicIds } = req.body;
        if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
            return res.status(200).json({ message: "Nothing to clean" });
        }

        console.log(`Cleaning up ${publicIds.length} orphaned files...`);
        const results = await Promise.all(publicIds.map(id => {
            // Determine resource type? Default image. If video, ID usually implies?
            // Cloudinary destroy defaults to image. If video, we need to know.
            // For now, try both or expect frontend to send type/object.
            // Simplification: Try destroying as image (most likely).
            // Better: Frontend sends objects { id, type }?
            // Let's assume frontend sends string IDs and we try default.
            return cloudinary.uploader.destroy(id);
        }));

        res.json({ message: "Cleanup successful", results });
    } catch (error) {
        console.error("Cleanup Error", error);
        res.status(500).json({ message: "Cleanup failed" });
    }
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Connection and Server Startup
const startServer = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        });

        console.log('Seeding Super Admin if needed...');
        await seedSuperAdmin();
        console.log('✅ Startup complete');
    } catch (error) {
        console.error('❌ Fatal Startup Error:', error);
        process.exit(1);
    }
};

startServer();

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

