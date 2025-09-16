'use client'

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Get projectId at https://cloud.walletconnect.com
const projectId = '06f5f8d13b7c28e1d5b6c3dfc21d8f4e'

const metadata = {
  name: 'TriBridge',
  description: 'Cross-border Stablecoin Payment Platform',
  url: 'https://tribridge.io', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Custom Testnet Chains
const sepoliaTestnet = {
  ...sepolia,
  name: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18,
  },
}

// Tron Nile Testnet configuration
const tronNile = {
  id: 3448148188,
  name: 'Tron Nile Testnet',
  network: 'tron-nile',
  nativeCurrency: {
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
  },
  rpcUrls: {
    public: { http: ['https://nile.trongrid.io'] },
    default: { http: ['https://nile.trongrid.io'] },
  },
  blockExplorers: {
    default: { name: 'Nile Scan', url: 'https://nile.tronscan.org' },
  },
  testnet: true,
}

const chains = [mainnet, arbitrum, sepoliaTestnet] as const
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
})

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

const queryClient = new QueryClient()

export function Web3ModalProvider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  )
}