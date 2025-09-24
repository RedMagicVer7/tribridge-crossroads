# TriBridge 生产环境部署指南

## 概述

TriBridge-RU-DevPlan-v3.0 现已完成开发，包含完整的俄罗斯跨境支付解决方案。本指南将帮助您部署生产环境并进行 Beta 测试。

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │    │  后端 (Node.js)  │    │ 智能合约 (Polygon)│
│   俄语界面      │◄──►│   Express API   │◄──►│   托管系统      │
│   支付方式 UI    │    │   合规检查      │    │   多签钱包      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Nginx      │    │   PostgreSQL    │    │   监控系统      │
│   反向代理      │    │     数据库      │    │  Prometheus     │
│   SSL 终端      │    │     Redis       │    │   Grafana       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 功能特性

### ✅ 已完成的核心功能

1. **智能合约托管系统**
   - Polygon 网络部署
   - USDT 托管和自动释放
   - 15天自动释放机制
   - 多签仲裁和争议处理

2. **俄罗斯 OTC 交易**
   - 卢布/USDT 兑换
   - 集成俄罗斯支付方式 (Sberbank, VTB, YooMoney)
   - 实时汇率和手续费计算

3. **物流验证系统**
   - 国际物流跟踪 (DHL, FedEx, UPS)
   - 发货凭证上传和验证
   - 自动状态更新

4. **境外节点清算**
   - CIPS, SWIFT, SPFS 网络集成
   - B2B 闭环支付
   - 多币种清算路由

5. **俄罗斯合规模块**
   - KYC/AML 验证
   - 制裁名单检查 (OFAC, EU, 俄罗斯)
   - 实时合规监控

6. **多签钱包功能**
   - 2/3 多签机制
   - 冷存储支持
   - 仲裁投票系统

7. **俄语前端界面**
   - 完整俄语本地化
   - 俄罗斯支付方式 UI
   - 移动端适配

8. **集成测试**
   - RusMach-ChinaEquip 完整场景测试
   - 端到端功能验证

## 快速部署

### 1. 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ 内存
- 10GB+ 磁盘空间

### 2. 部署步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd tribridge-crossroads

# 2. 配置环境变量
cp .env.production.example .env.production
# 编辑 .env.production 填入真实配置

# 3. 执行部署脚本
./deploy.sh

# 4. 准备 Beta 测试用户
./prepare-beta-users.sh
```

### 3. 访问地址

- 🌐 前端界面: https://localhost
- 🔧 后端 API: https://localhost/api
- 📊 监控面板: http://localhost:3001
- 📈 Prometheus: http://localhost:9090

## Beta 测试

### 测试用户账号 (8名)

#### 俄罗斯买方用户
1. **Ivan Petrov** - ivan.petrov@rusmach.ru (密码: test123)
2. **Anna Komarova** - anna.komarova@sibmining.ru (密码: test123)
3. **Dmitri Volkov** - dmitri.volkov@energyrus.ru (密码: test123)
4. **Elena Smirnova** - elena.smirnova@ruslogistics.ru (密码: test123)

#### 中国卖方用户
1. **Zhang Wei** - zhang.wei@chinaequip.com (密码: test123)
2. **Li Ming** - li.ming@heavyind.com (密码: test123)
3. **Wang Fang** - wang.fang@manufacturecn.com (密码: test123)
4. **Chen Hao** - chen.hao@chinatrade.com (密码: test123)

### 测试场景

1. **完整交易流程**
   - 用户注册和 KYC 验证
   - 卢布 → USDT OTC 兑换
   - 智能合约托管
   - 物流验证和跟踪
   - 收货确认和资金释放

2. **合规检查**
   - 制裁名单验证
   - AML 风险评估
   - 交易限额检查

3. **多签钱包**
   - 争议处理流程
   - 仲裁投票
   - 多签授权

## 配置说明

### 关键环境变量

```env
# 区块链配置
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address_here

# 数据库配置
DATABASE_URL=postgresql://user:pass@postgres:5432/tribridge_production
REDIS_URL=redis://:password@redis:6379

# 第三方服务
RUSSIA_OTC_API_KEY=your_russia_otc_api_key
LOGISTICS_API_KEY=your_logistics_api_key
COMPLIANCE_API_KEY=your_compliance_api_key

# 俄罗斯支付
SBERBANK_API_KEY=your_sberbank_api_key
VTB_API_KEY=your_vtb_api_key
YOOMONEY_API_KEY=your_yoomoney_api_key
```

### SSL 证书

```bash
# 生产环境请使用正式 SSL 证书
# 测试环境可使用自签名证书 (部署脚本会自动生成)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/tribridge.key \
  -out ssl/tribridge.crt
```

## 监控和日志

### Grafana 监控面板

- 访问: http://localhost:3001
- 用户名: admin
- 密码: (在 .env.production 中配置)

### 主要监控指标

- 系统性能 (CPU, 内存, 磁盘)
- 交易量和成功率
- API 响应时间
- 数据库连接数
- 区块链交易状态

### 日志查看

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# 实时日志
docker-compose -f docker-compose.prod.yml logs -f
```

## 安全配置

### 网络安全

- Nginx 反向代理
- SSL/TLS 加密
- 防火墙配置
- 请求频率限制

### 数据安全

- 数据库加密
- Redis 密码保护
- 敏感信息环境变量
- 定期备份

### 区块链安全

- 私钥安全存储
- 多签钱包验证
- 交易限额控制
- 智能合约审计

## 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

2. **Redis 连接失败**
   ```bash
   # 检查 Redis 状态
   docker-compose -f docker-compose.prod.yml logs redis
   ```

3. **智能合约调用失败**
   - 检查 Polygon 网络连接
   - 验证合约地址和 ABI
   - 确认私钥权限

4. **前端无法访问**
   - 检查 Nginx 配置
   - 验证 SSL 证书
   - 查看前端构建日志

### 性能优化

1. **数据库优化**
   - 添加索引
   - 查询优化
   - 连接池配置

2. **缓存策略**
   - Redis 缓存热点数据
   - CDN 静态资源
   - API 响应缓存

3. **负载均衡**
   - 多实例部署
   - 数据库读写分离
   - 前端 CDN 加速

## 维护和更新

### 定期维护

- 日志轮转和清理
- 数据库备份
- 安全更新
- 性能监控

### 版本更新

```bash
# 停止服务
docker-compose -f docker-compose.prod.yml down

# 备份数据
docker run --rm -v postgres_data:/backup alpine tar czf /backup/backup.tar.gz /var/lib/postgresql/data

# 更新代码
git pull origin main

# 重新部署
./deploy.sh
```

## 技术支持

- 📧 技术支持: admin@tribridge.com
- 📖 API 文档: https://localhost/api/docs
- 🐛 问题反馈: GitHub Issues
- 💬 技术讨论: Telegram/Discord

---

**TriBridge-RU-DevPlan-v3.0** 已完成全部开发任务，生产环境就绪！ 🚀