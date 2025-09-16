#!/bin/bash

# TriBridge 系统启动脚本
echo "🚀 启动 TriBridge 跨境支付系统..."

# 启动后端API服务
echo "📡 启动后端API服务 (端口8000)..."
cd backend
node dist/index-simple.js &
BACKEND_PID=$!
echo "后端服务PID: $BACKEND_PID"

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 测试后端API
echo "🔍 测试后端API..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端API服务运行正常"
else
    echo "❌ 后端API服务启动失败"
fi

echo ""
echo "🎉 TriBridge 系统启动完成！"
echo ""
echo "📊 系统状态:"
echo "  前端UI:    http://localhost:8080  (已运行)"
echo "  后端API:   http://localhost:8000"
echo ""
echo "🔗 可用API端点:"
echo "  健康检查:   GET  /health"
echo "  API信息:    GET  /api/info"
echo "  区块链列表: GET  /api/chains"
echo "  多链测试:   GET  /api/test/multichain"
echo ""
echo "📝 按 Ctrl+C 停止服务"

# 保持脚本运行
wait $BACKEND_PID