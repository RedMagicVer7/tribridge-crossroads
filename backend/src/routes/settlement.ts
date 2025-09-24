import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import settlementService, { SettlementType, SettlementNetwork, SettlementStatus } from '../services/settlementService.js';

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
 * 创建清算订单
 */
router.post('/orders', [
  authMiddleware,
  body('type').isIn(Object.values(SettlementType)),
  body('sourceAmount').isFloat({ min: 1 }),
  body('sourceCurrency').isString().isLength({ min: 3, max: 4 }),
  body('targetCurrency').isString().isLength({ min: 3, max: 4 }),
  body('preferredNetwork').optional().isIn(Object.values(SettlementNetwork)),
  body('escrowOrderId').optional().isInt({ min: 1 }),
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

    const order = await settlementService.createSettlementOrder(userId, req.body);
    
    res.status(201).json({
      success: true,
      data: order,
      message: '清算订单创建成功'
    });
  } catch (error) {
    console.error('Create settlement order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 执行清算
 */
router.post('/orders/:orderId/execute', [
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

    // 验证订单所有权
    const order = settlementService.getSettlementOrder(orderId);
    if (!order || order.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: '清算订单不存在或无权限'
      });
    }

    const executedOrder = await settlementService.executeSettlement(orderId);
    
    res.json({
      success: true,
      data: executedOrder,
      message: '清算执行成功'
    });
  } catch (error) {
    console.error('Execute settlement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * B2B清算请求
 */
router.post('/b2b', [
  authMiddleware,
  body('buyerCompany.name').isString().isLength({ min: 2, max: 200 }),
  body('buyerCompany.country').isString().isLength({ min: 2, max: 50 }),
  body('buyerCompany.bankAccount').isString().isLength({ min: 10, max: 50 }),
  body('sellerCompany.name').isString().isLength({ min: 2, max: 200 }),
  body('sellerCompany.country').isString().isLength({ min: 2, max: 50 }),
  body('sellerCompany.bankAccount').isString().isLength({ min: 10, max: 50 }),
  body('tradingDetails.contractNumber').isString().isLength({ min: 5, max: 50 }),
  body('tradingDetails.goodsDescription').isString().isLength({ min: 10, max: 500 }),
  body('tradingDetails.totalValue').isFloat({ min: 1000 }),
  body('tradingDetails.currency').isString().isLength({ min: 3, max: 4 }),
  body('tradingDetails.terms').isIn(['FOB', 'CIF', 'EXW', 'DDP']),
  body('settlementPreference.preferredNetwork').isIn(Object.values(SettlementNetwork)),
  body('settlementPreference.maxProcessingTime').isInt({ min: 1, max: 1440 }),
  body('settlementPreference.maxFeePercentage').isFloat({ min: 0, max: 5 }),
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

    const order = await settlementService.processB2BSettlement(req.body);
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'B2B清算请求创建成功'
    });
  } catch (error) {
    console.error('B2B settlement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取清算订单详情
 */
router.get('/orders/:orderId', [
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

    const order = settlementService.getSettlementOrder(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: '清算订单不存在'
      });
    }

    // 检查权限
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权限访问此订单'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get settlement order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取用户清算订单列表
 */
router.get('/orders', [
  authMiddleware,
  query('status').optional().isIn(Object.values(SettlementStatus)),
  query('type').optional().isIn(Object.values(SettlementType)),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { status, type, page = 1, limit = 20 } = req.query;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let orders = settlementService.getUserSettlementOrders(userId);
    
    // 过滤条件
    if (status) {
      orders = orders.filter(order => order.status === status);
    }
    if (type) {
      orders = orders.filter(order => order.type === type);
    }
    
    // 按创建时间倒序排列
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // 分页
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: orders.length,
          totalPages: Math.ceil(orders.length / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get user settlement orders error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 取消清算订单
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

    await settlementService.cancelSettlement(orderId, userId);
    
    res.json({
      success: true,
      message: '清算订单已取消'
    });
  } catch (error) {
    console.error('Cancel settlement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取境外节点列表
 */
router.get('/nodes', [authMiddleware], async (req: express.Request, res: express.Response) => {
  try {
    const nodes = settlementService.getOffshoreNodes();
    
    res.json({
      success: true,
      data: nodes
    });
  } catch (error) {
    console.error('Get offshore nodes error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取实时汇率
 */
router.get('/rates', async (req: express.Request, res: express.Response) => {
  try {
    const rates = settlementService.getCurrentRates();
    
    res.json({
      success: true,
      data: {
        rates,
        timestamp: new Date().toISOString(),
        source: 'TriBridge Settlement Service'
      }
    });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 预估清算费用
 */
router.post('/estimate', [
  body('sourceAmount').isFloat({ min: 1 }),
  body('sourceCurrency').isString().isLength({ min: 3, max: 4 }),
  body('targetCurrency').isString().isLength({ min: 3, max: 4 }),
  body('preferredNetwork').optional().isIn(Object.values(SettlementNetwork)),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const { sourceAmount, sourceCurrency, targetCurrency, preferredNetwork } = req.body;
    
    // 创建临时清算订单用于估算
    const tempUserId = 'estimate_user';
    const tempOrder = await settlementService.createSettlementOrder(tempUserId, {
      type: SettlementType.CROSS_BORDER,
      sourceAmount,
      sourceCurrency,
      targetCurrency,
      preferredNetwork
    });

    // 移除临时订单
    // settlementService.removeOrder(tempOrder.id); // 需要实现此方法
    
    res.json({
      success: true,
      data: {
        sourceAmount,
        targetAmount: tempOrder.targetAmount,
        exchangeRate: tempOrder.exchangeRate,
        fees: tempOrder.fees,
        estimatedTime: tempOrder.selectedNode.processingTime.average,
        selectedNode: {
          name: tempOrder.selectedNode.name,
          country: tempOrder.selectedNode.country,
          network: tempOrder.network
        }
      }
    });
  } catch (error) {
    console.error('Estimate settlement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取清算统计数据
 */
router.get('/stats', [authMiddleware], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const orders = settlementService.getUserSettlementOrders(userId);
    
    const stats = {
      total: orders.length,
      byStatus: Object.values(SettlementStatus).reduce((acc, status) => {
        acc[status] = orders.filter(order => order.status === status).length;
        return acc;
      }, {} as Record<string, number>),
      byType: Object.values(SettlementType).reduce((acc, type) => {
        acc[type] = orders.filter(order => order.type === type).length;
        return acc;
      }, {} as Record<string, number>),
      totalVolume: orders
        .filter(order => order.status === SettlementStatus.COMPLETED)
        .reduce((sum, order) => sum + order.sourceAmount, 0),
      totalFees: orders
        .filter(order => order.status === SettlementStatus.COMPLETED)
        .reduce((sum, order) => sum + order.fees.totalFee, 0),
      averageProcessingTime: calculateAverageProcessingTime(orders),
      successRate: calculateSuccessRate(orders)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get settlement stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 辅助函数
function calculateAverageProcessingTime(orders: any[]): number {
  const completedOrders = orders.filter(order => 
    order.status === SettlementStatus.COMPLETED && 
    order.processedAt && 
    order.completedAt
  );
  
  if (completedOrders.length === 0) return 0;
  
  const totalTime = completedOrders.reduce((sum, order) => {
    const processTime = new Date(order.completedAt).getTime() - new Date(order.processedAt).getTime();
    return sum + (processTime / (1000 * 60)); // 转换为分钟
  }, 0);
  
  return Math.round(totalTime / completedOrders.length);
}

function calculateSuccessRate(orders: any[]): number {
  if (orders.length === 0) return 0;
  
  const completedOrders = orders.filter(order => order.status === SettlementStatus.COMPLETED);
  return Math.round((completedOrders.length / orders.length) * 100);
}

export default router;