import { EventEmitter } from 'events';

// 物流状态枚举
export enum LogisticsStatus {
  PENDING = 'pending',           // 待发货
  PICKED_UP = 'picked_up',      // 已提货
  IN_TRANSIT = 'in_transit',    // 运输中
  CUSTOMS = 'customs',          // 海关清关中
  OUT_FOR_DELIVERY = 'out_for_delivery', // 派送中
  DELIVERED = 'delivered',      // 已送达
  FAILED = 'failed',           // 配送失败
  RETURNED = 'returned'        // 退回
}

// 物流提供商枚举
export enum LogisticsProvider {
  DHL = 'dhl',
  FEDEX = 'fedex',
  UPS = 'ups',
  EMS = 'ems',
  SF_EXPRESS = 'sf_express',    // 顺丰
  RUSSIAN_POST = 'russian_post', // 俄罗斯邮政
  SPSR = 'spsr',               // СПСР
  CDEK = 'cdek'                // СДЭК
}

// 物流文档类型
export enum DocumentType {
  BILL_OF_LADING = 'bill_of_lading',         // 提单
  COMMERCIAL_INVOICE = 'commercial_invoice',  // 商业发票
  PACKING_LIST = 'packing_list',             // 装箱单
  CERTIFICATE_OF_ORIGIN = 'certificate_of_origin', // 原产地证书
  CUSTOMS_DECLARATION = 'customs_declaration', // 报关单
  INSURANCE_CERTIFICATE = 'insurance_certificate', // 保险凭证
  EXPORT_LICENSE = 'export_license',         // 出口许可证
  PHYTOSANITARY = 'phytosanitary'           // 植检证书
}

// 物流文档接口
export interface LogisticsDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  hash: string;                  // 文档哈希值
  uploadedAt: Date;
  uploadedBy: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  isVerified: boolean;
  metadata: {
    fileSize: number;
    mimeType: string;
    checksum: string;
  };
}

// 物流跟踪点接口
export interface TrackingPoint {
  id: string;
  timestamp: Date;
  location: {
    city: string;
    country: string;
    countryCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  status: LogisticsStatus;
  description: string;
  localDescription?: string;     // 本地语言描述
  facility?: string;             // 设施名称
  nextLocation?: string;         // 下一站
  estimatedArrival?: Date;       // 预计到达时间
}

// 物流订单接口
export interface LogisticsOrder {
  id: string;
  escrowOrderId: number;         // 对应的智能合约订单ID
  trackingNumber: string;
  provider: LogisticsProvider;
  
  // 发货信息
  sender: {
    name: string;
    company?: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
  };
  
  // 收货信息
  recipient: {
    name: string;
    company?: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
  };
  
  // 货物信息
  goods: {
    description: string;
    category: string;
    weight: number;             // 重量 (kg)
    dimensions: {
      length: number;           // 长度 (cm)
      width: number;            // 宽度 (cm)
      height: number;           // 高度 (cm)
    };
    value: number;              // 货值 (USD)
    hsCode?: string;            // 海关编码
    quantity: number;
    unitPrice: number;
  };
  
  // 物流状态
  status: LogisticsStatus;
  trackingPoints: TrackingPoint[];
  documents: LogisticsDocument[];
  
  // 时间信息
  createdAt: Date;
  shippedAt?: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  
  // 特殊标记
  isExpress: boolean;
  isInsured: boolean;
  requiresSignature: boolean;
  customsDeclarationNumber?: string;
  
  // 费用信息
  costs: {
    shipping: number;
    insurance: number;
    customs: number;
    total: number;
    currency: string;
  };
}

// 物流验证结果
export interface LogisticsVerification {
  orderId: string;
  isVerified: boolean;
  verifiedAt: Date;
  verifiedBy: string;
  confidence: number;           // 验证可信度 (0-1)
  checks: {
    documentIntegrity: boolean;  // 文档完整性
    trackingConsistency: boolean; // 跟踪一致性
    timelineLogical: boolean;    // 时间线合理性
    providerAuthenticity: boolean; // 提供商真实性
  };
  issues: string[];             // 发现的问题
  recommendations: string[];     // 建议
}

/**
 * 物流验证服务
 * 处理国际物流跟踪、文档验证和状态更新
 */
export class LogisticsService extends EventEmitter {
  private orders: Map<string, LogisticsOrder> = new Map();
  private trackingCache: Map<string, TrackingPoint[]> = new Map();
  
  // 物流提供商API配置
  private providerAPIs: Record<LogisticsProvider, any> = {
    [LogisticsProvider.DHL]: {
      baseUrl: 'https://api-eu.dhl.com/track/shipments',
      apiKey: process.env.DHL_API_KEY,
      trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB='
    },
    [LogisticsProvider.FEDEX]: {
      baseUrl: 'https://apis.fedex.com/track/v1/trackingnumbers',
      apiKey: process.env.FEDEX_API_KEY,
      trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr='
    },
    [LogisticsProvider.UPS]: {
      baseUrl: 'https://onlinetools.ups.com/api/track',
      apiKey: process.env.UPS_API_KEY,
      trackingUrl: 'https://www.ups.com/track?tracknum='
    },
    [LogisticsProvider.EMS]: {
      baseUrl: 'http://www.ems.com.cn/mailtracking/ems_cn_track_api',
      trackingUrl: 'http://www.ems.com.cn/mailtracking/you_jian_cha_xun.html?mailNum='
    },
    [LogisticsProvider.SF_EXPRESS]: {
      baseUrl: 'https://bsp-oisp.sf-express.com/bsp-oisp/sfexpressService',
      apiKey: process.env.SF_API_KEY,
      trackingUrl: 'https://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/'
    },
    [LogisticsProvider.RUSSIAN_POST]: {
      baseUrl: 'https://tracking.pochta.ru/api/v1/trackings/by-barcodes',
      apiKey: process.env.RUSSIAN_POST_API_KEY,
      trackingUrl: 'https://www.pochta.ru/tracking#'
    },
    [LogisticsProvider.SPSR]: {
      baseUrl: 'https://spsr.ru/ajax/search_simple.php',
      trackingUrl: 'https://spsr.ru/search/?type=0&value='
    },
    [LogisticsProvider.CDEK]: {
      baseUrl: 'https://api.cdek.ru/v2/orders',
      apiKey: process.env.CDEK_API_KEY,
      trackingUrl: 'https://www.cdek.ru/ru/tracking?order_id='
    }
  };

  constructor() {
    super();
    this.startPeriodicTracking();
  }

  /**
   * 创建物流订单
   */
  async createLogisticsOrder(orderData: Omit<LogisticsOrder, 'id' | 'createdAt' | 'status' | 'trackingPoints'>): Promise<LogisticsOrder> {
    const order: LogisticsOrder = {
      ...orderData,
      id: `LOG-${Date.now()}`,
      status: LogisticsStatus.PENDING,
      trackingPoints: [],
      createdAt: new Date()
    };

    this.orders.set(order.id, order);
    
    // 发送创建事件
    this.emit('orderCreated', order);
    
    return order;
  }

  /**
   * 确认发货并开始跟踪
   */
  async confirmShipment(
    orderId: string, 
    trackingNumber: string, 
    provider: LogisticsProvider,
    documents: LogisticsDocument[]
  ): Promise<LogisticsOrder> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('物流订单不存在');
    }

    order.trackingNumber = trackingNumber;
    order.provider = provider;
    order.documents = documents;
    order.status = LogisticsStatus.PICKED_UP;
    order.shippedAt = new Date();

    // 添加发货跟踪点
    const shippedPoint: TrackingPoint = {
      id: `TP-${Date.now()}`,
      timestamp: new Date(),
      location: {
        city: order.sender.city,
        country: order.sender.country,
        countryCode: this.getCountryCode(order.sender.country)
      },
      status: LogisticsStatus.PICKED_UP,
      description: 'Package picked up and shipment created',
      localDescription: '包裹已提取，运单已创建',
      facility: 'Origin Facility'
    };

    order.trackingPoints.push(shippedPoint);
    this.orders.set(orderId, order);

    // 开始跟踪
    this.startTracking(trackingNumber, provider);
    
    this.emit('shipmentConfirmed', order);
    return order;
  }

  /**
   * 开始跟踪物流
   */
  private async startTracking(trackingNumber: string, provider: LogisticsProvider): Promise<void> {
    try {
      const trackingData = await this.fetchTrackingData(trackingNumber, provider);
      this.trackingCache.set(trackingNumber, trackingData);
      
      // 更新相关订单
      const order = Array.from(this.orders.values()).find(o => o.trackingNumber === trackingNumber);
      if (order) {
        order.trackingPoints = trackingData;
        this.updateOrderStatus(order);
        this.orders.set(order.id, order);
        this.emit('trackingUpdated', order);
      }
    } catch (error) {
      console.error(`跟踪物流失败 ${trackingNumber}:`, error);
    }
  }

  /**
   * 从物流提供商获取跟踪数据
   */
  private async fetchTrackingData(trackingNumber: string, provider: LogisticsProvider): Promise<TrackingPoint[]> {
    const config = this.providerAPIs[provider];
    if (!config) {
      throw new Error(`不支持的物流提供商: ${provider}`);
    }

    // 根据不同提供商调用相应API
    switch (provider) {
      case LogisticsProvider.DHL:
      case LogisticsProvider.FEDEX:
      case LogisticsProvider.RUSSIAN_POST:
        // 这里应该实现真实的API调用
        // 暂时返回模拟数据
        return this.generateMockTrackingData(trackingNumber);
      default:
        // 模拟跟踪数据
        return this.generateMockTrackingData(trackingNumber);
    }
  }

  /**
   * 生成模拟跟踪数据 (用于测试)
   */
  private generateMockTrackingData(trackingNumber: string): TrackingPoint[] {
    const points: TrackingPoint[] = [
      {
        id: `TP-${Date.now()}-1`,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
        location: {
          city: 'Shenzhen',
          country: 'China',
          countryCode: 'CN',
          coordinates: { lat: 22.5431, lng: 114.0579 }
        },
        status: LogisticsStatus.PICKED_UP,
        description: 'Package picked up from sender',
        localDescription: '包裹已从发件人处提取',
        facility: 'Shenzhen International Mail Exchange'
      },
      {
        id: `TP-${Date.now()}-2`,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4天前
        location: {
          city: 'Guangzhou',
          country: 'China',
          countryCode: 'CN',
          coordinates: { lat: 23.1291, lng: 113.2644 }
        },
        status: LogisticsStatus.IN_TRANSIT,
        description: 'Package in transit to international gateway',
        localDescription: '包裹正在运往国际转运中心',
        facility: 'Guangzhou International Hub',
        nextLocation: 'Moscow'
      },
      {
        id: `TP-${Date.now()}-3`,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        location: {
          city: 'Moscow',
          country: 'Russia',
          countryCode: 'RU',
          coordinates: { lat: 55.7558, lng: 37.6176 }
        },
        status: LogisticsStatus.CUSTOMS,
        description: 'Package arrived at customs for clearance',
        localDescription: 'Посылка прибыла на таможню для оформления',
        facility: 'Moscow International Airport Customs',
        estimatedArrival: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 明天
      }
    ];

    return points;
  }

  /**
   * 更新订单状态
   */
  private updateOrderStatus(order: LogisticsOrder): void {
    if (order.trackingPoints.length === 0) return;

    const latestPoint = order.trackingPoints[order.trackingPoints.length - 1];
    order.status = latestPoint.status;

    // 更新预计送达时间
    if (latestPoint.estimatedArrival) {
      order.estimatedDelivery = latestPoint.estimatedArrival;
    }

    // 如果已送达，记录实际送达时间
    if (order.status === LogisticsStatus.DELIVERED && !order.actualDelivery) {
      order.actualDelivery = latestPoint.timestamp;
    }
  }

  /**
   * 上传物流文档
   */
  async uploadDocument(
    orderId: string,
    type: DocumentType,
    file: {
      name: string;
      data: Buffer;
      mimeType: string;
    },
    uploadedBy: string
  ): Promise<LogisticsDocument> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('物流订单不存在');
    }

    // 计算文件哈希
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(file.data).digest('hex');
    const checksum = crypto.createHash('md5').update(file.data).digest('hex');

    // 模拟文件上传到云存储
    const fileUrl = `https://storage.tribridge.com/logistics/${orderId}/${type}_${Date.now()}.pdf`;

    const document: LogisticsDocument = {
      id: `DOC-${Date.now()}`,
      type,
      name: file.name,
      url: fileUrl,
      hash,
      uploadedAt: new Date(),
      uploadedBy,
      isVerified: false,
      metadata: {
        fileSize: file.data.length,
        mimeType: file.mimeType,
        checksum
      }
    };

    order.documents.push(document);
    this.orders.set(orderId, order);

    this.emit('documentUploaded', { orderId, document });
    return document;
  }

  /**
   * 验证物流文档
   */
  async verifyDocument(documentId: string, verifiedBy: string): Promise<LogisticsDocument> {
    for (const order of this.orders.values()) {
      const document = order.documents.find(doc => doc.id === documentId);
      if (document) {
        document.isVerified = true;
        document.verifiedAt = new Date();
        document.verifiedBy = verifiedBy;
        
        this.orders.set(order.id, order);
        this.emit('documentVerified', { orderId: order.id, document });
        return document;
      }
    }
    
    throw new Error('文档不存在');
  }

  /**
   * 验证整个物流订单
   */
  async verifyLogisticsOrder(orderId: string, verifiedBy: string): Promise<LogisticsVerification> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('物流订单不存在');
    }

    const verification: LogisticsVerification = {
      orderId,
      isVerified: false,
      verifiedAt: new Date(),
      verifiedBy,
      confidence: 0,
      checks: {
        documentIntegrity: false,
        trackingConsistency: false,
        timelineLogical: false,
        providerAuthenticity: false
      },
      issues: [],
      recommendations: []
    };

    // 检查文档完整性
    const requiredDocs = [DocumentType.BILL_OF_LADING, DocumentType.COMMERCIAL_INVOICE];
    const hasRequiredDocs = requiredDocs.every(type => 
      order.documents.some(doc => doc.type === type && doc.isVerified)
    );
    verification.checks.documentIntegrity = hasRequiredDocs;
    if (!hasRequiredDocs) {
      verification.issues.push('缺少必要的验证文档');
    }

    // 检查跟踪一致性
    verification.checks.trackingConsistency = order.trackingPoints.length > 0;
    if (!verification.checks.trackingConsistency) {
      verification.issues.push('缺少有效的跟踪信息');
    }

    // 检查时间线合理性
    verification.checks.timelineLogical = this.validateTimeline(order);
    if (!verification.checks.timelineLogical) {
      verification.issues.push('物流时间线存在异常');
    }

    // 检查提供商真实性
    verification.checks.providerAuthenticity = this.validateProvider(order.provider);

    // 计算可信度
    const checkCount = Object.values(verification.checks).filter(Boolean).length;
    verification.confidence = checkCount / 4;
    verification.isVerified = verification.confidence >= 0.75;

    if (!verification.isVerified) {
      verification.recommendations.push('建议人工审核物流信息');
    }

    this.emit('logisticsVerified', verification);
    return verification;
  }

  /**
   * 验证时间线合理性
   */
  private validateTimeline(order: LogisticsOrder): boolean {
    if (order.trackingPoints.length < 2) return false;

    // 检查时间戳是否按顺序
    for (let i = 1; i < order.trackingPoints.length; i++) {
      if (order.trackingPoints[i].timestamp < order.trackingPoints[i-1].timestamp) {
        return false;
      }
    }

    return true;
  }

  /**
   * 验证物流提供商
   */
  private validateProvider(provider: LogisticsProvider): boolean {
    return Object.values(LogisticsProvider).includes(provider);
  }

  /**
   * 获取国家代码
   */
  private getCountryCode(country: string): string {
    const codes: { [key: string]: string } = {
      'China': 'CN',
      'Russia': 'RU',
      'United States': 'US',
      'Germany': 'DE',
      'Japan': 'JP'
    };
    return codes[country] || 'XX';
  }

  /**
   * 定期跟踪更新
   */
  private startPeriodicTracking(): void {
    setInterval(() => {
      this.updateAllTracking();
    }, 60 * 60 * 1000); // 每小时更新一次
  }

  /**
   * 更新所有活跃的跟踪
   */
  private async updateAllTracking(): Promise<void> {
    const activeOrders = Array.from(this.orders.values()).filter(
      order => order.status !== LogisticsStatus.DELIVERED && 
               order.status !== LogisticsStatus.FAILED &&
               order.trackingNumber
    );

    for (const order of activeOrders) {
      try {
        await this.startTracking(order.trackingNumber, order.provider);
      } catch (error) {
        console.error(`更新跟踪失败 ${order.trackingNumber}:`, error);
      }
    }
  }

  /**
   * 获取物流订单
   */
  getLogisticsOrder(orderId: string): LogisticsOrder | null {
    return this.orders.get(orderId) || null;
  }

  /**
   * 根据智能合约订单ID获取物流订单
   */
  getLogisticsOrderByEscrowId(escrowOrderId: number): LogisticsOrder | null {
    return Array.from(this.orders.values()).find(
      order => order.escrowOrderId === escrowOrderId
    ) || null;
  }

  /**
   * 获取用户的物流订单
   */
  getUserLogisticsOrders(userId: string): LogisticsOrder[] {
    // 这里需要根据用户ID过滤，简化实现
    return Array.from(this.orders.values());
  }
}

export const logisticsService = new LogisticsService();
export default logisticsService;