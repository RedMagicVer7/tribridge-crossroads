# TriBridge 部署指南

本文档详细说明了如何将TriBridge跨境支付平台部署到GitHub Pages和其他云平台。

## 🚀 快速部署

### 方法一：GitHub Pages 自动部署

1. **启用GitHub Actions**
   ```bash
   # 推送代码到GitHub后，Actions会自动运行
   git push origin main
   ```

2. **手动部署到GitHub Pages**
   ```bash
   # 使用提供的部署脚本
   ./deploy-github-pages.sh
   ```

3. **访问部署的网站**
   - 主域名: `https://redmagicver7.github.io/tribridge-crossroads`
   - 自定义域名: `https://tribridge.pages.dev` (需配置)

### 方法二：Docker容器部署

1. **本地Docker测试**
   ```bash
   # 构建和运行容器
   docker-compose up --build
   
   # 访问应用
   # 前端: http://localhost:8080
   # 后端API: http://localhost:8000
   ```

2. **生产环境部署**
   ```bash
   # 使用生产环境配置
   docker-compose -f docker-compose.yml up -d
   ```

## 📋 部署配置

### GitHub Pages 配置

1. **仓库设置**
   - 进入GitHub仓库设置页面
   - 找到"Pages"部分
   - 选择源分支：`gh-pages`
   - 保存设置

2. **自定义域名** (可选)
   - 添加CNAME记录：`tribridge.pages.dev`
   - 在DNS设置中配置域名指向GitHub Pages

### 环境变量配置

**生产环境需要配置以下关键变量：**

```bash
# 数据库
DATABASE_URL=postgresql://user:pass@host:5432/tribridge

# 区块链RPC节点
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
TRON_RPC_URL=https://api.trongrid.io
BSC_RPC_URL=https://bsc-dataseed1.binance.org

# KYC/AML服务
SUMSUB_APP_TOKEN=your_sumsub_token
ONFIDO_API_TOKEN=your_onfido_token

# JWT密钥
JWT_SECRET=your-super-secure-secret-key
```

## 🔧 部署平台选择

### 1. GitHub Pages (推荐用于前端)
- ✅ 免费托管
- ✅ 自动HTTPS
- ✅ CDN加速
- ❌ 仅支持静态文件
- ❌ 不支持后端API

### 2. Vercel (推荐用于全栈)
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 3. Netlify
```bash
# 使用Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### 4. Railway (推荐用于后端)
```bash
# 连接Railway
npx @railway/cli login
railway link
railway up
```

### 5. Heroku
```bash
# 创建Heroku应用
heroku create tribridge-api
git push heroku main
```

## 📊 监控和日志

### 1. GitHub Actions监控
- 查看部署状态：仓库 → Actions 标签页
- 查看构建日志：点击具体的workflow运行

### 2. 应用监控
```bash
# 检查应用状态
curl https://your-domain.com/api/health

# 查看Docker容器日志
docker-compose logs -f backend
```

## 🔒 安全配置

### 1. 环境变量安全
- 使用GitHub Secrets存储敏感信息
- 不要在代码中硬编码密钥
- 定期轮换API密钥

### 2. HTTPS配置
- GitHub Pages自动提供HTTPS
- 自定义域名需要配置SSL证书

### 3. CORS配置
```javascript
// 生产环境CORS设置
const corsOptions = {
  origin: ['https://tribridge.pages.dev', 'https://your-domain.com'],
  credentials: true
}
```

## 🔄 更新部署

### 自动更新
推送到main分支会自动触发部署：
```bash
git add .
git commit -m "feat: 新功能更新"
git push origin main
```

### 手动更新
```bash
# 重新构建和部署
npm run build
./deploy-github-pages.sh
```

## 🎯 部署检查清单

- [ ] 代码已推送到GitHub
- [ ] GitHub Actions配置正确
- [ ] 环境变量已配置
- [ ] 域名DNS已设置
- [ ] HTTPS证书已配置
- [ ] 数据库连接正常
- [ ] API端点可访问
- [ ] 前端页面加载正常

## 📞 支持

如遇到部署问题，请检查：
1. GitHub Actions构建日志
2. 浏览器开发者工具控制台
3. 网络连接和DNS设置
4. API密钥和权限配置

---

🎉 **恭喜！您的TriBridge跨境支付平台已成功部署！**