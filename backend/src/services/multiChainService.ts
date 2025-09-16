/**
 * Multi-Chain Stablecoin Support Service
 * Supports Ethereum, TRON, and BSC networks
 * @author RedMagicVer7
 */

export interface ChainConfig {
  chainId: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  stablecoins: {
    [symbol: string]: {
      address: string
      decimals: number
      symbol: string
      name: string
    }
  }
}

export interface TransactionRequest {
  fromChain: string
  toChain: string
  fromToken: string
  toToken: string
  amount: string
  fromAddress: string
  toAddress: string
  slippage?: number
}

export interface TransactionResult {
  txHash: string
  chainId: number
  status: 'pending' | 'confirmed' | 'failed'
  confirmations: number
  gasUsed?: string
  blockNumber?: number
  timestamp: Date
}

export class MultiChainService {
  private chains: Map<string, ChainConfig> = new Map()
  private providers: Map<string, any> = new Map()

  constructor() {
    this.initializeChains()
    this.initializeProviders()
  }

  private initializeChains(): void {
    // Ethereum Mainnet
    this.chains.set('ethereum', {
      chainId: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
      explorerUrl: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      stablecoins: {
        USDT: {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          decimals: 6,
          symbol: 'USDT',
          name: 'Tether USD'
        },
        USDC: {
          address: '0xA0b86a33E6427c9C5B8E7c7F1D5b7F5F0A5C5C7D',
          decimals: 6,
          symbol: 'USDC',
          name: 'USD Coin'
        },
        DAI: {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          decimals: 18,
          symbol: 'DAI',
          name: 'Dai Stablecoin'
        }
      }
    })

    // TRON Mainnet
    this.chains.set('tron', {
      chainId: 728126428,
      name: 'TRON',
      symbol: 'TRX',
      rpcUrl: process.env.TRON_RPC_URL || 'https://api.trongrid.io',
      explorerUrl: 'https://tronscan.org',
      nativeCurrency: {
        name: 'TRON',
        symbol: 'TRX',
        decimals: 6
      },
      stablecoins: {
        USDT: {
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          decimals: 6,
          symbol: 'USDT',
          name: 'Tether USD'
        },
        USDC: {
          address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
          decimals: 6,
          symbol: 'USDC',
          name: 'USD Coin'
        }
      }
    })

    // BSC Mainnet
    this.chains.set('bsc', {
      chainId: 56,
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
      explorerUrl: 'https://bscscan.com',
      nativeCurrency: {
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
      },
      stablecoins: {
        USDT: {
          address: '0x55d398326f99059fF775485246999027B3197955',
          decimals: 18,
          symbol: 'USDT',
          name: 'Tether USD'
        },
        USDC: {
          address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
          decimals: 18,
          symbol: 'USDC',
          name: 'USD Coin'
        },
        BUSD: {
          address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
          decimals: 18,
          symbol: 'BUSD',
          name: 'Binance USD'
        }
      }
    })
  }

  private async initializeProviders(): Promise<void> {
    try {
      // Initialize Ethereum provider
      const { ethers } = await import('ethers')
      const ethConfig = this.chains.get('ethereum')
      if (ethConfig) {
        const ethProvider = new ethers.JsonRpcProvider(ethConfig.rpcUrl)
        this.providers.set('ethereum', ethProvider)
      }

      // Initialize TRON provider
      const TronWeb = require('tronweb')
      const tronConfig = this.chains.get('tron')
      if (tronConfig) {
        const tronProvider = new TronWeb({
          fullHost: tronConfig.rpcUrl,
          headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY }
        })
        this.providers.set('tron', tronProvider)
      }

      // Initialize BSC provider (same as Ethereum)
      const bscConfig = this.chains.get('bsc')
      if (bscConfig) {
        const bscProvider = new ethers.JsonRpcProvider(bscConfig.rpcUrl)
        this.providers.set('bsc', bscProvider)
      }

    } catch (error) {
      console.error('Failed to initialize blockchain providers:', error)
      throw error
    }
  }

  // Get supported chains
  public getSupportedChains(): ChainConfig[] {
    return Array.from(this.chains.values())
  }

  // Get chain configuration
  public getChainConfig(chainName: string): ChainConfig | undefined {
    return this.chains.get(chainName.toLowerCase())
  }

  // Get stablecoin balance
  public async getStablecoinBalance(
    chainName: string,
    tokenSymbol: string,
    address: string
  ): Promise<string> {
    const chain = this.chains.get(chainName.toLowerCase())
    const provider = this.providers.get(chainName.toLowerCase())
    
    if (!chain || !provider) {
      throw new Error(`Chain ${chainName} not supported`)
    }

    const token = chain.stablecoins[tokenSymbol.toUpperCase()]
    if (!token) {
      throw new Error(`Token ${tokenSymbol} not supported on ${chainName}`)
    }

    try {
      if (chainName.toLowerCase() === 'tron') {
        return await this.getTronBalance(provider, token.address, address)
      } else {
        return await this.getEVMBalance(provider, token.address, address, token.decimals)
      }
    } catch (error) {
      console.error(`Failed to get balance for ${tokenSymbol} on ${chainName}:`, error)
      throw error
    }
  }

  // EVM-compatible chains (Ethereum, BSC)
  private async getEVMBalance(
    provider: any,
    tokenAddress: string,
    userAddress: string,
    decimals: number
  ): Promise<string> {
    const { ethers } = await import('ethers')
    
    const abi = [
      'function balanceOf(address owner) view returns (uint256)'
    ]
    
    const contract = new ethers.Contract(tokenAddress, abi, provider)
    const balance = await contract.balanceOf(userAddress)
    
    return ethers.formatUnits(balance, decimals)
  }

  // TRON balance check
  private async getTronBalance(
    tronWeb: any,
    tokenAddress: string,
    userAddress: string
  ): Promise<string> {
    try {
      const contract = await tronWeb.contract().at(tokenAddress)
      const balance = await contract.balanceOf(userAddress).call()
      
      // TRON USDT has 6 decimals
      return (balance.toNumber() / Math.pow(10, 6)).toString()
    } catch (error) {
      console.error('TRON balance check failed:', error)
      throw error
    }
  }

  // Execute stablecoin transfer
  public async transferStablecoin(
    chainName: string,
    tokenSymbol: string,
    fromAddress: string,
    toAddress: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> {
    const chain = this.chains.get(chainName.toLowerCase())
    const provider = this.providers.get(chainName.toLowerCase())
    
    if (!chain || !provider) {
      throw new Error(`Chain ${chainName} not supported`)
    }

    const token = chain.stablecoins[tokenSymbol.toUpperCase()]
    if (!token) {
      throw new Error(`Token ${tokenSymbol} not supported on ${chainName}`)
    }

    try {
      if (chainName.toLowerCase() === 'tron') {
        return await this.executeTronTransfer(provider, token, fromAddress, toAddress, amount, privateKey)
      } else {
        return await this.executeEVMTransfer(provider, token, fromAddress, toAddress, amount, privateKey, chain.chainId)
      }
    } catch (error) {
      console.error(`Transfer failed on ${chainName}:`, error)
      throw error
    }
  }

  // EVM transfer
  private async executeEVMTransfer(
    provider: any,
    token: any,
    fromAddress: string,
    toAddress: string,
    amount: string,
    privateKey: string,
    chainId: number
  ): Promise<TransactionResult> {
    const { ethers } = await import('ethers')
    
    const wallet = new ethers.Wallet(privateKey, provider)
    
    const abi = [
      'function transfer(address to, uint256 amount) returns (bool)'
    ]
    
    const contract = new ethers.Contract(token.address, abi, wallet)
    const transferAmount = ethers.parseUnits(amount, token.decimals)
    
    const tx = await contract.transfer(toAddress, transferAmount)
    
    return {
      txHash: tx.hash,
      chainId,
      status: 'pending',
      confirmations: 0,
      timestamp: new Date()
    }
  }

  // TRON transfer
  private async executeTronTransfer(
    tronWeb: any,
    token: any,
    fromAddress: string,
    toAddress: string,
    amount: string,
    privateKey: string
  ): Promise<TransactionResult> {
    try {
      // Set private key
      tronWeb.setPrivateKey(privateKey)
      
      const contract = await tronWeb.contract().at(token.address)
      const transferAmount = Math.floor(parseFloat(amount) * Math.pow(10, token.decimals))
      
      const tx = await contract.transfer(toAddress, transferAmount).send()
      
      return {
        txHash: tx,
        chainId: 728126428, // TRON mainnet
        status: 'pending',
        confirmations: 0,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('TRON transfer failed:', error)
      throw error
    }
  }

  // Get transaction status
  public async getTransactionStatus(chainName: string, txHash: string): Promise<TransactionResult> {
    const provider = this.providers.get(chainName.toLowerCase())
    const chain = this.chains.get(chainName.toLowerCase())
    
    if (!provider || !chain) {
      throw new Error(`Chain ${chainName} not supported`)
    }

    try {
      if (chainName.toLowerCase() === 'tron') {
        return await this.getTronTransactionStatus(provider, txHash)
      } else {
        return await this.getEVMTransactionStatus(provider, txHash, chain.chainId)
      }
    } catch (error) {
      console.error(`Failed to get transaction status on ${chainName}:`, error)
      throw error
    }
  }

  // EVM transaction status
  private async getEVMTransactionStatus(
    provider: any,
    txHash: string,
    chainId: number
  ): Promise<TransactionResult> {
    const receipt = await provider.getTransactionReceipt(txHash)
    
    if (!receipt) {
      return {
        txHash,
        chainId,
        status: 'pending',
        confirmations: 0,
        timestamp: new Date()
      }
    }

    const currentBlock = await provider.getBlockNumber()
    const confirmations = currentBlock - receipt.blockNumber + 1

    return {
      txHash,
      chainId,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      confirmations,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      timestamp: new Date()
    }
  }

  // TRON transaction status
  private async getTronTransactionStatus(
    tronWeb: any,
    txHash: string
  ): Promise<TransactionResult> {
    try {
      const tx = await tronWeb.trx.getTransactionInfo(txHash)
      
      return {
        txHash,
        chainId: 728126428,
        status: tx.receipt?.result === 'SUCCESS' ? 'confirmed' : 'failed',
        confirmations: tx.blockNumber ? 1 : 0,
        blockNumber: tx.blockNumber,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        txHash,
        chainId: 728126428,
        status: 'pending',
        confirmations: 0,
        timestamp: new Date()
      }
    }
  }

  // Get current gas prices
  public async getGasPrices(chainName: string): Promise<{
    slow: string
    standard: string
    fast: string
  }> {
    const provider = this.providers.get(chainName.toLowerCase())
    
    if (!provider) {
      throw new Error(`Chain ${chainName} not supported`)
    }

    try {
      if (chainName.toLowerCase() === 'tron') {
        // TRON uses energy/bandwidth, return estimated costs
        return {
          slow: '10',
          standard: '15',
          fast: '20'
        }
      } else {
        const { ethers } = await import('ethers')
        const gasPrice = await provider.getFeeData()
        
        return {
          slow: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
          standard: ethers.formatUnits((gasPrice.gasPrice || BigInt(0)) * BigInt(110) / BigInt(100), 'gwei'),
          fast: ethers.formatUnits((gasPrice.gasPrice || BigInt(0)) * BigInt(120) / BigInt(100), 'gwei')
        }
      }
    } catch (error) {
      console.error(`Failed to get gas prices for ${chainName}:`, error)
      throw error
    }
  }

  // Validate address format for specific chain
  public validateAddress(chainName: string, address: string): boolean {
    try {
      if (chainName.toLowerCase() === 'tron') {
        // TRON addresses start with 'T' and are 34 characters long
        return address.startsWith('T') && address.length === 34
      } else {
        // EVM addresses (Ethereum, BSC)
        const { ethers } = require('ethers')
        return ethers.isAddress(address)
      }
    } catch (error) {
      return false
    }
  }

  // Get supported tokens for a chain
  public getSupportedTokens(chainName: string): string[] {
    const chain = this.chains.get(chainName.toLowerCase())
    return chain ? Object.keys(chain.stablecoins) : []
  }

  // Get token info
  public getTokenInfo(chainName: string, tokenSymbol: string) {
    const chain = this.chains.get(chainName.toLowerCase())
    return chain ? chain.stablecoins[tokenSymbol.toUpperCase()] : null
  }
}

export default MultiChainService