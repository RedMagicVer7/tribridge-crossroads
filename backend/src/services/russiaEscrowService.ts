import { ethers } from 'ethers';

// 智能合约ABI (需要编译后获取完整ABI)
const RUSSIA_ESCROW_ABI = [
  // 主要函数接口
  "function createOrder(address seller, uint256 amount, uint256 rubAmount, uint256 exchangeRate, string memory goodsDescription, string memory deliveryInfo, uint256 deliveryDeadline, bool isMultiSig, address[] memory arbitrators) external returns (uint256)",
  "function fundOrder(uint256 orderId) external",
  "function confirmShipment(uint256 orderId, string memory billOfLading, string memory trackingNumber, string memory customsDeclaration, string memory insuranceCert) external",
  "function confirmDelivery(uint256 orderId) external",
  "function autoReleaseOrder(uint256 orderId) external",
  "function raiseDispute(uint256 orderId, string memory reason) external",
  "function resolveDispute(uint256 orderId, string memory resolution, bool favorBuyer) external",
  "function cancelOrder(uint256 orderId, string memory reason) external",
  "function getOrder(uint256 orderId) external view returns (tuple(uint256 orderId, address buyer, address seller, uint256 amount, uint256 rubAmount, uint256 exchangeRate, string goodsDescription, string deliveryInfo, uint8 status, uint8 logisticsStatus, uint256 createdAt, uint256 deliveryDeadline, uint256 autoReleaseTime, string billOfLading, string trackingNumber, bool isMultiSig, address[] arbitrators))",
  "function getUserOrders(address user) external view returns (uint256[])",
  "function getDispute(uint256 orderId) external view returns (tuple(uint256 orderId, address initiator, string reason, uint256 createdAt, bool resolved, address resolver, string resolution))",
  
  // 事件
  "event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 amount, uint256 rubAmount)",
  "event OrderFunded(uint256 indexed orderId, uint256 amount)",
  "event OrderShipped(uint256 indexed orderId, string billOfLading, string trackingNumber)",
  "event OrderDelivered(uint256 indexed orderId)",
  "event OrderCompleted(uint256 indexed orderId, uint256 feeAmount)",
  "event DisputeRaised(uint256 indexed orderId, address indexed initiator, string reason)",
  
  // 状态函数
  "function nextOrderId() external view returns (uint256)",
  "function platformFeeRate() external view returns (uint256)",
  "function totalOrdersCreated() external view returns (uint256)",
  "function totalVolumeTraded() external view returns (uint256)",
];

// 合约配置
const CONTRACT_CONFIG = {
  polygon: {
    contractAddress: process.env.RUSSIA_ESCROW_CONTRACT_POLYGON || '',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    usdtAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  },
  mumbai: {
    contractAddress: process.env.RUSSIA_ESCROW_CONTRACT_MUMBAI || '',
    rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    usdtAddress: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB'
  }
};

// 订单状态枚举
export enum OrderStatus {
  Created = 0,
  Funded = 1,
  Shipped = 2,
  Delivered = 3,
  Completed = 4,
  Disputed = 5,
  Cancelled = 6,
  Refunded = 7
}

// 物流状态枚举
export enum LogisticsStatus {
  Pending = 0,
  InTransit = 1,
  Delivered = 2,
  Failed = 3
}

// 接口定义
export interface RussiaEscrowOrder {
  orderId: number;
  buyer: string;
  seller: string;
  amount: string;
  rubAmount: string;
  exchangeRate: string;
  goodsDescription: string;
  deliveryInfo: string;
  status: OrderStatus;
  logisticsStatus: LogisticsStatus;
  createdAt: number;
  deliveryDeadline: number;
  autoReleaseTime: number;
  billOfLading: string;
  trackingNumber: string;
  isMultiSig: boolean;
  arbitrators: string[];
}

export interface EscrowDispute {
  orderId: number;
  initiator: string;
  reason: string;
  createdAt: number;
  resolved: boolean;
  resolver: string;
  resolution: string;
}

export interface CreateOrderParams {
  seller: string;
  amount: string;
  rubAmount: string;
  exchangeRate: string;
  goodsDescription: string;
  deliveryInfo: string;
  deliveryDeadline: number;
  isMultiSig: boolean;
  arbitrators: string[];
}

export interface ShipmentInfo {
  billOfLading: string;
  trackingNumber: string;
  customsDeclaration: string;
  insuranceCert: string;
}

/**
 * 俄罗斯智能合约托管服务
 */
export class RussiaEscrowService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private network: 'polygon' | 'mumbai';

  constructor(network: 'polygon' | 'mumbai' = 'polygon') {
    this.network = network;
    const config = CONTRACT_CONFIG[network];
    
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.contract = new ethers.Contract(
      config.contractAddress,
      RUSSIA_ESCROW_ABI,
      this.provider
    );
  }

  /**
   * 获取带签名器的合约实例
   */
  private getContractWithSigner(privateKey: string): ethers.Contract {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const config = CONTRACT_CONFIG[this.network];
    return new ethers.Contract(
      config.contractAddress,
      RUSSIA_ESCROW_ABI,
      wallet
    );
  }

  /**
   * 创建托管订单
   */
  async createOrder(
    buyerPrivateKey: string,
    params: CreateOrderParams
  ): Promise<{ orderId: number; txHash: string }> {
    try {
      const contractWithSigner = this.getContractWithSigner(buyerPrivateKey);
      
      const tx = await contractWithSigner.createOrder(
        params.seller,
        ethers.parseUnits(params.amount, 6), // USDT 6位小数
        ethers.parseUnits(params.rubAmount, 18),
        ethers.parseUnits(params.exchangeRate, 18),
        params.goodsDescription,
        params.deliveryInfo,
        params.deliveryDeadline,
        params.isMultiSig,
        params.arbitrators
      );

      const receipt = await tx.wait();
      
      // 从事件中提取orderId
      const orderCreatedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'OrderCreated'
      );
      
      const orderId = orderCreatedEvent ? Number(orderCreatedEvent.args[0]) : 0;
      
      return {
        orderId,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
  }

  /**
   * 买方充值USDT到托管合约
   */
  async fundOrder(
    buyerPrivateKey: string,
    orderId: number
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(buyerPrivateKey);
      const tx = await contractWithSigner.fundOrder(orderId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('充值订单失败:', error);
      throw error;
    }
  }

  /**
   * 卖方确认发货
   */
  async confirmShipment(
    sellerPrivateKey: string,
    orderId: number,
    shipmentInfo: ShipmentInfo
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(sellerPrivateKey);
      const tx = await contractWithSigner.confirmShipment(
        orderId,
        shipmentInfo.billOfLading,
        shipmentInfo.trackingNumber,
        shipmentInfo.customsDeclaration,
        shipmentInfo.insuranceCert
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('确认发货失败:', error);
      throw error;
    }
  }

  /**
   * 买方确认收货
   */
  async confirmDelivery(
    buyerPrivateKey: string,
    orderId: number
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(buyerPrivateKey);
      const tx = await contractWithSigner.confirmDelivery(orderId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('确认收货失败:', error);
      throw error;
    }
  }

  /**
   * 自动释放订单（15天后）
   */
  async autoReleaseOrder(orderId: number): Promise<string> {
    try {
      // 使用平台管理员私钥
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY || '';
      const contractWithSigner = this.getContractWithSigner(adminPrivateKey);
      const tx = await contractWithSigner.autoReleaseOrder(orderId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('自动释放订单失败:', error);
      throw error;
    }
  }

  /**
   * 发起争议
   */
  async raiseDispute(
    userPrivateKey: string,
    orderId: number,
    reason: string
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(userPrivateKey);
      const tx = await contractWithSigner.raiseDispute(orderId, reason);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('发起争议失败:', error);
      throw error;
    }
  }

  /**
   * 仲裁员解决争议
   */
  async resolveDispute(
    arbitratorPrivateKey: string,
    orderId: number,
    resolution: string,
    favorBuyer: boolean
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(arbitratorPrivateKey);
      const tx = await contractWithSigner.resolveDispute(orderId, resolution, favorBuyer);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('解决争议失败:', error);
      throw error;
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(
    userPrivateKey: string,
    orderId: number,
    reason: string
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(userPrivateKey);
      const tx = await contractWithSigner.cancelOrder(orderId, reason);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('取消订单失败:', error);
      throw error;
    }
  }

  /**
   * 获取订单详情
   */
  async getOrder(orderId: number): Promise<RussiaEscrowOrder> {
    try {
      const order = await this.contract.getOrder(orderId);
      return {
        orderId: Number(order.orderId),
        buyer: order.buyer,
        seller: order.seller,
        amount: ethers.formatUnits(order.amount, 6),
        rubAmount: ethers.formatUnits(order.rubAmount, 18),
        exchangeRate: ethers.formatUnits(order.exchangeRate, 18),
        goodsDescription: order.goodsDescription,
        deliveryInfo: order.deliveryInfo,
        status: Number(order.status),
        logisticsStatus: Number(order.logisticsStatus),
        createdAt: Number(order.createdAt),
        deliveryDeadline: Number(order.deliveryDeadline),
        autoReleaseTime: Number(order.autoReleaseTime),
        billOfLading: order.billOfLading,
        trackingNumber: order.trackingNumber,
        isMultiSig: order.isMultiSig,
        arbitrators: order.arbitrators
      };
    } catch (error) {
      console.error('获取订单失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户订单列表
   */
  async getUserOrders(userAddress: string): Promise<number[]> {
    try {
      const orderIds = await this.contract.getUserOrders(userAddress);
      return orderIds.map((id: any) => Number(id));
    } catch (error) {
      console.error('获取用户订单失败:', error);
      throw error;
    }
  }

  /**
   * 获取争议信息
   */
  async getDispute(orderId: number): Promise<EscrowDispute> {
    try {
      const dispute = await this.contract.getDispute(orderId);
      return {
        orderId: Number(dispute.orderId),
        initiator: dispute.initiator,
        reason: dispute.reason,
        createdAt: Number(dispute.createdAt),
        resolved: dispute.resolved,
        resolver: dispute.resolver,
        resolution: dispute.resolution
      };
    } catch (error) {
      console.error('获取争议信息失败:', error);
      throw error;
    }
  }

  /**
   * 监听合约事件
   */
  async subscribeToEvents(callback: (event: any) => void): Promise<void> {
    this.contract.on('OrderCreated', (orderId, buyer, seller, amount, rubAmount, event) => {
      callback({
        type: 'OrderCreated',
        orderId: Number(orderId),
        buyer,
        seller,
        amount: ethers.formatUnits(amount, 6),
        rubAmount: ethers.formatUnits(rubAmount, 18),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });

    this.contract.on('OrderFunded', (orderId, amount, event) => {
      callback({
        type: 'OrderFunded',
        orderId: Number(orderId),
        amount: ethers.formatUnits(amount, 6),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });

    this.contract.on('OrderShipped', (orderId, billOfLading, trackingNumber, event) => {
      callback({
        type: 'OrderShipped',
        orderId: Number(orderId),
        billOfLading,
        trackingNumber,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });

    this.contract.on('OrderDelivered', (orderId, event) => {
      callback({
        type: 'OrderDelivered',
        orderId: Number(orderId),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });

    this.contract.on('OrderCompleted', (orderId, feeAmount, event) => {
      callback({
        type: 'OrderCompleted',
        orderId: Number(orderId),
        feeAmount: ethers.formatUnits(feeAmount, 6),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });

    this.contract.on('DisputeRaised', (orderId, initiator, reason, event) => {
      callback({
        type: 'DisputeRaised',
        orderId: Number(orderId),
        initiator,
        reason,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });
  }

  /**
   * 获取合约统计信息
   */
  async getContractStats(): Promise<{
    totalOrdersCreated: number;
    totalVolumeTraded: string;
    platformFeeRate: number;
    nextOrderId: number;
  }> {
    try {
      const [totalOrders, totalVolume, feeRate, nextId] = await Promise.all([
        this.contract.totalOrdersCreated(),
        this.contract.totalVolumeTraded(),
        this.contract.platformFeeRate(),
        this.contract.nextOrderId()
      ]);

      return {
        totalOrdersCreated: Number(totalOrders),
        totalVolumeTraded: ethers.formatUnits(totalVolume, 6),
        platformFeeRate: Number(feeRate),
        nextOrderId: Number(nextId)
      };
    } catch (error) {
      console.error('获取合约统计失败:', error);
      throw error;
    }
  }
}

export default RussiaEscrowService;