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

TriBridge now follows a **full-stack Next.js architecture** for simplified deployment:

### Full-stack Application (Next.js)
- **Framework**: Next.js 13+ with App Router
- **Frontend**: React + TypeScript + Tailwind CSS + ShadCN/UI
- **Backend**: Next.js API Routes
- **State Management**: React Query
- **Port**: http://localhost:3000

### Blockchain Integration
- **Supported Networks**: Ethereum, TRON, BSC
- **Stablecoins**: USDT, USDC, DAI, BUSD
- **Wallet Integration**: MetaMask and other Web3 wallets

## 🏷️ Version Information

The current version of this release is **v3.0.0**, which represents a major architectural milestone for TriBridge - the migration to a full-stack Next.js architecture for simplified deployment.

### Version History
- **v3.0.0**: Next.js Full-stack Architecture (2025-09-17)
- **v2.0.0**: Frontend-Backend Separation Release (2025-09-17)
- **v1.0.0-nextjs**: Initial Next.js Migration (2025-09-17)

For detailed version information, please refer to [VERSION.md](VERSION.md).

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
cd tribridge-crossroads
npm install
```

### Development

```bash
# Start development server
npm run dev
# Visit: http://localhost:3000
```

### Environment Configuration

Create a `.env.local` file in the project root directory with the following variables:

```env
# Development Environment Variables
JWT_SECRET=your-super-secure-jwt-secret-here-min-32-chars
```

For production deployment, use appropriate environment variables in your deployment platform.

## 🛠️ API Endpoints

### Health Check
- `GET /api/health` - Health check

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

## 🧪 Testing

### Frontend Testing

```bash
# Run frontend tests
npm test

# Run frontend tests in watch mode
npm run test:watch

# Run frontend tests with UI
npm run test:ui
```

Frontend tests use Vitest with JSDOM environment. Test files are located in `src/services/__tests__/`.

### Backend Testing

```bash
# Navigate to backend directory
cd backend

# Run backend tests
npm test

# Run backend tests in watch mode
npm run test:watch

# Run backend tests with coverage
npm run test:coverage
```

Backend tests use Jest with Node.js environment. Test files are located in `backend/src/services/__tests__/`.

## 🐳 Deployment

### Netlify Deployment (Recommended)

```bash
# Deploy to Netlify
npm run deploy:netlify
```

The project includes a `netlify.toml` configuration file that specifies the build command and publish directory for seamless Netlify deployment.

### Vercel Deployment

```bash
# Deploy to Vercel
npm run deploy:vercel
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
├── pages/               # Next.js pages and API routes
│   ├── api/             # API routes
│   └── ...              # Page components
├── backend/             # Backend source code
│   ├── src/             # Backend source code
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utility functions
│   └── ...
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── netlify.toml         # Netlify deployment configuration
```

### Available Scripts

#### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

#### Testing
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI

#### Deployment
- `npm run deploy:netlify` - Deploy to Netlify
- `npm run deploy:vercel` - Deploy to Vercel

## 🔒 Security Features

- **JWT Authentication**: Secure user sessions
- **API Key Validation**: Service-to-service authentication
- **Rate Limiting**: Protection against abuse
- **Security Headers**: Next.js built-in security features
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