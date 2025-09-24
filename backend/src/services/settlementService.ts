import { EventEmitter } from 'events';

// 清算状态枚举
export enum SettlementStatus {
  PENDING = 'pending',           // 待清算
  PROCESSING = 'processing',     // 清算中
  COMPLETED = 'completed',       // 已完成
  FAILED = 'failed',            // 失败
  CANCELLED = 'cancelled',       // 已取消
  PARTIALLY_SETTLED = 'partially_settled' // 部分清算
}

// 清算类型
export enum SettlementType {
  USDT_TO_CNY = 'usdt_to_cny',    // USDT转人民币
  USDT_TO_RUB = 'usdt_to_rub',    // USDT转卢布
  CNY_TO_USDT = 'cny_to_usdt',    // 人民币转USDT
  RUB_TO_USDT = 'rub_to_usdt',    // 卢布转USDT
  CROSS_BORDER = 'cross_border',   // 跨境清算
  DOMESTIC = 'domestic'            // 境内清算
}

// 清算网络
export enum SettlementNetwork {
  SWIFT = 'swift',               // SWIFT网络
  CIPS = 'cips',                 // 人民币跨境支付系统
  SPFS = 'spfs',                 // 俄罗斯金融信息传输系统
  CBDC = 'cbdc',                 // 央行数字货币
  CRYPTO = 'crypto',             // 加密货币网络
  CORRESPONDENT = 'correspondent' // 代理行网络
}

// 境外节点
export interface OffshoreNode {
  id: string;
  name: string;
  country: string;
  jurisdiction: string;          // 司法管辖区
  supportedCurrencies: string[];
  supportedNetworks: SettlementNetwork[];
  dailyLimit: number;
  monthlyLimit: number;
  fees: {
    fixed: number;
    percentage: number;
    currency: string;
  };
  processingTime: {
    min: number;               // 最短处理时间(分钟)
    max: number;               // 最长处理时间(分钟)
    average: number;           // 平均处理时间(分钟)
  };
  isActive: boolean;
  complianceLevel: 'basic' | 'enhanced' | 'premium';
  lastHealthCheck: Date;
}

// 清算订单
export interface SettlementOrder {
  id: string;
  userId: string;
  escrowOrderId?: number;        // 关联的托管订单
  type: SettlementType;
  network: SettlementNetwork;
  
  // 金额信息
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  
  // 清算路径
  settlementPath: SettlementPath[];
  selectedNode: OffshoreNode;
  
  // 费用信息
  fees: {
    networkFee: number;
    nodeFee: number;
    platformFee: number;
    totalFee: number;
    currency: string;
  };
  
  // 状态信息
  status: SettlementStatus;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  
  // 追踪信息
  transactionHash?: string;
  externalReference?: string;
  confirmations: number;
  
  // 合规信息
  compliance: {
    kycVerified: boolean;
    sanctionChecked: boolean;
    reportingRequired: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

// 清算路径
export interface SettlementPath {
  step: number;
  fromCurrency: string;
  toCurrency: string;
  network: SettlementNetwork;
  node: OffshoreNode;
  estimatedTime: number;
  estimatedCost: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// B2B清算请求
export interface B2BSettlementRequest {
  buyerCompany: {
    name: string;
    country: string;
    inn?: string;               // 税号
    swiftCode?: string;
    bankAccount: string;
  };
  sellerCompany: {
    name: string;
    country: string;
    inn?: string;
    swiftCode?: string;
    bankAccount: string;
  };
  tradingDetails: {
    contractNumber: string;
    goodsDescription: string;
    totalValue: number;
    currency: string;
    terms: 'FOB' | 'CIF' | 'EXW' | 'DDP';
  };
  settlementPreference: {
    preferredNetwork: SettlementNetwork;
    maxProcessingTime: number;
    maxFeePercentage: number;
  };
}

/**
 * 清算服务
 * 处理境外节点清算、USDT转换和B2B闭环支付
 */
export class SettlementService extends EventEmitter {
  private orders: Map<string, SettlementOrder> = new Map();
  private offshoreNodes: Map<string, OffshoreNode> = new Map();
  private exchangeRates: Map<string, number> = new Map();
  
  constructor() {
    super();
    this.initializeOffshoreNodes();
    this.initializeExchangeRates();
    this.startRateUpdates();
    this.startHealthChecks();
  }

  /**
   * 初始化境外节点
   */
  private initializeOffshoreNodes(): void {
    const nodes: OffshoreNode[] = [
      {
        id: 'singapore_node_01',
        name: 'Singapore Financial Hub',
        country: 'Singapore',
        jurisdiction: 'MAS Regulated',
        supportedCurrencies: ['USD', 'CNY', 'RUB', 'USDT'],
        supportedNetworks: [SettlementNetwork.SWIFT, SettlementNetwork.CIPS, SettlementNetwork.CRYPTO],
        dailyLimit: 10000000,      // $10M
        monthlyLimit: 200000000,   // $200M
        fees: {
          fixed: 50,
          percentage: 0.15,
          currency: 'USD'
        },
        processingTime: {
          min: 30,
          max: 240,
          average: 90
        },
        isActive: true,
        complianceLevel: 'premium',
        lastHealthCheck: new Date()
      },
      {
        id: 'dubai_node_01',
        name: 'DIFC Settlement Node',
        country: 'UAE',
        jurisdiction: 'DFSA Regulated',
        supportedCurrencies: ['USD', 'AED', 'RUB', 'USDT'],
        supportedNetworks: [SettlementNetwork.SWIFT, SettlementNetwork.SPFS, SettlementNetwork.CRYPTO],
        dailyLimit: 5000000,
        monthlyLimit: 100000000,
        fees: {
          fixed: 75,
          percentage: 0.25,
          currency: 'USD'
        },
        processingTime: {
          min: 60,
          max: 360,
          average: 150
        },
        isActive: true,
        complianceLevel: 'enhanced',
        lastHealthCheck: new Date()
      },
      {
        id: 'hongkong_node_01',
        name: 'Hong Kong Bridge Node',
        country: 'Hong Kong',
        jurisdiction: 'HKMA Regulated',
        supportedCurrencies: ['USD', 'CNY', 'HKD', 'USDT'],
        supportedNetworks: [SettlementNetwork.SWIFT, SettlementNetwork.CIPS, SettlementNetwork.CRYPTO],
        dailyLimit: 15000000,
        monthlyLimit: 300000000,
        fees: {
          fixed: 25,
          percentage: 0.08,
          currency: 'USD'
        },
        processingTime: {
          min: 15,
          max: 120,
          average: 45
        },
        isActive: true,
        complianceLevel: 'premium',
        lastHealthCheck: new Date()
      }
    ];

    nodes.forEach(node => {
      this.offshoreNodes.set(node.id, node);
    });
  }

  /**
   * 初始化汇率
   */
  private initializeExchangeRates(): void {
    // 模拟实时汇率
    this.exchangeRates.set('USD_CNY', 7.25);
    this.exchangeRates.set('USD_RUB', 96.8);
    this.exchangeRates.set('USDT_CNY', 7.26);
    this.exchangeRates.set('USDT_RUB', 96.5);
    this.exchangeRates.set('CNY_RUB', 13.35);
  }

  /**
   * 创建清算订单
   */
  async createSettlementOrder(
    userId: string,
    request: {
      type: SettlementType;
      sourceAmount: number;
      sourceCurrency: string;
      targetCurrency: string;
      preferredNetwork?: SettlementNetwork;
      escrowOrderId?: number;
    }
  ): Promise<SettlementOrder> {
    
    // 获取最优清算路径
    const settlementPaths = await this.calculateSettlementPaths(
      request.sourceCurrency,
      request.targetCurrency,
      request.sourceAmount,
      request.preferredNetwork
    );

    if (settlementPaths.length === 0) {
      throw new Error('无可用的清算路径');
    }

    const optimalPath = settlementPaths[0]; // 选择最优路径
    const selectedNode = optimalPath.node;

    // 计算目标金额和费用
    const exchangeRate = this.getExchangeRate(request.sourceCurrency, request.targetCurrency);
    const targetAmount = request.sourceAmount * exchangeRate;
    
    const fees = this.calculateFees(request.sourceAmount, selectedNode);

    const order: SettlementOrder = {
      id: `SETTLE-${Date.now()}`,
      userId,
      escrowOrderId: request.escrowOrderId,
      type: request.type,
      network: optimalPath.network,
      sourceAmount: request.sourceAmount,
      sourceCurrency: request.sourceCurrency,
      targetAmount: targetAmount - fees.totalFee,
      targetCurrency: request.targetCurrency,
      exchangeRate,
      settlementPath: settlementPaths,
      selectedNode,
      fees,
      status: SettlementStatus.PENDING,
      createdAt: new Date(),
      confirmations: 0,
      compliance: {
        kycVerified: true, // 假设已通过KYC
        sanctionChecked: true,
        reportingRequired: request.sourceAmount > 10000,
        riskLevel: 'low'
      }
    };

    this.orders.set(order.id, order);
    this.emit('settlementOrderCreated', order);
    
    return order;
  }

  /**
   * 执行清算
   */
  async executeSettlement(orderId: string): Promise<SettlementOrder> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('清算订单不存在');
    }

    if (order.status !== SettlementStatus.PENDING) {
      throw new Error('订单状态不允许执行清算');
    }

    try {
      order.status = SettlementStatus.PROCESSING;
      order.processedAt = new Date();
      this.orders.set(orderId, order);
      
      this.emit('settlementProcessing', order);

      // 根据网络类型执行不同的清算流程
      let result;
      switch (order.network) {
        case SettlementNetwork.CRYPTO:
          result = await this.executeCryptoSettlement(order);
          break;
        case SettlementNetwork.SWIFT:
          result = await this.executeSwiftSettlement(order);
          break;
        case SettlementNetwork.CIPS:
          result = await this.executeCipsSettlement(order);
          break;
        case SettlementNetwork.SPFS:
          result = await this.executeSpfsSettlement(order);
          break;
        default:
          throw new Error(`不支持的网络类型: ${order.network}`);
      }

      order.transactionHash = result.transactionHash;
      order.externalReference = result.externalReference;
      order.status = SettlementStatus.COMPLETED;
      order.completedAt = new Date();
      order.confirmations = result.confirmations || 1;

      this.orders.set(orderId, order);
      this.emit('settlementCompleted', order);

      return order;

    } catch (error) {
      order.status = SettlementStatus.FAILED;
      order.failureReason = error instanceof Error ? error.message : 'Unknown error';
      this.orders.set(orderId, order);
      
      this.emit('settlementFailed', order);
      throw error;
    }
  }

  /**
   * 执行加密货币清算
   */
  private async executeCryptoSettlement(order: SettlementOrder): Promise<{
    transactionHash: string;
    externalReference: string;
    confirmations: number;
  }> {
    // 模拟区块链交易
    await this.delay(2000); // 模拟网络延迟

    return {
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      externalReference: `CRYPTO-${Date.now()}`,
      confirmations: 12
    };
  }

  /**
   * 执行SWIFT清算
   */
  private async executeSwiftSettlement(order: SettlementOrder): Promise<{
    transactionHash: string;
    externalReference: string;
    confirmations: number;
  }> {
    // 模拟SWIFT处理
    await this.delay(5000);

    return {
      transactionHash: `SWIFT-${Date.now()}`,
      externalReference: `MT103-${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
      confirmations: 1
    };
  }

  /**
   * 执行CIPS清算
   */
  private async executeCipsSettlement(order: SettlementOrder): Promise<{
    transactionHash: string;
    externalReference: string;
    confirmations: number;
  }> {
    await this.delay(3000);

    return {
      transactionHash: `CIPS-${Date.now()}`,
      externalReference: `CIPS${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      confirmations: 1
    };
  }

  /**
   * 执行SPFS清算
   */
  private async executeSpfsSettlement(order: SettlementOrder): Promise<{
    transactionHash: string;
    externalReference: string;
    confirmations: number;
  }> {
    await this.delay(4000);

    return {
      transactionHash: `SPFS-${Date.now()}`,
      externalReference: `SPFS${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      confirmations: 1
    };
  }

  /**
   * 计算清算路径
   */
  private async calculateSettlementPaths(
    sourceCurrency: string,
    targetCurrency: string,
    amount: number,
    preferredNetwork?: SettlementNetwork
  ): Promise<SettlementPath[]> {
    const paths: SettlementPath[] = [];
    
    // 获取支持该货币对的节点
    const availableNodes = Array.from(this.offshoreNodes.values()).filter(node => 
      node.isActive &&
      node.supportedCurrencies.includes(sourceCurrency) &&
      node.supportedCurrencies.includes(targetCurrency) &&
      amount <= node.dailyLimit
    );

    for (const node of availableNodes) {
      for (const network of node.supportedNetworks) {
        // 如果指定了首选网络，优先使用
        if (preferredNetwork && network !== preferredNetwork) continue;

        const path: SettlementPath = {
          step: 1,
          fromCurrency: sourceCurrency,
          toCurrency: targetCurrency,
          network,
          node,
          estimatedTime: node.processingTime.average,
          estimatedCost: node.fees.fixed + (amount * node.fees.percentage / 100),
          riskLevel: this.assessPathRisk(node, network, amount)
        };

        paths.push(path);
      }
    }

    // 按成本和时间排序
    return paths.sort((a, b) => {
      const scoreA = a.estimatedCost + (a.estimatedTime * 0.1);
      const scoreB = b.estimatedCost + (b.estimatedTime * 0.1);
      return scoreA - scoreB;
    });
  }

  /**
   * 评估路径风险
   */
  private assessPathRisk(node: OffshoreNode, network: SettlementNetwork, amount: number): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // 节点合规等级
    if (node.complianceLevel === 'basic') riskScore += 3;
    else if (node.complianceLevel === 'enhanced') riskScore += 1;

    // 网络风险
    if (network === SettlementNetwork.CRYPTO) riskScore += 2;
    else if (network === SettlementNetwork.CORRESPONDENT) riskScore += 1;

    // 金额风险
    if (amount > 1000000) riskScore += 2;
    else if (amount > 100000) riskScore += 1;

    if (riskScore >= 5) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * 计算费用
   */
  private calculateFees(amount: number, node: OffshoreNode): {
    networkFee: number;
    nodeFee: number;
    platformFee: number;
    totalFee: number;
    currency: string;
  } {
    const nodeFee = node.fees.fixed + (amount * node.fees.percentage / 100);
    const networkFee = Math.max(5, amount * 0.01 / 100); // 最低$5网络费
    const platformFee = amount * 0.05 / 100; // 0.05%平台费
    
    return {
      networkFee,
      nodeFee,
      platformFee,
      totalFee: networkFee + nodeFee + platformFee,
      currency: node.fees.currency
    };
  }

  /**
   * 获取汇率
   */
  private getExchangeRate(from: string, to: string): number {
    const pair = `${from}_${to}`;
    const rate = this.exchangeRates.get(pair);
    
    if (rate) return rate;
    
    // 尝试反向汇率
    const reversePair = `${to}_${from}`;
    const reverseRate = this.exchangeRates.get(reversePair);
    if (reverseRate) return 1 / reverseRate;
    
    throw new Error(`汇率不可用: ${from} -> ${to}`);
  }

  /**
   * B2B清算请求
   */
  async processB2BSettlement(request: B2BSettlementRequest): Promise<SettlementOrder> {
    // 验证企业信息
    await this.validateCompanyInfo(request.buyerCompany);
    await this.validateCompanyInfo(request.sellerCompany);

    // 创建清算订单
    const settlementRequest = {
      type: SettlementType.CROSS_BORDER,
      sourceAmount: request.tradingDetails.totalValue,
      sourceCurrency: request.tradingDetails.currency,
      targetCurrency: request.sellerCompany.country === 'China' ? 'CNY' : 'USD',
      preferredNetwork: request.settlementPreference.preferredNetwork
    };

    // 这里应该关联一个系统用户ID，实际应用中需要处理
    const systemUserId = 'b2b_system';
    
    return this.createSettlementOrder(systemUserId, settlementRequest);
  }

  /**
   * 验证企业信息
   */
  private async validateCompanyInfo(company: any): Promise<void> {
    // 基础验证
    if (!company.name || !company.country || !company.bankAccount) {
      throw new Error('企业信息不完整');
    }

    // 这里应该集成企业信息验证服务
    // 如工商查询API、银行账户验证等
  }

  /**
   * 启动汇率更新
   */
  private startRateUpdates(): void {
    setInterval(() => {
      this.updateExchangeRates();
    }, 60000); // 每分钟更新
  }

  /**
   * 更新汇率
   */
  private async updateExchangeRates(): Promise<void> {
    try {
      // 模拟汇率波动
      for (const [pair, rate] of this.exchangeRates.entries()) {
        const fluctuation = (Math.random() - 0.5) * 0.02; // ±1%波动
        const newRate = rate * (1 + fluctuation);
        this.exchangeRates.set(pair, newRate);
      }
      
      this.emit('exchangeRatesUpdated', Object.fromEntries(this.exchangeRates));
    } catch (error) {
      console.error('更新汇率失败:', error);
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 300000); // 每5分钟检查
  }

  /**
   * 执行健康检查
   */
  private async performHealthChecks(): Promise<void> {
    for (const [nodeId, node] of this.offshoreNodes.entries()) {
      try {
        // 模拟健康检查
        const isHealthy = Math.random() > 0.1; // 90%健康率
        
        node.isActive = isHealthy;
        node.lastHealthCheck = new Date();
        
        this.offshoreNodes.set(nodeId, node);
        
        if (!isHealthy) {
          this.emit('nodeUnhealthy', { nodeId, node });
        }
      } catch (error) {
        console.error(`节点健康检查失败 ${nodeId}:`, error);
      }
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取清算订单
   */
  getSettlementOrder(orderId: string): SettlementOrder | null {
    return this.orders.get(orderId) || null;
  }

  /**
   * 获取用户清算订单
   */
  getUserSettlementOrders(userId: string): SettlementOrder[] {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  /**
   * 获取境外节点列表
   */
  getOffshoreNodes(): OffshoreNode[] {
    return Array.from(this.offshoreNodes.values()).filter(node => node.isActive);
  }

  /**
   * 获取当前汇率
   */
  getCurrentRates(): { [pair: string]: number } {
    return Object.fromEntries(this.exchangeRates);
  }

  /**
   * 取消清算订单
   */
  async cancelSettlement(orderId: string, userId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('清算订单不存在');
    }

    if (order.userId !== userId) {
      throw new Error('无权限操作');
    }

    if (order.status === SettlementStatus.PROCESSING) {
      throw new Error('正在处理中的订单无法取消');
    }

    if (order.status === SettlementStatus.COMPLETED) {
      throw new Error('已完成的订单无法取消');
    }

    order.status = SettlementStatus.CANCELLED;
    this.orders.set(orderId, order);
    
    this.emit('settlementCancelled', order);
  }
}

export const settlementService = new SettlementService();
export default settlementService;