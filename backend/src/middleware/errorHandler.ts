import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  isOperational?: boolean
}

// 全局错误处理中间件
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.error('Global Error Handler:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })

    // 默认错误响应
    let statusCode = error.statusCode || 500
    let message = error.message || '服务器内部错误'
    let errorCode = 'INTERNAL_SERVER_ERROR'

    // 根据错误类型设置响应
    if (error.name === 'ValidationError') {
      statusCode = 400
      message = '请求参数验证失败'
      errorCode = 'VALIDATION_ERROR'
    } else if (error.name === 'UnauthorizedError' || error.name === 'JsonWebTokenError') {
      statusCode = 401
      message = '身份验证失败'
      errorCode = 'UNAUTHORIZED'
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403
      message = '权限不足'
      errorCode = 'FORBIDDEN'
    } else if (error.name === 'NotFoundError') {
      statusCode = 404
      message = '资源未找到'
      errorCode = 'NOT_FOUND'
    } else if (error.name === 'ConflictError') {
      statusCode = 409
      message = '资源冲突'
      errorCode = 'CONFLICT'
    } else if (error.name === 'TooManyRequestsError') {
      statusCode = 429
      message = '请求频率超限'
      errorCode = 'TOO_MANY_REQUESTS'
    }

    // 区分生产环境和开发环境
    const isDevelopment = process.env.NODE_ENV !== 'production'
    
    const errorResponse: any = {
      success: false,
      error: message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    }

    // 开发环境下包含更多调试信息
    if (isDevelopment) {
      errorResponse.stack = error.stack
      errorResponse.details = error
    }

    res.status(statusCode).json(errorResponse)
  } catch (handlerError) {
    console.error('Error Handler Failed:', handlerError)
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    })
  }
}

// 404错误处理中间件
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`路由 ${req.method} ${req.originalUrl} 未找到`) as ApiError
  error.statusCode = 404
  error.name = 'NotFoundError'
  next(error)
}

// 异步错误捕获装饰器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 创建自定义错误类
export class CustomError extends Error implements ApiError {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

// 常用错误类
export class ValidationError extends CustomError {
  constructor(message: string = '请求参数验证失败') {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = '身份验证失败') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = '权限不足') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = '资源未找到') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = '资源冲突') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

export class TooManyRequestsError extends CustomError {
  constructor(message: string = '请求频率超限') {
    super(message, 429)
    this.name = 'TooManyRequestsError'
  }
}

// 未捕获异常处理
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error)
  console.error('Stack:', error.stack)
  
  // 优雅关闭
  process.exit(1)
})

// 未处理的Promise拒绝
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  
  // 优雅关闭
  process.exit(1)
})