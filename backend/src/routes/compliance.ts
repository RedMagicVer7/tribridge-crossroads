import { Router, Request, Response } from 'express';
import ComplianceService from '../services/complianceService';

const router = Router();
const complianceService = new ComplianceService();

// 执行合规检查
router.post('/check', async (req: Request, res: Response) => {
  try {
    const { userId, transactionId, checkData } = req.body;

    if (!userId || !transactionId || !checkData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, transactionId, checkData'
      });
    }

    const result = await complianceService.performComplianceCheck(
      userId,
      transactionId,
      checkData
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 获取合规检查结果
router.get('/check/:checkId', async (req: Request, res: Response) => {
  try {
    const { checkId } = req.params;
    const result = complianceService.getComplianceCheck(checkId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Compliance check not found'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get compliance check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 获取用户的所有合规检查
router.get('/user/:userId/checks', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const results = complianceService.getUserComplianceChecks(userId);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Get user compliance checks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 更新合规检查状态（手动审查）
router.put('/check/:checkId/status', async (req: Request, res: Response) => {
  try {
    const { checkId } = req.params;
    const { status, notes } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    const success = complianceService.updateCheckStatus(checkId, status, notes);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Compliance check not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update compliance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 获取风险统计数据
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const stats = complianceService.getRiskStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get compliance statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 预检查接口 - 在交易前进行快速风险评估
router.post('/pre-check', async (req: Request, res: Response) => {
  try {
    const { userCountry, destinationCountry, amount, currency } = req.body;

    // 快速地理位置检查
    const restrictions = complianceService['restrictedCountries'];
    const userRestriction = restrictions.get(userCountry);
    const destRestriction = restrictions.get(destinationCountry);

    let riskLevel = 'low';
    const warnings = [];

    if (userRestriction?.restrictionType === 'full_block' || 
        destRestriction?.restrictionType === 'full_block') {
      riskLevel = 'critical';
      warnings.push('Transaction involves blocked country/region');
    } else if (userRestriction?.restrictionType === 'enhanced_dd' || 
               destRestriction?.restrictionType === 'enhanced_dd') {
      riskLevel = 'high';
      warnings.push('Enhanced due diligence required');
    }

    if (amount > 10000) {
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
      warnings.push('Large transaction amount detected');
    }

    res.json({
      success: true,
      data: {
        riskLevel,
        warnings,
        canProceed: riskLevel !== 'critical',
        requiresEnhancedCheck: riskLevel === 'high'
      }
    });
  } catch (error) {
    console.error('Pre-check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;