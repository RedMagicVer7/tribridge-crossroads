import { Request, Response, NextFunction } from 'express'

// API密钥验证中间件
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: '缺少API密钥'
      })
    }

    // TODO: 从数据库或配置中验证API密钥
    const validApiKeys = [
      process.env.API_KEY_1 || 'tribridge-api-key-1',
      process.env.API_KEY_2 || 'tribridge-api-key-2',
      process.env.ADMIN_API_KEY || 'tribridge-admin-key'
    ]

    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        success: false,
        error: '无效的API密钥'
      })
    }

    // 记录API密钥使用情况
    console.log(`API密钥使用: ${apiKey.slice(0, 10)}... - ${req.method} ${req.path}`)

    next()
  } catch (error) {
    console.error('API密钥验证中间件错误:', error)
    return res.status(500).json({
      success: false,
      error: '服务器内部错误'
    })
  }
}

// 管理员API密钥验证中间件
export const validateAdminApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: '缺少管理员API密钥'
      })
    }

    const adminApiKey = process.env.ADMIN_API_KEY || 'tribridge-admin-key'

    if (apiKey !== adminApiKey) {
      return res.status(403).json({
        success: false,
        error: '需要管理员API密钥'
      })
    }

    console.log(`管理员API密钥使用: ${req.method} ${req.path}`)

    next()
  } catch (error) {
    console.error('管理员API密钥验证中间件错误:', error)
    return res.status(500).json({
      success: false,
      error: '服务器内部错误'
    })
  }
}

// 速率限制中间件（基于API密钥）
export const apiKeyRateLimit = (requestsPerMinute: number = 60) => {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers['x-api-key'] as string
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: '缺少API密钥'
        })
      }

      const now = Date.now()
      const windowMs = 60 * 1000 // 1分钟窗口
      const key = apiKey

      const current = requests.get(key)
      
      if (!current || now > current.resetTime) {
        // 新窗口或第一次请求
        requests.set(key, {
          count: 1,
          resetTime: now + windowMs
        })
        return next()
      }

      if (current.count >= requestsPerMinute) {
        return res.status(429).json({
          success: false,
          error: '请求频率超限',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        })
      }

      // 增加计数
      current.count++
      requests.set(key, current)

      // 设置响应头
      res.setHeader('X-RateLimit-Limit', requestsPerMinute)
      res.setHeader('X-RateLimit-Remaining', requestsPerMinute - current.count)
      res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000))

      next()
    } catch (error) {
      console.error('API密钥速率限制中间件错误:', error)
      return res.status(500).json({
        success: false,
        error: '服务器内部错误'
      })
    }
  }
}

// 清理过期的速率限制记录（定期调用）
export const cleanupRateLimit = () => {
  // TODO: 实现清理逻辑
  console.log('清理过期的速率限制记录')
}