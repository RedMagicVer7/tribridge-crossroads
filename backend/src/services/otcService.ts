import { EventEmitter } from 'events';

// OTC订单类型
export interface OTCOrder {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  fiatCurrency: string; // 法币类型 (CNY, RUB, USD)
  cryptoCurrency: string; // 加密货币类型 (USDT, USDC)
  fiatAmount: number;
  cryptoAmount: number;
  price: number; // 单价
  minAmount: number; // 最小交易金额
  maxAmount: number; // 最大交易金额
  paymentMethods: string[]; // 支付方式
  timeLimit: number; // 交易时限 (分钟)
  status: 'active' | 'trading' | 'completed' | 'cancelled' | 'disputed';
  merchantRating: number;
  completedOrders: number;
  createdAt: Date;
  updatedAt: Date;
  remarks?: string;
  autoReply?: string;
  escrowEnabled: boolean;
  trustLevel: 'verified' | 'premium' | 'standard';
}

// P2P交易接口
export interface P2PTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  fiatAmount: number;
  cryptoAmount: number;
  price: number;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'released' | 'disputed' | 'cancelled' | 'completed';
  chatMessages: ChatMessage[];
  disputeReason?: string;
  escrowTxId?: string;
  releaseCode?: string;
  startTime: Date;
  paymentTime?: Date;
  releaseTime?: Date;
  completedTime?: Date;
  expiryTime: Date;
}

// 聊天消息接口
export interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'payment_proof' | 'system';
  attachments?: string[];
}

// 支付方式接口
export interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'alipay' | 'wechat' | 'yoomoney' | 'qiwi' | 'sberbank' | 'vtb';
  name: string;
  details: { [key: string]: string };
  isVerified: boolean;
  country: string;
}

// 用户信用评级
export interface UserCreditScore {
  userId: string;
  rating: number; // 1-5星
  totalOrders: number;
  completedOrders: number;
  disputeCount: number;
  averageReleaseTime: number; // 平均放币时间(分钟)
  trustLevel: 'verified' | 'premium' | 'standard' | 'new';
  kycVerified: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  lastActiveTime: Date;
}

class OTCService extends EventEmitter {
  private orders: Map<string, OTCOrder> = new Map();
  private transactions: Map<string, P2PTransaction> = new Map();
  private userCredits: Map<string, UserCreditScore> = new Map();
  private orderBook: { [pair: string]: OTCOrder[] } = {};

  constructor() {
    super();
    this.initializeMockData();
  }

  // 初始化模拟数据
  private initializeMockData(): void {
    // 创建模拟订单
    const mockOrders: OTCOrder[] = [
      {
        id: 'OTC001',
        userId: 'user1',
        type: 'sell',
        fiatCurrency: 'CNY',
        cryptoCurrency: 'USDT',
        fiatAmount: 10000,
        cryptoAmount: 1366.12,
        price: 7.32,
        minAmount: 500,
        maxAmount: 10000,
        paymentMethods: ['alipay', 'wechat', 'bank_transfer'],
        timeLimit: 15,
        status: 'active',
        merchantRating: 4.8,
        completedOrders: 1250,
        createdAt: new Date(),
        updatedAt: new Date(),
        remarks: '秒放币，支持支付宝、微信',
        autoReply: '您好，请按照以下步骤进行交易',
        escrowEnabled: true,
        trustLevel: 'verified'
      },
      {
        id: 'OTC002',
        userId: 'user2',
        type: 'buy',
        fiatCurrency: 'RUB',
        cryptoCurrency: 'USDT',
        fiatAmount: 96800,
        cryptoAmount: 1000,
        price: 96.8,
        minAmount: 1000,
        maxAmount: 50000,
        paymentMethods: ['sberbank', 'vtb', 'yoomoney'],
        timeLimit: 30,
        status: 'active',
        merchantRating: 4.6,
        completedOrders: 850,
        createdAt: new Date(),
        updatedAt: new Date(),
        remarks: 'Быстрая покупка USDT за рубли',
        autoReply: 'Здравствуйте! Готов к сделке',
        escrowEnabled: true,
        trustLevel: 'premium'
      }
    ];

    mockOrders.forEach(order => {
      this.orders.set(order.id, order);
      const pair = `${order.fiatCurrency}_${order.cryptoCurrency}`;
      if (!this.orderBook[pair]) {
        this.orderBook[pair] = [];
      }
      this.orderBook[pair].push(order);
    });

    // 初始化用户信用评级
    this.userCredits.set('user1', {
      userId: 'user1',
      rating: 4.8,
      totalOrders: 1250,
      completedOrders: 1245,
      disputeCount: 2,
      averageReleaseTime: 3.5,
      trustLevel: 'verified',
      kycVerified: true,
      phoneVerified: true,
      emailVerified: true,
      lastActiveTime: new Date()
    });
  }

  // 创建OTC订单
  async createOrder(orderData: Omit<OTCOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<OTCOrder> {
    const order: OTCOrder = {
      ...orderData,
      id: `OTC${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.set(order.id, order);
    
    // 添加到订单簿
    const pair = `${order.fiatCurrency}_${order.cryptoCurrency}`;
    if (!this.orderBook[pair]) {
      this.orderBook[pair] = [];
    }
    this.orderBook[pair].push(order);
    
    // 按价格排序
    this.sortOrderBook(pair);
    
    this.emit('orderCreated', order);
    return order;
  }

  // 获取订单簿
  getOrderBook(fiatCurrency: string, cryptoCurrency: string): { buy: OTCOrder[], sell: OTCOrder[] } {
    const pair = `${fiatCurrency}_${cryptoCurrency}`;
    const orders = this.orderBook[pair] || [];
    
    return {
      buy: orders.filter(o => o.type === 'buy' && o.status === 'active').slice(0, 20),
      sell: orders.filter(o => o.type === 'sell' && o.status === 'active').slice(0, 20)
    };
  }

  // 创建P2P交易
  async createTransaction(
    orderId: string, 
    buyerId: string, 
    amount: number, 
    paymentMethod: string
  ): Promise<P2PTransaction> {
    const order = this.orders.get(orderId);
    if (!order || order.status !== 'active') {
      throw new Error('订单不可用');
    }

    if (amount < order.minAmount || amount > order.maxAmount) {
      throw new Error('交易金额超出范围');
    }

    const cryptoAmount = amount / order.price;
    const transaction: P2PTransaction = {
      id: `TXN${Date.now()}`,
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
      releaseCode: this.generateReleaseCode()
    };

    this.transactions.set(transaction.id, transaction);
    
    // 更新订单状态
    order.status = 'trading';
    this.orders.set(orderId, order);

    this.emit('transactionCreated', transaction);
    return transaction;
  }

  // 添加聊天消息
  async addChatMessage(
    transactionId: string, 
    senderId: string, 
    message: string, 
    type: 'text' | 'image' | 'payment_proof' | 'system' = 'text'
  ): Promise<ChatMessage> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('交易不存在');
    }

    const chatMessage: ChatMessage = {
      id: `MSG${Date.now()}`,
      senderId,
      message,
      timestamp: new Date(),
      type
    };

    transaction.chatMessages.push(chatMessage);
    this.transactions.set(transactionId, transaction);

    this.emit('chatMessage', { transactionId, message: chatMessage });
    return chatMessage;
  }

  // 确认付款
  async confirmPayment(transactionId: string, buyerId: string): Promise<P2PTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.buyerId !== buyerId) {
      throw new Error('无权限操作');
    }

    transaction.status = 'paid';
    transaction.paymentTime = new Date();
    this.transactions.set(transactionId, transaction);

    // 添加系统消息
    await this.addChatMessage(transactionId, 'system', '买家已确认付款，等待卖家放币', 'system');
    
    this.emit('paymentConfirmed', transaction);
    return transaction;
  }

  // 释放加密货币
  async releaseCrypto(transactionId: string, sellerId: string, releaseCode: string): Promise<P2PTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || transaction.sellerId !== sellerId) {
      throw new Error('无权限操作');
    }

    if (transaction.releaseCode !== releaseCode) {
      throw new Error('释放码错误');
    }

    transaction.status = 'released';
    transaction.releaseTime = new Date();
    this.transactions.set(transactionId, transaction);

    // 更新订单状态
    const order = this.orders.get(transaction.orderId);
    if (order) {
      order.status = 'completed';
      this.orders.set(order.id, order);
    }

    this.emit('cryptoReleased', transaction);
    return transaction;
  }

  // 发起争议
  async raiseDispute(transactionId: string, userId: string, reason: string): Promise<P2PTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction || (transaction.buyerId !== userId && transaction.sellerId !== userId)) {
      throw new Error('无权限操作');
    }

    transaction.status = 'disputed';
    transaction.disputeReason = reason;
    this.transactions.set(transactionId, transaction);

    await this.addChatMessage(transactionId, 'system', `争议已发起: ${reason}`, 'system');
    
    this.emit('disputeRaised', transaction);
    return transaction;
  }

  // 获取用户信用评级
  getUserCreditScore(userId: string): UserCreditScore | null {
    return this.userCredits.get(userId) || null;
  }

  // 更新用户信用评级
  updateUserCreditScore(userId: string, transaction: P2PTransaction): void {
    let credit = this.userCredits.get(userId) || {
      userId,
      rating: 5.0,
      totalOrders: 0,
      completedOrders: 0,
      disputeCount: 0,
      averageReleaseTime: 0,
      trustLevel: 'new',
      kycVerified: false,
      phoneVerified: false,
      emailVerified: false,
      lastActiveTime: new Date()
    };

    credit.totalOrders++;
    if (transaction.status === 'completed') {
      credit.completedOrders++;
      
      // 更新平均放币时间(仅对卖家)
      if (transaction.sellerId === userId && transaction.releaseTime && transaction.paymentTime) {
        const releaseTime = (transaction.releaseTime.getTime() - transaction.paymentTime.getTime()) / (1000 * 60);
        credit.averageReleaseTime = (credit.averageReleaseTime * (credit.completedOrders - 1) + releaseTime) / credit.completedOrders;
      }
    }

    if (transaction.status === 'disputed') {
      credit.disputeCount++;
    }

    // 计算信用评级
    const completionRate = credit.totalOrders > 0 ? credit.completedOrders / credit.totalOrders : 1;
    const disputeRate = credit.totalOrders > 0 ? credit.disputeCount / credit.totalOrders : 0;
    credit.rating = Math.max(1, 5 * completionRate - disputeRate * 2);

    // 更新信任级别
    if (credit.completedOrders > 1000 && credit.rating > 4.8 && credit.kycVerified) {
      credit.trustLevel = 'verified';
    } else if (credit.completedOrders > 500 && credit.rating > 4.5) {
      credit.trustLevel = 'premium';
    } else if (credit.completedOrders > 10) {
      credit.trustLevel = 'standard';
    }

    credit.lastActiveTime = new Date();
    this.userCredits.set(userId, credit);
  }

  // 生成释放码
  private generateReleaseCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // 对订单簿排序
  private sortOrderBook(pair: string): void {
    if (!this.orderBook[pair]) return;
    
    this.orderBook[pair].sort((a, b) => {
      if (a.type === 'buy') {
        return b.price - a.price; // 买单按价格从高到低
      } else {
        return a.price - b.price; // 卖单按价格从低到高
      }
    });
  }

  // 获取交易详情
  getTransaction(transactionId: string): P2PTransaction | null {
    return this.transactions.get(transactionId) || null;
  }

  // 获取用户订单
  getUserOrders(userId: string): OTCOrder[] {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  // 获取用户交易
  getUserTransactions(userId: string): P2PTransaction[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.buyerId === userId || tx.sellerId === userId
    );
  }

  // 取消订单
  async cancelOrder(orderId: string, userId: string): Promise<void> {
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
    const pair = `${order.fiatCurrency}_${order.cryptoCurrency}`;
    if (this.orderBook[pair]) {
      this.orderBook[pair] = this.orderBook[pair].filter(o => o.id !== orderId);
    }

    this.emit('orderCancelled', order);
  }
}

export const otcService = new OTCService();
export default otcService;