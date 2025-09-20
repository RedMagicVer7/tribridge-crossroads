import { Router, Request, Response } from 'express';

const router = Router();

// 获取用户资料
router.get('/profile', async (req: Request, res: Response) => {
  try {
    // 演示用的模拟用户数据
    const user = {
      id: '1',
      email: 'demo@tribridge.com',
      fullName: 'Demo User',
      phone: '+86 138****8888',
      kycStatus: 'verified',
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      walletAddress: '0x742d35Cc6648C8532C2B41F398999930894B6Af8',
      preferences: {
        language: 'zh-CN',
        currency: 'CNY',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      }
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('获取用户资料错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 获取用户钱包列表
router.get('/wallets', async (req: Request, res: Response) => {
  try {
    // 演示用的模拟钱包数据
    const wallets = [
      {
        id: '1',
        name: 'MetaMask Wallet',
        address: '0x742d35Cc6648C8532C2B41F398999930894B6Af8',
        chain: 'ethereum',
        isDefault: true,
        balance: {
          eth: '1.5',
          usdt: '10000',
          usdc: '5000'
        },
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'TRON Wallet',
        address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        chain: 'tron',
        isDefault: false,
        balance: {
          trx: '1000',
          usdt: '8000'
        },
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ]

    res.json({
      success: true,
      data: wallets
    })
  } catch (error) {
    console.error('获取钱包列表错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

export default router