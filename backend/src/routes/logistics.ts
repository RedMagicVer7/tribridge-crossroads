import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import logisticsService, { LogisticsStatus, LogisticsProvider, DocumentType } from '../services/logisticsService.js';
import multer from 'multer';

const router = express.Router();

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'));
    }
  }
});

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
 * 创建物流订单
 */
router.post('/orders', [
  authMiddleware,
  body('escrowOrderId').isInt({ min: 1 }),
  body('sender.name').isString().isLength({ min: 2, max: 100 }),
  body('sender.address').isString().isLength({ min: 10, max: 200 }),
  body('sender.city').isString().isLength({ min: 2, max: 50 }),
  body('sender.country').isString().isLength({ min: 2, max: 50 }),
  body('sender.phone').isString().isLength({ min: 10, max: 20 }),
  body('sender.email').isEmail(),
  body('recipient.name').isString().isLength({ min: 2, max: 100 }),
  body('recipient.address').isString().isLength({ min: 10, max: 200 }),
  body('recipient.city').isString().isLength({ min: 2, max: 50 }),
  body('recipient.country').isString().isLength({ min: 2, max: 50 }),
  body('recipient.phone').isString().isLength({ min: 10, max: 20 }),
  body('recipient.email').isEmail(),
  body('goods.description').isString().isLength({ min: 10, max: 500 }),
  body('goods.weight').isFloat({ min: 0.1, max: 10000 }),
  body('goods.value').isFloat({ min: 1, max: 1000000 }),
  body('goods.quantity').isInt({ min: 1, max: 10000 }),
  body('isExpress').isBoolean(),
  body('isInsured').isBoolean(),
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

    const orderData = {
      ...req.body,
      status: LogisticsStatus.PENDING,
      trackingPoints: [],
      documents: [],
      costs: {
        shipping: 0,
        insurance: 0,
        customs: 0,
        total: 0,
        currency: 'USD'
      }
    };

    const order = await logisticsService.createLogisticsOrder(orderData);
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Logistics order created successfully'
    });
  } catch (error) {
    console.error('Create logistics order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 确认发货
 */
router.post('/orders/:orderId/confirm-shipment', [
  authMiddleware,
  param('orderId').isString(),
  body('trackingNumber').isString().isLength({ min: 5, max: 50 }),
  body('provider').isIn(Object.values(LogisticsProvider)),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { trackingNumber, provider } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const order = await logisticsService.confirmShipment(orderId, trackingNumber, provider, []);
    
    res.json({
      success: true,
      data: order,
      message: 'Shipment confirmed successfully'
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
 * 上传物流文档
 */
router.post('/orders/:orderId/documents', [
  authMiddleware,
  param('orderId').isString(),
  body('type').isIn(Object.values(DocumentType)),
  validateRequest,
  upload.single('document')
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;
    const { type } = req.body;
    const file = req.file;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const document = await logisticsService.uploadDocument(
      orderId,
      type as DocumentType,
      {
        name: file.originalname,
        data: file.buffer,
        mimeType: file.mimetype
      },
      userId
    );
    
    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 验证物流文档
 */
router.put('/documents/:documentId/verify', [
  authMiddleware,
  param('documentId').isString(),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { documentId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // 这里应该检查用户是否有验证权限（例如是管理员或验证员）
    const document = await logisticsService.verifyDocument(documentId, userId);
    
    res.json({
      success: true,
      data: document,
      message: 'Document verified successfully'
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 验证整个物流订单
 */
router.post('/orders/:orderId/verify', [
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

    const verification = await logisticsService.verifyLogisticsOrder(orderId, userId);
    
    res.json({
      success: true,
      data: verification,
      message: verification.isVerified ? 'Logistics order verified' : 'Logistics order verification failed'
    });
  } catch (error) {
    console.error('Verify logistics order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取物流订单详情
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

    const order = logisticsService.getLogisticsOrder(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Logistics order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get logistics order error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 根据智能合约订单ID获取物流信息
 */
router.get('/orders/escrow/:escrowOrderId', [
  authMiddleware,
  param('escrowOrderId').isInt({ min: 1 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { escrowOrderId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const order = logisticsService.getLogisticsOrderByEscrowId(Number(escrowOrderId));
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Logistics order not found for this escrow order'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get logistics order by escrow ID error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取用户的物流订单列表
 */
router.get('/orders', [
  authMiddleware,
  query('status').optional().isIn(Object.values(LogisticsStatus)),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest
], async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    const { status, page = 1, limit = 20 } = req.query;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let orders = logisticsService.getUserLogisticsOrders(userId);
    
    // 按状态过滤
    if (status) {
      orders = orders.filter(order => order.status === status);
    }
    
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
    console.error('Get user logistics orders error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

/**
 * 获取物流状态统计
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

    const orders = logisticsService.getUserLogisticsOrders(userId);
    
    const stats = {
      total: orders.length,
      byStatus: Object.values(LogisticsStatus).reduce((acc, status) => {
        acc[status] = orders.filter(order => order.status === status).length;
        return acc;
      }, {} as Record<string, number>),
      byProvider: Object.values(LogisticsProvider).reduce((acc, provider) => {
        acc[provider] = orders.filter(order => order.provider === provider).length;
        return acc;
      }, {} as Record<string, number>),
      averageDeliveryTime: calculateAverageDeliveryTime(orders),
      onTimeDeliveryRate: calculateOnTimeDeliveryRate(orders)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get logistics stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 辅助方法
function calculateAverageDeliveryTime(orders: any[]): number {
  const deliveredOrders = orders.filter(order => 
    order.status === LogisticsStatus.DELIVERED && 
    order.shippedAt && 
    order.actualDelivery
  );
  
  if (deliveredOrders.length === 0) return 0;
  
  const totalDays = deliveredOrders.reduce((sum, order) => {
    const shippedTime = new Date(order.shippedAt).getTime();
    const deliveredTime = new Date(order.actualDelivery).getTime();
    const days = (deliveredTime - shippedTime) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / deliveredOrders.length);
}

function calculateOnTimeDeliveryRate(orders: any[]): number {
  const deliveredOrders = orders.filter(order => 
    order.status === LogisticsStatus.DELIVERED && 
    order.estimatedDelivery && 
    order.actualDelivery
  );
  
  if (deliveredOrders.length === 0) return 0;
  
  const onTimeOrders = deliveredOrders.filter(order => {
    const estimated = new Date(order.estimatedDelivery).getTime();
    const actual = new Date(order.actualDelivery).getTime();
    return actual <= estimated;
  });
  
  return Math.round((onTimeOrders.length / deliveredOrders.length) * 100);
}

export default router;