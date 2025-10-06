#!/bin/bash

echo "🔍 验证Railway部署状态..."

# 替换为您的Railway应用URL
RAILWAY_URL="https://your-app-name.up.railway.app"

echo "📋 部署验证清单："
echo ""

echo "1. 🏥 健康检查"
echo "   curl $RAILWAY_URL/health"
echo ""

echo "2. 📊 API信息"
echo "   curl $RAILWAY_URL/api/info"
echo ""

echo "3. 📚 API文档"
echo "   curl $RAILWAY_URL/api/docs"
echo ""

echo "4. 🔍 检查Railway日志"
echo "   - 访问Railway Dashboard"
echo "   - 查看Deploy Logs"
echo "   - 确认无权限错误"
echo ""

echo "5. 🌐 测试CORS"
echo "   - 确保FRONTEND_URL设置正确"
echo "   - 测试跨域API调用"
echo ""

echo "✅ 修复验证："
echo "   - 无winston文件权限错误"
echo "   - 日志正常输出到控制台"
echo "   - 服务稳定运行"

echo ""
echo "🎯 如果部署成功，您将看到："
echo "   - Status: healthy"
echo "   - Environment: production"
echo "   - 无崩溃或重启循环"