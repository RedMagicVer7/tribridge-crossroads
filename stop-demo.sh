#!/bin/bash

# TriBridge 项目停止脚本

echo "🛑 停止 TriBridge 演示服务..."

# 读取保存的进程ID并终止
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "停止后端服务 (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm -f .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "停止前端服务 (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm -f .frontend.pid
fi

# 强制终止端口占用的进程
echo "清理端口占用..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo "✅ 所有服务已停止"