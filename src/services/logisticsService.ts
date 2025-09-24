/**
 * 物流追踪服务
 * 处理货物追踪和物流状态管理
 */

export interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Shipment {
  id: string;
  from: string;
  to: string;
  fromAddress: string;
  toAddress: string;
  status: 'created' | 'shipped' | 'in_transit' | 'customs' | 'out_for_delivery' | 'delivered' | 'exception';
  value: string;
  currency: string;
  productType: string;
  weight: number;
  dimensions: string;
  carrier: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  progress: number;
  events: TrackingEvent[];
}

export interface LogisticsProvider {
  id: string;
  name: string;
  type: 'sea' | 'air' | 'land' | 'rail';
  coverage: string[];
  transitTime: string;
  reliability: number;
}

class LogisticsService {
  private baseUrl = '/api/logistics';

  /**
   * 根据追踪号获取货物信息
   */
  async getShipmentByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockShipments: { [key: string]: Shipment } = {
      'TRI-RU-2024-001': {
        id: 'TRI-RU-2024-001',
        from: '上海',
        to: '莫斯科',
        fromAddress: '上海市浦东新区张江高科技园区',
        toAddress: '莫斯科市中央区红场附近工业区',
        status: 'delivered',
        value: '25,000',
        currency: 'USDT',
        productType: '重型挖掘设备',
        weight: 15000,
        dimensions: '12m x 3m x 3.5m',
        carrier: '中俄物流联运',
        estimatedDelivery: '2024-01-20',
        actualDelivery: '2024-01-20',
        progress: 100,
        events: [
          {
            id: '1',
            timestamp: '2024-01-20 14:30',
            location: '莫斯科物流中心',
            status: 'delivered',
            description: '货物已送达收货人'
          },
          {
            id: '2',
            timestamp: '2024-01-20 09:15',
            location: '莫斯科配送站',
            status: 'out_for_delivery',
            description: '货物派送中'
          },
          {
            id: '3',
            timestamp: '2024-01-19 16:45',
            location: '莫斯科海关',
            status: 'customs_cleared',
            description: '海关清关完成'
          },
          {
            id: '4',
            timestamp: '2024-01-18 11:20',
            location: '符拉迪沃斯托克港',
            status: 'arrived_port',
            description: '货物抵达目的港'
          },
          {
            id: '5',
            timestamp: '2024-01-15 08:30',
            location: '上海港',
            status: 'departed',
            description: '货物离港'
          },
          {
            id: '6',
            timestamp: '2024-01-10 10:00',
            location: '上海制造工厂',
            status: 'shipped',
            description: '货物已发出'
          }
        ]
      },
      'TRI-RU-2024-002': {
        id: 'TRI-RU-2024-002',
        from: '广州',
        to: '圣彼得堡',
        fromAddress: '广州市黄埔区经济技术开发区',
        toAddress: '圣彼得堡工业园区',
        status: 'in_transit',
        value: '15,000',
        currency: 'USDT',
        productType: '矿业设备',
        weight: 8500,
        dimensions: '8m x 2.5m x 2.8m',
        carrier: '欧亚大陆桥运输',
        estimatedDelivery: '2024-01-25',
        progress: 65,
        events: [
          {
            id: '1',
            timestamp: '2024-01-18 16:20',
            location: '莫斯科中转站',
            status: 'in_transit',
            description: '货物正在运输中'
          },
          {
            id: '2',
            timestamp: '2024-01-16 12:00',
            location: '新西伯利亚',
            status: 'in_transit',
            description: '货物通过新西伯利亚'
          },
          {
            id: '3',
            timestamp: '2024-01-12 08:45',
            location: '满洲里边境',
            status: 'customs_cleared',
            description: '边境海关检查完成'
          },
          {
            id: '4',
            timestamp: '2024-01-08 14:30',
            location: '广州港',
            status: 'shipped',
            description: '货物已发出'
          }
        ]
      }
    };

    return mockShipments[trackingNumber] || null;
  }

  /**
   * 获取用户的所有货运信息
   */
  async getUserShipments(userId: string): Promise<Shipment[]> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: 'TRI-RU-2024-001',
        from: '上海',
        to: '莫斯科',
        fromAddress: '上海市浦东新区',
        toAddress: '莫斯科市中央区',
        status: 'delivered',
        value: '25,000',
        currency: 'USDT',
        productType: '重型挖掘设备',
        weight: 15000,
        dimensions: '12m x 3m x 3.5m',
        carrier: '中俄物流联运',
        estimatedDelivery: '2024-01-20',
        actualDelivery: '2024-01-20',
        progress: 100,
        events: []
      },
      {
        id: 'TRI-RU-2024-002',
        from: '广州',
        to: '圣彼得堡',
        fromAddress: '广州市黄埔区',
        toAddress: '圣彼得堡工业园区',
        status: 'in_transit',
        value: '15,000',
        currency: 'USDT',
        productType: '矿业设备',
        weight: 8500,
        dimensions: '8m x 2.5m x 2.8m',
        carrier: '欧亚大陆桥运输',
        estimatedDelivery: '2024-01-25',
        progress: 65,
        events: []
      },
      {
        id: 'TRI-RU-2024-003',
        from: '深圳',
        to: '新西伯利亚',
        fromAddress: '深圳市南山区科技园',
        toAddress: '新西伯利亚工业区',
        status: 'customs',
        value: '35,000',
        currency: 'USDT',
        productType: '能源设备',
        weight: 12000,
        dimensions: '10m x 3m x 3m',
        carrier: '跨境专线物流',
        estimatedDelivery: '2024-01-30',
        progress: 45,
        events: []
      }
    ];
  }

  /**
   * 获取物流统计信息
   */
  async getLogisticsStats(userId?: string): Promise<{
    inTransit: number;
    delivered: number;
    averageDeliveryTime: number;
    deliveryRate: number;
  }> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      inTransit: 8,
      delivered: 156,
      averageDeliveryTime: 12, // 天
      deliveryRate: 98.5 // 百分比
    };
  }

  /**
   * 获取可用的物流服务商
   */
  async getLogisticsProviders(): Promise<LogisticsProvider[]> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      {
        id: 'sea-1',
        name: '中俄海运专线',
        type: 'sea',
        coverage: ['中国', '俄罗斯'],
        transitTime: '15-20天',
        reliability: 95
      },
      {
        id: 'land-1',
        name: '欧亚大陆桥',
        type: 'land',
        coverage: ['中国', '俄罗斯', '中亚'],
        transitTime: '8-12天',
        reliability: 92
      },
      {
        id: 'air-1',
        name: '中俄航空货运',
        type: 'air',
        coverage: ['中国', '俄罗斯'],
        transitTime: '3-5天',
        reliability: 98
      },
      {
        id: 'rail-1',
        name: '中欧班列',
        type: 'rail',
        coverage: ['中国', '俄罗斯', '欧洲'],
        transitTime: '10-15天',
        reliability: 94
      }
    ];
  }

  /**
   * 创建新的货运订单
   */
  async createShipment(shipmentData: Omit<Shipment, 'id' | 'events' | 'progress' | 'status'>): Promise<Shipment> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newShipment: Shipment = {
      ...shipmentData,
      id: `TRI-RU-${Date.now()}`,
      status: 'created',
      progress: 0,
      events: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          location: shipmentData.from,
          status: 'created',
          description: '货运订单已创建'
        }
      ]
    };

    return newShipment;
  }

  /**
   * 获取货物追踪的地图坐标
   */
  async getTrackingCoordinates(trackingNumber: string): Promise<{ lat: number; lng: number; }[]> {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 返回中俄贸易路线的关键坐标点
    return [
      { lat: 31.2304, lng: 121.4737 }, // 上海
      { lat: 43.8563, lng: 125.3245 }, // 满洲里
      { lat: 55.0084, lng: 82.9357 },  // 新西伯利亚
      { lat: 55.7558, lng: 37.6176 }   // 莫斯科
    ];
  }
}

export const logisticsService = new LogisticsService();