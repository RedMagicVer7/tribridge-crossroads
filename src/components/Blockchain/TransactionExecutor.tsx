'use client'

import React, { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ExternalLink, Send, Clock, CheckCircle, AlertCircle, Hash, DollarSign } from 'lucide-react'
import { WalletService, TransactionRequest, TransactionResult } from '@/services/walletService'

interface TransactionStep {
  id: number
  title: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  description: string
  txHash?: string
}

export function TransactionExecutor() {
  const { address, isConnected, chain } = useAccount()
  const [isExecuting, setIsExecuting] = useState(false)
  const [transaction, setTransaction] = useState<TransactionResult | null>(null)
  const [steps, setSteps] = useState<TransactionStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  
  // Form state
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    token: 'DAI' as 'DAI' | 'USDC'
  })

  const walletService = new WalletService()

  const transactionSteps: Omit<TransactionStep, 'status'>[] = [
    {
      id: 1,
      title: '验证交易参数',
      description: '检查接收地址和转账金额'
    },
    {
      id: 2,
      title: '检查余额',
      description: '确认钱包有足够的代币余额'
    },
    {
      id: 3,
      title: '计算Gas费用',
      description: '估算交易所需的网络费用'
    },
    {
      id: 4,
      title: '发起交易',
      description: '向区块链网络提交交易'
    },
    {
      id: 5,
      title: '等待确认',
      description: '等待区块链网络确认交易'
    },
    {
      id: 6,
      title: '交易完成',
      description: '交易已成功确认并记录到区块链'
    }
  ]

  const initializeSteps = useCallback(() => {
    const initialSteps = transactionSteps.map(step => ({
      ...step,
      status: 'pending' as const
    }))
    setSteps(initialSteps)
    setCurrentStep(0)
  }, [])

  const updateStep = useCallback((stepId: number, status: TransactionStep['status'], txHash?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, txHash }
        : step
    ))
  }, [])

  const executeTransaction = async () => {
    if (!isConnected || !address || !chain) {
      console.error('Wallet not connected')
      return
    }

    setIsExecuting(true)
    initializeSteps()

    try {
      // Step 1: 验证交易参数
      setCurrentStep(1)
      updateStep(1, 'processing')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (!formData.to || !formData.amount) {
        throw new Error('Invalid transaction parameters')
      }
      updateStep(1, 'completed')

      // Step 2: 检查余额
      setCurrentStep(2)
      updateStep(2, 'processing')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const balances = await walletService.getStablecoinBalances(address, chain.id)
      const tokenBalance = balances.find(b => b.token === formData.token)
      
      if (!tokenBalance || parseFloat(tokenBalance.balance) < parseFloat(formData.amount)) {
        throw new Error('Insufficient balance')
      }
      updateStep(2, 'completed')

      // Step 3: 计算Gas费用
      setCurrentStep(3)
      updateStep(3, 'processing')
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateStep(3, 'completed')

      // Step 4: 发起交易
      setCurrentStep(4)
      updateStep(4, 'processing')
      
      const txRequest: TransactionRequest = {
        to: formData.to,
        amount: formData.amount,
        token: formData.token,
        network: chain.id
      }

      const result = await walletService.transferStablecoin(txRequest)
      updateStep(4, 'completed', result.hash)
      setTransaction(result)

      // Step 5: 等待确认
      setCurrentStep(5)
      updateStep(5, 'processing')
      
      // 模拟等待确认过程
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 检查交易状态
      const finalStatus = await walletService.getTransactionStatus(result.hash)
      setTransaction(finalStatus)
      
      if (finalStatus.status === 'confirmed') {
        updateStep(5, 'completed')
        
        // Step 6: 交易完成
        setCurrentStep(6)
        updateStep(6, 'completed')
        
        // 调用后端API记录交易
        await fetch('/api/wallet/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: address,
            to: formData.to,
            amount: formData.amount,
            token: formData.token,
            networkId: chain.id,
            txHash: result.hash
          })
        })
      } else {
        updateStep(5, 'failed')
        throw new Error('Transaction failed to confirm')
      }

    } catch (error) {
      console.error('Transaction execution failed:', error)
      const currentStepIndex = steps.findIndex(s => s.status === 'processing')
      if (currentStepIndex >= 0) {
        updateStep(steps[currentStepIndex].id, 'failed')
      }
    } finally {
      setIsExecuting(false)
    }
  }

  const resetTransaction = () => {
    setTransaction(null)
    setSteps([])
    setCurrentStep(0)
    setFormData({ to: '', amount: '', token: 'DAI' })
  }

  const getStepIcon = (step: TransactionStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getExplorerUrl = (txHash: string) => {
    const explorers = {
      1: 'https://etherscan.io',
      11155111: 'https://sepolia.etherscan.io'
    }
    const explorer = explorers[chain?.id as keyof typeof explorers] || 'https://etherscan.io'
    return `${explorer}/tx/${txHash}`
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please connect your wallet to execute transactions</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Transaction Form */}
      {!transaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              发起链上交易
            </CardTitle>
            <CardDescription>
              使用 {formData.token} 进行真实的区块链转账
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="token">选择代币</Label>
                <Select value={formData.token} onValueChange={(value: 'DAI' | 'USDC') => 
                  setFormData(prev => ({ ...prev, token: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAI">DAI (Dai Stablecoin)</SelectItem>
                    <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">接收地址</Label>
                <Input
                  id="to"
                  placeholder="0x..."
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">转账数量</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={executeTransaction}
              disabled={isExecuting || !formData.to || !formData.amount}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  执行中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  执行交易
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Transaction Progress */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>交易进度</span>
              {transaction && (
                <Badge className={
                  transaction.status === 'confirmed' ? 'bg-green-500' :
                  transaction.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                }>
                  {transaction.status === 'confirmed' ? '已确认' :
                   transaction.status === 'failed' ? '失败' : '处理中'}
                </Badge>
              )}
            </CardTitle>
            <Progress value={(currentStep / steps.length) * 100} className="w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.title}</h4>
                      {step.txHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getExplorerUrl(step.txHash!), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.txHash && (
                      <div className="flex items-center gap-2 mt-1">
                        <Hash className="h-3 w-3" />
                        <code className="text-xs">{step.txHash.slice(0, 20)}...</code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {transaction && transaction.status === 'confirmed' && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                  <CheckCircle className="h-4 w-4" />
                  交易成功完成！
                </div>
                <div className="space-y-1 text-sm text-green-600">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    <span>交易哈希: {transaction.hash}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3" />
                    <span>确认数: {transaction.confirmations}</span>
                  </div>
                  {transaction.gasUsed && (
                    <div className="flex items-center gap-2">
                      <span>Gas使用: {transaction.gasUsed}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button 
              onClick={resetTransaction}
              variant="outline"
              className="w-full mt-4"
            >
              发起新交易
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}