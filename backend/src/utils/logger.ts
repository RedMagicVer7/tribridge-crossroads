import winston from 'winston'
import path from 'path'

// 日志级别配置
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

// 日志颜色配置
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
}

winston.addColors(logColors)

// 根据环境确定日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

// 自定义日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// 生产环境日志格式（结构化JSON）
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// 云环境检测（Railway, Vercel, Heroku等）
const isCloudEnvironment = () => {
  return !!(process.env.RAILWAY_ENVIRONMENT || 
           process.env.VERCEL || 
           process.env.HEROKU_APP_NAME || 
           process.env.NODE_ENV === 'production')
}

// 动态创建传输器 - 关键修复：避免在云环境中创建File传输器
const createTransports = () => {
  const transports = []
  
  // 总是添加控制台传输器
  transports.push(new winston.transports.Console({
    format: isCloudEnvironment() ? productionFormat : format
  }))
  
  // 只在非云环境中添加文件传输器
  if (!isCloudEnvironment()) {
    try {
      // 尝试创建日志目录
      const fs = require('fs')
      const logsDir = path.join(process.cwd(), 'logs')
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }
      
      transports.push(new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: productionFormat
      }))
      
      transports.push(new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: productionFormat
      }))
    } catch (error) {
      console.warn('Failed to create file transports, using console only:', error.message)
    }
  }
  
  return transports
}

// 创建logger实例 - 使用动态传输器
export const logger = winston.createLogger({
  level: level(),
  levels: logLevels,
  format: isCloudEnvironment() ? productionFormat : format,
  transports: createTransports(),
  exitOnError: false
})

// HTTP请求日志中间件
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }

    if (res.statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`)
    } else {
      logger.http(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`)
    }
  })

  next()
}

// 业务日志记录器
export class BusinessLogger {
  // 交易日志
  static transaction(action: string, data: any) {
    logger.info(`TRANSACTION: ${action}`, { 
      type: 'transaction',
      action, 
      data,
      timestamp: new Date().toISOString()
    })
  }

  // KYC日志
  static kyc(action: string, userId: string, data: any) {
    logger.info(`KYC: ${action}`, {
      type: 'kyc',
      action,
      userId,
      data,
      timestamp: new Date().toISOString()
    })
  }

  // 区块链操作日志
  static blockchain(chain: string, action: string, data: any) {
    logger.info(`BLOCKCHAIN: ${chain} - ${action}`, {
      type: 'blockchain',
      chain,
      action,
      data,
      timestamp: new Date().toISOString()
    })
  }

  // 安全事件日志
  static security(event: string, data: any) {
    logger.warn(`SECURITY: ${event}`, {
      type: 'security',
      event,
      data,
      timestamp: new Date().toISOString()
    })
  }

  // 错误日志
  static error(error: Error, context?: any) {
    logger.error(`ERROR: ${error.message}`, {
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date().toISOString()
    })
  }

  // 性能日志
  static performance(operation: string, duration: number, data?: any) {
    logger.info(`PERFORMANCE: ${operation} - ${duration}ms`, {
      type: 'performance',
      operation,
      duration,
      data,
      timestamp: new Date().toISOString()
    })
  }
}

// 默认导出
export default logger