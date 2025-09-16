import { Router, Request, Response } from 'express'
import { KYCService } from '../services/kycService'

const router = Router()
const kycService = new KYCService()

// 提交KYC申请
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { 
      personalInfo, 
      documents, 
      provider = 'sumsub' 
    } = req.body
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: '未授权访问' 
      })
    }

    if (!personalInfo || !documents) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要的KYC信息' 
      })
    }

    const kycRequest = {
      userId,
      personalInfo,
      documents,
      submittedAt: new Date().toISOString()
    }

    const result = await kycService.submitKYC(kycRequest, provider)

    res.status(201).json({
      success: true,
      data: result,
      message: 'KYC申请提交成功'
    })
  } catch (error) {
    console.error('提交KYC错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 获取KYC状态
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: '未授权访问' 
      })
    }

    // TODO: 从数据库获取用户KYC状态
    const kycStatus = {
      userId,
      status: 'verified', // pending, under_review, verified, rejected
      level: 'full', // basic, full
      submittedAt: '2024-01-01T00:00:00.000Z',
      verifiedAt: '2024-01-02T00:00:00.000Z',
      documents: [
        {
          type: 'passport',
          status: 'verified',
          uploadedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          type: 'address_proof',
          status: 'verified',
          uploadedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      provider: 'sumsub',
      limits: {
        daily: 50000,
        monthly: 1000000,
        annual: 5000000
      }
    }

    res.json({
      success: true,
      data: kycStatus
    })
  } catch (error) {
    console.error('获取KYC状态错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 上传KYC文档
router.post('/documents', async (req: Request, res: Response) => {
  try {
    const { documentType, file } = req.body
    const userId = req.user?.userId

    if (!userId || !documentType || !file) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要参数' 
      })
    }

    // TODO: 处理文件上传和验证
    const documentId = Date.now().toString()

    res.status(201).json({
      success: true,
      data: {
        documentId,
        type: documentType,
        status: 'uploaded',
        uploadedAt: new Date().toISOString()
      },
      message: '文档上传成功'
    })
  } catch (error) {
    console.error('上传文档错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 获取KYC验证历史
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: '未授权访问' 
      })
    }

    // TODO: 从数据库获取KYC历史记录
    const history = [
      {
        id: '1',
        status: 'verified',
        provider: 'sumsub',
        submittedAt: '2024-01-01T00:00:00.000Z',
        completedAt: '2024-01-02T00:00:00.000Z',
        notes: 'KYC验证成功'
      }
    ]

    res.json({
      success: true,
      data: history
    })
  } catch (error) {
    console.error('获取KYC历史错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// Webhook处理（用于接收第三方KYC服务的状态更新）
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { provider, event, data } = req.body

    console.log(`收到来自 ${provider} 的KYC webhook事件:`, event, data)

    // TODO: 处理不同提供商的webhook事件
    switch (provider) {
      case 'sumsub':
        // 处理Sumsub的webhook
        break
      case 'onfido':
        // 处理Onfido的webhook
        break
      default:
        console.log('未知的KYC提供商:', provider)
    }

    res.json({
      success: true,
      message: 'Webhook处理成功'
    })
  } catch (error) {
    console.error('处理KYC webhook错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

export default router