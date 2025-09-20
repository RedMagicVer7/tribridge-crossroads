import { Router, Request, Response } from 'express';
import ValueAddedService from '../services/valueAddedService';

const router = Router();
const valueAddedService = new ValueAddedService();

// 汇率锁定相关路由
router.post('/rate-lock', async (req: Request, res: Response) => {
  try {
    const { userId, fromCurrency, toCurrency, amount, lockDuration } = req.body;

    if (!userId || !fromCurrency || !toCurrency || !amount || !lockDuration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const rateLock = await valueAddedService.createRateLock(
      userId, fromCurrency, toCurrency, amount, lockDuration
    );

    res.json({
      success: true,
      data: rateLock
    });
  } catch (error) {
    console.error('Create rate lock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/rate-lock/:lockId/use', async (req: Request, res: Response) => {
  try {
    const { lockId } = req.params;
    const success = await valueAddedService.useRateLock(lockId);

    res.json({
      success,
      message: success ? 'Rate lock used successfully' : 'Failed to use rate lock'
    });
  } catch (error) {
    console.error('Use rate lock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 信用管理相关路由
router.get('/credit-profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = valueAddedService.getCreditProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Credit profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get credit profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 保险服务相关路由
router.post('/insurance', async (req: Request, res: Response) => {
  try {
    const { userId, policyType, coverage, duration } = req.body;

    if (!userId || !policyType || !coverage || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const policy = await valueAddedService.createInsurancePolicy(
      userId, policyType, coverage, duration
    );

    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Create insurance policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 忠诚度计划相关路由
router.get('/loyalty/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const program = valueAddedService.getLoyaltyProgram(userId);

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Get loyalty program error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/loyalty/:userId/points', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { points, reason } = req.body;

    if (!points || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing points or reason'
      });
    }

    valueAddedService.addLoyaltyPoints(userId, points, reason);

    res.json({
      success: true,
      message: 'Points added successfully'
    });
  } catch (error) {
    console.error('Add loyalty points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 推荐计划相关路由
router.post('/referral/code/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const referralCode = valueAddedService.createReferralCode(userId);

    res.json({
      success: true,
      data: { referralCode }
    });
  } catch (error) {
    console.error('Create referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/referral/process', async (req: Request, res: Response) => {
  try {
    const { referralCode, newUserId } = req.body;

    if (!referralCode || !newUserId) {
      return res.status(400).json({
        success: false,
        message: 'Missing referral code or new user ID'
      });
    }

    const referral = await valueAddedService.processReferral(referralCode, newUserId);

    res.json({
      success: true,
      data: referral
    });
  } catch (error) {
    console.error('Process referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 高级订单相关路由
router.post('/advanced-order', async (req: Request, res: Response) => {
  try {
    const { 
      userId, orderType, fromCurrency, toCurrency, amount, 
      triggerPrice, limitPrice, trailingAmount 
    } = req.body;

    if (!userId || !orderType || !fromCurrency || !toCurrency || !amount || !triggerPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const order = await valueAddedService.createAdvancedOrder(
      userId, orderType, fromCurrency, toCurrency, amount,
      triggerPrice, limitPrice, trailingAmount
    );

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create advanced order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 用户服务摘要
router.get('/summary/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const summary = valueAddedService.getUserServicesSummary(userId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get user services summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 用户折扣计算
router.get('/discount/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const discount = valueAddedService.calculateUserDiscount(userId);

    res.json({
      success: true,
      data: { discount }
    });
  } catch (error) {
    console.error('Calculate user discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;