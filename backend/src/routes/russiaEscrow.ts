import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import RussiaEscrowService, { OrderStatus, LogisticsStatus } from '../services/russiaEscrowService.js';

const router = express.Router();

// 初始化智能合约服务
const escrowService = new RussiaEscrowService(
  process.env.NODE_ENV === 'production' ? 'polygon' : 'mumbai'
);

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
 * 创建智能合约托管订单
 */
router.post('/orders', [
  authMiddleware,
  body('seller').isEthereumAddress().withMessage('Invalid seller address'),
  body('amount').isNumeric().isFloat({ min: 100 }).withMessage('Minimum amount is 100 USDT'),
  body('rubAmount').isNumeric().isFloat({ min: 1000 }).withMessage('Minimum RUB amount is 1000'),
  body('exchangeRate').isNumeric().isFloat({ min: 1 }).withMessage('Invalid exchange rate'),
  body('goodsDescription').isString().isLength({ min: 10, max: 500 }).withMessage('Invalid goods description'),
  body('deliveryInfo').isString().isLength({ min: 10, max: 200 }).withMessage('Invalid delivery info'),
  body('deliveryDays').isInt({ min: 1, max: 180 }).withMessage('Delivery days must be 1-180'),
  body('isMultiSig').isBoolean(),
  body('arbitrators').optional().isArray(),
  body('privateKey').isString().isLength({ min: 64, max: 66 }).withMessage('Invalid private key'),
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
      seller,
      amount,
      rubAmount,
      exchangeRate,
      goodsDescription,
      deliveryInfo,
      deliveryDays,
      isMultiSig,
      arbitrators = [],
      privateKey
    } = req.body;

    // 计算交货期限（当前时间 + 交货天数）
    const deliveryDeadline = Math.floor(Date.now() / 1000) + (deliveryDays * 24 * 60 * 60);

    const orderParams = {
      seller,
      amount: amount.toString(),
      rubAmount: rubAmount.toString(),
      exchangeRate: exchangeRate.toString(),
      goodsDescription,
      deliveryInfo,
      deliveryDeadline,
      isMultiSig,
      arbitrators: isMultiSig ? arbitrators : []
    };

    const result = await escrowService.createOrder(privateKey, orderParams);

    res.status(201).json({
      success: true,
      data: {
        orderId: result.orderId,
        txHash: result.txHash,
        contractAddress: process.env.RUSSIA_ESCROW_CONTRACT_POLYGON || process.env.RUSSIA_ESCROW_CONTRACT_MUMBAI,
        message: '托管订单创建成功，请进行充值'
      }
    });
  } catch (error) {
    console.error('Create escrow order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 买方充值USDT到托管合约
 */
router.post('/orders/:orderId/fund', [
  authMiddleware,
  param('orderId').isInt({ min: 1 }),
  body('privateKey').isString().isLength({ min: 64, max: 66 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { privateKey } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // 验证用户是否是订单的买方
    const order = await escrowService.getOrder(Number(orderId));
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const txHash = await escrowService.fundOrder(privateKey, Number(orderId));

    res.json({
      success: true,
      data: {
        orderId: Number(orderId),
        txHash,
        message: 'USDT充值成功，资金已托管'
      }
    });
  } catch (error) {
    console.error('Fund order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 卖方确认发货并上传物流信息
 */
router.post('/orders/:orderId/ship', [
  authMiddleware,
  param('orderId').isInt({ min: 1 }),
  body('billOfLading').isString().isLength({ min: 10, max: 200 }).withMessage('Invalid bill of lading'),
  body('trackingNumber').isString().isLength({ min: 5, max: 50 }).withMessage('Invalid tracking number'),
  body('customsDeclaration').optional().isString().isLength({ max: 200 }),
  body('insuranceCert').optional().isString().isLength({ max: 200 }),
  body('privateKey').isString().isLength({ min: 64, max: 66 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const {
      billOfLading,
      trackingNumber,
      customsDeclaration = '',
      insuranceCert = '',
      privateKey
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const shipmentInfo = {
      billOfLading,
      trackingNumber,
      customsDeclaration,
      insuranceCert
    };

    const txHash = await escrowService.confirmShipment(
      privateKey,
      Number(orderId),
      shipmentInfo
    );

    res.json({
      success: true,
      data: {
        orderId: Number(orderId),
        txHash,
        trackingNumber,
        billOfLading,
        message: '发货确认成功，物流信息已上链'
      }
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
 * 买方确认收货
 */
router.post('/orders/:orderId/deliver', [
  authMiddleware,
  param('orderId').isInt({ min: 1 }),
  body('privateKey').isString().isLength({ min: 64, max: 66 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { privateKey } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const txHash = await escrowService.confirmDelivery(privateKey, Number(orderId));

    res.json({
      success: true,
      data: {
        orderId: Number(orderId),
        txHash,
        message: '收货确认成功，资金已释放给卖方'
      }
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
 * 发起争议
 */
router.post('/orders/:orderId/dispute', [
  authMiddleware,
  param('orderId').isInt({ min: 1 }),
  body('reason').isString().isLength({ min: 20, max: 500 }).withMessage('Dispute reason must be 20-500 characters'),
  body('privateKey').isString().isLength({ min: 64, max: 66 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { reason, privateKey } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const txHash = await escrowService.raiseDispute(privateKey, Number(orderId), reason);

    res.json({
      success: true,
      data: {
        orderId: Number(orderId),
        txHash,
        reason,
        message: '争议发起成功，等待仲裁员处理'
      }
    });
  } catch (error) {
    console.error('Raise dispute error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 仲裁员解决争议
 */
router.post('/orders/:orderId/resolve', [
  authMiddleware,
  param('orderId').isInt({ min: 1 }),
  body('resolution').isString().isLength({ min: 20, max: 500 }).withMessage('Resolution must be 20-500 characters'),
  body('favorBuyer').isBoolean(),
  body('arbitratorKey').isString().isLength({ min: 64, max: 66 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { resolution, favorBuyer, arbitratorKey } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const txHash = await escrowService.resolveDispute(
      arbitratorKey,
      Number(orderId),
      resolution,
      favorBuyer
    );

    res.json({
      success: true,
      data: {
        orderId: Number(orderId),
        txHash,
        resolution,
        favorBuyer,
        message: '争议解决成功'
      }
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 取消订单
 */
router.post('/orders/:orderId/cancel', [
  authMiddleware,
  param('orderId').isInt({ min: 1 }),
  body('reason').isString().isLength({ min: 10, max: 200 }).withMessage('Cancel reason must be 10-200 characters'),
  body('privateKey').isString().isLength({ min: 64, max: 66 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { reason, privateKey } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const txHash = await escrowService.cancelOrder(privateKey, Number(orderId), reason);

    res.json({
      success: true,
      data: {
        orderId: Number(orderId),
        txHash,
        reason,
        message: '订单取消成功'
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取订单详情
 */
router.get('/orders/:orderId', [
  authMiddleware,
  param('orderId').isInt({ min: 1 }),
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

    const order = await escrowService.getOrder(Number(orderId));
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // 获取争议信息（如果存在）
    let dispute = null;
    try {
      if (order.status === OrderStatus.Disputed) {
        dispute = await escrowService.getDispute(Number(orderId));
      }
    } catch (error) {
      // 忽略争议获取错误
    }

    res.json({
      success: true,
      data: {
        order: {
          ...order,
          statusText: OrderStatus[order.status],
          logisticsStatusText: LogisticsStatus[order.logisticsStatus],
          createdAtFormatted: new Date(order.createdAt * 1000).toISOString(),
          deliveryDeadlineFormatted: new Date(order.deliveryDeadline * 1000).toISOString(),
          autoReleaseTimeFormatted: new Date(order.autoReleaseTime * 1000).toISOString()
        },
        dispute
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取用户订单列表
 */
router.get('/orders', [
  authMiddleware,
  query('userAddress').isEthereumAddress(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { userAddress } = req.query as { userAddress: string };

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const orderIds = await escrowService.getUserOrders(userAddress);
    
    // 获取订单详情
    const orders = await Promise.all(
      orderIds.map(async (orderId) => {
        try {
          const order = await escrowService.getOrder(orderId);
          return {
            ...order,
            statusText: OrderStatus[order.status],
            logisticsStatusText: LogisticsStatus[order.logisticsStatus],
            createdAtFormatted: new Date(order.createdAt * 1000).toISOString()
          };
        } catch (error) {
          console.error(`Error fetching order ${orderId}:`, error);
          return null;
        }
      })
    );

    // 过滤掉获取失败的订单
    const validOrders = orders.filter(order => order !== null);

    res.json({
      success: true,
      data: {
        orders: validOrders,
        total: validOrders.length
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取合约统计信息
 */
router.get('/stats', async (req: express.Request, res: express.Response) => {
  try {
    const stats = await escrowService.getContractStats();

    res.json({
      success: true,
      data: {
        ...stats,
        platformFeeRatePercent: (stats.platformFeeRate / 100).toFixed(2) + '%',
        network: process.env.NODE_ENV === 'production' ? 'Polygon' : 'Mumbai Testnet'
      }
    });
  } catch (error) {
    console.error('Get contract stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 自动释放到期订单（定时任务调用）
 */
router.post('/auto-release/:orderId', [
  param('orderId').isInt({ min: 1 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const { orderId } = req.params;

    // 验证API密钥（用于定时任务认证）
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const txHash = await escrowService.autoReleaseOrder(Number(orderId));

    res.json({
      success: true,
      data: {
        orderId: Number(orderId),
        txHash,
        message: '订单自动释放成功'
      }
    });
  } catch (error) {
    console.error('Auto release order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;