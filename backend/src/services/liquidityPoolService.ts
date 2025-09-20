import { EventEmitter } from 'events';

// 资金池接口
export interface LiquidityPool {
  id: string;
  name: string;
  currency: string; // USD, CNY, RUB, USDT, USDC
  totalAmount: number; // 总资金量
  availableAmount: number; // 可用资金量
  lockedAmount: number; // 锁定资金量
  minInvestment: number; // 最小投资金额
  maxInvestment: number; // 最大投资金额
  apy: number; // 年化收益率
  riskLevel: 'low' | 'medium' | 'high';
  lockPeriod: number; // 锁定期(天)
  managementFee: number; // 管理费率
  performanceFee: number; // 业绩提成
  status: 'active' | 'paused' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  strategyType: 'lending' | 'arbitrage' | 'yield_farming' | 'staking';
  description?: string;
  historicalPerformance: PerformanceRecord[];
}

// 用户投资记录
export interface UserInvestment {
  id: string;
  userId: string;
  poolId: string;
  principal: number; // 本金
  currentValue: number; // 当前价值
  earnedInterest: number; // 已赚取利息
  investmentDate: Date;
  maturityDate: Date;
  status: 'active' | 'matured' | 'withdrawn' | 'penalty_withdrawn';
  compoundingEnabled: boolean; // 是否复投
  autoReinvest: boolean; // 是否自动再投资
  withdrawalRequests: WithdrawalRequest[];
}

// 提取请求
export interface WithdrawalRequest {
  id: string;
  investmentId: string;
  requestedAmount: number;
  actualAmount: number; // 实际提取金额(扣除手续费)
  penalty: number; // 提前提取罚金
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: Date;
  processedDate?: Date;
  reason?: string;
}

// 绩效记录
export interface PerformanceRecord {
  date: Date;
  totalValue: number;
  dailyReturn: number;
  cumulativeReturn: number;
  sharpeRatio: number;
  volatility: number;
}

// 风险评估
export interface RiskAssessment {
  poolId: string;
  date: Date;
  volatility: number; // 波动率
  maxDrawdown: number; // 最大回撤
  beta: number; // 贝塔系数
  var95: number; // 95%置信度下的VaR
  stressTestResults: { [scenario: string]: number };
  riskScore: number; // 1-10风险评分
  recommendations: string[];
}

// 资金流动记录
export interface CashFlow {
  id: string;
  poolId: string;
  type: 'deposit' | 'withdrawal' | 'interest' | 'fee' | 'rebalance';
  amount: number;
  currency: string;
  description: string;
  timestamp: Date;
  txHash?: string; // 区块链交易哈希
  relatedUserId?: string;
}

class LiquidityPoolService extends EventEmitter {
  private pools: Map<string, LiquidityPool> = new Map();
  private investments: Map<string, UserInvestment> = new Map();
  private withdrawalRequests: Map<string, WithdrawalRequest> = new Map();
  private cashFlows: Map<string, CashFlow> = new Map();
  private riskAssessments: Map<string, RiskAssessment> = new Map();

  constructor() {
    super();
    this.initializeMockData();
    this.startPerformanceTracking();
  }

  // 初始化模拟数据
  private initializeMockData(): void {
    const mockPools: LiquidityPool[] = [
      {
        id: 'POOL_USD_001',
        name: 'USD稳定币收益池',
        currency: 'USD',
        totalAmount: 5000000,
        availableAmount: 3200000,
        lockedAmount: 1800000,
        minInvestment: 1000,
        maxInvestment: 500000,
        apy: 0.085, // 8.5%
        riskLevel: 'low',
        lockPeriod: 90,
        managementFee: 0.02, // 2%
        performanceFee: 0.1, // 10%
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        strategyType: 'lending',
        description: '通过借贷协议为稳定币提供流动性，获得稳定收益',
        historicalPerformance: this.generatePerformanceHistory(365, 0.085)
      },
      {
        id: 'POOL_CNY_001',
        name: '人民币套利池',
        currency: 'CNY',
        totalAmount: 36000000,
        availableAmount: 22000000,
        lockedAmount: 14000000,
        minInvestment: 5000,
        maxInvestment: 2000000,
        apy: 0.12, // 12%
        riskLevel: 'medium',
        lockPeriod: 180,
        managementFee: 0.025,
        performanceFee: 0.15,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        strategyType: 'arbitrage',
        description: '利用CNY/USDT汇率差异进行套利交易',
        historicalPerformance: this.generatePerformanceHistory(365, 0.12)
      },
      {
        id: 'POOL_RUB_001',
        name: '卢布高收益池',
        currency: 'RUB',
        totalAmount: 120000000,
        availableAmount: 80000000,
        lockedAmount: 40000000,
        minInvestment: 50000,
        maxInvestment: 10000000,
        apy: 0.18, // 18%
        riskLevel: 'high',
        lockPeriod: 365,
        managementFee: 0.03,
        performanceFee: 0.2,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        strategyType: 'yield_farming',
        description: '通过多策略组合获取高收益，适合风险偏好较高的投资者',
        historicalPerformance: this.generatePerformanceHistory(365, 0.18)
      }
    ];

    mockPools.forEach(pool => {
      this.pools.set(pool.id, pool);
    });

    // 生成模拟用户投资
    const mockInvestments: UserInvestment[] = [
      {
        id: 'INV_001',
        userId: 'user1',
        poolId: 'POOL_USD_001',
        principal: 10000,
        currentValue: 10425, // 投资50天收益
        earnedInterest: 425,
        investmentDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        maturityDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        status: 'active',
        compoundingEnabled: true,
        autoReinvest: false,
        withdrawalRequests: []
      },
      {
        id: 'INV_002',
        userId: 'user1',
        poolId: 'POOL_CNY_001',
        principal: 50000,
        currentValue: 52800,
        earnedInterest: 2800,
        investmentDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        maturityDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        status: 'active',
        compoundingEnabled: true,
        autoReinvest: true,
        withdrawalRequests: []
      }
    ];

    mockInvestments.forEach(investment => {
      this.investments.set(investment.id, investment);
    });
  }

  // 生成历史绩效数据
  private generatePerformanceHistory(days: number, targetAPY: number): PerformanceRecord[] {
    const records: PerformanceRecord[] = [];
    let cumulativeReturn = 0;
    let totalValue = 1000000; // 初始值
    
    const dailyTargetReturn = Math.pow(1 + targetAPY, 1/365) - 1;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      
      // 添加随机波动
      const volatility = 0.02; // 2%日波动率
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      const dailyReturn = dailyTargetReturn * randomFactor;
      
      totalValue *= (1 + dailyReturn);
      cumulativeReturn = (totalValue / 1000000) - 1;
      
      records.push({
        date,
        totalValue,
        dailyReturn,
        cumulativeReturn,
        sharpeRatio: cumulativeReturn / Math.sqrt(volatility * 365),
        volatility: volatility
      });
    }
    
    return records;
  }

  // 获取所有资金池
  getAllPools(): LiquidityPool[] {
    return Array.from(this.pools.values()).filter(pool => pool.status === 'active');
  }

  // 获取特定资金池
  getPool(poolId: string): LiquidityPool | null {
    return this.pools.get(poolId) || null;
  }

  // 创建投资
  async createInvestment(
    userId: string, 
    poolId: string, 
    amount: number,
    options: { compoundingEnabled?: boolean; autoReinvest?: boolean } = {}
  ): Promise<UserInvestment> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error('资金池不存在');
    }

    if (pool.status !== 'active') {
      throw new Error('资金池未激活');
    }

    if (amount < pool.minInvestment || amount > pool.maxInvestment) {
      throw new Error(`投资金额必须在 ${pool.minInvestment} - ${pool.maxInvestment} 之间`);
    }

    if (amount > pool.availableAmount) {
      throw new Error('资金池可用资金不足');
    }

    const investment: UserInvestment = {
      id: `INV_${Date.now()}`,
      userId,
      poolId,
      principal: amount,
      currentValue: amount,
      earnedInterest: 0,
      investmentDate: new Date(),
      maturityDate: new Date(Date.now() + pool.lockPeriod * 24 * 60 * 60 * 1000),
      status: 'active',
      compoundingEnabled: options.compoundingEnabled || false,
      autoReinvest: options.autoReinvest || false,
      withdrawalRequests: []
    };

    this.investments.set(investment.id, investment);

    // 更新资金池
    pool.availableAmount -= amount;
    pool.lockedAmount += amount;
    pool.updatedAt = new Date();
    this.pools.set(poolId, pool);

    // 记录资金流
    this.recordCashFlow({
      poolId,
      type: 'deposit',
      amount,
      currency: pool.currency,
      description: `用户 ${userId} 投资`,
      relatedUserId: userId
    });

    this.emit('investmentCreated', investment);
    return investment;
  }

  // 获取用户投资
  getUserInvestments(userId: string): UserInvestment[] {
    return Array.from(this.investments.values()).filter(inv => inv.userId === userId);
  }

  // 计算投资收益
  async calculateReturns(investmentId: string): Promise<{
    principal: number;
    currentValue: number;
    totalReturn: number;
    dailyReturn: number;
    annualizedReturn: number;
  }> {
    const investment = this.investments.get(investmentId);
    if (!investment) {
      throw new Error('投资记录不存在');
    }

    const pool = this.pools.get(investment.poolId);
    if (!pool) {
      throw new Error('关联资金池不存在');
    }

    const daysSinceInvestment = Math.floor(
      (Date.now() - investment.investmentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 计算复利收益
    const dailyRate = Math.pow(1 + pool.apy, 1/365) - 1;
    let currentValue = investment.principal;
    
    for (let i = 0; i < daysSinceInvestment; i++) {
      currentValue *= (1 + dailyRate);
    }

    // 扣除管理费
    const managementFeeAmount = currentValue * pool.managementFee * (daysSinceInvestment / 365);
    currentValue -= managementFeeAmount;

    const totalReturn = currentValue - investment.principal;
    const dailyReturn = totalReturn / daysSinceInvestment;
    const annualizedReturn = Math.pow(currentValue / investment.principal, 365 / daysSinceInvestment) - 1;

    // 更新投资记录
    investment.currentValue = currentValue;
    investment.earnedInterest = totalReturn;
    this.investments.set(investmentId, investment);

    return {
      principal: investment.principal,
      currentValue,
      totalReturn,
      dailyReturn,
      annualizedReturn
    };
  }

  // 申请提取
  async requestWithdrawal(
    investmentId: string, 
    amount: number, 
    isEarlyWithdrawal: boolean = false
  ): Promise<WithdrawalRequest> {
    const investment = this.investments.get(investmentId);
    if (!investment) {
      throw new Error('投资记录不存在');
    }

    const pool = this.pools.get(investment.poolId);
    if (!pool) {
      throw new Error('关联资金池不存在');
    }

    if (amount > investment.currentValue) {
      throw new Error('提取金额超过当前投资价值');
    }

    let penalty = 0;
    if (isEarlyWithdrawal) {
      // 提前提取罚金计算
      const remainingDays = Math.max(0, Math.floor(
        (investment.maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ));
      penalty = amount * 0.01 * (remainingDays / 365); // 按剩余时间比例收取1%罚金
    }

    const withdrawalRequest: WithdrawalRequest = {
      id: `WDR_${Date.now()}`,
      investmentId,
      requestedAmount: amount,
      actualAmount: amount - penalty,
      penalty,
      status: 'pending',
      requestDate: new Date(),
      reason: isEarlyWithdrawal ? 'early_withdrawal' : 'maturity_withdrawal'
    };

    this.withdrawalRequests.set(withdrawalRequest.id, withdrawalRequest);
    investment.withdrawalRequests.push(withdrawalRequest);
    this.investments.set(investmentId, investment);

    this.emit('withdrawalRequested', withdrawalRequest);
    return withdrawalRequest;
  }

  // 处理提取请求
  async processWithdrawal(requestId: string, approved: boolean, reason?: string): Promise<WithdrawalRequest> {
    const request = this.withdrawalRequests.get(requestId);
    if (!request) {
      throw new Error('提取请求不存在');
    }

    const investment = this.investments.get(request.investmentId);
    if (!investment) {
      throw new Error('关联投资记录不存在');
    }

    const pool = this.pools.get(investment.poolId);
    if (!pool) {
      throw new Error('关联资金池不存在');
    }

    request.status = approved ? 'approved' : 'rejected';
    request.processedDate = new Date();
    if (reason) request.reason = reason;

    if (approved) {
      // 更新投资记录
      investment.currentValue -= request.requestedAmount;
      if (investment.currentValue <= 0) {
        investment.status = request.penalty > 0 ? 'penalty_withdrawn' : 'withdrawn';
      }

      // 更新资金池
      pool.lockedAmount -= request.requestedAmount;
      pool.availableAmount = Math.max(0, pool.availableAmount); // 确保不为负数

      // 记录资金流
      this.recordCashFlow({
        poolId: investment.poolId,
        type: 'withdrawal',
        amount: request.actualAmount,
        currency: pool.currency,
        description: `用户提取，罚金: ${request.penalty}`,
        relatedUserId: investment.userId
      });

      if (request.penalty > 0) {
        this.recordCashFlow({
          poolId: investment.poolId,
          type: 'fee',
          amount: request.penalty,
          currency: pool.currency,
          description: '提前提取罚金',
          relatedUserId: investment.userId
        });
      }

      this.pools.set(investment.poolId, pool);
      this.investments.set(investment.id, investment);
    }

    this.withdrawalRequests.set(requestId, request);
    this.emit('withdrawalProcessed', request);
    return request;
  }

  // 获取资金池统计
  getPoolStatistics(poolId: string): {
    totalInvestors: number;
    averageInvestment: number;
    totalReturns: number;
    utilizationRate: number;
    performanceMetrics: {
      sharpeRatio: number;
      volatility: number;
      maxDrawdown: number;
      totalReturn: number;
    };
  } {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error('资金池不存在');
    }

    const poolInvestments = Array.from(this.investments.values())
      .filter(inv => inv.poolId === poolId);

    const totalInvestors = new Set(poolInvestments.map(inv => inv.userId)).size;
    const averageInvestment = poolInvestments.reduce((sum, inv) => sum + inv.principal, 0) / poolInvestments.length || 0;
    const totalReturns = poolInvestments.reduce((sum, inv) => sum + inv.earnedInterest, 0);
    const utilizationRate = pool.lockedAmount / pool.totalAmount;

    // 计算绩效指标
    const performance = pool.historicalPerformance;
    const returns = performance.map(p => p.dailyReturn);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance * 365);
    
    const cumulativeReturns = performance.map(p => p.cumulativeReturn);
    const maxReturn = Math.max(...cumulativeReturns);
    const maxDrawdown = cumulativeReturns.reduce((max, curr, idx) => {
      const peak = Math.max(...cumulativeReturns.slice(0, idx + 1));
      const drawdown = (peak - curr) / peak;
      return Math.max(max, drawdown);
    }, 0);

    const sharpeRatio = avgReturn / volatility;
    const totalReturn = performance[performance.length - 1]?.cumulativeReturn || 0;

    return {
      totalInvestors,
      averageInvestment,
      totalReturns,
      utilizationRate,
      performanceMetrics: {
        sharpeRatio,
        volatility,
        maxDrawdown,
        totalReturn
      }
    };
  }

  // 记录资金流
  private recordCashFlow(data: Omit<CashFlow, 'id' | 'timestamp'>): void {
    const cashFlow: CashFlow = {
      ...data,
      id: `CF_${Date.now()}`,
      timestamp: new Date()
    };
    this.cashFlows.set(cashFlow.id, cashFlow);
  }

  // 获取资金流记录
  getCashFlows(poolId: string, limit: number = 100): CashFlow[] {
    return Array.from(this.cashFlows.values())
      .filter(cf => cf.poolId === poolId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // 开始绩效跟踪
  private startPerformanceTracking(): void {
    setInterval(() => {
      this.updatePoolPerformance();
      this.updateInvestmentValues();
    }, 24 * 60 * 60 * 1000); // 每天更新一次
  }

  // 更新资金池绩效
  private updatePoolPerformance(): void {
    this.pools.forEach(pool => {
      const dailyReturn = (Math.random() - 0.48) * 0.02; // 轻微向上偏移的随机回报
      const lastRecord = pool.historicalPerformance[pool.historicalPerformance.length - 1];
      const newTotalValue = lastRecord.totalValue * (1 + dailyReturn);
      const newCumulativeReturn = (newTotalValue / pool.historicalPerformance[0].totalValue) - 1;

      const newRecord: PerformanceRecord = {
        date: new Date(),
        totalValue: newTotalValue,
        dailyReturn,
        cumulativeReturn: newCumulativeReturn,
        sharpeRatio: newCumulativeReturn / 0.15, // 简化计算
        volatility: 0.02
      };

      pool.historicalPerformance.push(newRecord);
      
      // 保持最近365天的记录
      if (pool.historicalPerformance.length > 365) {
        pool.historicalPerformance = pool.historicalPerformance.slice(-365);
      }

      this.pools.set(pool.id, pool);
    });
  }

  // 更新投资价值
  private updateInvestmentValues(): void {
    this.investments.forEach(investment => {
      if (investment.status === 'active') {
        this.calculateReturns(investment.id);
      }
    });
  }

  // 风险评估
  async performRiskAssessment(poolId: string): Promise<RiskAssessment> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error('资金池不存在');
    }

    const performance = pool.historicalPerformance;
    const returns = performance.map(p => p.dailyReturn);
    
    // 计算波动率
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance * 365);

    // 计算最大回撤
    const cumulativeReturns = performance.map(p => p.cumulativeReturn);
    const maxDrawdown = cumulativeReturns.reduce((max, curr, idx) => {
      const peak = Math.max(...cumulativeReturns.slice(0, idx + 1));
      const drawdown = (peak - curr) / peak;
      return Math.max(max, drawdown);
    }, 0);

    // 简化的VaR计算 (95%置信度)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95 = sortedReturns[Math.floor(returns.length * 0.05)];

    // 压力测试
    const stressTestResults = {
      'market_crash': -0.3,
      'liquidity_crisis': -0.15,
      'rate_hike': -0.08,
      'currency_devaluation': -0.12
    };

    // 风险评分 (1-10)
    let riskScore = 5;
    if (volatility > 0.3) riskScore += 2;
    else if (volatility > 0.2) riskScore += 1;
    if (maxDrawdown > 0.2) riskScore += 2;
    else if (maxDrawdown > 0.1) riskScore += 1;
    riskScore = Math.min(10, Math.max(1, riskScore));

    const assessment: RiskAssessment = {
      poolId,
      date: new Date(),
      volatility,
      maxDrawdown,
      beta: 1.0, // 简化设为1
      var95,
      stressTestResults,
      riskScore,
      recommendations: this.generateRiskRecommendations(riskScore, volatility, maxDrawdown)
    };

    this.riskAssessments.set(`${poolId}_${Date.now()}`, assessment);
    return assessment;
  }

  // 生成风险建议
  private generateRiskRecommendations(riskScore: number, volatility: number, maxDrawdown: number): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 8) {
      recommendations.push('高风险投资，建议仅投入可承受全损的资金');
      recommendations.push('考虑分散投资到低风险资金池');
    } else if (riskScore >= 6) {
      recommendations.push('中等风险投资，建议控制投资比例');
      recommendations.push('定期监控投资表现');
    } else {
      recommendations.push('低风险投资，适合稳健型投资者');
    }

    if (volatility > 0.25) {
      recommendations.push('波动率较高，建议关注市场动态');
    }

    if (maxDrawdown > 0.15) {
      recommendations.push('历史最大回撤较大，需要心理承受能力');
    }

    return recommendations;
  }
}

export const liquidityPoolService = new LiquidityPoolService();
export default liquidityPoolService;