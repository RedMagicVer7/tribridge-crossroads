import { Router, Request, Response } from 'express'
import { MultiChainService } from '../services/multiChainService'

const router = Router()
const multiChainService = new MultiChainService()

// 获取支持的区块链列表
router.get('/chains', async (req: Request, res: Response) => {
  try {
    const chains = multiChainService.getSupportedChains()
    
    res.json({
      success: true,
      data: chains
    })
  } catch (error) {
    console.error('获取区块链列表错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 获取特定链的配置信息
router.get('/chains/:chainName', async (req: Request, res: Response) => {
  try {
    const { chainName } = req.params
    const chainConfig = multiChainService.getChainConfig(chainName)
    
    if (!chainConfig) {
      return res.status(404).json({
        success: false,
        error: '不支持的区块链'
      })
    }

    res.json({
      success: true,
      data: chainConfig
    })
  } catch (error) {
    console.error('获取链配置错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 获取钱包余额
router.get('/balance/:chainName/:address', async (req: Request, res: Response) => {
  try {
    const { chainName, address } = req.params
    const { token } = req.query
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: '缺少代币符号参数'
      })
    }

    const balance = await multiChainService.getStablecoinBalance(
      chainName,
      token as string,
      address
    )

    res.json({
      success: true,
      data: {
        chain: chainName,
        address,
        token,
        balance
      }
    })
  } catch (error) {
    console.error('获取余额错误:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器内部错误' 
    })
  }
})

// 获取多个代币余额
router.post('/balance/multi', async (req: Request, res: Response) => {
  try {
    const { addresses } = req.body
    
    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({
        success: false,
        error: '无效的地址列表'
      })
    }

    const balances = []
    for (const addressInfo of addresses) {
      const { chain, address, tokens } = addressInfo
      
      for (const token of tokens) {
        try {
          const balance = await multiChainService.getStablecoinBalance(chain, token, address)
          balances.push({
            chain,
            address,
            token,
            balance
          })
        } catch (error) {
          balances.push({
            chain,
            address,
            token,
            balance: '0',
            error: error instanceof Error ? error.message : '获取失败'
          })
        }
      }
    }

    res.json({
      success: true,
      data: balances
    })
  } catch (error) {
    console.error('批量获取余额错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 验证地址格式
router.post('/validate-address', async (req: Request, res: Response) => {
  try {
    const { chain, address } = req.body
    
    if (!chain || !address) {
      return res.status(400).json({
        success: false,
        error: '缺少链名或地址参数'
      })
    }

    // 简单的地址格式验证
    let isValid = false
    let addressType = 'unknown'

    switch (chain.toLowerCase()) {
      case 'ethereum':
      case 'bsc':
        isValid = /^0x[a-fA-F0-9]{40}$/.test(address)
        addressType = 'evm'
        break
      case 'tron':
        isValid = /^T[A-Za-z1-9]{33}$/.test(address)
        addressType = 'tron'
        break
      default:
        isValid = false
    }

    res.json({
      success: true,
      data: {
        chain,
        address,
        isValid,
        addressType
      }
    })
  } catch (error) {
    console.error('验证地址错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 获取交易费用估算
router.post('/estimate-fee', async (req: Request, res: Response) => {
  try {
    const { chain, token, amount, from, to } = req.body
    
    if (!chain || !token || !amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: '缺少必要的参数'
      })
    }

    // TODO: 实现真实的费用估算逻辑
    const feeEstimate = {
      chain,
      token,
      amount,
      estimatedFee: '0.001',
      gasPrice: '20000000000', // 20 Gwei
      gasLimit: '21000',
      estimatedTime: '2-5 minutes',
      exchangeRate: '1.0'
    }

    res.json({
      success: true,
      data: feeEstimate
    })
  } catch (error) {
    console.error('估算费用错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 获取网络状态
router.get('/network/:chainName/status', async (req: Request, res: Response) => {
  try {
    const { chainName } = req.params
    
    // TODO: 实现真实的网络状态检查
    const networkStatus = {
      chain: chainName,
      isOnline: true,
      blockHeight: 18500000,
      avgBlockTime: '12s',
      gasPrice: '20000000000',
      congestion: 'low', // low, medium, high
      lastUpdated: new Date().toISOString()
    }

    res.json({
      success: true,
      data: networkStatus
    })
  } catch (error) {
    console.error('获取网络状态错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 获取交易历史
router.get('/transactions/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params
    const { chain, limit = 20, page = 1 } = req.query
    
    // TODO: 从区块链网络获取真实交易历史
    const transactions = [
      {
        hash: '0x1234567890abcdef',
        chain: chain || 'ethereum',
        from: address,
        to: '0x8ba1f109551bD432803012645Hac136c',
        value: '100',
        token: 'USDT',
        fee: '0.001',
        status: 'confirmed',
        blockNumber: 18500000,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    ]

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: transactions.length
        }
      }
    })
  } catch (error) {
    console.error('获取交易历史错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

export default router