'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WalletConnect } from '@/components/Wallet/WalletConnect'
import { TransactionExecutor } from '@/components/Blockchain/TransactionExecutor'
import { Wallet, Send, TrendingUp, Settings, Shield, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TriBridge</h1>
              <Badge variant="secondary" className="ml-2">PoC v2.0</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">Sepolia Testnet</Badge>
              <Badge className="bg-blue-500 text-white">Live Demo</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Cross-border Stablecoin Payment Platform
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Experience real blockchain transactions with DAI & USDC on Ethereum Sepolia testnet
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Testnet Safe</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Real-time Rates</span>
            </div>
            <div className="flex items-center gap-1">
              <Send className="h-4 w-4" />
              <span>On-chain Execution</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Wallet className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <CardTitle>钱包集成</CardTitle>
              <CardDescription>
                连接 MetaMask 管理你的 DAI/USDC 资产
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <Send className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <CardTitle>链上交易</CardTitle>
              <CardDescription>
                真实的区块链转账，可在区块浏览器查看
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <CardTitle>实时汇率</CardTitle>
              <CardDescription>
                CoinGecko API 提供准确的市场汇率
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Application Tabs */}
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              钱包管理
            </TabsTrigger>
            <TabsTrigger value="transaction" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              发起交易
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              交易分析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-6">
            <WalletConnect />
          </TabsContent>

          <TabsContent value="transaction" className="mt-6">
            <TransactionExecutor />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>交易分析</CardTitle>
                <CardDescription>
                  查看你的交易历史和统计数据
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>交易分析功能开发中...</p>
                  <p className="text-sm">完成一些交易后这里会显示统计数据</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technical Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">技术栈</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>前端框架:</span>
                  <Badge variant="outline">Next.js 14</Badge>
                </div>
                <div className="flex justify-between">
                  <span>钱包集成:</span>
                  <Badge variant="outline">Wagmi + Web3Modal</Badge>
                </div>
                <div className="flex justify-between">
                  <span>区块链:</span>
                  <Badge variant="outline">Ethereum + ethers.js</Badge>
                </div>
                <div className="flex justify-between">
                  <span>UI组件:</span>
                  <Badge variant="outline">shadcn/ui + Tailwind</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">网络信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>测试网络:</span>
                  <Badge className="bg-blue-500">Ethereum Sepolia</Badge>
                </div>
                <div className="flex justify-between">
                  <span>DAI 合约:</span>
                  <code className="text-xs">0x68194...D574</code>
                </div>
                <div className="flex justify-between">
                  <span>USDC 合约:</span>
                  <code className="text-xs">0xda9d4...7f53f</code>
                </div>
                <div className="flex justify-between">
                  <span>区块浏览器:</span>
                  <a 
                    href="https://sepolia.etherscan.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Sepolia Etherscan
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>TriBridge PoC v2.0 - Blockchain Cross-border Payment Platform</p>
          <p className="mt-1">⚠️ 这是测试网环境，所有交易都是虚拟的，不涉及真实资金</p>
        </footer>
      </main>
    </div>
  )
}