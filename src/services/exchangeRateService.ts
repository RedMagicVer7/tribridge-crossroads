// 汇率API服务
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
  source: 'coingecko' | 'binance' | 'mock';
}

export interface PriceData {
  [currency: string]: {
    usd: number;
    cny: number;
    rub: number;
  };
}

class ExchangeRateService {
  private cache: Map<string, { rate: ExchangeRate; expiry: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30秒缓存

  // 添加超时设置
  private readonly API_TIMEOUT = 5000; // 5秒超时

  // CoinGecko API (免费版) - 增强版带超时
  private async fetchFromCoinGecko(): Promise<PriceData> {
    try {
      // 添加超时处理
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=tether,usd-coin,ethereum&vs_currencies=usd,cny,rub',
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 转换为我们的格式
      return {
        USDT: {
          usd: data.tether?.usd || 1,
          cny: data.tether?.cny || 7.3,
          rub: data.tether?.rub || 96.5
        },
        USDC: {
          usd: data['usd-coin']?.usd || 1,
          cny: data['usd-coin']?.cny || 7.3,
          rub: data['usd-coin']?.rub || 96.5
        },
        ETH: {
          usd: data.ethereum?.usd || 2000,
          cny: data.ethereum?.cny || 14600,
          rub: data.ethereum?.rub || 193000
        }
      };
    } catch (error) {
      console.warn('CoinGecko API failed, will try next source', error);
      throw error;
    }
  }

  // Binance API (备用) - 增强版带超时和更可靠的请求格式
  private async fetchFromBinance(): Promise<PriceData> {
    try {
      // 添加超时处理
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);
      
      // 使用更可靠的请求格式，避免URL编码问题
      const symbols = ['USDTRUB', 'ETHUSDT'];
      const symbolParams = symbols.map(s => encodeURIComponent(s)).join(',');
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbolParams}`,
        { 
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          method: 'GET'
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Binance API request failed with status: ${response.status}`);
        throw new Error(`Binance API request failed: ${response.status}`);
      }
      
      // 处理可能的JSON解析错误
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn('Failed to parse Binance API response:', jsonError);
        throw new Error('Failed to parse Binance API response');
      }
      
      // 解析Binance数据
      const rates: { [key: string]: number } = {};
      if (Array.isArray(data)) {
        data.forEach((item: { symbol: string; price: string }) => {
          rates[item.symbol] = parseFloat(item.price);
        });
      } else if (data && data.symbol && data.price) {
        // 处理单个返回对象的情况
        rates[data.symbol] = parseFloat(data.price);
      }
      
      console.log('Binance API data received:', rates);
      
      return {
        USDT: {
          usd: 1,
          cny: 7.3, // 使用默认汇率作为后备
          rub: rates.USDTRUB || 96.5
        },
        USDC: {
          usd: 1,
          cny: 7.3,
          rub: rates.USDTRUB || 96.5
        },
        ETH: {
          usd: rates.ETHUSDT || 2000,
          cny: (rates.ETHUSDT || 2000) * 7.3,
          rub: (rates.ETHUSDT || 2000) * (rates.USDTRUB || 96.5)
        }
      };
    } catch (error) {
      console.warn('Binance API failed, will use mock data', error);
      throw error;
    }
  }

  // 模拟汇率数据（开发环境和API失败时使用）
  private getMockRates(): PriceData {
    const baseRates = {
      USDT: { usd: 1, cny: 7.32, rub: 96.8 },
      USDC: { usd: 1, cny: 7.31, rub: 96.7 },
      ETH: { usd: 2045.32, cny: 14951.84, rub: 197985.50 },
      BTC: { usd: 43250.00, cny: 316190.00, rub: 4178420.00 }
    };

    // 添加小幅随机波动来模拟真实市场
    Object.keys(baseRates).forEach(currency => {
      const rates = baseRates[currency as keyof typeof baseRates];
      const volatility = 0.001; // 0.1% 波动
      
      rates.usd *= (1 + (Math.random() - 0.5) * volatility);
      rates.cny *= (1 + (Math.random() - 0.5) * volatility);
      rates.rub *= (1 + (Math.random() - 0.5) * volatility);
    });

    return baseRates;
  }

  // 获取实时汇率 - 增强错误处理
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const cacheKey = `${from}-${to}`;
    const cached = this.cache.get(cacheKey);
    
    // 检查缓存
    if (cached && Date.now() < cached.expiry) {
      return cached.rate;
    }

    try {
      let priceData: PriceData;
      let source: 'coingecko' | 'binance' | 'mock' = 'mock';
      
      // 首先尝试CoinGecko
      try {
        priceData = await this.fetchFromCoinGecko();
        source = 'coingecko';
      } catch (coingeckoError) {
        console.warn('CoinGecko API call failed:', coingeckoError.message);
        // 如果CoinGecko失败，尝试Binance
        try {
          priceData = await this.fetchFromBinance();
          source = 'binance';
        } catch (binanceError) {
          console.warn('Binance API call failed:', binanceError.message);
          // 如果都失败，使用模拟数据
          console.log('All external APIs failed, using mock exchange rates');
          priceData = this.getMockRates();
          source = 'mock';
        }
      }

      const rate = this.calculateExchangeRate(from, to, priceData);
      const exchangeRate: ExchangeRate = {
        from,
        to,
        rate,
        timestamp: Date.now(),
        source: source // 使用实际成功的数据源
      };

      // 缓存结果
      this.cache.set(cacheKey, {
        rate: exchangeRate,
        expiry: Date.now() + this.CACHE_DURATION
      });

      return exchangeRate;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      
      // 返回模拟汇率作为后备
      const mockData = this.getMockRates();
      const rate = this.calculateExchangeRate(from, to, mockData);
      
      return {
        from,
        to,
        rate,
        timestamp: Date.now(),
        source: 'mock'
      };
    }
  }

  // 计算兑换汇率
  private calculateExchangeRate(from: string, to: string, priceData: PriceData): number {
    // 处理法币到法币的转换
    if (['USD', 'CNY', 'RUB'].includes(from) && ['USD', 'CNY', 'RUB'].includes(to)) {
      return this.getFiatToFiatRate(from, to);
    }

    // 处理加密货币到法币或反之
    const normalizedFrom = this.normalizeCurrency(from);
    const normalizedTo = this.normalizeCurrency(to);

    if (normalizedFrom === normalizedTo) {
      return 1;
    }

    // 如果是从加密货币到法币
    if (priceData[normalizedFrom]) {
      const fromData = priceData[normalizedFrom];
      if (normalizedTo === 'USD') return fromData.usd;
      if (normalizedTo === 'CNY') return fromData.cny;
      if (normalizedTo === 'RUB') return fromData.rub;
    }

    // 如果是从法币到加密货币
    if (priceData[normalizedTo]) {
      const toData = priceData[normalizedTo];
      if (normalizedFrom === 'USD') return 1 / toData.usd;
      if (normalizedFrom === 'CNY') return 1 / toData.cny;
      if (normalizedFrom === 'RUB') return 1 / toData.rub;
    }

    // 加密货币之间的转换（通过USD）
    if (priceData[normalizedFrom] && priceData[normalizedTo]) {
      const fromUsdRate = priceData[normalizedFrom].usd;
      const toUsdRate = priceData[normalizedTo].usd;
      return fromUsdRate / toUsdRate;
    }

    // 默认返回1
    return 1;
  }

  // 法币间汇率（相对稳定的汇率）
  private getFiatToFiatRate(from: string, to: string): number {
    const rates: { [key: string]: { [key: string]: number } } = {
      USD: { CNY: 7.32, RUB: 96.8, USD: 1 },
      CNY: { USD: 1/7.32, RUB: 13.23, CNY: 1 },
      RUB: { USD: 1/96.8, CNY: 1/13.23, RUB: 1 }
    };

    return rates[from]?.[to] || 1;
  }

  // 规范化货币代码
  private normalizeCurrency(currency: string): string {
    const mapping: { [key: string]: string } = {
      'RMB': 'CNY',
      'YUAN': 'CNY',
      'RUBLE': 'RUB',
      'BITCOIN': 'BTC',
      'ETHEREUM': 'ETH'
    };

    return mapping[currency.toUpperCase()] || currency.toUpperCase();
  }

  // 获取支持的货币列表
  getSupportedCurrencies(): string[] {
    return ['USD', 'CNY', 'RUB', 'USDT', 'USDC', 'ETH', 'BTC'];
  }

  // 获取所有汇率（用于批量显示）
  async getAllRates(): Promise<{ [pair: string]: ExchangeRate }> {
    const currencies = this.getSupportedCurrencies();
    const rates: { [pair: string]: ExchangeRate } = {};

    // 并发获取所有汇率
    const promises: Promise<void>[] = [];

    for (const from of currencies) {
      for (const to of currencies) {
        if (from !== to) {
          promises.push(
            this.getExchangeRate(from, to).then(rate => {
              rates[`${from}-${to}`] = rate;
            })
          );
        }
      }
    }

    await Promise.allSettled(promises);
    return rates;
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear();
  }
}

// 导出单例实例
export const exchangeRateService = new ExchangeRateService();
export default exchangeRateService;