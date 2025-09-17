import { ethers, BrowserProvider, formatUnits, parseUnits } from 'ethers'
import { sepolia } from 'wagmi/chains'

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

// DAI and USDC contract addresses on different networks
export const STABLECOIN_CONTRACTS = {
  // Ethereum Sepolia Testnet
  11155111: {
    DAI: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', // DAI on Sepolia
    USDC: '0xda9d4f9b69ac6C22e444eD9aF0CfC043b7a7f53f', // USDC on Sepolia
  },
  // Ethereum Mainnet (for reference)
  1: {
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    USDC: '0xA0b86a33E6427c9C5B8E7c7F1D5b7F5F0A5C5C7D',
  }
}

// ERC20 ABI for stablecoin operations
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
]

export interface WalletBalance {
  token: string
  balance: string
  decimals: number
  symbol: string
  contractAddress: string
}

export interface TransactionRequest {
  to: string
  amount: string
  token: 'DAI' | 'USDC'
  network: number
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  confirmations: number
  gasUsed?: string
  blockNumber?: number
}

export class WalletService {
  private provider: BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  constructor() {
    this.initializeProvider()
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
    }
  }

  // Get wallet balances for stablecoins
  async getStablecoinBalances(address: string, networkId: number): Promise<WalletBalance[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    const contracts = STABLECOIN_CONTRACTS[networkId as keyof typeof STABLECOIN_CONTRACTS]
    if (!contracts) {
      throw new Error(`Network ${networkId} not supported`)
    }

    const balances: WalletBalance[] = []

    for (const [symbol, contractAddress] of Object.entries(contracts)) {
      try {
        const contract = new ethers.Contract(contractAddress, ERC20_ABI, this.provider)
        
        const [balance, decimals, name] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
          contract.symbol()
        ])

        balances.push({
          token: symbol,
          balance: formatUnits(balance, decimals),
          decimals,
          symbol: name,
          contractAddress
        })
      } catch (error) {
        console.error(`Error fetching ${symbol} balance:`, error)
      }
    }

    return balances
  }

  // Execute stablecoin transfer
  async transferStablecoin(request: TransactionRequest): Promise<TransactionResult> {
    if (!this.provider || !this.signer) {
      throw new Error('Wallet not connected')
    }

    const contracts = STABLECOIN_CONTRACTS[request.network as keyof typeof STABLECOIN_CONTRACTS]
    if (!contracts) {
      throw new Error(`Network ${request.network} not supported`)
    }

    const contractAddress = contracts[request.token]
    if (!contractAddress) {
      throw new Error(`Token ${request.token} not supported on network ${request.network}`)
    }

    try {
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, this.signer)
      const decimals = await contract.decimals()
      const amount = parseUnits(request.amount, decimals)

      // Execute transfer
      const tx = await contract.transfer(request.to, amount)
      
      return {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      }
    } catch (error) {
      console.error('Transfer failed:', error)
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Monitor transaction status
  async getTransactionStatus(hash: string): Promise<TransactionResult> {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    try {
      const tx = await this.provider.getTransaction(hash)
      const receipt = await this.provider.getTransactionReceipt(hash)

      if (!tx) {
        throw new Error('Transaction not found')
      }

      if (!receipt) {
        return {
          hash,
          status: 'pending',
          confirmations: 0
        }
      }

      const currentBlock = await this.provider.getBlockNumber()
      const confirmations = currentBlock - receipt.blockNumber + 1

      return {
        hash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmations,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      }
    } catch (error) {
      console.error('Error checking transaction status:', error)
      throw error
    }
  }

  // Approve token spending (for DEX interactions)
  async approveToken(
    tokenAddress: string, 
    spenderAddress: string, 
    amount: string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected')
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer)
    const tx = await contract.approve(spenderAddress, amount)
    
    return tx.hash
  }

  // Get current network
  async getNetwork(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    const network = await this.provider.getNetwork()
    return Number(network.chainId)
  }

  // Switch network
  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not available')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        await this.addNetwork(chainId)
      } else {
        throw error
      }
    }
  }

  private async addNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not available')
    }

    const networkConfig = {
      11155111: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        rpcUrls: ['https://rpc.sepolia.org'],
        nativeCurrency: {
          name: 'Sepolia Ether',
          symbol: 'SEP',
          decimals: 18
        },
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      }
    }

    const config = networkConfig[chainId as keyof typeof networkConfig]
    if (!config) {
      throw new Error(`Network ${chainId} not supported`)
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [config],
    })
  }
}

// Hook for using wallet service
export function useWalletService() {
  return new WalletService()
}