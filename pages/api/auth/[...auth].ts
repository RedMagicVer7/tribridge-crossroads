// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  switch (req.method) {
    case 'POST':
      switch (action?.[0]) {
        case 'register':
          return handleRegister(req, res);
        case 'login':
          return handleLogin(req, res);
        case 'refresh':
          return handleRefresh(req, res);
        default:
          return res.status(404).json({ success: false, error: 'API端点未找到' });
      }
    default:
      return res.status(405).json({ success: false, error: '方法不允许' });
  }
}

// JWT Payload interface
interface JwtPayload {
  userId: string;
  email: string;
}

// 用户注册
async function handleRegister(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password, fullName } = req.body;

    // 验证输入
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必要的注册信息' 
      });
    }

    // 密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // TODO: 保存到数据库
    const user = {
      id: Date.now().toString(),
      email,
      fullName,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

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
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    });
  }
}

// 用户登录
async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少登录凭据' 
      });
    }

    // TODO: 从数据库查询用户
    // 这里使用模拟数据
    const mockUser = {
      id: '1',
      email: 'demo@tribridge.com',
      fullName: 'Demo User',
      password: await bcrypt.hash('password123', 10) // 模拟密码
    };

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, mockUser.password);
    if (!isValidPassword || email !== mockUser.email) {
      return res.status(401).json({ 
        success: false, 
        error: '邮箱或密码错误' 
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

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
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    });
  }
}

// 刷新令牌
async function handleRefresh(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        error: '缺少刷新令牌' 
      });
    }

    // 验证刷新令牌
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'refresh-secret'
    ) as JwtPayload;

    // 生成新的访问令牌
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(401).json({ 
      success: false, 
      error: '无效的刷新令牌' 
    });
  }
}