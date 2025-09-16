import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3ModalProvider } from '@/config/wagmi'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TriBridge - Cross-border Stablecoin Payment Platform',
  description: 'Revolutionary blockchain-based cross-border payment solution using stablecoins',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3ModalProvider>
          {children}
        </Web3ModalProvider>
      </body>
    </html>
  )
}