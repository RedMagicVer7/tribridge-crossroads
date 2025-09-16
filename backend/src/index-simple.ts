import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 导入服务
import { MultiChainService } from './services/multiChainService'
import { KYCService } from './services/kycService'
import { redis } from './services/redis'

class TriBridgeServer {
  private app: express.Application
  private server: any
  private io: SocketIOServer
  private multiChainService: MultiChainService
  private kycService: KYCService

  constructor() {
    this.app = express()
    this.server = createServer(this.app)
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })
    
    this.multiChainService = new MultiChainService()
    this.kycService = new KYCService()
    
    this.setupMiddleware()
    this.setupRoutes()
    this.setupSocketIO()
  }

  private setupMiddleware(): void {
    // 安全中间件
    this.app.use(helmet())
    
    // CORS配置
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true
    }))
    
    // 压缩中间件
    this.app.use(compression())
    
    // 解析中间件
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  }

  private setupRoutes(): void {
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'TriBridge API服务运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      })
    })

    // API信息
    this.app.get('/api/info', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'TriBridge Backend API',
          version: '1.0.0',
          description: '跨境支付区块链后端服务',
          supportedChains: ['ethereum', 'tron', 'bsc'],
          supportedTokens: ['USDT', 'USDC', 'DAI', 'BUSD'],
          features: [
            'Multi-chain support',
            'KYC/AML integration', 
            'Cross-chain settlement',
            'Real-time monitoring'
          ]
        }
      })
    })

    // 获取支持的区块链
    this.app.get('/api/chains', (req, res) => {
      try {
        const chains = this.multiChainService.getSupportedChains()
        res.json({
          success: true,
          data: chains
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: '获取区块链列表失败'
        })
      }
    })

    // 测试多链服务
    this.app.get('/api/test/multichain', async (req, res) => {
      try {
        const { chain = 'ethereum', token = 'USDT', address = '0x742d35Cc6648C8532C2B41F398999930894B6Af8' } = req.query

        const balance = await this.multiChainService.getStablecoinBalance(
          chain as string,
          token as string, 
          address as string
        )

        res.json({
          success: true,
          data: {
            chain,
            token,
            address,
            balance
          }
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : '多链服务测试失败'
        })
      }
    })

    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: `路由 ${req.method} ${req.originalUrl} 未找到`
      })
    })

    // 错误处理
    this.app.use((error: any, req: any, res: any, next: any) => {
      console.error('Global Error:', error)
      res.status(500).json({
        success: false,
        error: '服务器内部错误'
      })
    })
  }

  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log('客户端连接:', socket.id)

      socket.on('subscribe-transactions', (userId) => {
        socket.join(`user-${userId}`)
        console.log(`用户 ${userId} 订阅交易更新`)
      })

      socket.on('disconnect', () => {
        console.log('客户端断开连接:', socket.id)
      })
    })
  }

  public async start(): Promise<void> {
    try {
      const port = process.env.PORT || 8000

      // 测试Redis连接
      try {
        await redis.connect()
        console.log('✓ Redis连接成功')
      } catch (error) {
        console.warn('⚠ Redis连接失败，将在无缓存模式下运行:', error)
      }

      // 启动服务器
      this.server.listen(port, () => {
        console.log(`
🚀 TriBridge Backend API 服务已启动
📡 端口: ${port}
🌐 环境: ${process.env.NODE_ENV || 'development'}
🔗 支持的区块链: Ethereum, TRON, BSC
💰 支持的代币: USDT, USDC, DAI, BUSD
📊 实时监控: WebSocket 已启用
        `)
      })

    } catch (error) {
      console.error('启动服务器失败:', error)
      process.exit(1)
    }
  }
}

// 启动服务器
const server = new TriBridgeServer()
server.start().catch(error => {
  console.error('服务器启动失败:', error)
  process.exit(1)
})

export default TriBridgeServer