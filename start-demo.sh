#!/bin/bash

# TriBridge 项目启动脚本
# 启动前端和后端服务用于演示

echo "🚀 启动 TriBridge 稳定币跨境支付平台演示..."
echo "======================================================"

# 检查Node.js版本
echo "📋 检查系统环境..."
node_version=$(node --version)
echo "Node.js 版本: $node_version"

# 检查端口占用
echo "🔍 检查端口状态..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 已被占用，正在尝试终止..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

if lsof -i :8000 > /dev/null 2>&1; then
    echo "⚠️  端口 8000 已被占用，正在尝试终止..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

# 安装依赖
echo "📦 安装前端依赖..."
npm install

echo "📦 安装后端依赖..."
cd backend
npm install
cd ..

# 创建环境变量文件
echo "⚙️  配置环境变量..."
if [ ! -f .env ]; then
    cat > .env << EOF
# 前端环境变量
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=TriBridge
NEXT_PUBLIC_APP_VERSION=3.0.0
NEXT_PUBLIC_ENVIRONMENT=development
EOF
fi

if [ ! -f backend/.env ]; then
    cat > backend/.env << EOF
# 后端环境变量
PORT=8000
NODE_ENV=development
API_VERSION=1.0.0
FRONTEND_URL=http://localhost:3000

# JWT配置
JWT_SECRET=tribridge_demo_secret_key_2024
JWT_EXPIRES_IN=24h

# 数据库配置（演示用SQLite）
DATABASE_URL="file:./dev.db"

# Redis配置（可选，演示时可跳过）
REDIS_URL=redis://localhost:6379

# 区块链配置
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/demo
TRON_RPC_URL=https://api.trongrid.io
BSC_RPC_URL=https://bsc-dataseed.binance.org

# CIPS配置（测试环境）
CIPS_PARTICIPANT_CODE=TEST001
CIPS_API_ENDPOINT=https://api-sandbox.cips.com.cn
CIPS_API_KEY=demo_key

# NPS配置（测试环境）
NPS_BANK_ID=TEST_BANK
NPS_API_ENDPOINT=https://api-test.nps.ru
NPS_API_KEY=demo_key

# API密钥（演示用）
API_KEY=tribridge_demo_api_key_2024
EOF
fi

echo "✅ 环境配置完成"

# 启动后端服务
echo "🔧 启动后端服务..."
cd backend
echo "编译TypeScript代码..."
npm run build

echo "启动后端API服务 (端口: 8000)..."
npm start &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 检查后端健康状态
echo "🔍 检查后端服务状态..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务启动成功!"
    echo "📊 API文档: http://localhost:8000/api/docs"
    echo "❤️  健康检查: http://localhost:8000/health"
else
    echo "❌ 后端服务启动失败，请检查日志"
fi

# 启动前端服务
echo "🎨 启动前端服务..."
echo "构建Next.js应用..."
npm run build

echo "启动前端应用 (端口: 3000)..."
npm start &
FRONTEND_PID=$!

# 等待前端启动
echo "⏳ 等待前端服务启动..."
sleep 8

# 检查前端状态
echo "🔍 检查前端服务状态..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务启动成功!"
else
    echo "❌ 前端服务启动失败，请检查日志"
fi

echo ""
echo "🎉 TriBridge 平台启动完成!"
echo "======================================================"
echo "🌐 前端访问地址: http://localhost:3000"
echo "🔧 后端API地址:  http://localhost:8000"
echo "📚 API文档:      http://localhost:8000/api/docs"
echo ""
echo "✨ 核心功能演示:"
echo "   • OTC/P2P 交易: /otc"
echo "   • 资金池管理:   /pools" 
echo "   • 钱包连接:     /wallet"
echo "   • 合规验证:     /compliance"
echo "   • 交易历史:     /transactions"
echo "   • 数据分析:     /analytics"
echo ""
echo "🛑 停止服务: Ctrl+C 或运行 ./stop-demo.sh"
echo "======================================================"

# 保存进程ID以便停止
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# 等待用户中断
trap 'echo ""; echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; echo "✅ 服务已停止"; exit 0' INT

echo "按 Ctrl+C 停止演示服务"
wait