import { Router, Request, Response } from 'express';
import BRICSStablecoinService from '../services/bricsStablecoinService';

const router = Router();
const bricsService = new BRICSStablecoinService();

// 获取所有BRICS稳定币
router.get('/stablecoins', async (req: Request, res: Response) => {
  try {
    const stablecoins = bricsService.getAllStablecoins();
    res.json({
      success: true,
      data: stablecoins
    });
  } catch (error) {
    console.error('Get stablecoins error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 获取特定稳定币信息
router.get('/stablecoins/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stablecoin = bricsService.getStablecoin(id);

    if (!stablecoin) {
      return res.status(404).json({
        success: false,
        message: 'Stablecoin not found'
      });
    }

    res.json({
      success: true,
      data: stablecoin
    });
  } catch (error) {
    console.error('Get stablecoin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 计算兑换率
router.get('/exchange-rate/:fromCoin/:toCoin', async (req: Request, res: Response) => {
  try {
    const { fromCoin, toCoin } = req.params;
    const exchangeRate = bricsService.calculateExchangeRate(fromCoin, toCoin);

    res.json({
      success: true,
      data: {
        fromCoin,
        toCoin,
        exchangeRate,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Calculate exchange rate error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Invalid request'
    });
  }
});

// 创建兑换订单
router.post('/exchange', async (req: Request, res: Response) => {
  try {
    const { fromCoin, toCoin, amount, userId } = req.body;

    if (!fromCoin || !toCoin || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fromCoin, toCoin, amount, userId'
      });
    }

    const exchange = await bricsService.createExchange(fromCoin, toCoin, amount, userId);

    res.json({
      success: true,
      data: exchange
    });
  } catch (error) {
    console.error('Create exchange error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取兑换订单状态
router.get('/exchange/:exchangeId', async (req: Request, res: Response) => {
  try {
    const { exchangeId } = req.params;
    const exchange = bricsService.getExchange(exchangeId);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    res.json({
      success: true,
      data: exchange
    });
  } catch (error) {
    console.error('Get exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 获取用户兑换历史
router.get('/user/:userId/exchanges', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const exchanges = bricsService.getUserExchanges(userId);

    res.json({
      success: true,
      data: exchanges
    });
  } catch (error) {
    console.error('Get user exchanges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 获取流动性池信息
router.get('/liquidity-pools', async (req: Request, res: Response) => {
  try {
    const pools = bricsService.getLiquidityPools();
    res.json({
      success: true,
      data: pools
    });
  } catch (error) {
    console.error('Get liquidity pools error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 添加流动性
router.post('/liquidity-pools/:poolId/add', async (req: Request, res: Response) => {
  try {
    const { poolId } = req.params;
    const { token0Amount, token1Amount, userId } = req.body;

    if (!token0Amount || !token1Amount || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token0Amount, token1Amount, userId'
      });
    }

    const result = await bricsService.addLiquidity(poolId, token0Amount, token1Amount, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Add liquidity error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取支付路由
router.get('/payment-routes', async (req: Request, res: Response) => {
  try {
    const { fromCountry, toCountry } = req.query;

    if (fromCountry && toCountry) {
      const route = bricsService.getPaymentRoute(fromCountry as string, toCountry as string);
      res.json({
        success: true,
        data: route
      });
    } else {
      const routes = bricsService.getAllPaymentRoutes();
      res.json({
        success: true,
        data: routes
      });
    }
  } catch (error) {
    console.error('Get payment routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 估算跨境支付
router.post('/estimate-payment', async (req: Request, res: Response) => {
  try {
    const { fromCountry, toCountry, amount, currency } = req.body;

    if (!fromCountry || !toCountry || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fromCountry, toCountry, amount, currency'
      });
    }

    const estimation = bricsService.estimateCrossBorderPayment(
      fromCountry,
      toCountry,
      parseFloat(amount),
      currency
    );

    res.json({
      success: true,
      data: estimation
    });
  } catch (error) {
    console.error('Estimate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 获取统计数据
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const stats = bricsService.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 更新汇率（管理员接口）
router.put('/exchange-rates', async (req: Request, res: Response) => {
  try {
    const { rates } = req.body;

    if (!rates || typeof rates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid rates data'
      });
    }

    bricsService.updateExchangeRates(rates);

    res.json({
      success: true,
      message: 'Exchange rates updated successfully'
    });
  } catch (error) {
    console.error('Update exchange rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// BRICS支付网络状态
router.get('/network-status', async (req: Request, res: Response) => {
  try {
    // 模拟网络状态数据
    const networkStatus = {
      overall: 'healthy',
      nodes: {
        china: { status: 'online', latency: 45, uptime: 99.9 },
        russia: { status: 'online', latency: 52, uptime: 99.8 },
        india: { status: 'online', latency: 38, uptime: 99.95 },
        brazil: { status: 'online', latency: 67, uptime: 99.7 },
        southAfrica: { status: 'online', latency: 78, uptime: 99.6 }
      },
      transactions: {
        last24h: 15678,
        avgProcessingTime: 12.5,
        successRate: 99.8
      },
      bridges: {
        bcny_brub: { status: 'active', volume24h: 2500000 },
        binr_bbrl: { status: 'active', volume24h: 1800000 },
        bzar_bcny: { status: 'active', volume24h: 950000 },
        brics_usdt: { status: 'active', volume24h: 3200000 }
      }
    };

    res.json({
      success: true,
      data: networkStatus
    });
  } catch (error) {
    console.error('Get network status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;