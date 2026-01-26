require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./src/db/db');
const seedSuperAdmin = require('./src/utils/seedSuperAdmin');

const app = express();
const server = http.createServer(app);

// Update CORS to allow Socket.io and Frontend
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true
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

// Real Upload Route: Converts image to Base64 for DB storage (No local folders)
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Convert buffer to Base64 Data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    res.json({
        url: dataURI,
        secure_url: dataURI
    });
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Connection and Server Startup
const startServer = async () => {
    try {
        await connectDB();
        await seedSuperAdmin();

        const PORT = process.env.PORT || 5000;
        server.listen(PORT);
    } catch (error) {
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

