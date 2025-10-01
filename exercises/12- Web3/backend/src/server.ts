import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { initializeBlockchain } from './utils/blockchain.js';
import authRoutes from './routes/auth.js';
import faucetRoutes from './routes/faucet.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Faucet Backend API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/faucet', faucetRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Initialize blockchain and start server
async function startServer() {
  try {
    console.log('🚀 Starting Faucet Backend API...');
    
    // Initialize blockchain connection
    initializeBlockchain();
    
    // Start HTTP server
    app.listen(config.port, () => {
      console.log(`✅ Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📱 Frontend URL: ${config.frontendUrl}`);
      console.log(`🔗 Blockchain: ${config.rpcUrl}`);
      console.log('\n📚 API Endpoints:');
      console.log(`   GET  /health                    - Health check`);
      console.log(`   POST /auth/message              - Get SIWE message`);
      console.log(`   POST /auth/signin               - Sign in with SIWE`);
      console.log(`   POST /faucet/claim              - Claim tokens (protected)`);
      console.log(`   GET  /faucet/status/:address    - Get status (protected)`);
      console.log(`   GET  /faucet/info               - Get faucet info (public)`);
      console.log('\n🔒 Authentication: Bearer <JWT_TOKEN>');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
