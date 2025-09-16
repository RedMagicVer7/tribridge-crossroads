import { exchangeRateService, ExchangeRate } from './exchangeRateService';

export interface Transaction {
  id: string;
  type: 'exchange' | 'transfer' | 'deposit' | 'withdraw';
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'processing';
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fee: number;
  feePercentage: number;
  timestamp: string;
  processingTime: number; // 毫秒
  blockchainTxId?: string;
  counterparty?: string;
  notes?: string;
  userId?: string;
  performanceMetrics?: {
    startTime: number;
    endTime: number;
    steps: TransactionStep[];
  };
}

export interface TransactionStep {
  name: string;
  startTime: number;
  endTime: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration: number;
}

export interface TransactionRequest {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  userId?: string;
}

export interface TransactionPreview {
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fee: number;
  feePercentage: number;
  processingTime: string;
  priceImpact: number;
  estimatedGasFee?: number;
}

class TransactionService {
  private transactions: Transaction[] = [];
  private readonly FEE_PERCENTAGE = 0.002; // 0.2% 手续费
  private readonly MIN_FEE = 1; // 最低手续费
  private readonly MAX_FEE = 100; // 最高手续费

  constructor() {
    this.initializeMockTransactions();
  }

  // 初始化模拟交易数据
  private initializeMockTransactions(): void {
    const mockTransactions: Transaction[] = [
      {
        id: 'TX' + Date.now() + '001',
        type: 'exchange',
        status: 'completed',
        fromCurrency: 'USD',
        toCurrency: 'CNY',
        fromAmount: 1000,
        toAmount: 7320,
        exchangeRate: 7.32,
        fee: 2.0,
        feePercentage: 0.002,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        processingTime: 850,
        blockchainTxId: '0x8f3cf7ad51cb2cc8df4a...',
        counterparty: 'Bank of China',
        performanceMetrics: {
          startTime: Date.now() - 301000,
          endTime: Date.now() - 300150,
          steps: [
            { name: '验证交易', startTime: Date.now() - 301000, endTime: Date.now() - 300800, status: 'completed', duration: 200 },
            { name: '获取汇率', startTime: Date.now() - 300800, endTime: Date.now() - 300600, status: 'completed', duration: 200 },
            { name: '执行兑换', startTime: Date.now() - 300600, endTime: Date.now() - 300200, status: 'completed', duration: 400 },
            { name: '确认交易', startTime: Date.now() - 300200, endTime: Date.now() - 300150, status: 'completed', duration: 50 }
          ]
        }
      },
      {
        id: 'TX' + Date.now() + '002',
        type: 'exchange',
        status: 'pending',
        fromCurrency: 'RUB',
        toCurrency: 'USDT',
        fromAmount: 50000,
        toAmount: 516.53,
        exchangeRate: 0.0103,
        fee: 100.0,
        feePercentage: 0.002,
        timestamp: new Date(Date.now() - 180000).toISOString(),
        processingTime: 0,
        notes: 'Large amount transaction - under review'
      }
    ];

    this.transactions = mockTransactions;
  }

  // 生成交易预览
  async getTransactionPreview(request: TransactionRequest): Promise<TransactionPreview> {
    try {
      const exchangeRate = await exchangeRateService.getExchangeRate(
        request.fromCurrency,
        request.toCurrency
      );

      const fee = Math.max(
        this.MIN_FEE,
        Math.min(
          this.MAX_FEE,
          request.fromAmount * this.FEE_PERCENTAGE
        )
      );

      const effectiveAmount = request.fromAmount - fee;
      const toAmount = effectiveAmount * exchangeRate.rate;
      
      // 模拟价格影响（大额交易）
      const priceImpact = this.calculatePriceImpact(request.fromAmount, request.fromCurrency);
      
      // 估算处理时间
      const processingTime = this.estimateProcessingTime(request.fromAmount);

      return {
        fromAmount: request.fromAmount,
        toAmount: toAmount * (1 - priceImpact),
        exchangeRate: exchangeRate.rate,
        fee,
        feePercentage: this.FEE_PERCENTAGE,
        processingTime,
        priceImpact,
        estimatedGasFee: this.estimateGasFee(request.fromCurrency, request.toCurrency)
      };
    } catch (error) {
      console.error('Failed to generate transaction preview:', error);
      throw new Error('无法生成交易预览，请稍后重试');
    }
  }

  // 执行交易
  async executeTransaction(request: TransactionRequest): Promise<Transaction> {
    const startTime = Date.now();
    
    try {
      // 生成交易ID
      const transactionId = this.generateTransactionId();
      
      // 获取交易预览
      const preview = await this.getTransactionPreview(request);
      
      // 创建交易记录
      const transaction: Transaction = {
        id: transactionId,
        type: 'exchange',
        status: 'processing',
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        fromAmount: request.fromAmount,
        toAmount: preview.toAmount,
        exchangeRate: preview.exchangeRate,
        fee: preview.fee,
        feePercentage: preview.feePercentage,
        timestamp: new Date().toISOString(),
        processingTime: 0,
        userId: request.userId,
        performanceMetrics: {
          startTime,
          endTime: 0,
          steps: []
        }
      };

      // 添加到交易列表
      this.transactions.unshift(transaction);
      
      // 模拟异步处理
      this.processTransactionAsync(transaction);
      
      return transaction;
    } catch (error) {
      console.error('Transaction execution failed:', error);
      throw new Error('交易执行失败，请稍后重试');
    }
  }

  // 异步处理交易
  private async processTransactionAsync(transaction: Transaction): Promise<void> {
    const steps = [
      { name: '验证交易参数', duration: 150 },
      { name: '检查余额', duration: 100 },
      { name: '获取最新汇率', duration: 200 },
      { name: '风险评估', duration: 300 },
      { name: '执行兑换', duration: 400 },
      { name: '区块链确认', duration: 600 },
      { name: '更新余额', duration: 150 }
    ];

    let currentTime = Date.now();
    const transactionSteps: TransactionStep[] = [];

    for (const step of steps) {
      const stepStart = currentTime;
      const stepEnd = currentTime + step.duration + Math.random() * 100; // 添加随机延迟
      
      transactionSteps.push({
        name: step.name,
        startTime: stepStart,
        endTime: stepEnd,
        status: 'processing',
        duration: stepEnd - stepStart
      });

      // 更新交易状态
      transaction.status = 'processing';
      transaction.performanceMetrics!.steps = [...transactionSteps];
      
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, step.duration + Math.random() * 100));
      
      // 完成步骤
      transactionSteps[transactionSteps.length - 1].status = 'completed';
      currentTime = stepEnd;
    }

    // 完成交易
    const endTime = Date.now();
    transaction.status = Math.random() > 0.05 ? 'completed' : 'failed'; // 95% 成功率
    transaction.processingTime = endTime - transaction.performanceMetrics!.startTime;
    transaction.performanceMetrics!.endTime = endTime;
    transaction.blockchainTxId = this.generateBlockchainTxId();

    if (transaction.status === 'failed') {
      transaction.notes = '交易失败：网络拥堵，请稍后重试';
    }
  }

  // 计算价格影响
  private calculatePriceImpact(amount: number, currency: string): number {
    const baseLiquidity = 1000000; // 基础流动性 100万
    const impact = Math.min(0.005, amount / baseLiquidity * 0.1); // 最大0.5%影响
    return impact;
  }

  // 估算处理时间
  private estimateProcessingTime(amount: number): string {
    if (amount < 1000) return '< 30秒';
    if (amount < 10000) return '30-60秒';
    if (amount < 100000) return '1-2分钟';
    return '2-5分钟';
  }

  // 估算Gas费用
  private estimateGasFee(fromCurrency: string, toCurrency: string): number | undefined {
    const cryptoCurrencies = ['ETH', 'USDT', 'USDC', 'BTC'];
    
    if (cryptoCurrencies.includes(fromCurrency) || cryptoCurrencies.includes(toCurrency)) {
      return Math.random() * 50 + 5; // 5-55 USD
    }
    
    return undefined;
  }

  // 生成交易ID
  private generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TX${timestamp.slice(-8)}${random}`;
  }

  // 生成区块链交易ID
  private generateBlockchainTxId(): string {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 获取交易历史
  getTransactionHistory(userId?: string, limit: number = 20): Transaction[] {
    let filtered = this.transactions;
    
    if (userId) {
      filtered = filtered.filter(tx => tx.userId === userId);
    }
    
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // 根据ID获取交易
  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find(tx => tx.id === id);
  }

  // 获取交易统计
  getTransactionStats(timeRange: '24h' | '7d' | '30d' = '24h'): {
    totalVolume: number;
    totalTransactions: number;
    successRate: number;
    averageProcessingTime: number;
    topCurrencyPairs: { pair: string; volume: number; count: number }[];
  } {
    const now = Date.now();
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - timeRanges[timeRange];
    const recentTransactions = this.transactions.filter(
      tx => new Date(tx.timestamp).getTime() > cutoff
    );

    const totalVolume = recentTransactions.reduce((sum, tx) => sum + tx.fromAmount, 0);
    const completedTransactions = recentTransactions.filter(tx => tx.status === 'completed');
    const successRate = recentTransactions.length > 0 
      ? (completedTransactions.length / recentTransactions.length) * 100 
      : 0;
    
    const averageProcessingTime = completedTransactions.length > 0
      ? completedTransactions.reduce((sum, tx) => sum + tx.processingTime, 0) / completedTransactions.length
      : 0;

    // 统计货币对
    const pairStats: { [key: string]: { volume: number; count: number } } = {};
    recentTransactions.forEach(tx => {
      const pair = `${tx.fromCurrency}/${tx.toCurrency}`;
      if (!pairStats[pair]) {
        pairStats[pair] = { volume: 0, count: 0 };
      }
      pairStats[pair].volume += tx.fromAmount;
      pairStats[pair].count++;
    });

    const topCurrencyPairs = Object.entries(pairStats)
      .map(([pair, stats]) => ({ pair, ...stats }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    return {
      totalVolume,
      totalTransactions: recentTransactions.length,
      successRate,
      averageProcessingTime,
      topCurrencyPairs
    };
  }

  // 生成实时模拟数据
  generateRealtimeData(): void {
    // 每30秒生成一笔新交易
    setInterval(() => {
      const currencies = ['USD', 'CNY', 'RUB', 'USDT', 'USDC', 'ETH'];
      const fromCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      let toCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      
      // 确保不是同一货币
      while (toCurrency === fromCurrency) {
        toCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      }

      const amount = Math.random() * 10000 + 100; // 100-10100

      this.executeTransaction({
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        userId: 'demo-user'
      }).catch(console.error);
    }, 30000);
  }
}

// 导出单例实例
export const transactionService = new TransactionService();
export default transactionService;