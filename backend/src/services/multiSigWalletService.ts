import { ethers } from 'ethers';
import { EventEmitter } from 'events';

// 多签钱包ABI (简化版本)
const MULTISIG_WALLET_ABI = [
  "function proposeTransaction(address to, uint256 value, address token, bytes data, string reason) external returns (uint256)",
  "function approveTransaction(uint256 txId) external",
  "function executeTransaction(uint256 txId) external",
  "function cancelTransaction(uint256 txId, string reason) external",
  "function createDispute(uint256 escrowOrderId, address buyer, address seller, uint256 amount, address token, string reason) external returns (uint256)",
  "function voteOnDispute(uint256 disputeId, bool favorBuyer) external",
  "function resolveDispute(uint256 disputeId, bool favorBuyer, string resolution) external",
  "function getTransaction(uint256 txId) external view returns (address proposer, address to, uint256 value, address token, bytes data, string reason, bool executed, bool cancelled, uint256 approvalCount, uint256 proposedAt)",
  "function getDispute(uint256 disputeId) external view returns (uint256 escrowOrderId, address initiator, address buyer, address seller, uint256 amount, address token, string reason, bool resolved, address resolver, bool favorBuyer, string resolution, uint256 voteCount)",
  "function hasApproved(uint256 txId, address arbitrator) external view returns (bool)",
  "function getBalance(address token) external view returns (uint256)",
  "function getSupportedTokens() external view returns (address[])",
  "function requiredApprovals() external view returns (uint256)",
  "function totalArbitrators() external view returns (uint256)",
  "function isArbitrator(address account) external view returns (bool)",
  
  // 事件
  "event TransactionProposed(uint256 indexed txId, address indexed proposer, address indexed to, uint256 value, address token, bytes data, string reason)",
  "event TransactionApproved(uint256 indexed txId, address indexed approver)",
  "event TransactionExecuted(uint256 indexed txId, address indexed executor, bool success)",
  "event DisputeCreated(uint256 indexed disputeId, uint256 indexed escrowOrderId, address indexed initiator, string reason)",
  "event DisputeResolved(uint256 indexed disputeId, address indexed resolver, bool favorBuyer, string resolution)"
];

// 多签交易状态
export enum MultiSigTransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// 争议状态
export enum DisputeStatus {
  OPEN = 'open',
  VOTING = 'voting',
  RESOLVED = 'resolved',
  EXPIRED = 'expired'
}

// 多签交易接口
export interface MultiSigTransaction {
  id: number;
  proposer: string;
  to: string;
  value: string;
  token: string;
  data: string;
  reason: string;
  executed: boolean;
  cancelled: boolean;
  approvalCount: number;
  proposedAt: number;
  status: MultiSigTransactionStatus;
  approvals: string[];
  requiredApprovals: number;
}

// 争议接口
export interface Dispute {
  id: number;
  escrowOrderId: number;
  initiator: string;
  buyer: string;
  seller: string;
  amount: string;
  token: string;
  reason: string;
  resolved: boolean;
  resolver: string;
  favorBuyer: boolean;
  resolution: string;
  voteCount: number;
  status: DisputeStatus;
  votes: string[];
  createdAt: number;
  resolvedAt?: number;
}

// 仲裁员信息
export interface Arbitrator {
  address: string;
  isActive: boolean;
  totalVotes: number;
  successfulVotes: number;
  reputation: number;
  joinedAt: Date;
  lastActivity: Date;
}

/**
 * 多签钱包服务
 * 处理多签交易、仲裁和争议解决
 */
export class MultiSigWalletService extends EventEmitter {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private contractAddress: string;
  private network: 'polygon' | 'mumbai';
  
  // 仲裁员信息缓存
  private arbitrators: Map<string, Arbitrator> = new Map();
  private transactions: Map<number, MultiSigTransaction> = new Map();
  private disputes: Map<number, Dispute> = new Map();

  constructor(network: 'polygon' | 'mumbai' = 'polygon') {
    super();
    this.network = network;
    
    const config = {
      polygon: {
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        contractAddress: process.env.MULTISIG_WALLET_CONTRACT_POLYGON || ''
      },
      mumbai: {
        rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
        contractAddress: process.env.MULTISIG_WALLET_CONTRACT_MUMBAI || ''
      }
    };

    this.provider = new ethers.JsonRpcProvider(config[network].rpcUrl);
    this.contractAddress = config[network].contractAddress;
    this.contract = new ethers.Contract(
      this.contractAddress,
      MULTISIG_WALLET_ABI,
      this.provider
    );

    this.startEventListening();
    this.initializeArbitrators();
  }

  /**
   * 获取带签名器的合约实例
   */
  private getContractWithSigner(privateKey: string): any {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    return this.contract.connect(wallet);
  }

  /**
   * 提议多签交易
   */
  async proposeTransaction(
    arbitratorPrivateKey: string,
    to: string,
    value: string,
    token: string,
    data: string,
    reason: string
  ): Promise<{ txId: number; txHash: string }> {
    try {
      const contractWithSigner = this.getContractWithSigner(arbitratorPrivateKey);
      
      const valueInWei = token === ethers.ZeroAddress ? 
        ethers.parseEther(value) : 
        ethers.parseUnits(value, 6); // USDT 6位小数

      const tx = await contractWithSigner.proposeTransaction(
        to,
        valueInWei,
        token,
        data || '0x',
        reason
      );

      const receipt = await tx.wait();
      
      // 从事件中提取交易ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'TransactionProposed';
        } catch {
          return false;
        }
      });

      let txId = 0;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        txId = Number(parsed?.args[0]);
      }

      return {
        txId,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('提议交易失败:', error);
      throw error;
    }
  }

  /**
   * 批准多签交易
   */
  async approveTransaction(
    arbitratorPrivateKey: string,
    txId: number
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(arbitratorPrivateKey);
      const tx = await contractWithSigner.approveTransaction(txId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('批准交易失败:', error);
      throw error;
    }
  }

  /**
   * 执行多签交易
   */
  async executeTransaction(
    arbitratorPrivateKey: string,
    txId: number
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(arbitratorPrivateKey);
      const tx = await contractWithSigner.executeTransaction(txId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('执行交易失败:', error);
      throw error;
    }
  }

  /**
   * 取消多签交易
   */
  async cancelTransaction(
    arbitratorPrivateKey: string,
    txId: number,
    reason: string
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(arbitratorPrivateKey);
      const tx = await contractWithSigner.cancelTransaction(txId, reason);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('取消交易失败:', error);
      throw error;
    }
  }

  /**
   * 创建争议
   */
  async createDispute(
    arbitratorPrivateKey: string,
    escrowOrderId: number,
    buyer: string,
    seller: string,
    amount: string,
    token: string,
    reason: string
  ): Promise<{ disputeId: number; txHash: string }> {
    try {
      const contractWithSigner = this.getContractWithSigner(arbitratorPrivateKey);
      
      const amountInWei = token === ethers.ZeroAddress ? 
        ethers.parseEther(amount) : 
        ethers.parseUnits(amount, 6);

      const tx = await contractWithSigner.createDispute(
        escrowOrderId,
        buyer,
        seller,
        amountInWei,
        token,
        reason
      );

      const receipt = await tx.wait();
      
      // 从事件中提取争议ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'DisputeCreated';
        } catch {
          return false;
        }
      });

      let disputeId = 0;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        disputeId = Number(parsed?.args[0]);
      }

      return {
        disputeId,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('创建争议失败:', error);
      throw error;
    }
  }

  /**
   * 对争议投票
   */
  async voteOnDispute(
    arbitratorPrivateKey: string,
    disputeId: number,
    favorBuyer: boolean
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(arbitratorPrivateKey);
      const tx = await contractWithSigner.voteOnDispute(disputeId, favorBuyer);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('争议投票失败:', error);
      throw error;
    }
  }

  /**
   * 解决争议 (管理员权限)
   */
  async resolveDispute(
    adminPrivateKey: string,
    disputeId: number,
    favorBuyer: boolean,
    resolution: string
  ): Promise<string> {
    try {
      const contractWithSigner = this.getContractWithSigner(adminPrivateKey);
      const tx = await contractWithSigner.resolveDispute(disputeId, favorBuyer, resolution);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('解决争议失败:', error);
      throw error;
    }
  }

  /**
   * 获取多签交易详情
   */
  async getTransaction(txId: number): Promise<MultiSigTransaction> {
    try {
      const txData = await this.contract.getTransaction(txId);
      const requiredApprovals = await this.contract.requiredApprovals();
      
      // 获取批准列表
      const approvals: string[] = [];
      const totalArbitrators = await this.contract.totalArbitrators();
      
      // 这里需要遍历所有仲裁员检查是否已批准
      // 实际实现中应该通过事件或其他方式优化
      
      const status = this.determineTransactionStatus(
        txData.executed,
        txData.cancelled,
        Number(txData.approvalCount),
        Number(requiredApprovals),
        Number(txData.proposedAt)
      );

      return {
        id: txId,
        proposer: txData.proposer,
        to: txData.to,
        value: txData.value.toString(),
        token: txData.token,
        data: txData.data,
        reason: txData.reason,
        executed: txData.executed,
        cancelled: txData.cancelled,
        approvalCount: Number(txData.approvalCount),
        proposedAt: Number(txData.proposedAt),
        status,
        approvals,
        requiredApprovals: Number(requiredApprovals)
      };
    } catch (error) {
      console.error('获取交易详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取争议详情
   */
  async getDispute(disputeId: number): Promise<Dispute> {
    try {
      const disputeData = await this.contract.getDispute(disputeId);
      
      const status = this.determineDisputeStatus(
        disputeData.resolved,
        Number(disputeData.voteCount)
      );

      return {
        id: disputeId,
        escrowOrderId: Number(disputeData.escrowOrderId),
        initiator: disputeData.initiator,
        buyer: disputeData.buyer,
        seller: disputeData.seller,
        amount: disputeData.amount.toString(),
        token: disputeData.token,
        reason: disputeData.reason,
        resolved: disputeData.resolved,
        resolver: disputeData.resolver,
        favorBuyer: disputeData.favorBuyer,
        resolution: disputeData.resolution,
        voteCount: Number(disputeData.voteCount),
        status,
        votes: [], // 需要通过事件获取
        createdAt: Date.now(), // 需要从事件获取
        resolvedAt: disputeData.resolved ? Date.now() : undefined
      };
    } catch (error) {
      console.error('获取争议详情失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否已批准交易
   */
  async hasApproved(txId: number, arbitratorAddress: string): Promise<boolean> {
    try {
      return await this.contract.hasApproved(txId, arbitratorAddress);
    } catch (error) {
      console.error('检查批准状态失败:', error);
      return false;
    }
  }

  /**
   * 获取钱包余额
   */
  async getBalance(tokenAddress: string): Promise<string> {
    try {
      const balance = await this.contract.getBalance(tokenAddress);
      
      if (tokenAddress === ethers.ZeroAddress) {
        return ethers.formatEther(balance);
      } else {
        return ethers.formatUnits(balance, 6); // USDT 6位小数
      }
    } catch (error) {
      console.error('获取余额失败:', error);
      throw error;
    }
  }

  /**
   * 获取支持的代币列表
   */
  async getSupportedTokens(): Promise<string[]> {
    try {
      return await this.contract.getSupportedTokens();
    } catch (error) {
      console.error('获取支持代币失败:', error);
      return [];
    }
  }

  /**
   * 获取合约信息
   */
  async getContractInfo(): Promise<{
    requiredApprovals: number;
    totalArbitrators: number;
    contractAddress: string;
    network: string;
  }> {
    try {
      const [requiredApprovals, totalArbitrators] = await Promise.all([
        this.contract.requiredApprovals(),
        this.contract.totalArbitrators()
      ]);

      return {
        requiredApprovals: Number(requiredApprovals),
        totalArbitrators: Number(totalArbitrators),
        contractAddress: this.contractAddress,
        network: this.network
      };
    } catch (error) {
      console.error('获取合约信息失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否为仲裁员
   */
  async isArbitrator(address: string): Promise<boolean> {
    try {
      return await this.contract.isArbitrator(address);
    } catch (error) {
      console.error('检查仲裁员身份失败:', error);
      return false;
    }
  }

  /**
   * 确定交易状态
   */
  private determineTransactionStatus(
    executed: boolean,
    cancelled: boolean,
    approvalCount: number,
    requiredApprovals: number,
    proposedAt: number
  ): MultiSigTransactionStatus {
    if (executed) return MultiSigTransactionStatus.EXECUTED;
    if (cancelled) return MultiSigTransactionStatus.CANCELLED;
    
    const now = Math.floor(Date.now() / 1000);
    const TRANSACTION_TIMEOUT = 7 * 24 * 60 * 60; // 7天
    
    if (now > proposedAt + TRANSACTION_TIMEOUT) {
      return MultiSigTransactionStatus.EXPIRED;
    }
    
    if (approvalCount >= requiredApprovals) {
      return MultiSigTransactionStatus.APPROVED;
    }
    
    return MultiSigTransactionStatus.PENDING;
  }

  /**
   * 确定争议状态
   */
  private determineDisputeStatus(
    resolved: boolean,
    voteCount: number
  ): DisputeStatus {
    if (resolved) return DisputeStatus.RESOLVED;
    if (voteCount > 0) return DisputeStatus.VOTING;
    return DisputeStatus.OPEN;
  }

  /**
   * 初始化仲裁员信息
   */
  private async initializeArbitrators(): Promise<void> {
    // 这里应该从链上或数据库加载仲裁员信息
    // 模拟数据
    const mockArbitrators = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
      '0x3456789012345678901234567890123456789012'
    ];

    for (const address of mockArbitrators) {
      this.arbitrators.set(address, {
        address,
        isActive: true,
        totalVotes: 0,
        successfulVotes: 0,
        reputation: 100,
        joinedAt: new Date(),
        lastActivity: new Date()
      });
    }
  }

  /**
   * 开始监听事件
   */
  private startEventListening(): void {
    // 监听交易提议事件
    this.contract.on('TransactionProposed', (txId, proposer, to, value, token, data, reason) => {
      this.emit('transactionProposed', {
        txId: Number(txId),
        proposer,
        to,
        value: value.toString(),
        token,
        data,
        reason
      });
    });

    // 监听交易批准事件
    this.contract.on('TransactionApproved', (txId, approver) => {
      this.emit('transactionApproved', {
        txId: Number(txId),
        approver
      });
    });

    // 监听交易执行事件
    this.contract.on('TransactionExecuted', (txId, executor, success) => {
      this.emit('transactionExecuted', {
        txId: Number(txId),
        executor,
        success
      });
    });

    // 监听争议创建事件
    this.contract.on('DisputeCreated', (disputeId, escrowOrderId, initiator, reason) => {
      this.emit('disputeCreated', {
        disputeId: Number(disputeId),
        escrowOrderId: Number(escrowOrderId),
        initiator,
        reason
      });
    });

    // 监听争议解决事件
    this.contract.on('DisputeResolved', (disputeId, resolver, favorBuyer, resolution) => {
      this.emit('disputeResolved', {
        disputeId: Number(disputeId),
        resolver,
        favorBuyer,
        resolution
      });
    });
  }

  /**
   * 获取仲裁员信息
   */
  getArbitrator(address: string): Arbitrator | null {
    return this.arbitrators.get(address) || null;
  }

  /**
   * 获取所有仲裁员
   */
  getAllArbitrators(): Arbitrator[] {
    return Array.from(this.arbitrators.values());
  }
}

export const multiSigWalletService = new MultiSigWalletService(
  process.env.NODE_ENV === 'production' ? 'polygon' : 'mumbai'
);

export default multiSigWalletService;