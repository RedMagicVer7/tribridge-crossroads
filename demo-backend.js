import express from 'express'
import cors from 'cors'

const app = express()
const port = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// 用户API模拟数据
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      email: 'demo@tribridge.com',
      fullName: 'Demo User',
      phone: '+86 138****8888',
      kycStatus: 'verified',
      walletAddress: '0x742d35Cc6648C8532C2B41F398999930894B6Af8'
    }
  })
})

// OTC订单
app.get('/api/otc/orders', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        type: 'buy',
        fiatCurrency: 'CNY',
        cryptoCurrency: 'USDT',
        amount: '10000',
        price: '7.20',
        status: 'active',
        trader: 'Alice',
        createdAt: new Date().toISOString()
      }
    ]
  })
})

// 资金池
app.get('/api/pools', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'USDT 稳定收益池',
        currency: 'USDT',
        apy: 8.5,
        tvl: '1000000',
        riskLevel: 'low'
      }
    ]
  })
})

app.listen(port, () => {
  console.log(`🚀 TriBridge Demo API 运行在 http://localhost:${port}`)
})