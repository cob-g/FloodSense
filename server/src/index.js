import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeSocket } from './socket.js';

// Import routes
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import fallbackRoutes from './routes/fallbacks.js';
import sensorRoutes from './routes/sensors.js';
import analyticsRoutes from './routes/analytics.js';
import usersAdminRoutes from './routes/usersAdmin.js';
import contactRoutes from './routes/contact.js';
import chatRoutes from './routes/chat.js';
import geocodeRoutes from './routes/geocode.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Socket.IO CORS - will be configured after allowedOrigins is defined
const socketServer = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? [process.env.CLIENT_URL].filter(Boolean)
        : [
          "http://localhost:5173", 
          "http://localhost:3000", 
          "http://localhost:3001",
          "http://localhost:5174",  // ✅ Added port 5174 (actual frontend port)
          "http://localhost:5175"
        ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize socket instance for use in other modules
const io = initializeSocket(socketServer);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/floodsense';

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.CLIENT_URL].filter(Boolean)
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.CLIENT_URL
    ].filter(Boolean);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files
const uploadsPath = process.env.UPLOAD_PATH || './uploads';
app.use('/uploads', express.static(path.resolve(uploadsPath)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/fallbacks', fallbackRoutes);
app.use('/api', sensorRoutes); // Sensor routes (handles /api/sensor-data)
app.use('/api/admin', analyticsRoutes); // Admin analytics (weekly report)
app.use('/api/admin', usersAdminRoutes); // Admin users management
app.use('/api/contact', contactRoutes); // Contact form routes
app.use('/api/chat', chatRoutes);
app.use('/api/geocode', geocodeRoutes); // AI Chatbot routes

// Basic health check endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'FloodSense API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'FloodSense API',
    version: '1.0.0',
    description: 'Community flood monitoring and reporting system',
    endpoints: {
      auth: '/api/auth',
      reports: '/api/reports',
      fallbacks: '/api/fallbacks',
      sensorData: '/api/sensor-data',
      ping: '/api/ping'
    },
    documentation: 'https://github.com/your-org/floodsense'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB.'
    });
  }
  
  if (error.message && error.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // MongoDB errors
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format.'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  
  // Join barangay room for location-based updates
  socket.on('join-barangay', (barangay) => {
    if (barangay && typeof barangay === 'string') {
      socket.join(`barangay-${barangay}`);
      console.log(`User ${socket.id} joined barangay: ${barangay}`);
      
      socket.emit('joined-barangay', {
        barangay,
        message: `Successfully joined ${barangay} updates`
      });
    }
  });

  // Leave barangay room
  socket.on('leave-barangay', (barangay) => {
    if (barangay && typeof barangay === 'string') {
      socket.leave(`barangay-${barangay}`);
      console.log(`User ${socket.id} left barangay: ${barangay}`);
      
      socket.emit('left-barangay', {
        barangay,
        message: `Left ${barangay} updates`
      });
    }
  });

  // Handle ping for connection testing
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Run seeding if needed
    if (process.env.SEED_ADMIN === 'true') {
      try {
        const { seedAdmin } = await import('./utils/seed.js');
        await seedAdmin();
      } catch (seedError) {
        console.warn('⚠️  Admin seeding failed. Continuing without seeded admin:', seedError?.message || seedError);
      }
    }
    
    // Handle port-in-use error before attempting to listen
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use by another process.`);
        console.error(`   Kill it with: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`);
        console.error(`   Or change PORT in server/.env`);
        process.exit(1);
      }
      throw error;
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 FloodSense server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API available at: http://localhost:${PORT}/api`);
      console.log(`📁 Uploads directory: ${path.resolve(uploadsPath)}`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n📋 Available endpoints:`);
        console.log(`   GET  /api/ping - Health check`);
        console.log(`   POST /api/auth/register - Register user`);
        console.log(`   POST /api/auth/login - Login user`);
        console.log(`   GET  /api/reports - Get reports`);
        console.log(`   POST /api/reports - Create report`);
        console.log(`   GET  /api/fallbacks - Get fallback places`);
        console.log(`   POST /api/sensor-data - Submit sensor reading (ESP32)`);
        console.log(`   GET  /api/sensor-data - Get sensor readings`);
      }
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log('HTTP server closed.');
    
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      process.exit(1);
    }
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UN HANDLED_REJECTION');
});

// Export for use in other modules
export { app };
