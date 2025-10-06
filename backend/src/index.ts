/**
 * TriBridge Backend API Service
 * Main application entry point
 * @author RedMagicVer7
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import kycRoutes from './routes/kyc'
import transactionRoutes from './routes/transaction'
import blockchainRoutes from './routes/blockchain'
import settlementRoutes from './routes/settlement'
import analyticsRoutes from './routes/analytics'
import russiaEscrowRoutes from './routes/russiaEscrow'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import { validateApiKey } from './middleware/apiKey'

// Logger with enhanced fallback for cloud environments
let logger: any
try {
  // 首先尝试导入winston logger
  logger = require('./utils/logger').logger
  console.log('✅ Winston logger loaded successfully')
} catch (error) {
  console.warn('⚠️  Winston logger failed, using simple fallback:', error.message)
  // 如果winston失败，使用简单的console logger
  logger = {
    info: (msg: string, ...args: any[]) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${new Date().toISOString()}: ${msg}`, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${new Date().toISOString()}: ${msg}`, ...args),
    debug: (msg: string, ...args: any[]) => console.log(`[DEBUG] ${new Date().toISOString()}: ${msg}`, ...args),
    http: (msg: string, ...args: any[]) => console.log(`[HTTP] ${new Date().toISOString()}: ${msg}`, ...args)
  }
}

// Import services
import { DatabaseService } from './services/database'
import { RedisService } from './services/redis'
import { BlockchainService } from './services/blockchain'

// Create service instances
const database = new DatabaseService()
const redis = new RedisService()

class TriBridgeAPI {
  private app: express.Application
  private server: any
  private io: Server
  private port: number

  constructor() {
    this.app = express()
    this.port = parseInt(process.env.PORT || '3001')
    this.server = createServer(this.app)
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    })

    this.initializeMiddleware()
    this.initializeRoutes()
    this.initializeWebSocket()
    this.initializeErrorHandling()
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }))

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      optionsSuccessStatus: 200
    }))

    // Request compression
    this.app.use(compression())

    // Request logging
    this.app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }))

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production' ? 100 : 1000, // requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
    this.app.use('/api', limiter)

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // API key validation for external requests
    this.app.use('/api', validateApiKey)
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      })
    })

    // API routes
    this.app.use('/api/auth', authRoutes)
    this.app.use('/api/user', authMiddleware, userRoutes)
    this.app.use('/api/kyc', authMiddleware, kycRoutes)
    this.app.use('/api/transactions', authMiddleware, transactionRoutes)
    this.app.use('/api/blockchain', authMiddleware, blockchainRoutes)
    this.app.use('/api/settlement', authMiddleware, settlementRoutes)
    this.app.use('/api/analytics', authMiddleware, analyticsRoutes)

    // API documentation
    this.app.get('/api/docs', (req, res) => {
      res.json({
        title: 'TriBridge API Documentation',
        version: '1.0.0',
        description: 'Cross-border stablecoin payment platform API',
        endpoints: {
          auth: '/api/auth',
          user: '/api/user',
          kyc: '/api/kyc',
          transactions: '/api/transactions',
          blockchain: '/api/blockchain',
          settlement: '/api/settlement',
          analytics: '/api/analytics'
        },
        websocket: {
          url: `ws://localhost:${this.port}`,
          events: [
            'transaction_update',
            'rate_change',
            'kyc_status_update',
            'settlement_complete'
          ]
        }
      })
    })

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `The requested endpoint ${req.originalUrl} does not exist`,
        timestamp: new Date().toISOString()
      })
    })
  }

  private initializeWebSocket(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`)

      // Join user-specific room
      socket.on('join_user_room', (userId: string) => {
        socket.join(`user_${userId}`)
        logger.info(`User ${userId} joined their room`)
      })

      // Handle transaction monitoring
      socket.on('monitor_transaction', (transactionId: string) => {
        socket.join(`transaction_${transactionId}`)
        logger.info(`Monitoring transaction: ${transactionId}`)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`)
      })
    })

    // Store socket.io instance globally for other services
    ;(global as any).io = this.io
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler)

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      this.server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      this.server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
      process.exit(1)
    })
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await database.testConnection()
      logger.info('Database connected successfully')

      // Initialize Redis connection
      await redis.connect()
      logger.info('Redis connected successfully')

      // Initialize blockchain services
      // 初始化区块链服务
      const blockchainService = new BlockchainService()
      blockchainService.startHealthCheck()
      logger.info('Blockchain services initialized')

      // Start server
      this.server.listen(this.port, () => {
        logger.info(`🚀 TriBridge API Server running on port ${this.port}`)
        logger.info(`📚 API Documentation: http://localhost:${this.port}/api/docs`)
        logger.info(`🔍 Health Check: http://localhost:${this.port}/health`)
        logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
      })

    } catch (error) {
      logger.error('Failed to start server:', error)
      process.exit(1)
    }
  }
}

// Start the application
const api = new TriBridgeAPI()
api.start()

export default TriBridgeAPI