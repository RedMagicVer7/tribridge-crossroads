/**
 * 简化的云环境友好日志器
 * 用于Railway等容器化环境，避免文件系统权限问题
 */

// 简单的控制台日志器，避免winston文件权限问题
export const simpleLogger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data ? JSON.stringify(data) : '')
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error)
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data ? JSON.stringify(data) : '')
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, data ? JSON.stringify(data) : '')
    }
  },
  
  http: (message: string) => {
    console.log(`[HTTP] ${new Date().toISOString()}: ${message}`)
  }
}

// HTTP请求日志中间件（简化版）
export const simpleHttpLogger = (req: any, res: any, next: any) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    
    if (res.statusCode >= 400) {
      simpleLogger.warn(`HTTP ${logMessage}`)
    } else {
      simpleLogger.http(`HTTP ${logMessage}`)
    }
  })

  next()
}

export default simpleLogger