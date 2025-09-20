import { EventEmitter } from 'events';
import axios from 'axios';

// 支付系统类型
export type PaymentSystem = 'CIPS' | 'NPS' | 'SWIFT' | 'SPFS';

// 支付请求接口
export interface PaymentRequest {
  id: string;
  system: PaymentSystem;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  purpose: string;
  urgency: 'normal' | 'urgent' | 'express';
  beneficiaryInfo: BeneficiaryInfo;
  additionalInfo?: { [key: string]: any };
  complianceData?: ComplianceData;
}

// 受益人信息
export interface BeneficiaryInfo {
  name: string;
  address: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  swiftCode?: string;
  routingNumber?: string;
  country: string;
}

// 合规数据
export interface ComplianceData {
  sourceOfFunds: string;
  purposeCode: string;
  regulatoryReporting: boolean;
  sanctions_check: boolean;
  aml_status: 'pending' | 'approved' | 'rejected';
  documentation: string[];
}

// 支付响应
export interface PaymentResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  referenceNumber: string;
  processingTime: number;
  fee: number;
  exchangeRate?: number;
  estimatedArrival: Date;
  actualArrival?: Date;
  errorCode?: string;
  errorMessage?: string;
}

// 支付状态更新
export interface PaymentStatusUpdate {
  paymentId: string;
  status: PaymentResponse['status'];
  timestamp: Date;
  details?: string;
  nextAction?: string;
}

// CIPS特定配置
interface CIPSConfig {
  participantCode: string;
  apiEndpoint: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
  messageFormat: 'MT103' | 'MT202' | 'pacs.008';
}

// NPS特定配置
interface NPSConfig {
  bankIdentifier: string;
  apiEndpoint: string;
  apiKey: string;
  environment: 'test' | 'production';
  paymentTypes: string[];
}

// 汇率信息
export interface ExchangeRateInfo {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
  source: string;
  spread: number;
}

class CrossBorderPaymentService extends EventEmitter {
  private payments: Map<string, PaymentRequest> = new Map();
  private responses: Map<string, PaymentResponse> = new Map();
  private statusUpdates: Map<string, PaymentStatusUpdate[]> = new Map();
  
  private cipsConfig: CIPSConfig;
  private npsConfig: NPSConfig;

  constructor() {
    super();
    
    // 初始化配置
    this.cipsConfig = {
      participantCode: process.env.CIPS_PARTICIPANT_CODE || 'TEST001',
      apiEndpoint: process.env.CIPS_API_ENDPOINT || 'https://api-sandbox.cips.com.cn',
      apiKey: process.env.CIPS_API_KEY || 'test_key',
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
      messageFormat: 'pacs.008'
    };

    this.npsConfig = {
      bankIdentifier: process.env.NPS_BANK_ID || 'TEST_BANK',
      apiEndpoint: process.env.NPS_API_ENDPOINT || 'https://api-test.nps.ru',
      apiKey: process.env.NPS_API_KEY || 'test_key',
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'test') as 'test' | 'production',
      paymentTypes: ['regular', 'urgent', 'express']
    };

    this.initializeMockData();
    this.startStatusPolling();
  }

  // 初始化模拟数据
  private initializeMockData(): void {
    // 创建一些模拟支付记录
    const mockPayments: PaymentRequest[] = [
      {
        id: 'PAY_CIPS_001',
        system: 'CIPS',
        fromAccount: 'CN1234567890123456789',
        toAccount: 'RU9876543210987654321',
        amount: 100000,
        currency: 'CNY',
        purpose: 'Trade Settlement',
        urgency: 'normal',
        beneficiaryInfo: {
          name: 'Russian Trading Company LLC',
          address: 'Moscow, Russia',
          bankName: 'Sberbank',
          bankCode: 'SABRRUMM',
          accountNumber: 'RU9876543210987654321',
          swiftCode: 'SABRRUMM',
          country: 'RU'
        },
        complianceData: {
          sourceOfFunds: 'business_revenue',
          purposeCode: 'GSCO', // Goods/Services
          regulatoryReporting: true,
          sanctions_check: true,
          aml_status: 'approved',
          documentation: ['invoice_001.pdf', 'contract_001.pdf']
        }
      },
      {
        id: 'PAY_NPS_001',
        system: 'NPS',
        fromAccount: 'RU1111222233334444555',
        toAccount: 'CN5555444433332222111',
        amount: 2500000,
        currency: 'RUB',
        purpose: 'Import Payment',
        urgency: 'urgent',
        beneficiaryInfo: {
          name: 'China Manufacturing Co Ltd',
          address: 'Shanghai, China',
          bankName: 'Bank of China',
          bankCode: 'BKCHCNBJ',
          accountNumber: 'CN5555444433332222111',
          swiftCode: 'BKCHCNBJ',
          country: 'CN'
        },
        complianceData: {
          sourceOfFunds: 'corporate_account',
          purposeCode: 'TRAD',
          regulatoryReporting: true,
          sanctions_check: true,
          aml_status: 'approved',
          documentation: ['purchase_order_001.pdf']
        }
      }
    ];

    mockPayments.forEach(payment => {
      this.payments.set(payment.id, payment);
      
      // 创建对应的响应
      const response: PaymentResponse = {
        id: payment.id,
        status: 'processing',
        referenceNumber: `REF${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        processingTime: this.calculateProcessingTime(payment.system, payment.urgency),
        fee: this.calculateFee(payment.amount, payment.system),
        exchangeRate: payment.currency === 'CNY' ? 13.85 : 0.072,
        estimatedArrival: new Date(Date.now() + this.calculateProcessingTime(payment.system, payment.urgency) * 1000)
      };
      
      this.responses.set(payment.id, response);
      this.statusUpdates.set(payment.id, []);
    });
  }

  // 创建跨境支付
  async createPayment(paymentData: Omit<PaymentRequest, 'id'>): Promise<PaymentResponse> {
    const paymentId = `PAY_${paymentData.system}_${Date.now()}`;
    
    const payment: PaymentRequest = {
      ...paymentData,
      id: paymentId
    };

    // 验证支付数据
    this.validatePaymentRequest(payment);

    // 选择合适的支付系统
    const response = await this.processPayment(payment);
    
    this.payments.set(paymentId, payment);
    this.responses.set(paymentId, response);
    this.statusUpdates.set(paymentId, []);

    // 发送初始状态更新
    this.addStatusUpdate(paymentId, 'pending', '支付请求已提交');

    this.emit('paymentCreated', { payment, response });
    return response;
  }

  // 验证支付请求
  private validatePaymentRequest(payment: PaymentRequest): void {
    if (!payment.fromAccount || !payment.toAccount) {
      throw new Error('账户信息不完整');
    }

    if (payment.amount <= 0) {
      throw new Error('支付金额必须大于0');
    }

    if (!payment.beneficiaryInfo.name || !payment.beneficiaryInfo.bankCode) {
      throw new Error('受益人信息不完整');
    }

    // 检查制裁名单（简化版）
    if (payment.complianceData?.sanctions_check && this.isOnSanctionsList(payment.beneficiaryInfo.name)) {
      throw new Error('受益人在制裁名单中');
    }

    // 验证金额限制
    const systemLimits = this.getSystemLimits(payment.system);
    if (payment.amount > systemLimits.maxAmount) {
      throw new Error(`超过${payment.system}系统最大限额`);
    }
  }

  // 处理支付
  private async processPayment(payment: PaymentRequest): Promise<PaymentResponse> {
    const processingTime = this.calculateProcessingTime(payment.system, payment.urgency);
    const fee = this.calculateFee(payment.amount, payment.system);
    
    let exchangeRate: number | undefined;
    if (payment.currency !== this.getBaseCurrency(payment.system)) {
      exchangeRate = await this.getExchangeRate(payment.currency, this.getBaseCurrency(payment.system));
    }

    const response: PaymentResponse = {
      id: payment.id,
      status: 'pending',
      referenceNumber: this.generateReferenceNumber(payment.system),
      processingTime,
      fee,
      exchangeRate,
      estimatedArrival: new Date(Date.now() + processingTime * 1000)
    };

    // 根据支付系统调用相应的API
    try {
      switch (payment.system) {
        case 'CIPS':
          await this.processCIPSPayment(payment, response);
          break;
        case 'NPS':
          await this.processNPSPayment(payment, response);
          break;
        case 'SWIFT':
          await this.processSWIFTPayment(payment, response);
          break;
        case 'SPFS':
          await this.processSPFSPayment(payment, response);
          break;
        default:
          throw new Error(`不支持的支付系统: ${payment.system}`);
      }
    } catch (error) {
      response.status = 'failed';
      response.errorMessage = error instanceof Error ? error.message : '支付处理失败';
    }

    return response;
  }

  // CIPS支付处理
  private async processCIPSPayment(payment: PaymentRequest, response: PaymentResponse): Promise<void> {
    try {
      // 构建CIPS消息
      const cipsMessage = this.buildCIPSMessage(payment);
      
      // 模拟API调用
      const apiResponse = await this.callCIPSAPI(cipsMessage);
      
      response.transactionId = apiResponse.transactionId;
      response.status = 'processing';
      
      this.addStatusUpdate(payment.id, 'processing', 'CIPS系统处理中');
    } catch (error) {
      throw new Error(`CIPS处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // NPS支付处理
  private async processNPSPayment(payment: PaymentRequest, response: PaymentResponse): Promise<void> {
    try {
      // 构建NPS消息
      const npsMessage = this.buildNPSMessage(payment);
      
      // 模拟API调用
      const apiResponse = await this.callNPSAPI(npsMessage);
      
      response.transactionId = apiResponse.transactionId;
      response.status = 'processing';
      
      this.addStatusUpdate(payment.id, 'processing', 'NPS系统处理中');
    } catch (error) {
      throw new Error(`NPS处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // SWIFT支付处理（作为备用）
  private async processSWIFTPayment(payment: PaymentRequest, response: PaymentResponse): Promise<void> {
    // SWIFT处理逻辑（简化）
    response.transactionId = `SWIFT_${Date.now()}`;
    response.status = 'processing';
    this.addStatusUpdate(payment.id, 'processing', 'SWIFT系统处理中');
  }

  // SPFS支付处理（俄罗斯金融信息传输系统）
  private async processSPFSPayment(payment: PaymentRequest, response: PaymentResponse): Promise<void> {
    // SPFS处理逻辑（简化）
    response.transactionId = `SPFS_${Date.now()}`;
    response.status = 'processing';
    this.addStatusUpdate(payment.id, 'processing', 'SPFS系统处理中');
  }

  // 构建CIPS消息
  private buildCIPSMessage(payment: PaymentRequest): any {
    return {
      messageId: `CIPS${Date.now()}`,
      messageType: this.cipsConfig.messageFormat,
      participantCode: this.cipsConfig.participantCode,
      paymentInfo: {
        amount: payment.amount,
        currency: payment.currency,
        debtorAccount: payment.fromAccount,
        creditorAccount: payment.toAccount,
        purposeCode: payment.complianceData?.purposeCode,
        remittanceInformation: payment.purpose
      },
      creditorAgent: {
        bicfi: payment.beneficiaryInfo.swiftCode,
        name: payment.beneficiaryInfo.bankName
      },
      creditor: {
        name: payment.beneficiaryInfo.name,
        postalAddress: payment.beneficiaryInfo.address
      }
    };
  }

  // 构建NPS消息
  private buildNPSMessage(payment: PaymentRequest): any {
    return {
      messageId: `NPS${Date.now()}`,
      bankId: this.npsConfig.bankIdentifier,
      paymentType: this.mapUrgencyToNPSType(payment.urgency),
      amount: payment.amount,
      currency: payment.currency,
      payerAccount: payment.fromAccount,
      payeeAccount: payment.toAccount,
      payeeInfo: {
        name: payment.beneficiaryInfo.name,
        bankName: payment.beneficiaryInfo.bankName,
        bankCode: payment.beneficiaryInfo.bankCode
      },
      purpose: payment.purpose,
      urgency: payment.urgency
    };
  }

  // 模拟CIPS API调用
  private async callCIPSAPI(message: any): Promise<{ transactionId: string; status: string }> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // 模拟API响应
    return {
      transactionId: `CIPS_TXN_${Date.now()}`,
      status: 'accepted'
    };
  }

  // 模拟NPS API调用
  private async callNPSAPI(message: any): Promise<{ transactionId: string; status: string }> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
    
    // 模拟API响应
    return {
      transactionId: `NPS_TXN_${Date.now()}`,
      status: 'processing'
    };
  }

  // 获取支付状态
  getPaymentStatus(paymentId: string): PaymentResponse | null {
    return this.responses.get(paymentId) || null;
  }

  // 获取支付历史
  getPaymentHistory(paymentId: string): PaymentStatusUpdate[] {
    return this.statusUpdates.get(paymentId) || [];
  }

  // 获取所有支付
  getAllPayments(): PaymentRequest[] {
    return Array.from(this.payments.values());
  }

  // 取消支付
  async cancelPayment(paymentId: string, reason: string): Promise<boolean> {
    const payment = this.payments.get(paymentId);
    const response = this.responses.get(paymentId);
    
    if (!payment || !response) {
      throw new Error('支付记录不存在');
    }

    if (response.status === 'completed') {
      throw new Error('已完成的支付无法取消');
    }

    response.status = 'cancelled';
    this.responses.set(paymentId, response);
    
    this.addStatusUpdate(paymentId, 'cancelled', `支付已取消: ${reason}`);
    this.emit('paymentCancelled', { paymentId, reason });
    
    return true;
  }

  // 获取实时汇率
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // 模拟汇率获取
    const rates: { [key: string]: number } = {
      'CNY_RUB': 13.85,
      'RUB_CNY': 0.072,
      'CNY_USD': 0.14,
      'USD_CNY': 7.32,
      'RUB_USD': 0.011,
      'USD_RUB': 96.8
    };

    const pair = `${fromCurrency}_${toCurrency}`;
    return rates[pair] || 1.0;
  }

  // 获取系统限制
  private getSystemLimits(system: PaymentSystem): { maxAmount: number; minAmount: number } {
    const limits = {
      CIPS: { maxAmount: 50000000, minAmount: 1 }, // 5000万人民币
      NPS: { maxAmount: 100000000, minAmount: 1 }, // 1亿卢布
      SWIFT: { maxAmount: 10000000, minAmount: 1 }, // 1000万美元
      SPFS: { maxAmount: 50000000, minAmount: 1 }  // 5000万卢布
    };
    return limits[system];
  }

  // 计算处理时间（秒）
  private calculateProcessingTime(system: PaymentSystem, urgency: string): number {
    const baseTimes = {
      CIPS: { normal: 1800, urgent: 900, express: 300 }, // 30分钟、15分钟、5分钟
      NPS: { normal: 3600, urgent: 1800, express: 600 }, // 1小时、30分钟、10分钟
      SWIFT: { normal: 86400, urgent: 43200, express: 21600 }, // 1天、12小时、6小时
      SPFS: { normal: 2700, urgent: 1350, express: 450 } // 45分钟、22.5分钟、7.5分钟
    };
    
    return baseTimes[system][urgency as keyof typeof baseTimes[typeof system]] || 3600;
  }

  // 计算手续费
  private calculateFee(amount: number, system: PaymentSystem): number {
    const feeRates = {
      CIPS: 0.001, // 0.1%
      NPS: 0.0015, // 0.15%
      SWIFT: 0.003, // 0.3%
      SPFS: 0.0012 // 0.12%
    };
    
    const minFees = {
      CIPS: 50,    // 最低50元
      NPS: 100,    // 最低100卢布
      SWIFT: 25,   // 最低25美元
      SPFS: 80     // 最低80卢布
    };
    
    const calculatedFee = amount * feeRates[system];
    return Math.max(calculatedFee, minFees[system]);
  }

  // 生成参考号
  private generateReferenceNumber(system: PaymentSystem): string {
    const prefix = {
      CIPS: 'CIPS',
      NPS: 'NPSR',
      SWIFT: 'SWFT',
      SPFS: 'SPFS'
    };
    
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `${prefix[system]}${timestamp}${random}`;
  }

  // 获取系统基础货币
  private getBaseCurrency(system: PaymentSystem): string {
    const currencies = {
      CIPS: 'CNY',
      NPS: 'RUB',
      SWIFT: 'USD',
      SPFS: 'RUB'
    };
    return currencies[system];
  }

  // 映射紧急程度到NPS类型
  private mapUrgencyToNPSType(urgency: string): string {
    const mapping = {
      normal: 'regular',
      urgent: 'urgent',
      express: 'express'
    };
    return mapping[urgency as keyof typeof mapping] || 'regular';
  }

  // 检查制裁名单（简化版）
  private isOnSanctionsList(name: string): boolean {
    // 简化的制裁名单检查
    const sanctionsList = ['sanctioned entity', 'blocked person'];
    return sanctionsList.some(item => name.toLowerCase().includes(item));
  }

  // 添加状态更新
  private addStatusUpdate(paymentId: string, status: PaymentResponse['status'], details: string): void {
    const updates = this.statusUpdates.get(paymentId) || [];
    updates.push({
      paymentId,
      status,
      timestamp: new Date(),
      details
    });
    this.statusUpdates.set(paymentId, updates);
    
    // 更新支付响应状态
    const response = this.responses.get(paymentId);
    if (response) {
      response.status = status;
      this.responses.set(paymentId, response);
    }
    
    this.emit('statusUpdate', { paymentId, status, details });
  }

  // 开始状态轮询
  private startStatusPolling(): void {
    setInterval(() => {
      this.pollPaymentStatuses();
    }, 30000); // 每30秒检查一次
  }

  // 轮询支付状态
  private pollPaymentStatuses(): void {
    this.responses.forEach((response, paymentId) => {
      if (response.status === 'processing') {
        // 模拟状态变化
        const random = Math.random();
        if (random < 0.1) { // 10%概率完成
          this.addStatusUpdate(paymentId, 'completed', '支付已完成');
          response.actualArrival = new Date();
        } else if (random < 0.02) { // 2%概率失败
          this.addStatusUpdate(paymentId, 'failed', '支付处理失败');
          response.errorMessage = '系统处理超时';
        }
      }
    });
  }
}

export const crossBorderPaymentService = new CrossBorderPaymentService();
export default crossBorderPaymentService;