#!/bin/bash

# TriBridge 本地显示问题修复脚本

set -e

echo "🔧 修复TriBridge本地显示问题..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📋 开始诊断和修复...${NC}"

# 1. 检查当前进程
echo -e "${BLUE}1. 检查当前运行进程...${NC}"
VITE_PID=$(ps aux | grep -E "node.*vite" | grep -v grep | awk '{print $2}' | head -1)

if [ -n "$VITE_PID" ]; then
    echo -e "${GREEN}✅ 发现Vite进程 (PID: $VITE_PID)${NC}"
else
    echo -e "${YELLOW}⚠️ 未发现Vite进程${NC}"
fi

# 2. 检查端口占用
echo -e "${BLUE}2. 检查端口占用...${NC}"
if lsof -i :8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 端口8080已被占用${NC}"
    lsof -i :8080
else
    echo -e "${RED}❌ 端口8080未被占用${NC}"
fi

# 3. 测试本地连接
echo -e "${BLUE}3. 测试本地服务器连接...${NC}"
if curl -s --head http://localhost:8080 | head -1 | grep -q "200 OK"; then
    echo -e "${GREEN}✅ 本地服务器响应正常${NC}"
else
    echo -e "${RED}❌ 本地服务器连接失败${NC}"
fi

# 4. 检查依赖
echo -e "${BLUE}4. 检查项目依赖...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules存在${NC}"
else
    echo -e "${YELLOW}⚠️ node_modules不存在，正在安装...${NC}"
    npm install
fi

# 5. 清理和重建
echo -e "${BLUE}5. 清理缓存和重建...${NC}"

# 清理Vite缓存
if [ -d "node_modules/.vite" ]; then
    echo "清理Vite缓存..."
    rm -rf node_modules/.vite
fi

# 清理dist目录
if [ -d "dist" ]; then
    echo "清理构建目录..."
    rm -rf dist
fi

# 清理Next.js缓存
if [ -d ".next" ]; then
    echo "清理Next.js缓存..."
    rm -rf .next
fi

# 6. 修复TypeScript配置
echo -e "${BLUE}6. 检查TypeScript配置...${NC}"
if [ -f "tsconfig.json" ]; then
    # 备份原配置
    cp tsconfig.json tsconfig.json.backup
    
    # 创建优化的tsconfig
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
    echo -e "${GREEN}✅ TypeScript配置已优化${NC}"
fi

# 7. 修复package.json的type字段
echo -e "${BLUE}7. 修复package.json配置...${NC}"
if ! grep -q '"type": "module"' package.json; then
    # 添加type: module到package.json
    sed -i '' 's/"private": true,/"private": true,\n  "type": "module",/' package.json
    echo -e "${GREEN}✅ 已添加type: module到package.json${NC}"
fi

# 8. 重新启动开发服务器
echo -e "${BLUE}8. 重新启动开发服务器...${NC}"

# 杀死现有进程
if [ -n "$VITE_PID" ]; then
    echo "停止现有Vite进程..."
    kill $VITE_PID 2>/dev/null || true
    sleep 2
fi

# 清理所有相关进程
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*8080" 2>/dev/null || true

sleep 3

# 重新安装依赖
echo -e "${BLUE}9. 重新安装依赖...${NC}"
npm ci

# 启动开发服务器
echo -e "${BLUE}10. 启动开发服务器...${NC}"
echo "正在启动Vite开发服务器..."

# 启动Vite服务器并捕获输出
npm run vite:dev > vite.log 2>&1 &
VITE_NEW_PID=$!

# 等待服务器启动
echo "等待服务器启动..."
for i in {1..30}; do
    if curl -s --head http://localhost:8080 | grep -q "200 OK"; then
        echo -e "${GREEN}✅ 开发服务器启动成功！${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# 11. 最终验证
echo -e "${BLUE}11. 最终验证...${NC}"

if curl -s --head http://localhost:8080 | grep -q "200 OK"; then
    echo -e "${GREEN}🎉 修复完成！TriBridge本地显示问题已解决${NC}"
    echo ""
    echo -e "${BLUE}📋 访问信息:${NC}"
    echo "  🌐 本地地址: http://localhost:8080"
    echo "  🔧 诊断页面: file://$(pwd)/diagnose-display.html"
    echo "  📝 服务器日志: $(pwd)/vite.log"
    echo ""
    echo -e "${BLUE}📱 建议操作:${NC}"
    echo "  1. 打开浏览器访问 http://localhost:8080"
    echo "  2. 如果仍有问题，按F12打开开发者工具查看控制台错误"
    echo "  3. 尝试硬刷新：Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)"
else
    echo -e "${RED}❌ 修复未完成，服务器仍无法访问${NC}"
    echo ""
    echo -e "${YELLOW}💡 手动故障排除:${NC}"
    echo "  1. 检查服务器日志: cat vite.log"
    echo "  2. 手动启动: npm run vite:dev"
    echo "  3. 检查端口冲突: lsof -i :8080"
    echo "  4. 打开诊断页面: open diagnose-display.html"
fi

echo ""
echo -e "${BLUE}🔗 快速链接:${NC}"
echo "  • 主应用: http://localhost:8080"
echo "  • 诊断工具: file://$(pwd)/diagnose-display.html"
echo "  • 服务器进程: PID $VITE_NEW_PID"