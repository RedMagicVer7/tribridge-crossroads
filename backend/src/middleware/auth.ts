import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: '缺少访问令牌'
      })
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '无效的令牌格式'
      })
    }

    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'default-secret'
      ) as any

      req.user = {
        userId: decoded.userId,
        email: decoded.email
      }

      next()
    } catch (jwtError) {
      console.error('JWT验证失败:', jwtError)
      return res.status(401).json({
        success: false,
        error: '令牌已过期或无效'
      })
    }
  } catch (error) {
    console.error('身份验证中间件错误:', error)
    return res.status(500).json({
      success: false,
      error: '服务器内部错误'
    })
  }
}

// 可选的身份验证中间件（用于某些公开接口）
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return next() // 无令牌时继续，不设置用户信息
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader

    if (!token) {
      return next() // 无效格式时继续
    }

    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'default-secret'
      ) as any

      req.user = {
        userId: decoded.userId,
        email: decoded.email
      }
    } catch (jwtError) {
      // JWT验证失败时继续，不设置用户信息
      console.warn('可选JWT验证失败:', jwtError)
    }

    next()
  } catch (error) {
    console.error('可选身份验证中间件错误:', error)
    next() // 出错时也继续
  }
}

// 角色验证中间件
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '需要身份验证'
        })
      }

      // TODO: 从数据库获取用户角色
      const userRole = 'user' // 默认角色

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: '权限不足'
        })
      }

      next()
    } catch (error) {
      console.error('角色验证中间件错误:', error)
      return res.status(500).json({
        success: false,
        error: '服务器内部错误'
      })
    }
  }
}

// 管理员验证中间件
export const requireAdmin = requireRole(['admin', 'superadmin'])

// 用户自己或管理员访问验证
export const requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '需要身份验证'
      })
    }

    const { userId } = req.params
    const currentUserId = req.user.userId

    // TODO: 从数据库获取用户角色
    const userRole = 'user'

    // 允许用户访问自己的资源或管理员访问任何资源
    if (currentUserId === userId || ['admin', 'superadmin'].includes(userRole)) {
      return next()
    }

    return res.status(403).json({
      success: false,
      error: '权限不足'
    })
  } catch (error) {
    console.error('所有者或管理员验证中间件错误:', error)
    return res.status(500).json({
      success: false,
      error: '服务器内部错误'
    })
  }
}