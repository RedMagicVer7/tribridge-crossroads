import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import otcService, { OTCOrder, P2PTransaction } from '../services/otcService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 验证中间件
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// 获取订单簿
router.get('/orderbook', [
  query('fiatCurrency').isString().isLength({ min: 3, max: 3 }),
  query('cryptoCurrency').isString().isLength({ min: 3, max: 10 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const { fiatCurrency, cryptoCurrency } = req.query as { fiatCurrency: string, cryptoCurrency: string };
    const orderBook = otcService.getOrderBook(fiatCurrency, cryptoCurrency);
    
    res.json({
      success: true,
      data: orderBook
    });
  } catch (error) {
    console.error('Get orderbook error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 创建OTC订单
router.post('/orders', [
  authMiddleware,
  body('type').isIn(['buy', 'sell']),
  body('fiatCurrency').isString().isLength({ min: 3, max: 3 }),
  body('cryptoCurrency').isString().isLength({ min: 3, max: 10 }),
  body('fiatAmount').isNumeric().isFloat({ min: 1 }),
  body('cryptoAmount').isNumeric().isFloat({ min: 0.001 }),
  body('price').isNumeric().isFloat({ min: 0.01 }),
  body('minAmount').isNumeric().isFloat({ min: 1 }),
  body('maxAmount').isNumeric().isFloat({ min: 1 }),
  body('paymentMethods').isArray({ min: 1 }),
  body('timeLimit').isInt({ min: 5, max: 60 }),
  body('escrowEnabled').isBoolean(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const orderData = {
      ...req.body,
      userId,
      status: 'active' as const,
      merchantRating: 5.0,
      completedOrders: 0,
      trustLevel: 'standard' as const
    };

    const order = await otcService.createOrder(orderData);
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取用户订单
router.get('/orders/user', [authMiddleware], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const orders = otcService.getUserOrders(userId);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 取消订单
router.put('/orders/:orderId/cancel', [
  authMiddleware,
  param('orderId').isString(),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await otcService.cancelOrder(orderId, userId);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 创建P2P交易
router.post('/transactions', [
  authMiddleware,
  body('orderId').isString(),
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('paymentMethod').isString(),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { orderId, amount, paymentMethod } = req.body;
    const transaction = await otcService.createTransaction(orderId, userId, amount, paymentMethod);
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取交易详情
router.get('/transactions/:transactionId', [
  authMiddleware,
  param('transactionId').isString(),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = otcService.getTransaction(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // 检查用户权限
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取用户交易
router.get('/transactions/user/all', [authMiddleware], async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transactions = otcService.getUserTransactions(userId);
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 发送聊天消息
router.post('/transactions/:transactionId/messages', [
  authMiddleware,
  param('transactionId').isString(),
  body('message').isString().isLength({ min: 1, max: 1000 }),
  body('type').optional().isIn(['text', 'image', 'payment_proof']),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;
    const { message, type = 'text' } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = otcService.getTransaction(transactionId);
    if (!transaction || (transaction.buyerId !== userId && transaction.sellerId !== userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const chatMessage = await otcService.addChatMessage(transactionId, userId, message, type);
    
    res.status(201).json({
      success: true,
      data: chatMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 确认付款
router.put('/transactions/:transactionId/confirm-payment', [
  authMiddleware,
  param('transactionId').isString(),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = await otcService.confirmPayment(transactionId, userId);
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 释放加密货币
router.put('/transactions/:transactionId/release', [
  authMiddleware,
  param('transactionId').isString(),
  body('releaseCode').isString().isLength({ min: 6, max: 6 }),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;
    const { releaseCode } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = await otcService.releaseCrypto(transactionId, userId, releaseCode);
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Release crypto error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 发起争议
router.put('/transactions/:transactionId/dispute', [
  authMiddleware,
  param('transactionId').isString(),
  body('reason').isString().isLength({ min: 10, max: 500 }),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;
    const { reason } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = await otcService.raiseDispute(transactionId, userId, reason);
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Raise dispute error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取用户信用评级
router.get('/users/:userId/credit', [
  param('userId').isString(),
  validateRequest
], async (req, res) => {
  try {
    const { userId } = req.params;
    const creditScore = otcService.getUserCreditScore(userId);
    
    if (!creditScore) {
      return res.status(404).json({
        success: false,
        error: 'User credit score not found'
      });
    }
    
    res.json({
      success: true,
      data: creditScore
    });
  } catch (error) {
    console.error('Get credit score error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;