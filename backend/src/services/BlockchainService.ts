import { MultiChainService } from './MultiChainService'
import { logger } from '../utils/logger'

export interface BlockchainStats {
  totalTransactions: number
  totalVolume: string
  activeChains: number
  avgConfirmationTime: number
  networkCongestion: 'low' | 'medium' | 'high'
}

export interface ChainStatus {
  name: string
  isOnline: boolean
  blockHeight: number
  gasPrice: string
  avgBlockTime: number
  pendingTransactions: number
}

export class BlockchainService extends MultiChainService {
  private stats: BlockchainStats
  private chainStatus: Map<string, ChainStatus> = new Map()

  constructor() {
    super()
    this.stats = {
      totalTransactions: 0,
      totalVolume: '0',
      activeChains: 3,
      avgConfirmationTime: 0,
      networkCongestion: 'low'
    }
    this.initializeChainStatus()
  }

  private initializeChainStatus(): void {
    // 初始化链状态
    const chains = ['ethereum', 'tron', 'bsc']
    
    chains.forEach(chain => {
      this.chainStatus.set(chain, {
        name: chain,
        isOnline: true,
        blockHeight: 0,
        gasPrice: '0',
        avgBlockTime: this.getDefaultBlockTime(chain),
        pendingTransactions: 0
      })
    })
  }

  private getDefaultBlockTime(chain: string): number {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return 12 // seconds
      case 'tron':
        return 3 // seconds
      case 'bsc':
        return 5 // seconds
      default:
        return 10
    }
  }

  // 获取区块链统计信息
  public getBlockchainStats(): BlockchainStats {
    return { ...this.stats }
  }

  // 获取链状态
  public getChainStatus(chainName?: string): ChainStatus | ChainStatus[] | undefined {
    if (chainName) {
      return this.chainStatus.get(chainName.toLowerCase())
    }
    return Array.from(this.chainStatus.values())
  }

  // 更新链状态
  public async updateChainStatus(chainName: string): Promise<void> {
    try {
      const chain = chainName.toLowerCase()
      const config = this.getChainConfig(chain)
      
      if (!config) {
        logger.warn(`不支持的链: ${chainName}`)
        return
      }

      // 实现真实的链状态检查
      const provider = this.providers.get(chain)
      if (!provider) {
        throw new Error(`Provider for ${chain} not found`)
      }

      let chainStatus: ChainStatus

      if (chain === 'tron') {
        // TRON specific implementation
        const block = await provider.trx.getCurrentBlock()
        const blockHeight = block.block_header.raw_data.number
        
        chainStatus = {
          name: chain,
          isOnline: true,
          blockHeight,
          gasPrice: '420', // TRX
          avgBlockTime: this.getDefaultBlockTime(chain),
          pendingTransactions: 0 // TRON doesn't expose this easily
        }
      } else {
        // EVM chains (ethereum, bsc)
        const blockNumber = await provider.getBlockNumber()
        const feeData = await provider.getFeeData()
        
        const { ethers } = await import('ethers')
        const gasPrice = ethers.formatUnits(feeData.gasPrice || 0, 'gwei')
        
        chainStatus = {
          name: chain,
          isOnline: true,
          blockHeight: blockNumber,
          gasPrice,
          avgBlockTime: this.getDefaultBlockTime(chain),
          pendingTransactions: 0 // Would need to query mempool for this
        }
      }

      this.chainStatus.set(chain, chainStatus)
      logger.debug(`更新链状态: ${chain}`, chainStatus)
    } catch (error) {
      logger.error(`更新链状态失败: ${chainName}`, error)
      
      // 标记链为离线
      const currentStatus = this.chainStatus.get(chainName.toLowerCase())
      if (currentStatus) {
        currentStatus.isOnline = false
        this.chainStatus.set(chainName.toLowerCase(), currentStatus)
      }
    }
  }

  // 检查所有链的健康状态
  public async checkAllChainsHealth(): Promise<void> {
    const chains = Array.from(this.chainStatus.keys())
    
    for (const chain of chains) {
      try {
        await this.updateChainStatus(chain)
      } catch (error) {
        logger.error(`检查链健康状态失败: ${chain}`, error)
      }
    }

    // 更新统计信息
    this.updateStats()
  }

  private updateStats(): void {
    const allChains = Array.from(this.chainStatus.values())
    const onlineChains = allChains.filter(chain => chain.isOnline)
    
    // 计算平均确认时间
    const avgConfirmationTime = onlineChains.length > 0
      ? onlineChains.reduce((sum, chain) => sum + chain.avgBlockTime, 0) / onlineChains.length
      : 0

    // 计算网络拥堵程度
    const totalPendingTx = onlineChains.reduce((sum, chain) => sum + chain.pendingTransactions, 0)
    const avgPendingTx = onlineChains.length > 0 ? totalPendingTx / onlineChains.length : 0
    
    let congestion: 'low' | 'medium' | 'high' = 'low'
    if (avgPendingTx > 1000) {
      congestion = 'high'
    } else if (avgPendingTx > 500) {
      congestion = 'medium'
    }

    this.stats = {
      ...this.stats,
      activeChains: onlineChains.length,
      avgConfirmationTime,
      networkCongestion: congestion
    }
  }

  // 获取网络拥堵建议
  public getNetworkCongestionAdvice(): {
    level: string
    message: string
    recommendedGasMultiplier: number
  } {
    const { networkCongestion } = this.stats
    
    switch (networkCongestion) {
      case 'high':
        return {
          level: 'high',
          message: '网络拥堵严重，建议增加Gas费或稍后重试',
          recommendedGasMultiplier: 1.5
        }
      case 'medium':
        return {
          level: 'medium',
          message: '网络拥堵中等，建议适当增加Gas费',
          recommendedGasMultiplier: 1.2
        }
      default:
        return {
          level: 'low',
          message: '网络运行正常，可正常发送交易',
          recommendedGasMultiplier: 1.0
        }
    }
  }

  // 估算最佳Gas价格
  public async estimateOptimalGasPrice(chainName: string): Promise<{
    slow: string
    standard: string
    fast: string
    instant: string
  }> {
    try {
      const chain = chainName.toLowerCase()
      const chainStatus = this.chainStatus.get(chain)
      
      if (!chainStatus || !chainStatus.isOnline) {
        throw new Error(`链 ${chainName} 不可用`)
      }

      const baseGasPrice = parseInt(chainStatus.gasPrice)
      
      return {
        slow: (baseGasPrice * 0.8).toFixed(0),
        standard: baseGasPrice.toFixed(0),
        fast: (baseGasPrice * 1.2).toFixed(0),
        instant: (baseGasPrice * 1.5).toFixed(0)
      }
    } catch (error) {
      logger.error(`估算Gas价格失败: ${chainName}`, error)
      throw error
    }
  }

  // 监控交易状态
  public async monitorTransaction(chainName: string, txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed'
    confirmations: number
    blockNumber?: number
    gasUsed?: string
  }> {
    try {
      // 实现真实的交易监控
      const result = await this.getTransactionStatus(chainName, txHash)
      
      logger.info(`监控交易: ${chainName} - ${txHash}`, result)
      return {
        status: result.status,
        confirmations: result.confirmations,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed
      }
    } catch (error) {
      logger.error(`监控交易失败: ${chainName} - ${txHash}`, error)
      throw error
    }
  }

  // 获取区块链性能指标
  public getPerformanceMetrics(): {
    throughput: { [chain: string]: number }
    latency: { [chain: string]: number }
    successRate: { [chain: string]: number }
  } {
    const allChains = Array.from(this.chainStatus.values())
    
    const metrics = {
      throughput: {} as { [chain: string]: number },
      latency: {} as { [chain: string]: number },
      successRate: {} as { [chain: string]: number }
    }

    allChains.forEach(chain => {
      // 这些指标在实际应用中应该从监控系统获取
      metrics.throughput[chain.name] = chain.isOnline ? Math.random() * 1000 + 100 : 0 // TPS
      metrics.latency[chain.name] = chain.avgBlockTime * 1000 // ms
      metrics.successRate[chain.name] = chain.isOnline ? 95 + Math.random() * 4 : 0 // 95-99%
    })

    return metrics
  }

  // 启动定期健康检查
  public startHealthCheck(intervalMs: number = 30000): void {
    setInterval(async () => {
      try {
        await this.checkAllChainsHealth()
        logger.debug('区块链健康检查完成')
      } catch (error) {
        logger.error('区块链健康检查失败', error)
      }
    }, intervalMs)

    logger.info(`区块链健康检查已启动，间隔: ${intervalMs}ms`)
  }
}