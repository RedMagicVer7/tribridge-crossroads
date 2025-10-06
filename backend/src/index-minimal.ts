import express from 'express'
import cors from 'cors'

const app = express()
const port = parseInt(process.env.PORT || '8000')

// 基础中间件
app.use(cors())
app.use(express.json())

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: port,
    env: process.env.NODE_ENV || 'development'
  })
})

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'TriBridge API is running',
    endpoints: {
      health: '/health',
      info: '/api/info'
    }
  })
})

// API信息
app.get('/api/info', (req, res) => {
  res.json({
    name: 'TriBridge Backend API',
    version: '1.0.0',
    status: 'running'
  })
})

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Health check: http://localhost:${port}/health`)
})

export default app