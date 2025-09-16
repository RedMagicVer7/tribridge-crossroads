import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

export async function POST(request: NextRequest) {
  try {
    const { from, to, amount, token, networkId, txHash } = await request.json()

    if (!from || !to || !amount || !token || !networkId) {
      return NextResponse.json(
        { error: 'Missing required transaction parameters' },
        { status: 400 }
      )
    }

    // Validate addresses
    if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum addresses' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Connect to the appropriate RPC provider
    // 2. Verify the transaction
    // 3. Store transaction details in database
    // 4. Send notifications

    // For now, simulate transaction processing
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate transaction hash if not provided
    const simulatedTxHash = txHash || `0x${Math.random().toString(16).padStart(64, '0')}`

    const transaction = {
      id: transactionId,
      hash: simulatedTxHash,
      from,
      to,
      amount,
      token,
      networkId,
      status: 'pending',
      timestamp: new Date().toISOString(),
      confirmations: 0,
      gasUsed: '21000',
      gasFee: '0.001',
      blockNumber: null,
      explorerUrl: getExplorerUrl(networkId, simulatedTxHash)
    }

    // Store transaction (in real app, use database)
    console.log('Transaction stored:', transaction)

    return NextResponse.json({ 
      success: true, 
      transaction 
    })
  } catch (error) {
    console.error('Error processing transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const txHash = searchParams.get('hash')
    const address = searchParams.get('address')

    if (txHash) {
      // Get specific transaction by hash
      // In real app, fetch from database or blockchain
      const transaction = {
        id: `tx_${Date.now()}`,
        hash: txHash,
        status: 'confirmed',
        confirmations: 12,
        blockNumber: 18500000,
        timestamp: new Date().toISOString(),
        gasUsed: '21000',
        gasFee: '0.001'
      }

      return NextResponse.json({ transaction })
    }

    if (address) {
      // Get transaction history for address
      // In real app, fetch from database
      const mockHistory = [
        {
          id: 'tx_1',
          hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          from: '0x742d35Cc6639C0532FEb96b3e1d8aB9e2b8D6D2F',
          to: address,
          amount: '100.0',
          token: 'DAI',
          status: 'confirmed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          confirmations: 24
        },
        {
          id: 'tx_2',
          hash: '0x9876543210987654321098765432109876543210987654321098765432109876',
          from: address,
          to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          amount: '50.0',
          token: 'USDC',
          status: 'confirmed',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          confirmations: 48
        }
      ]

      return NextResponse.json({ transactions: mockHistory })
    }

    return NextResponse.json(
      { error: 'Transaction hash or address required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getExplorerUrl(networkId: number, txHash: string): string {
  const explorers = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    3448148188: 'https://nile.tronscan.org'
  }
  
  const explorer = explorers[networkId as keyof typeof explorers] || 'https://etherscan.io'
  return `${explorer}/tx/${txHash}`
}