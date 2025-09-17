# TriBridge Version Information

## Current Version: v3.0.0 - Next.js Full-stack Architecture

This version represents a major architectural milestone for TriBridge - the migration from frontend-backend separation to a full-stack Next.js architecture for simplified deployment.

### Version Details
- **Version**: v3.0.0
- **Architecture**: Next.js Full-stack Architecture
- **Frontend**: Next.js 13+ with App Router
- **Backend**: Next.js API Routes
- **Release Date**: 2025-09-17

### Key Features of This Release

#### Full-stack Application (Next.js)
- **Framework**: Next.js 13+ with App Router
- **Frontend**: React + TypeScript + Tailwind CSS + ShadCN/UI
- **Backend**: Next.js API Routes
- **State Management**: React Query
- **Port**: http://localhost:3000

#### Blockchain Integration
- **Supported Networks**: Ethereum, TRON, BSC
- **Stablecoins**: USDT, USDC, DAI, BUSD
- **Wallet Integration**: MetaMask and other Web3 wallets

### Deployment Information
- **Unified Deployment**: Single deployment for entire application
- **Platform**: Netlify (recommended) or Vercel
- **Build Command**: next build
- **Publish Directory**: .next

### API Endpoints
```
GET  /api/health              - Health check
POST /api/auth/register       - User registration
POST /api/auth/login          - User login
POST /api/auth/refresh        - Refresh token
```

### Version History
- v3.0.0 (2025-09-17): Next.js Full-stack Architecture
- v2.0.0 (2025-09-17): Frontend-Backend Separation Release
- v1.x.x (Previous): Monolithic architecture

This migration to a full-stack Next.js architecture allows for simplified deployment to platforms like Netlify while maintaining all existing functionality. The unified architecture reduces complexity and operational overhead, making it easier to develop, deploy, and maintain the application.