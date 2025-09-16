import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const router = Router()

// 用户注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body

    // 验证输入
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要的注册信息' 
      })
    }

    // 密码加密
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // TODO: 保存到数据库
    const user = {
      id: Date.now().toString(),
      email,
      fullName,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    )

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        },
        token
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少登录凭据' 
      })
    }

    // TODO: 从数据库查询用户
    // 这里使用模拟数据
    const mockUser = {
      id: '1',
      email: 'demo@tribridge.com',
      fullName: 'Demo User',
      password: await bcrypt.hash('password123', 10) // 模拟密码
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, mockUser.password)
    if (!isValidPassword || email !== mockUser.email) {
      return res.status(401).json({ 
        success: false, 
        error: '邮箱或密码错误' 
      })
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      data: {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName
        },
        token
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    })
  }
})

// 刷新令牌
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        error: '缺少刷新令牌' 
      })
    }

    // 验证刷新令牌
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'refresh-secret'
    ) as any

    // 生成新的访问令牌
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      data: {
        token: newToken
      }
    })
  } catch (error) {
    console.error('刷新令牌错误:', error)
    res.status(401).json({ 
      success: false, 
      error: '无效的刷新令牌' 
    })
  }
})

export default router