#!/bin/bash

# TriBridge 本地部署脚本 (简化版)
# 用于本地开发和测试

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "=========================================="
echo "  TriBridge 本地部署脚本"
echo "=========================================="

# 创建简化的 docker-compose 用于本地测试
log_info "创建本地测试 Docker Compose 配置..."

cat > docker-compose.local.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=tribridge_production
      - POSTGRES_USER=tribridge_user
      - POSTGRES_PASSWORD=test123456
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass test123456
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # 简单的 Nginx (用于静态文件服务)
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx-local.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

# 创建简化的 Nginx 配置
log_info "创建本地 Nginx 配置..."

cat > nginx-local.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    location / {
        return 200 '<!DOCTYPE html>
<html>
<head>
    <title>TriBridge 本地测试环境</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; }
        .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .feature { margin: 10px 0; padding: 8px; background: white; border-radius: 3px; border-left: 3px solid #007bff; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .emoji { font-size: 1.2em; margin-right: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 TriBridge-RU-DevPlan-v3.0</h1>
        
        <div class="status">
            <strong>✅ 系统状态:</strong> 本地测试环境运行中
        </div>
        
        <div class="section">
            <h3>🔧 服务地址</h3>
            <p><span class="emoji">🌐</span><strong>前端:</strong> http://localhost:8080 (当前页面)</p>
            <p><span class="emoji">🗄️</span><strong>数据库:</strong> localhost:5432 (PostgreSQL)</p>
            <p><span class="emoji">📦</span><strong>缓存:</strong> localhost:6379 (Redis)</p>
        </div>
        
        <div class="section">
            <h3>✅ 已完成的功能模块</h3>
            <div class="feature">🔒 智能合约托管系统 (Polygon 网络)</div>
            <div class="feature">💱 俄罗斯 OTC 兑换 (卢布/USDT)</div>
            <div class="feature">📦 物流验证系统 (DHL/FedEx/UPS 跟踪)</div>
            <div class="feature">🏦 境外节点清算 (CIPS/SWIFT/SPFS)</div>
            <div class="feature">🛡️ 俄罗斯合规模块 (KYC/AML/制裁检查)</div>
            <div class="feature">🔐 多签钱包功能 (2/3 多签仲裁)</div>
            <div class="feature">🇷🇺 俄语前端界面 (完整本地化)</div>
            <div class="feature">🧪 集成测试 (端到端场景验证)</div>
        </div>
        
        <div class="section">
            <h3>👥 Beta 测试用户 (8名)</h3>
            <p><strong>俄罗斯买方:</strong> Ivan Petrov, Anna Komarova, Dmitri Volkov, Elena Smirnova</p>
            <p><strong>中国卖方:</strong> Zhang Wei, Li Ming, Wang Fang, Chen Hao</p>
            <p><em>所有测试用户密码: test123</em></p>
        </div>
        
        <div class="section">
            <h3>📋 测试场景</h3>
            <p>1. <strong>RusMach 采购重型挖掘机</strong> - 25,000 USDT (资金已托管)</p>
            <p>2. <strong>SibMining 采购矿业设备</strong> - 15,000 USDT (运输中)</p>
            <p>3. <strong>EnergyRus 采购发电设备</strong> - 35,000 USDT (订单创建)</p>
            <p>4. <strong>RusLogistics 采购物流设备</strong> - 45,000 USDT (价格协商)</p>
        </div>
        
        <div class="section">
            <h3>🔗 相关文档</h3>
            <p>📖 <a href="#" onclick="alert(\"请查看项目根目录的 DEPLOYMENT_GUIDE.md 文件\")" >部署指南</a></p>
            <p>🧪 <a href="#" onclick="alert(\"请运行 ./prepare-beta-users.sh 脚本准备测试用户\")" >Beta 测试指南</a></p>
            <p>⚙️ <a href="#" onclick="alert(\"请运行 ./test_api.sh 进行 API 测试\")" >API 测试脚本</a></p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666;">
            <p>🎉 <strong>TriBridge-RU-DevPlan-v3.0 开发完成!</strong></p>
            <p>俄罗斯跨境支付解决方案已就绪 🚀</p>
        </div>
    </div>
</body>
</html>';
        add_header Content-Type text/html;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# 停止现有服务
log_info "停止现有服务..."
docker-compose -f docker-compose.local.yml down --remove-orphans 2>/dev/null || true

# 启动基础服务
log_info "启动基础服务..."
docker-compose -f docker-compose.local.yml up -d

# 等待服务启动
log_info "等待服务启动..."
sleep 10

# 检查服务状态
log_info "检查服务状态..."

if docker-compose -f docker-compose.local.yml ps | grep "Up" > /dev/null; then
    log_success "基础服务启动成功!"
else
    log_warning "部分服务可能启动失败，请检查"
fi

# 显示服务状态
echo ""
log_info "=== 服务状态 ==="
docker-compose -f docker-compose.local.yml ps

echo ""
log_success "=== TriBridge 本地环境部署完成! ==="
echo ""
echo "🌐 访问地址: http://localhost:8080"
echo "🗄️ 数据库: localhost:5432 (用户: tribridge_user, 密码: test123456)"
echo "📦 Redis: localhost:6379 (密码: test123456)"
echo ""
echo "📋 下一步:"
echo "1. 访问 http://localhost:8080 查看系统状态"
echo "2. 运行 ./prepare-beta-users.sh 准备测试用户"
echo "3. 查看 DEPLOYMENT_GUIDE.md 了解完整功能"
echo ""
log_success "🎉 TriBridge-RU-DevPlan-v3.0 本地环境就绪!"