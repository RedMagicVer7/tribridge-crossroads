import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import liquidityPoolService, { LiquidityPool, UserInvestment } from '../services/liquidityPoolService.js';
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

// 获取所有资金池
router.get('/pools', async (req, res) => {
  try {
    const pools = liquidityPoolService.getAllPools();
    
    // 为每个资金池计算额外统计信息
    const poolsWithStats = await Promise.all(pools.map(async (pool) => {
      try {
        const stats = liquidityPoolService.getPoolStatistics(pool.id);
        return {
          ...pool,
          statistics: stats
        };
      } catch (error) {
        return {
          ...pool,
          statistics: null
        };
      }
    }));
    
    res.json({
      success: true,
      data: poolsWithStats
    });
  } catch (error) {
    console.error('Get pools error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取特定资金池详情
router.get('/pools/:poolId', [
  param('poolId').isString(),
  validateRequest
], async (req, res) => {
  try {
    const { poolId } = req.params;
    const pool = liquidityPoolService.getPool(poolId);
    
    if (!pool) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      });
    }

    const statistics = liquidityPoolService.getPoolStatistics(poolId);
    const cashFlows = liquidityPoolService.getCashFlows(poolId, 50);
    
    res.json({
      success: true,
      data: {
        ...pool,
        statistics,
        recentCashFlows: cashFlows
      }
    });
  } catch (error) {
    console.error('Get pool error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 创建投资
router.post('/pools/:poolId/invest', [
  authMiddleware,
  param('poolId').isString(),
  body('amount').isNumeric().isFloat({ min: 1 }),
  body('compoundingEnabled').optional().isBoolean(),
  body('autoReinvest').optional().isBoolean(),
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

    const { poolId } = req.params;
    const { amount, compoundingEnabled, autoReinvest } = req.body;

    const investment = await liquidityPoolService.createInvestment(
      userId,
      poolId,
      amount,
      { compoundingEnabled, autoReinvest }
    );
    
    res.status(201).json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Investment creation failed'
    });
  }
});

// 获取用户投资
router.get('/investments', [authMiddleware], async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const investments = liquidityPoolService.getUserInvestments(userId);
    
    // 为每个投资计算最新收益
    const investmentsWithReturns = await Promise.all(investments.map(async (investment) => {
      try {
        const returns = await liquidityPoolService.calculateReturns(investment.id);
        return {
          ...investment,
          returns
        };
      } catch (error) {
        return {
          ...investment,
          returns: null
        };
      }
    }));
    
    res.json({
      success: true,
      data: investmentsWithReturns
    });
  } catch (error) {
    console.error('Get user investments error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取投资收益计算
router.get('/investments/:investmentId/returns', [
  authMiddleware,
  param('investmentId').isString(),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    const { investmentId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // 验证投资所有权
    const investments = liquidityPoolService.getUserInvestments(userId);
    const investment = investments.find(inv => inv.id === investmentId);
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found or access denied'
      });
    }

    const returns = await liquidityPoolService.calculateReturns(investmentId);
    
    res.json({
      success: true,
      data: returns
    });
  } catch (error) {
    console.error('Calculate returns error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 申请提取
router.post('/investments/:investmentId/withdraw', [
  authMiddleware,
  param('investmentId').isString(),
  body('amount').isNumeric().isFloat({ min: 0.01 }),
  body('isEarlyWithdrawal').optional().isBoolean(),
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user?.id;
    const { investmentId } = req.params;
    const { amount, isEarlyWithdrawal = false } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // 验证投资所有权
    const investments = liquidityPoolService.getUserInvestments(userId);
    const investment = investments.find(inv => inv.id === investmentId);
    
    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found or access denied'
      });
    }

    const withdrawalRequest = await liquidityPoolService.requestWithdrawal(
      investmentId,
      amount,
      isEarlyWithdrawal
    );
    
    res.status(201).json({
      success: true,
      data: withdrawalRequest
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Withdrawal request failed'
    });
  }
});

// 管理员：处理提取请求
router.put('/withdrawals/:requestId/process', [
  authMiddleware,
  param('requestId').isString(),
  body('approved').isBoolean(),
  body('reason').optional().isString(),
  validateRequest
], async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approved, reason } = req.body;

    // 这里应该检查管理员权限，暂时简化
    // const isAdmin = req.user?.role === 'admin';
    // if (!isAdmin) {
    //   return res.status(403).json({ success: false, error: 'Admin access required' });
    // }

    const withdrawalRequest = await liquidityPoolService.processWithdrawal(
      requestId,
      approved,
      reason
    );
    
    res.json({
      success: true,
      data: withdrawalRequest
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Withdrawal processing failed'
    });
  }
});

// 获取资金池统计
router.get('/pools/:poolId/statistics', [
  param('poolId').isString(),
  validateRequest
], async (req, res) => {
  try {
    const { poolId } = req.params;
    const statistics = liquidityPoolService.getPoolStatistics(poolId);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get pool statistics error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取资金流记录
router.get('/pools/:poolId/cashflows', [
  param('poolId').isString(),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  validateRequest
], async (req, res) => {
  try {
    const { poolId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const cashFlows = liquidityPoolService.getCashFlows(poolId, limit);
    
    res.json({
      success: true,
      data: cashFlows
    });
  } catch (error) {
    console.error('Get cash flows error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 风险评估
router.get('/pools/:poolId/risk-assessment', [
  param('poolId').isString(),
  validateRequest
], async (req, res) => {
  try {
    const { poolId } = req.params;
    const riskAssessment = await liquidityPoolService.performRiskAssessment(poolId);
    
    res.json({
      success: true,
      data: riskAssessment
    });
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// 获取投资组合概览
router.get('/portfolio/overview', [authMiddleware], async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const investments = liquidityPoolService.getUserInvestments(userId);
    
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalReturns = 0;
    
    const portfolioBreakdown = await Promise.all(investments.map(async (investment) => {
      const returns = await liquidityPoolService.calculateReturns(investment.id);
      const pool = liquidityPoolService.getPool(investment.poolId);
      
      totalInvested += returns.principal;
      totalCurrentValue += returns.currentValue;
      totalReturns += returns.totalReturn;
      
      return {
        investmentId: investment.id,
        poolId: investment.poolId,
        poolName: pool?.name,
        currency: pool?.currency,
        principal: returns.principal,
        currentValue: returns.currentValue,
        totalReturn: returns.totalReturn,
        annualizedReturn: returns.annualizedReturn,
        status: investment.status
      };
    }));

    const portfolioReturn = totalInvested > 0 ? (totalCurrentValue - totalInvested) / totalInvested : 0;
    
    res.json({
      success: true,
      data: {
        summary: {
          totalInvested,
          totalCurrentValue,
          totalReturns,
          portfolioReturn,
          activeInvestments: investments.filter(inv => inv.status === 'active').length
        },
        breakdown: portfolioBreakdown
      }
    });
  } catch (error) {
    console.error('Get portfolio overview error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;