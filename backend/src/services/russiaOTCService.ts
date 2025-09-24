import { EventEmitter } from 'events';

// 俄罗斯OTC订单类型
export interface RussiaOTCOrder {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  fiatCurrency: 'RUB'; // 专门针对卢布
  cryptoCurrency: 'USDT' | 'USDC';
  fiatAmount: number; // 卢布金额
  cryptoAmount: number; // 加密货币金额
  price: number; // 汇率 (RUB/USDT)
  minAmount: number; // 最小交易金额 (RUB)
  maxAmount: number; // 最大交易金额 (RUB)
  paymentMethods: RussiaPaymentMethod[];
  timeLimit: number; // 交易时限 (分钟)
  status: 'active' | 'trading' | 'completed' | 'cancelled' | 'disputed';
  merchantRating: number;
  completedOrders: number;
  createdAt: Date;
  updatedAt: Date;
  remarks?: string;
  autoReply?: string;
  escrowEnabled: boolean;
  escrowContractAddress?: string; // 智能合约地址
  escrowOrderId?: number; // 智能合约订单ID
  trustLevel: 'verified' | 'premium' | 'standard';
  businessType: 'individual' | 'company' | 'machinery_dealer'; // 业务类型
  companyInfo?: {
    name: string;
    inn: string; // 俄罗斯税号
    kpp?: string; // KPP代码
    ogrn: string; // OGRN码
    address: string;
    phone: string;
  };
}

// 俄罗斯支付方式
export interface RussiaPaymentMethod {
  id: string;
  type: 'sberbank' | 'vtb' | 'yoomoney' | 'qiwi' | 'tinkoff' | 'alfa_bank' | 'raiffeisen';
  name: string;
  details: { [key: string]: string };
  isVerified: boolean;
  dailyLimit: number; // 日限额 (RUB)
  monthlyLimit: number; // 月限额 (RUB)
  processingTime: number; // 处理时间 (分钟)
  fees: {
    fixed: number; // 固定费用 (RUB)
    percentage: number; // 百分比费用
  };
}

// 俄罗斯P2P交易接口
export interface RussiaP2PTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  fiatAmount: number; // RUB
  cryptoAmount: number; // USDT
  price: number; // 汇率
  paymentMethod: RussiaPaymentMethod;
  status: 'pending' | 'rub_paid' | 'usdt_escrowed' | 'goods_shipped' | 'goods_delivered' | 'completed' | 'disputed' | 'cancelled';
  chatMessages: ChatMessage[];
  disputeReason?: string;
  escrowTxId?: string;
  escrowContractOrderId?: number;
  releaseCode?: string;
  startTime: Date;
  rubPaymentTime?: Date; // 卢布支付时间
  usdtEscrowTime?: Date; // USDT托管时间
  goodsShippedTime?: Date; // 货物发货时间
  goodsDeliveredTime?: Date; // 货物送达时间
  completedTime?: Date;
  expiryTime: Date;
  sanctions: {
    ofacChecked: boolean; // OFAC制裁名单检查
    euSanctionsChecked: boolean; // 欧盟制裁检查
    russianSanctionsChecked: boolean; // 俄罗斯制裁检查
    checkDate: Date;
  };
  compliance: {
    kycStatus: 'pending' | 'approved' | 'rejected';
    amlRisk: 'low' | 'medium' | 'high';
    sourceOfFunds: string;
    purposeOfTransaction: string;
  };
}

// 聊天消息接口 (支持俄语)
export interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'payment_proof' | 'shipping_proof' | 'system';
  attachments?: string[];
  language: 'ru' | 'zh' | 'en'; // 消息语言
  autoTranslated?: {
    [key: string]: string; // 自动翻译版本
  };
}

// 汇率服务接口
export interface RubUsdtRateService {
  getCurrentRate(): Promise<number>;
  getRateHistory(days: number): Promise<Array<{ date: Date; rate: number }>>;
  subscribePriceUpdates(callback: (rate: number) => void): void;
}

/**
 * 俄罗斯OTC交易服务
 * 专门处理卢布-USDT交易，集成智能合约托管
 */
export class RussiaOTCService extends EventEmitter {
  private orders: Map<string, RussiaOTCOrder> = new Map();
  private transactions: Map<string, RussiaP2PTransaction> = new Map();
  private paymentMethods: Map<string, RussiaPaymentMethod> = new Map();
  private orderBook: { buy: RussiaOTCOrder[], sell: RussiaOTCOrder[] } = { buy: [], sell: [] };
  private currentRate: number = 96.8; // 当前RUB/USDT汇率

  constructor() {
    super();
    this.initializeRussiaPaymentMethods();
    this.initializeMockData();
    this.startRateUpdates();
  }

  // 初始化俄罗斯支付方式
  private initializeRussiaPaymentMethods(): void {
    const methods: RussiaPaymentMethod[] = [
      {
        id: 'sberbank',
        type: 'sberbank',
        name: 'Сбербанк',
        details: {
          bankName: 'Сбербанк России',
          bik: '044525225',
          icon: '🏦'
        },
        isVerified: true,
        dailyLimit: 5000000, // 5M RUB
        monthlyLimit: 100000000, // 100M RUB
        processingTime: 10,
        fees: { fixed: 0, percentage: 0.5 }
      },
      {
        id: 'vtb',
        type: 'vtb',
        name: 'ВТБ',
        details: {
          bankName: 'Банк ВТБ',
          bik: '044525187',
          icon: '🏦'
        },
        isVerified: true,
        dailyLimit: 3000000,
        monthlyLimit: 60000000,
        processingTime: 15,
        fees: { fixed: 100, percentage: 0.3 }
      },
      {
        id: 'yoomoney',
        type: 'yoomoney',
        name: 'ЮMoney',
        details: {
          walletType: 'Электронный кошелек',
          icon: '💳'
        },
        isVerified: true,
        dailyLimit: 500000,
        monthlyLimit: 10000000,
        processingTime: 5,
        fees: { fixed: 0, percentage: 1.5 }
      },
      {
        id: 'qiwi',
        type: 'qiwi',
        name: 'QIWI',
        details: {
          walletType: 'QIWI Кошелек',
          icon: '🔶'
        },
        isVerified: true,
        dailyLimit: 600000,
        monthlyLimit: 15000000,
        processingTime: 3,
        fees: { fixed: 50, percentage: 2.0 }
      },
      {
        id: 'tinkoff',
        type: 'tinkoff',
        name: 'Тинькофф Банк',
        details: {
          bankName: 'Тинькофф Банк',
          bik: '044525974',
          icon: '💛'
        },
        isVerified: true,
        dailyLimit: 2000000,
        monthlyLimit: 50000000,
        processingTime: 8,
        fees: { fixed: 0, percentage: 0.8 }
      }
    ];

    methods.forEach(method => {
      this.paymentMethods.set(method.id, method);
    });
  }

  // 初始化模拟数据
  private initializeMockData(): void {
    const mockOrders: RussiaOTCOrder[] = [
      {
        id: 'RU-OTC-001',
        userId: 'rusmach_user',
        type: 'buy',
        fiatCurrency: 'RUB',
        cryptoCurrency: 'USDT',
        fiatAmount: 2000000, // 2M RUB
        cryptoAmount: 20661.16, // 约21K USDT
        price: 96.8,
        minAmount: 100000, // 100K RUB
        maxAmount: 2000000,
        paymentMethods: [
          this.paymentMethods.get('sberbank')!,
          this.paymentMethods.get('vtb')!
        ],
        timeLimit: 30,
        status: 'active',
        merchantRating: 4.9,
        completedOrders: 850,
        createdAt: new Date(),
        updatedAt: new Date(),
        remarks: 'Покупка USDT для закупки оборудования в Китае. Быстрая сделка, гарантия безопасности.',
        autoReply: 'Здравствуйте! Готов к сделке. Работаю с эскроу-контрактом для максимальной безопасности.',
        escrowEnabled: true,
        trustLevel: 'verified',
        businessType: 'machinery_dealer',
        companyInfo: {
          name: 'ООО "РусМаш"',
          inn: '7707083893',
          kpp: '770701001',
          ogrn: '1037739010891',
          address: 'г. Москва, ул. Промышленная, д. 15',
          phone: '+7 (495) 123-45-67'
        }
      },
      {
        id: 'RU-OTC-002',
        userId: 'crypto_trader_ru',
        type: 'sell',
        fiatCurrency: 'RUB',
        cryptoCurrency: 'USDT',
        fiatAmount: 5000000, // 5M RUB
        cryptoAmount: 51652.89, // 约52K USDT
        price: 96.8,
        minAmount: 200000, // 200K RUB
        maxAmount: 5000000,
        paymentMethods: [
          this.paymentMethods.get('sberbank')!,
          this.paymentMethods.get('tinkoff')!,
          this.paymentMethods.get('yoomoney')!
        ],
        timeLimit: 20,
        status: 'active',
        merchantRating: 4.7,
        completedOrders: 1250,
        createdAt: new Date(),
        updatedAt: new Date(),
        remarks: 'Продажа USDT за рубли. Быстрая обработка, работаю 24/7. Поддержка всех банков.',
        autoReply: 'Привет! Готов к сделке. Переводы обрабатываю в течение 10 минут.',
        escrowEnabled: true,
        trustLevel: 'premium',
        businessType: 'individual'
      }
    ];

    mockOrders.forEach(order => {
      this.orders.set(order.id, order);
      if (order.type === 'buy') {
        this.orderBook.buy.push(order);
      } else {
        this.orderBook.sell.push(order);
      }
    });

    this.sortOrderBook();
  }

  // 启动汇率更新
  private startRateUpdates(): void {
    // 模拟实时汇率更新
    setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * 2; // ±1 RUB
      this.currentRate = Math.max(90, Math.min(105, this.currentRate + fluctuation));
      this.emit('rateUpdate', this.currentRate);
    }, 30000); // 每30秒更新一次
  }

  /**
   * 创建俄罗斯OTC订单
   */
  async createRussiaOrder(orderData: Omit<RussiaOTCOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<RussiaOTCOrder> {
    // 制裁检查
    await this.checkSanctions(orderData.userId);

    const order: RussiaOTCOrder = {
      ...orderData,
      id: `RU-OTC-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.set(order.id, order);
    
    // 添加到订单簿
    if (order.type === 'buy') {
      this.orderBook.buy.push(order);
    } else {
      this.orderBook.sell.push(order);
    }
    
    this.sortOrderBook();
    
    this.emit('russiaOrderCreated', order);
    return order;
  }

  /**
   * 创建俄罗斯P2P交易 (集成智能合约)
   */
  async createRussiaTransaction(
    orderId: string, 
    buyerId: string, 
    amount: number, // RUB
    paymentMethodId: string,
    goodsInfo?: {
      description: string;
      deliveryAddress: string;
      expectedDeliveryDays: number;
    }
  ): Promise<RussiaP2PTransaction> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== 'active') {
      throw new Error('订单不可用');
    }

    if (amount < order.minAmount || amount > order.maxAmount) {
      throw new Error('交易金额超出范围');
    }

    const paymentMethod = this.paymentMethods.get(paymentMethodId);
    if (!paymentMethod) {
      throw new Error('不支持的支付方式');
    }

    // 制裁和合规检查
    await this.checkSanctions(buyerId);
    await this.checkSanctions(order.userId);

    const cryptoAmount = amount / order.price;
    const transaction: RussiaP2PTransaction = {
      id: `RU-TXN-${Date.now()}`,
      orderId,
      buyerId: order.type === 'buy' ? order.userId : buyerId,
      sellerId: order.type === 'sell' ? order.userId : buyerId,
      fiatAmount: amount,
      cryptoAmount,
      price: order.price,
      paymentMethod,
      status: 'pending',
      chatMessages: [],
      startTime: new Date(),
      expiryTime: new Date(Date.now() + order.timeLimit * 60 * 1000),
      releaseCode: this.generateReleaseCode(),
      sanctions: {
        ofacChecked: true,
        euSanctionsChecked: true,
        russianSanctionsChecked: true,
        checkDate: new Date()
      },
      compliance: {
        kycStatus: 'approved', // 假设已通过KYC
        amlRisk: 'low',
        sourceOfFunds: goodsInfo ? 'business_purchase' : 'trading',
        purposeOfTransaction: goodsInfo ? `Purchase of ${goodsInfo.description}` : 'Cryptocurrency trading'
      }
    };

    this.transactions.set(transaction.id, transaction);
    
    // 更新订单状态
    order.status = 'trading';
    this.orders.set(orderId, order);

    this.emit('russiaTransactionCreated', transaction);
    return transaction;
  }

  /**
   * 确认卢布支付
   */
  async confirmRubPayment(transactionId: string, buyerId: string, paymentProof?: string): Promise<RussiaP2PTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.buyerId !== buyerId) {
      throw new Error('无权限操作');
    }

    transaction.status = 'rub_paid';
    transaction.rubPaymentTime = new Date();
    this.transactions.set(transactionId, transaction);

    // 添加系统消息
    await this.addChatMessage(transactionId, 'system', '买家已确认卢布支付，等待卖家将USDT托管到智能合约', 'system', 'ru');
    
    this.emit('rubPaymentConfirmed', transaction);
    return transaction;
  }

  /**
   * USDT托管到智能合约
   */
  async escrowUsdt(transactionId: string, sellerId: string, escrowTxId: string, contractOrderId: number): Promise<RussiaP2PTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.sellerId !== sellerId) {
      throw new Error('无权限操作');
    }

    transaction.status = 'usdt_escrowed';
    transaction.usdtEscrowTime = new Date();
    transaction.escrowTxId = escrowTxId;
    transaction.escrowContractOrderId = contractOrderId;
    this.transactions.set(transactionId, transaction);

    await this.addChatMessage(transactionId, 'system', `USDT已托管到智能合约，合约订单号: ${contractOrderId}`, 'system', 'ru');
    
    this.emit('usdtEscrowed', transaction);
    return transaction;
  }

  /**
   * 确认货物发运 (针对实物贸易)
   */
  async confirmGoodsShipped(
    transactionId: string, 
    sellerId: string, 
    shippingInfo: {
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: Date;
      billOfLading?: string;
    }
  ): Promise<RussiaP2PTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.sellerId !== sellerId) {
      throw new Error('无权限操作');
    }

    transaction.status = 'goods_shipped';
    transaction.goodsShippedTime = new Date();
    this.transactions.set(transactionId, transaction);

    const message = `货物已发运
追踪号: ${shippingInfo.trackingNumber}
承运商: ${shippingInfo.carrier}
预计送达: ${shippingInfo.estimatedDelivery.toLocaleDateString('ru-RU')}`;

    await this.addChatMessage(transactionId, 'system', message, 'shipping_proof', 'ru');
    
    this.emit('goodsShipped', transaction);
    return transaction;
  }

  /**
   * 确认货物收到
   */
  async confirmGoodsDelivered(transactionId: string, buyerId: string): Promise<RussiaP2PTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.buyerId !== buyerId) {
      throw new Error('无权限操作');
    }

    transaction.status = 'goods_delivered';
    transaction.goodsDeliveredTime = new Date();
    this.transactions.set(transactionId, transaction);

    await this.addChatMessage(transactionId, 'system', '买家确认收货，智能合约将自动释放USDT给卖家', 'system', 'ru');
    
    this.emit('goodsDelivered', transaction);
    return transaction;
  }

  /**
   * 添加聊天消息 (支持俄语)
   */
  async addChatMessage(
    transactionId: string, 
    senderId: string, 
    message: string, 
    type: 'text' | 'image' | 'payment_proof' | 'shipping_proof' | 'system' = 'text',
    language: 'ru' | 'zh' | 'en' = 'ru'
  ): Promise<ChatMessage> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('交易不存在');
    }

    const chatMessage: ChatMessage = {
      id: `MSG-${Date.now()}`,
      senderId,
      message,
      timestamp: new Date(),
      type,
      language
    };

    // 如果是俄语消息，自动翻译成中文
    if (language === 'ru' && type === 'text') {
      chatMessage.autoTranslated = {
        zh: await this.translateMessage(message, 'ru', 'zh'),
        en: await this.translateMessage(message, 'ru', 'en')
      };
    }

    transaction.chatMessages.push(chatMessage);
    this.transactions.set(transactionId, transaction);

    this.emit('chatMessage', { transactionId, message: chatMessage });
    return chatMessage;
  }

  /**
   * 制裁名单检查
   */
  private async checkSanctions(userId: string): Promise<void> {
    // 模拟制裁检查
    const sanctionedEntities = ['blocked_user_1', 'blocked_company_2'];
    
    if (sanctionedEntities.includes(userId)) {
      throw new Error('该用户在制裁名单中，无法进行交易');
    }

    // 这里应该调用真实的制裁检查API
    // - OFAC (美国财政部外国资产控制办公室)
    // - EU Sanctions
    // - Russian Federal Financial Monitoring Service
  }

  /**
   * 消息翻译 (模拟)
   */
  private async translateMessage(message: string, from: string, to: string): Promise<string> {
    // 简单的俄语-中文常见短语翻译
    const translations: { [key: string]: { [key: string]: string } } = {
      'ru-zh': {
        'Здравствуйте': '您好',
        'Готов к сделке': '准备交易',
        'Оплачиваю': '正在付款',
        'Оплатил': '已付款',
        'Получил товар': '已收到货物',
        'Спасибо': '谢谢',
        'Хорошо': '好的'
      },
      'ru-en': {
        'Здравствуйте': 'Hello',
        'Готов к сделке': 'Ready to trade',
        'Оплачиваю': 'Making payment',
        'Оплатил': 'Payment made',
        'Получил товар': 'Goods received',
        'Спасибо': 'Thank you',
        'Хорошо': 'Good'
      }
    };

    const langPair = `${from}-${to}`;
    const dict = translations[langPair];
    
    if (dict && dict[message]) {
      return dict[message];
    }

    // 这里应该调用真实的翻译API (如Google Translate, Yandex Translate)
    return `[Translated from ${from}]: ${message}`;
  }

  /**
   * 获取俄罗斯订单簿
   */
  getRussiaOrderBook(): { buy: RussiaOTCOrder[], sell: RussiaOTCOrder[] } {
    return {
      buy: this.orderBook.buy.filter(o => o.status === 'active').slice(0, 20),
      sell: this.orderBook.sell.filter(o => o.status === 'active').slice(0, 20)
    };
  }

  /**
   * 获取当前卢布汇率
   */
  getCurrentRubRate(): number {
    return this.currentRate;
  }

  /**
   * 获取支付方式列表
   */
  getRussiaPaymentMethods(): RussiaPaymentMethod[] {
    return Array.from(this.paymentMethods.values());
  }

  /**
   * 对订单簿排序
   */
  private sortOrderBook(): void {
    this.orderBook.buy.sort((a, b) => b.price - a.price); // 买单按价格从高到低
    this.orderBook.sell.sort((a, b) => a.price - b.price); // 卖单按价格从低到高
  }

  /**
   * 生成释放码
   */
  private generateReleaseCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * 获取交易详情
   */
  getRussiaTransaction(transactionId: string): RussiaP2PTransaction | null {
    return this.transactions.get(transactionId) || null;
  }

  /**
   * 获取用户订单
   */
  getUserRussiaOrders(userId: string): RussiaOTCOrder[] {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  /**
   * 获取用户交易
   */
  getUserRussiaTransactions(userId: string): RussiaP2PTransaction[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.buyerId === userId || tx.sellerId === userId
    );
  }

  /**
   * 取消订单
   */
  async cancelRussiaOrder(orderId: string, userId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order || order.userId !== userId) {
      throw new Error('无权限操作');
    }

    if (order.status === 'trading') {
      throw new Error('订单正在交易中，无法取消');
    }

    order.status = 'cancelled';
    this.orders.set(orderId, order);

    // 从订单簿移除
    this.orderBook.buy = this.orderBook.buy.filter(o => o.id !== orderId);
    this.orderBook.sell = this.orderBook.sell.filter(o => o.id !== orderId);

    this.emit('russiaOrderCancelled', order);
  }
}

export const russiaOTCService = new RussiaOTCService();
export default russiaOTCService;