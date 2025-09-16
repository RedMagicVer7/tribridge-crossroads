'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { WalletService, WalletBalance } from '@/services/walletService'

// Simple toast replacement
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message)
}

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [balances, setBalances] = useState<WalletBalance[]>([])
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const walletService = new WalletService()

  useEffect(() => {
    if (isConnected && address && chain) {
      loadBalances()
    }
  }, [isConnected, address, chain])

  const loadBalances = async () => {
    if (!address || !chain) return
    
    setIsLoadingBalances(true)
    try {
      const balances = await walletService.getStablecoinBalances(address, chain.id)
      setBalances(balances)
    } catch (error) {
      console.error('Failed to load balances:', error)
      toast.error('Failed to load wallet balances')
    } finally {
      setIsLoadingBalances(false)
    }
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getNetworkBadgeColor = (chainId: number) => {
    switch (chainId) {
      case 11155111: return 'bg-blue-500' // Sepolia
      case 1: return 'bg-green-500' // Mainnet
      default: return 'bg-gray-500'
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your wallet to start using TriBridge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={!connector.ready || isPending}
              variant="outline"
              className="w-full justify-start"
            >
              {isPending && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              )}
              <img 
                src={`/icons/${connector.name.toLowerCase()}.svg`} 
                alt={connector.name}
                className="w-5 h-5 mr-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              {connector.name}
              {!connector.ready && ' (unsupported)'}
            </Button>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Wallet Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connected
            </span>
            <Button
              onClick={() => disconnect()}
              variant="outline"
              size="sm"
            >
              Disconnect
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <Badge className={`${getNetworkBadgeColor(chain?.id || 0)} text-white`}>
              {chain?.name || 'Unknown'}
            </Badge>
          </div>

          {/* Address */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address:</span>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {formatAddress(address || '')}
              </code>
              <Button
                onClick={copyAddress}
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8"
                onClick={() => window.open(`${chain?.blockExplorers?.default?.url}/address/${address}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stablecoin Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stablecoin Balances</span>
            <Button
              onClick={loadBalances}
              disabled={isLoadingBalances}
              variant="outline"
              size="sm"
            >
              {isLoadingBalances ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Your DAI and USDC balances on {chain?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBalances ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-1">
                      <div className="w-12 h-4 bg-muted rounded animate-pulse" />
                      <div className="w-16 h-3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : balances.length > 0 ? (
            <div className="space-y-2">
              {balances.map((balance) => (
                <div key={balance.token} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {balance.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{balance.symbol}</div>
                      <div className="text-sm text-muted-foreground">{balance.token}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {parseFloat(balance.balance).toFixed(4)}
                    </div>
                    <div className="text-sm text-muted-foreground">{balance.symbol}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No stablecoin balances found</p>
              <p className="text-sm">Make sure you have DAI or USDC on {chain?.name}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}