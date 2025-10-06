# 🚀 TriBridge Vercel + Railway 部署清单

## ✅ 部署前检查清单

### 📋 准备工作
- [ ] GitHub仓库已创建 (`RedMagicVer7/tribridge-crossroads`)
- [ ] 代码已推送到主分支
- [ ] **本地构建测试通过** ✅ (已修复TypeScript错误)
- [ ] Vercel账号已准备 (建议GitHub登录)
- [ ] Railway账号已准备 (建议GitHub登录)

### 🔧 工具安装
```bash
# 安装部署工具
npm install -g vercel @railway/cli

# 运行准备脚本
./deploy-vercel-railway.sh
```

## 🎯 部署步骤

### 1️⃣ Railway后端部署 (先部署)
1. 访问 [Railway Dashboard](https://railway.app/dashboard)
2. New Project → Deploy from GitHub → 选择仓库
3. 设置 Root Directory: `backend`
4. 添加服务: PostgreSQL + Redis
5. 配置环境变量 (参考 `.env.railway`)
6. 记录后端URL: `https://xxx.up.railway.app`

### 2️⃣ Vercel前端部署 (后部署)
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. Add New Project → Import Git Repository
3. Framework: Vite, Build: `npm run build`
4. 配置环境变量 (参考 `.env.vercel`)
5. **重要**: 设置 `VITE_API_URL` 为Railway后端URL
6. 部署完成后记录前端URL

### 3️⃣ CORS配置更新
1. 在Railway后端添加环境变量:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
2. 重新部署后端服务

## 🧪 验证部署

### 前端验证
- [ ] Vercel URL可以正常访问
- [ ] 页面路由功能正常
- [ ] 控制台无严重错误

### 后端验证
```bash
# 健康检查
curl https://your-railway-app.up.railway.app/health

# API信息
curl https://your-railway-app.up.railway.app/api/info
```

### 集成验证
- [ ] 前端可以成功调用后端API
- [ ] 数据库连接正常
- [ ] Redis缓存工作正常

## 📝 环境变量快速配置

### Vercel环境变量 (必需)
```bash
VITE_API_URL=https://your-railway-app.up.railway.app
VITE_APP_TITLE=TriBridge Cross-border Payment Platform
NODE_ENV=production
```

### Railway环境变量 (必需)
```bash
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-vercel-app.vercel.app
RAILWAY_ENVIRONMENT=true  # 重要：修复日志权限问题
DATABASE_URL=${{Postgres.DATABASE_URL}}  # 自动生成
REDIS_URL=${{Redis.REDIS_URL}}            # 自动生成
JWT_SECRET=your-super-secure-jwt-secret
```

## 🚨 常见问题解决

| 问题 | 解决方案 |
|------|----------|
| CORS错误 | 检查Railway的FRONTEND_URL设置 |
| API调用失败 | 确认Vercel的VITE_API_URL正确 |
| 构建失败 | 检查依赖和Node.js版本 |
| 数据库连接失败 | 确认PostgreSQL插件已安装 |
| **日志权限错误 (EACCES)** | **设置RAILWAY_ENVIRONMENT=true** 🔴 |

## 💰 成本预估

| 平台 | 免费额度 | 付费计划 |
|------|----------|----------|
| **Vercel** | 100GB流量/月 | $20/月起 |
| **Railway** | $5信用/月 | $20/月起 |

## 🎉 部署完成

✅ **前端**: https://your-app.vercel.app  
✅ **后端**: https://your-app.up.railway.app  
✅ **状态**: 生产环境就绪

---

**下一步**: 
1. 配置自定义域名
2. 设置监控告警  
3. 准备Beta测试
4. 优化性能配置