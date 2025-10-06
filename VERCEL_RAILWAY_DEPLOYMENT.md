# TriBridge Vercel + Railway 部署指南

本指南将帮助您将TriBridge项目部署到Vercel（前端）和Railway（后端）。

## 🎯 部署架构

```
用户浏览器
    ↓
Vercel (前端)
    ↓ API调用
Railway (后端)
    ↓
PostgreSQL & Redis (Railway托管)
```

## 📋 准备工作

### 1. 账号准备
- [Vercel账号](https://vercel.com) (推荐使用GitHub登录)
- [Railway账号](https://railway.app) (推荐使用GitHub登录)
- GitHub仓库 (代码托管)

### 2. 代码准备
确保您的代码已推送到GitHub仓库，用户名：`RedMagicVer7`

## 🚀 Railway后端部署步骤

### 步骤1: 创建Railway项目
1. 访问 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择您的 `tribridge-crossroads` 仓库

### 步骤2: 配置服务
1. Railway会自动检测到多个服务，选择部署后端
2. 设置 Root Directory 为 `backend`
3. 确认Build Command: `npm run build`
4. 确认Start Command: `npm start`

### 步骤3: 添加数据库服务
1. 在同一项目中点击 "Add Service"
2. 选择 "PostgreSQL" 插件
3. Railway会自动生成 `DATABASE_URL` 环境变量

### 步骤4: 添加Redis服务  
1. 在同一项目中点击 "Add Service"
2. 选择 "Redis" 插件
3. Railway会自动生成 `REDIS_URL` 环境变量

### 步骤5: 配置环境变量
在Railway后端服务的Variables部分添加以下变量：

```bash
# 应用配置
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-vercel-app.vercel.app

# 数据库 (自动生成)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# JWT配置
JWT_SECRET=your-super-secure-jwt-secret-change-this

# 区块链配置
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_ID
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_ID
TRON_RPC_URL=https://api.trongrid.io
BSC_RPC_URL=https://bsc-dataseed.binance.org

# 智能合约地址
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
RUSSIA_ESCROW_CONTRACT=0x1234567890123456789012345678901234567890

# 私钥 (生产环境请使用安全的密钥管理)
PRIVATE_KEY=your-private-key-here

# KYC服务 (可选)
SUMSUB_APP_TOKEN=your-sumsub-token
ONFIDO_API_TOKEN=your-onfido-token

# 俄罗斯OTC服务 (可选)
RUSSIA_OTC_API_KEY=your-russia-otc-api-key
SBERBANK_API_KEY=your-sberbank-api-key
VTB_API_KEY=your-vtb-api-key

# 物流服务 (可选)
LOGISTICS_API_KEY=your-logistics-api-key
DHL_API_KEY=your-dhl-api-key
FEDEX_API_KEY=your-fedex-api-key

# 合规服务 (可选)
COMPLIANCE_API_KEY=your-compliance-api-key
```

### 步骤6: 获取后端URL
部署完成后，记录Railway分配的URL，格式类似：
`https://your-app-name-production.up.railway.app`

## 🌐 Vercel前端部署步骤

### 步骤1: 连接GitHub仓库
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择您的 `tribridge-crossroads` 仓库
4. 保持Root Directory为默认 `./`

### 步骤2: 配置构建设置
Vercel会自动检测项目配置，确认以下设置：
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 步骤3: 配置环境变量
在Vercel项目设置的Environment Variables部分添加：

```bash
# API配置 (使用Railway后端URL)
VITE_API_URL=https://your-railway-backend.up.railway.app

# 应用配置
VITE_APP_TITLE=TriBridge Cross-border Payment Platform
NODE_ENV=production
VITE_APP_ENV=production

# 区块链配置
VITE_ETH_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_ID
VITE_TRON_RPC_URL=https://api.trongrid.io
VITE_BSC_RPC_URL=https://bsc-dataseed.binance.org
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# 功能开关
VITE_ENABLE_RUSSIA_MODULE=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

### 步骤4: 部署项目
1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要2-5分钟）
3. 获取Vercel分配的URL

### 步骤5: 更新CORS配置
回到Railway，在后端环境变量中更新：
```bash
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## 🔧 本地开发命令

### 一键部署脚本
```bash
# 部署到Vercel
npm run deploy:vercel

# 或手动部署
vercel --prod
```

### 本地测试生产构建
```bash
# 构建前端
npm run build

# 预览构建结果
npm run preview

# 测试后端
cd backend
npm run build
npm start
```

## 📝 部署后验证

### 1. 检查前端
访问您的Vercel URL，确认：
- ✅ 页面正常加载
- ✅ 路由功能正常
- ✅ API调用成功

### 2. 检查后端
访问您的Railway URL：
```bash
# 健康检查
curl https://your-railway-backend.up.railway.app/health

# API信息
curl https://your-railway-backend.up.railway.app/api/info

# 区块链支持
curl https://your-railway-backend.up.railway.app/api/chains
```

### 3. 检查数据库连接
确认后端日志显示数据库连接成功。

## 🚨 常见问题

### 问题1: CORS错误
**解决方案**: 确保Railway后端的 `FRONTEND_URL` 环境变量设置为正确的Vercel URL

### 问题2: API调用失败
**解决方案**: 确认Vercel的 `VITE_API_URL` 指向正确的Railway URL

### 问题3: 数据库连接失败
**解决方案**: 检查Railway PostgreSQL插件是否正确安装并生成了 `DATABASE_URL`

### 问题4: 构建失败
**解决方案**: 检查 `package.json` 中的依赖是否完整，确认Node.js版本兼容

## 🔒 安全建议

1. **环境变量**: 永远不要将敏感信息提交到代码仓库
2. **私钥管理**: 生产环境使用硬件钱包或密钥管理服务
3. **API密钥**: 定期轮换第三方服务的API密钥
4. **HTTPS**: 确保所有API调用都使用HTTPS
5. **CORS**: 严格配置CORS策略，只允许可信域名

## 📊 监控和日志

### Vercel监控
- 访问Vercel Dashboard查看部署状态和性能指标
- 查看Function Logs了解API调用情况

### Railway监控
- 访问Railway Dashboard查看服务状态和资源使用
- 查看Deploy Logs了解部署过程
- 监控数据库连接和性能

## 🔄 CI/CD流程

两个平台都支持Git集成，当您推送代码到GitHub时：
1. Vercel自动重新部署前端
2. Railway自动重新部署后端
3. 支持Preview deployments for Pull Requests

## 💰 成本估算

### Vercel (前端)
- **Hobby Plan**: 免费
  - 100GB带宽/月
  - 12个项目
  - Serverless Functions: 100小时/月

### Railway (后端 + 数据库)
- **Starter Plan**: 免费 (有限额度)
  - $5信用额度/月
  - 512MB RAM
  - 1GB磁盘
- **Developer Plan**: $20/月
  - $20信用额度
  - 8GB RAM
  - 100GB磁盘

## 🎉 部署完成

恭喜！您的TriBridge应用现在已经成功部署到：
- 🌐 **前端**: https://your-app.vercel.app
- 🚀 **后端**: https://your-app.up.railway.app

现在您可以：
1. 分享链接给Beta测试用户
2. 配置自定义域名
3. 设置监控和告警
4. 准备生产环境优化

---

**技术支持**: 如果遇到问题，请查看Railway和Vercel的官方文档，或在项目Issues中反馈。