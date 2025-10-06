// 最基础的HTTP服务器 - 不依赖任何npm包
const http = require('http')
const url = require('url')

const port = parseInt(process.env.PORT || '8000')

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json')
  
  console.log(`${new Date().toISOString()} - ${req.method} ${path}`)
  
  if (path === '/health') {
    res.statusCode = 200
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      port: port,
      env: process.env.NODE_ENV || 'development',
      node_version: process.version,
      platform: process.platform,
      railway_env: process.env.RAILWAY_ENVIRONMENT || 'false'
    }))
  } else if (path === '/') {
    res.statusCode = 200
    res.end(JSON.stringify({
      message: 'TriBridge API is running (Basic HTTP Server)',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        info: '/api/info'
      }
    }))
  } else if (path === '/api/info') {
    res.statusCode = 200
    res.end(JSON.stringify({
      name: 'TriBridge Backend API',
      version: '1.0.0',
      status: 'running',
      runtime: 'Node.js ' + process.version,
      server_type: 'Basic HTTP Server'
    }))
  } else {
    res.statusCode = 404
    res.end(JSON.stringify({
      error: 'Not Found',
      path: path,
      timestamp: new Date().toISOString()
    }))
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Basic HTTP Server running on port ${port}`)
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'false'}`)
  console.log(`📝 Node.js version: ${process.version}`)
  console.log(`💻 Platform: ${process.platform}`)
  console.log(`🔍 Health check: http://localhost:${port}/health`)
})

server.on('error', (err) => {
  console.error('Server error:', err)
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})