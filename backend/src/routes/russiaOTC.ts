import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import russiaOTCService, { RussiaOTCOrder, RussiaP2PTransaction } from '../services/russiaOTCService.js';

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

/**
 * 获取俄罗斯订单簿 (RUB/USDT)
 */
router.get('/orderbook', async (req: express.Request, res: express.Response) => {
  try {
    const orderBook = russiaOTCService.getRussiaOrderBook();
    const currentRate = russiaOTCService.getCurrentRubRate();
    
    res.json({
      success: true,
      data: {
        orderBook,
        currentRate,
        currency: 'RUB/USDT',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get Russia orderbook error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 创建俄罗斯OTC订单
 */
router.post('/orders', [
  authMiddleware,
  body('type').isIn(['buy', 'sell']),
  body('fiatAmount').isNumeric().isFloat({ min: 10000 }).withMessage('Minimum amount is 10,000 RUB'),
  body('cryptoAmount').isNumeric().isFloat({ min: 100 }).withMessage('Minimum crypto amount is 100 USDT'),
  body('price').isNumeric().isFloat({ min: 80, max: 120 }).withMessage('Price must be between 80-120 RUB/USDT'),
  body('minAmount').isNumeric().isFloat({ min: 1000 }),
  body('maxAmount').isNumeric().isFloat({ min: 10000 }),
  body('paymentMethodIds').isArray({ min: 1 }).withMessage('At least one payment method required'),
  body('timeLimit').isInt({ min: 10, max: 120 }),
  body('escrowEnabled').isBoolean(),
  body('businessType').isIn(['individual', 'company', 'machinery_dealer']),
  body('remarks').optional().isString().isLength({ max: 500 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const {
      type,
      fiatAmount,
      cryptoAmount,
      price,
      minAmount,
      maxAmount,
      paymentMethodIds,
      timeLimit,
      escrowEnabled,
      businessType,
      remarks,
      companyInfo
    } = req.body;

    // 获取支付方式详情
    const allPaymentMethods = russiaOTCService.getRussiaPaymentMethods();
    const paymentMethods = allPaymentMethods.filter(pm => paymentMethodIds.includes(pm.id));

    if (paymentMethods.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment methods'
      });
    }

    const orderData = {
      userId,
      type,
      fiatCurrency: 'RUB' as const,
      cryptoCurrency: 'USDT' as const,
      fiatAmount,
      cryptoAmount,
      price,
      minAmount,
      maxAmount,
      paymentMethods,
      timeLimit,
      status: 'active' as const,
      merchantRating: 5.0,
      completedOrders: 0,
      remarks,
      escrowEnabled,
      trustLevel: 'standard' as const,
      businessType,
      companyInfo
    };

    const order = await russiaOTCService.createRussiaOrder(orderData);
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Российский OTC заказ создан успешно'
    });
  } catch (error) {
    console.error('Create Russia order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 创建俄罗斯P2P交易
 */
router.post('/transactions', [
  authMiddleware,
  body('orderId').isString(),
  body('amount').isNumeric().isFloat({ min: 1000 }).withMessage('Minimum amount is 1,000 RUB'),
  body('paymentMethodId').isString(),
  body('goodsInfo').optional().isObject(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { orderId, amount, paymentMethodId, goodsInfo } = req.body;
    
    const transaction = await russiaOTCService.createRussiaTransaction(
      orderId, 
      userId, 
      amount, 
      paymentMethodId,
      goodsInfo
    );
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Российская P2P транзакция создана'
    });
  } catch (error) {
    console.error('Create Russia transaction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 确认卢布支付
 */
router.put('/transactions/:transactionId/confirm-rub-payment', [
  authMiddleware,
  param('transactionId').isString(),
  body('paymentProof').optional().isString(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { transactionId } = req.params;
    const { paymentProof } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = await russiaOTCService.confirmRubPayment(transactionId, userId, paymentProof);
    
    res.json({
      success: true,
      data: transaction,
      message: 'Оплата рублями подтверждена'
    });
  } catch (error) {
    console.error('Confirm RUB payment error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * USDT托管到智能合约
 */
router.put('/transactions/:transactionId/escrow-usdt', [
  authMiddleware,
  param('transactionId').isString(),
  body('escrowTxId').isString(),
  body('contractOrderId').isInt({ min: 1 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { transactionId } = req.params;
    const { escrowTxId, contractOrderId } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = await russiaOTCService.escrowUsdt(transactionId, userId, escrowTxId, contractOrderId);
    
    res.json({
      success: true,
      data: transaction,
      message: 'USDT размещен в эскроу-контракте'
    });
  } catch (error) {
    console.error('Escrow USDT error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 确认货物发运
 */
router.put('/transactions/:transactionId/confirm-shipment', [
  authMiddleware,
  param('transactionId').isString(),
  body('trackingNumber').isString().isLength({ min: 5, max: 50 }),
  body('carrier').isString().isLength({ min: 2, max: 100 }),
  body('estimatedDelivery').isISO8601(),
  body('billOfLading').optional().isString(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { transactionId } = req.params;
    const { trackingNumber, carrier, estimatedDelivery, billOfLading } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const shippingInfo = {
      trackingNumber,
      carrier,
      estimatedDelivery: new Date(estimatedDelivery),
      billOfLading
    };

    const transaction = await russiaOTCService.confirmGoodsShipped(transactionId, userId, shippingInfo);
    
    res.json({
      success: true,
      data: transaction,
      message: 'Отгрузка товара подтверждена'
    });
  } catch (error) {
    console.error('Confirm shipment error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 确认货物收到
 */
router.put('/transactions/:transactionId/confirm-delivery', [
  authMiddleware,
  param('transactionId').isString(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { transactionId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = await russiaOTCService.confirmGoodsDelivered(transactionId, userId);
    
    res.json({
      success: true,
      data: transaction,
      message: 'Получение товара подтверждено'
    });
  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 发送聊天消息
 */
router.post('/transactions/:transactionId/messages', [
  authMiddleware,
  param('transactionId').isString(),
  body('message').isString().isLength({ min: 1, max: 1000 }),
  body('type').optional().isIn(['text', 'image', 'payment_proof', 'shipping_proof']),
  body('language').optional().isIn(['ru', 'zh', 'en']),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { transactionId } = req.params;
    const { message, type = 'text', language = 'ru' } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = russiaOTCService.getRussiaTransaction(transactionId);
    if (!transaction || (transaction.buyerId !== userId && transaction.sellerId !== userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const chatMessage = await russiaOTCService.addChatMessage(transactionId, userId, message, type, language);
    
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

/**
 * 获取交易详情
 */
router.get('/transactions/:transactionId', [
  authMiddleware,
  param('transactionId').isString(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { transactionId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transaction = russiaOTCService.getRussiaTransaction(transactionId);
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
    console.error('Get Russia transaction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取用户俄罗斯订单
 */
router.get('/orders/user', [authMiddleware], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const orders = russiaOTCService.getUserRussiaOrders(userId);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get user Russia orders error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取用户俄罗斯交易
 */
router.get('/transactions/user/all', [authMiddleware], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const transactions = russiaOTCService.getUserRussiaTransactions(userId);
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get user Russia transactions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 取消俄罗斯订单
 */
router.put('/orders/:orderId/cancel', [
  authMiddleware,
  param('orderId').isString(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await russiaOTCService.cancelRussiaOrder(orderId, userId);
    
    res.json({
      success: true,
      message: 'Российский заказ отменен'
    });
  } catch (error) {
    console.error('Cancel Russia order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取俄罗斯支付方式
 */
router.get('/payment-methods', async (req: express.Request, res: express.Response) => {
  try {
    const paymentMethods = russiaOTCService.getRussiaPaymentMethods();
    
    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Get Russia payment methods error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取当前RUB/USDT汇率
 */
router.get('/rate', async (req: express.Request, res: express.Response) => {
  try {
    const currentRate = russiaOTCService.getCurrentRubRate();
    
    res.json({
      success: true,
      data: {
        rate: currentRate,
        currency: 'RUB/USDT',
        timestamp: new Date().toISOString(),
        source: 'TriBridge Rate Service'
      }
    });
  } catch (error) {
    console.error('Get RUB rate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;