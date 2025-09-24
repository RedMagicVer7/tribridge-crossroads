/**
 * OTC 交易服务
 * 处理卢布/USDT OTC 交易相关功能
 */

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export interface TradeOrder {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  userId: string;
}

export interface WalletBalance {
  currency: string;
  balance: number;
  frozenBalance: number;
}

class TradingService {
  private baseUrl = '/api/trading';

  /**
   * 获取当前汇率
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      from,
      to,
      rate: from === 'RUB' && to === 'USDT' ? 88.5 : 0.0113,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 获取用户钱包余额
   */
  async getWalletBalances(userId: string): Promise<WalletBalance[]> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { currency: 'USDT', balance: 1250.50, frozenBalance: 50.0 },
      { currency: 'RUB', balance: 45780.00, frozenBalance: 1200.0 }
    ];
  }

  /**
   * 创建交易订单
   */
  async createTradeOrder(order: Omit<TradeOrder, 'id' | 'timestamp' | 'status'>): Promise<TradeOrder> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newOrder: TradeOrder = {
      ...order,
      id: `TO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    return newOrder;
  }

  /**
   * 获取用户交易历史
   */
  async getTradeHistory(userId: string, limit: number = 10): Promise<TradeOrder[]> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        id: 'TO-001',
        fromCurrency: 'USDT',
        toCurrency: 'RUB',
        fromAmount: 100,
        toAmount: 8850,
        rate: 88.5,
        status: 'completed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userId
      },
      {
        id: 'TO-002',
        fromCurrency: 'USDT',
        toCurrency: 'RUB',
        fromAmount: 50,
        toAmount: 4425,
        rate: 88.5,
        status: 'completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        userId
      },
      {
        id: 'TO-003',
        fromCurrency: 'RUB',
        toCurrency: 'USDT',
        fromAmount: 2000,
        toAmount: 22.6,
        rate: 88.5,
        status: 'processing',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        userId
      }
    ];
  }

  /**
   * 计算交易金额
   */
  calculateExchange(amount: number, from: string, to: string, rate: number): number {
    if (from === 'RUB' && to === 'USDT') {
      return amount / rate;
    } else if (from === 'USDT' && to === 'RUB') {
      return amount * rate;
    }
    return amount;
  }

  /**
   * 验证交易参数
   */
  validateTrade(fromAmount: number, fromCurrency: string, userBalance: number): {
    isValid: boolean;
    error?: string;
  } {
    if (fromAmount <= 0) {
      return { isValid: false, error: '交易金额必须大于0' };
    }
    
    if (fromAmount > userBalance) {
      return { isValid: false, error: '余额不足' };
    }
    
    // RUB 最小交易金额
    if (fromCurrency === 'RUB' && fromAmount < 1000) {
      return { isValid: false, error: 'RUB 最小交易金额为 1000' };
    }
    
    // USDT 最小交易金额
    if (fromCurrency === 'USDT' && fromAmount < 10) {
      return { isValid: false, error: 'USDT 最小交易金额为 10' };
    }
    
    return { isValid: true };
  }
}

export const tradingService = new TradingService();