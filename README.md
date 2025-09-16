# TriBridge: Cross-border Payment Platform

TriBridge is a cutting-edge cross-border payment platform that leverages blockchain technology to enable fast, secure, and compliant international money transfers. Built with a modern tech stack, it supports multi-chain stablecoin settlements and integrates comprehensive KYC/AML compliance services.

## 🌟 Key Features

- **Multi-chain Stablecoin Support**: Seamless transactions across Ethereum, TRON, and BSC networks
- **KYC/AML Compliance**: Integrated with Sumsub, Onfido, and domestic compliance providers
- **Real-time Exchange Rates**: Live currency conversion with minimal slippage
- **Secure Transactions**: Multi-signature wallets and regulated bridges
- **Comprehensive Dashboard**: Real-time monitoring, analytics, and transaction history
- **Responsive UI**: Works seamlessly across desktop and mobile devices

## 🏗️ Architecture

TriBridge follows a **front-end and back-end separated** architecture:

### Frontend (展示UI)
- **Framework**: React + Vite + TypeScript
- **UI Library**: ShadCN/UI + Tailwind CSS
- **State Management**: React Query
- **Port**: http://localhost:3000

### Backend (API服务)
- **Framework**: Express.js + TypeScript + Socket.IO
- **Port**: http://localhost:8000
- **Database**: PostgreSQL + Redis
- **Authentication**: JWT + API Key validation

### Blockchain Integration
- **Supported Networks**: Ethereum, TRON, BSC
- **Stablecoins**: USDT, USDC, DAI, BUSD
- **Wallet Integration**: MetaMask and other Web3 wallets

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker (for containerized deployment)

### Frontend Setup

```bash
cd tribridge-crossroads
npm install
npm run dev
# Visit: http://localhost:3000
```

### Backend Setup

```bash
cd backend
npm install
npm run build
npm start
# API: http://localhost:8000
```

### Environment Configuration

Create a `.env` file in the project root directory with the following variables:

```env
# Development Environment Variables
NODE_ENV=development
VITE_API_URL=http://localhost:8000

# Blockchain Configuration (testnet)
VITE_ETH_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
VITE_TRON_RPC_URL=https://api.nileex.io
VITE_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

For production deployment, use `.env.production` with appropriate values.

## 🛠️ API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /api/docs` - API documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### KYC Services
- `POST /api/kyc/submit` - Submit KYC verification
- `GET /api/kyc/status` - Check KYC status

### Transactions
- `POST /api/transactions/preview` - Preview transaction
- `POST /api/transactions/execute` - Execute transaction
- `GET /api/transactions/history` - Transaction history

### Blockchain
- `GET /api/blockchain/chains` - Supported chains
- `GET /api/blockchain/balance` - Token balance
- `GET /api/blockchain/rates` - Exchange rates

## 🐳 Deployment

### Docker Deployment

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

### Cloud Deployment

```bash
# Deploy to GitHub Pages
npm run deploy:github

# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify
```

Note: For Netlify deployment, the project includes a `netlify.toml` configuration file that specifies the build command and publish directory.

### Backend Deployment

```bash
# Deploy to Heroku
cd backend
npm run deploy:heroku

# Deploy to Railway
cd backend
npm run deploy:railway
```

## 🔧 Development

### Project Structure

```
tribridge-crossroads/
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   └── contexts/        # React contexts
├── public/              # Static assets
├── backend/             # Backend API service
│   ├── src/             # Backend source code
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utility functions
│   └── prisma/          # Database schema
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Multi-container setup
└── nginx.conf           # Nginx reverse proxy
```

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

#### Deployment
- `npm run deploy:github` - Deploy to GitHub Pages
- `npm run deploy:vercel` - Deploy to Vercel
- `npm run deploy:netlify` - Deploy to Netlify
- `npm run docker:build` - Build Docker image
- `npm run docker:compose` - Run with Docker Compose

## 🔒 Security Features

- **JWT Authentication**: Secure user sessions
- **API Key Validation**: Service-to-service authentication
- **Rate Limiting**: Protection against abuse
- **Helmet.js**: Security headers
- **CORS Configuration**: Controlled resource sharing
- **Input Validation**: Zod schema validation
- **Encrypted Storage**: Sensitive data encryption

## 📊 Monitoring & Analytics

- **Real-time Updates**: WebSocket connections
- **Performance Metrics**: Transaction processing times
- **Error Tracking**: Comprehensive logging
- **Health Checks**: Automated system monitoring

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@tribridge.com or join our [Discord community](https://discord.gg/tribridge).

---

**TriBridge Team**  
*Building the next generation of cross-border payment infrastructure*