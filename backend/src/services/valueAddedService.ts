import { EventEmitter } from 'events';

export interface RateLock {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  lockedRate: number;
  amount: string;
  lockDuration: number; // 小时
  fee: string;
  status: 'active' | 'expired' | 'used' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
}

export interface CreditProfile {
  userId: string;
  creditScore: number; // 0-1000
  creditLimit: string;
  usedCredit: string;
  availableCredit: string;
  paymentHistory: PaymentRecord[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

export interface PaymentRecord {
  id: string;
  amount: string;
  currency: string;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'defaulted';
  daysLate: number;
}

export interface InsurancePolicy {
  id: string;
  userId: string;
  policyType: 'transaction' | 'rate_volatility' | 'counterparty' | 'comprehensive';
  coverage: string;
  premium: string;
  deductible: string;
  duration: number; // 天
  status: 'active' | 'expired' | 'claimed' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
}

export interface LoyaltyProgram {
  userId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  totalEarned: number;
  benefits: string[];
  nextTierRequirement: number;
  discountRate: number; // 手续费折扣百分比
}

export interface ReferralProgram {
  referrerId: string;
  refereeId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'rewarded';
  rewardAmount: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AdvancedOrder {
  id: string;
  userId: string;
  orderType: 'limit' | 'stop_loss' | 'take_profit' | 'trailing_stop';
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  triggerPrice: number;
  limitPrice?: number;
  trailingAmount?: number;
  status: 'pending' | 'triggered' | 'filled' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
}

class ValueAddedService extends EventEmitter {
  private rateLocks: Map<string, RateLock> = new Map();
  private creditProfiles: Map<string, CreditProfile> = new Map();
  private insurancePolicies: Map<string, InsurancePolicy> = new Map();
  private loyaltyPrograms: Map<string, LoyaltyProgram> = new Map();
  private referralPrograms: Map<string, ReferralProgram[]> = new Map();
  private advancedOrders: Map<string, AdvancedOrder> = new Map();

  constructor() {
    super();
    this.initializeSampleData();
    this.startBackgroundTasks();
  }

  private initializeSampleData() {
    // 初始化一些示例数据
    const sampleUser = 'user_demo';
    
    // 信用档案
    this.creditProfiles.set(sampleUser, {
      userId: sampleUser,
      creditScore: 750,
      creditLimit: '100000',
      usedCredit: '25000',
      availableCredit: '75000',
      paymentHistory: [
        {
          id: 'pay_001',
          amount: '5000',
          currency: 'USDT',
          dueDate: new Date('2024-01-15'),
          paidDate: new Date('2024-01-14'),
          status: 'paid',
          daysLate: 0
        }
      ],
      riskLevel: 'low',
      lastUpdated: new Date()
    });

    // 忠诚度计划
    this.loyaltyPrograms.set(sampleUser, {
      userId: sampleUser,
      tier: 'gold',
      points: 12500,
      totalEarned: 25000,
      benefits: ['0.5%手续费折扣', '专属客服', '优先处理', '高级分析工具'],
      nextTierRequirement: 37500, // 到白金级
      discountRate: 0.5
    });
  }

  private startBackgroundTasks() {
    // 每小时检查汇率锁定是否过期
    setInterval(() => {
      this.checkExpiredRateLocks();
    }, 60 * 60 * 1000);

    // 每天更新信用评分
    setInterval(() => {
      this.updateCreditScores();
    }, 24 * 60 * 60 * 1000);
  }

  // 汇率锁定服务
  async createRateLock(
    userId: string,
    fromCurrency: string,
    toCurrency: string,
    amount: string,
    lockDuration: number
  ): Promise<RateLock> {
    const lockId = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 获取当前汇率
    const currentRate = await this.getCurrentRate(fromCurrency, toCurrency);
    
    // 计算锁定费用（基于金额和时长）
    const feeRate = 0.001 * (lockDuration / 24); // 每天0.1%
    const fee = (parseFloat(amount) * feeRate).toFixed(6);

    const rateLock: RateLock = {
      id: lockId,
      userId,
      fromCurrency,
      toCurrency,
      lockedRate: currentRate,
      amount,
      lockDuration,
      fee,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + lockDuration * 60 * 60 * 1000)
    };

    this.rateLocks.set(lockId, rateLock);
    this.emit('rateLockCreated', rateLock);

    return rateLock;
  }

  async useRateLock(lockId: string): Promise<boolean> {
    const rateLock = this.rateLocks.get(lockId);
    if (!rateLock || rateLock.status !== 'active') {
      return false;
    }

    if (new Date() > rateLock.expiresAt) {
      rateLock.status = 'expired';
      return false;
    }

    rateLock.status = 'used';
    rateLock.usedAt = new Date();
    this.emit('rateLockUsed', rateLock);

    return true;
  }

  private async getCurrentRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // 模拟汇率API调用
    return Math.random() * 100 + 1;
  }

  private checkExpiredRateLocks() {
    const now = new Date();
    for (const [id, lock] of this.rateLocks.entries()) {
      if (lock.status === 'active' && now > lock.expiresAt) {
        lock.status = 'expired';
        this.emit('rateLockExpired', lock);
      }
    }
  }

  // 信用管理服务
  getCreditProfile(userId: string): CreditProfile | undefined {
    return this.creditProfiles.get(userId);
  }

  async updateCreditScore(userId: string, newPayment: PaymentRecord): Promise<void> {
    const profile = this.creditProfiles.get(userId);
    if (!profile) return;

    profile.paymentHistory.push(newPayment);
    
    // 重新计算信用评分
    const onTimePayments = profile.paymentHistory.filter(p => p.daysLate === 0).length;
    const totalPayments = profile.paymentHistory.length;
    const onTimeRate = onTimePayments / totalPayments;

    // 简化的信用评分算法
    let newScore = 300 + (onTimeRate * 700); // 基础分300-1000
    
    // 调整基于最近支付表现
    const recentPayments = profile.paymentHistory.slice(-10);
    const recentOnTime = recentPayments.filter(p => p.daysLate === 0).length;
    const recentOnTimeRate = recentOnTime / recentPayments.length;
    
    newScore = newScore * 0.7 + (recentOnTimeRate * 300);
    
    profile.creditScore = Math.min(1000, Math.max(300, Math.round(newScore)));
    
    // 更新风险等级
    if (profile.creditScore >= 800) profile.riskLevel = 'low';
    else if (profile.creditScore >= 650) profile.riskLevel = 'medium';
    else if (profile.creditScore >= 500) profile.riskLevel = 'high';
    else profile.riskLevel = 'critical';

    profile.lastUpdated = new Date();
    this.emit('creditScoreUpdated', profile);
  }

  private updateCreditScores() {
    // 定期更新所有用户的信用评分
    for (const [userId, profile] of this.creditProfiles.entries()) {
      // 检查逾期付款
      const now = new Date();
      profile.paymentHistory.forEach(payment => {
        if (payment.status === 'pending' && now > payment.dueDate) {
          payment.status = 'overdue';
          payment.daysLate = Math.floor((now.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      });
    }
  }

  // 保险服务
  async createInsurancePolicy(
    userId: string,
    policyType: InsurancePolicy['policyType'],
    coverage: string,
    duration: number
  ): Promise<InsurancePolicy> {
    const policyId = `ins_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 计算保费（基于保障类型和金额）
    const coverageAmount = parseFloat(coverage);
    let premiumRate = 0.01; // 基础费率1%
    
    switch (policyType) {
      case 'transaction':
        premiumRate = 0.005; // 0.5%
        break;
      case 'rate_volatility':
        premiumRate = 0.015; // 1.5%
        break;
      case 'counterparty':
        premiumRate = 0.01; // 1%
        break;
      case 'comprehensive':
        premiumRate = 0.025; // 2.5%
        break;
    }

    const premium = (coverageAmount * premiumRate).toFixed(2);
    const deductible = (coverageAmount * 0.05).toFixed(2); // 5%免赔额

    const policy: InsurancePolicy = {
      id: policyId,
      userId,
      policyType,
      coverage,
      premium,
      deductible,
      duration,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
    };

    this.insurancePolicies.set(policyId, policy);
    this.emit('insurancePolicyCreated', policy);

    return policy;
  }

  // 忠诚度计划
  getLoyaltyProgram(userId: string): LoyaltyProgram | undefined {
    return this.loyaltyPrograms.get(userId);
  }

  addLoyaltyPoints(userId: string, points: number, reason: string): void {
    let program = this.loyaltyPrograms.get(userId);
    
    if (!program) {
      program = {
        userId,
        tier: 'bronze',
        points: 0,
        totalEarned: 0,
        benefits: ['基础客服支持'],
        nextTierRequirement: 1000,
        discountRate: 0
      };
      this.loyaltyPrograms.set(userId, program);
    }

    program.points += points;
    program.totalEarned += points;

    // 检查是否可以升级等级
    this.checkTierUpgrade(program);

    this.emit('loyaltyPointsAdded', { userId, points, reason, newTotal: program.points });
  }

  private checkTierUpgrade(program: LoyaltyProgram): void {
    const tiers = [
      { name: 'bronze' as const, requirement: 0, discount: 0, benefits: ['基础客服支持'] },
      { name: 'silver' as const, requirement: 1000, discount: 0.1, benefits: ['基础客服支持', '交易报告'] },
      { name: 'gold' as const, requirement: 5000, discount: 0.25, benefits: ['基础客服支持', '交易报告', '优先处理'] },
      { name: 'platinum' as const, requirement: 25000, discount: 0.5, benefits: ['专属客服', '交易报告', '优先处理', '高级分析'] },
      { name: 'diamond' as const, requirement: 100000, discount: 0.75, benefits: ['专属客服', '交易报告', '优先处理', '高级分析', '定制服务'] }
    ];

    const currentTierIndex = tiers.findIndex(t => t.name === program.tier);
    const newTier = tiers.reverse().find(t => program.totalEarned >= t.requirement);

    if (newTier && newTier.name !== program.tier) {
      const oldTier = program.tier;
      program.tier = newTier.name;
      program.discountRate = newTier.discount;
      program.benefits = newTier.benefits;
      
      // 设置下一等级要求
      const nextTierIndex = tiers.findIndex(t => t.name === newTier.name) - 1;
      if (nextTierIndex >= 0) {
        program.nextTierRequirement = tiers[nextTierIndex].requirement;
      }

      this.emit('tierUpgraded', { userId: program.userId, oldTier, newTier: program.tier });
    }
  }

  // 推荐计划
  createReferralCode(userId: string): string {
    const code = `REF_${userId.slice(-4)}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    return code;
  }

  async processReferral(referralCode: string, newUserId: string): Promise<ReferralProgram | null> {
    // 从推荐码解析推荐人ID（简化版）
    const referrerId = `user_${referralCode.split('_')[1]}`;
    
    const referral: ReferralProgram = {
      referrerId,
      refereeId: newUserId,
      referralCode,
      status: 'pending',
      rewardAmount: '50', // 50 USDT奖励
      createdAt: new Date()
    };

    let referrals = this.referralPrograms.get(referrerId) || [];
    referrals.push(referral);
    this.referralPrograms.set(referrerId, referrals);

    this.emit('referralCreated', referral);
    return referral;
  }

  // 高级订单
  async createAdvancedOrder(
    userId: string,
    orderType: AdvancedOrder['orderType'],
    fromCurrency: string,
    toCurrency: string,
    amount: string,
    triggerPrice: number,
    limitPrice?: number,
    trailingAmount?: number
  ): Promise<AdvancedOrder> {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const order: AdvancedOrder = {
      id: orderId,
      userId,
      orderType,
      fromCurrency,
      toCurrency,
      amount,
      triggerPrice,
      limitPrice,
      trailingAmount,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天过期
    };

    this.advancedOrders.set(orderId, order);
    this.emit('advancedOrderCreated', order);

    return order;
  }

  // 获取用户的所有增值服务摘要
  getUserServicesSummary(userId: string): {
    rateLocks: RateLock[];
    creditProfile: CreditProfile | undefined;
    insurancePolicies: InsurancePolicy[];
    loyaltyProgram: LoyaltyProgram | undefined;
    referrals: ReferralProgram[];
    advancedOrders: AdvancedOrder[];
  } {
    const rateLocks = Array.from(this.rateLocks.values()).filter(lock => lock.userId === userId);
    const creditProfile = this.creditProfiles.get(userId);
    const insurancePolicies = Array.from(this.insurancePolicies.values()).filter(policy => policy.userId === userId);
    const loyaltyProgram = this.loyaltyPrograms.get(userId);
    const referrals = this.referralPrograms.get(userId) || [];
    const advancedOrders = Array.from(this.advancedOrders.values()).filter(order => order.userId === userId);

    return {
      rateLocks,
      creditProfile,
      insurancePolicies,
      loyaltyProgram,
      referrals,
      advancedOrders
    };
  }

  // 计算用户折扣率
  calculateUserDiscount(userId: string): number {
    const loyaltyProgram = this.loyaltyPrograms.get(userId);
    const creditProfile = this.creditProfiles.get(userId);
    
    let discount = 0;
    
    // 忠诚度折扣
    if (loyaltyProgram) {
      discount += loyaltyProgram.discountRate;
    }
    
    // 信用评分折扣
    if (creditProfile && creditProfile.creditScore >= 800) {
      discount += 0.1; // 额外10%折扣
    }
    
    return Math.min(discount, 0.9); // 最大90%折扣
  }
}

export default ValueAddedService;