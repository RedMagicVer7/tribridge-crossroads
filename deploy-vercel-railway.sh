#!/bin/bash

# TriBridge Vercel + Railway 部署脚本
# 作者: RedMagicVer7
# 用途: 一键准备和部署TriBridge到Vercel和Railway

set -e

echo "🚀 TriBridge Vercel + Railway 部署准备脚本"
echo "============================================"

# 检查必要工具
check_tools() {
    echo "📋 检查必要工具..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git 未安装，请先安装 Git"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 npm"
        exit 1
    fi
    
    echo "✅ 所有必要工具已安装"
}

# 安装CLI工具
install_cli() {
    echo "🔧 安装部署CLI工具..."
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 安装 Vercel CLI..."
        npm install -g vercel
    else
        echo "✅ Vercel CLI 已安装"
    fi
    
    if ! command -v railway &> /dev/null; then
        echo "📦 安装 Railway CLI..."
        npm install -g @railway/cli
    else
        echo "✅ Railway CLI 已安装"
    fi
}

# 准备项目
prepare_project() {
    echo "📂 准备项目文件..."
    
    # 确保在项目根目录
    if [ ! -f "package.json" ]; then
        echo "❌ 请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 安装依赖
    echo "📦 安装前端依赖..."
    npm install
    
    echo "📦 安装后端依赖..."
    cd backend
    npm install
    cd ..
    
    # 构建测试
    echo "🔨 测试构建..."
    npm run build
    
    echo "🔨 测试后端构建..."
    cd backend
    npm run build
    cd ..
    
    echo "✅ 项目准备完成"
}

# 检查Git状态
check_git() {
    echo "🔍 检查Git状态..."
    
    if [ -z "$(git remote -v)" ]; then
        echo "❌ 未设置Git远程仓库"
        echo "请先执行: git remote add origin https://github.com/RedMagicVer7/tribridge-crossroads.git"
        exit 1
    fi
    
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  有未提交的更改，是否提交并推送? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Prepare for Vercel + Railway deployment"
            git push origin main
        else
            echo "请先提交您的更改"
            exit 1
        fi
    fi
    
    echo "✅ Git状态正常"
}

# 显示环境变量模板
show_env_template() {
    echo "📋 环境变量配置模板"
    echo "===================="
    
    echo ""
    echo "🌐 Vercel前端环境变量:"
    echo "---------------------"
    cat .env.vercel
    
    echo ""
    echo "🚀 Railway后端环境变量:"
    echo "----------------------"
    cat .env.railway
}

# 部署指导
deployment_guide() {
    echo ""
    echo "🎯 下一步部署指导"
    echo "=================="
    echo ""
    echo "1. 🚀 部署后端到Railway:"
    echo "   a) 访问 https://railway.app/dashboard"
    echo "   b) 选择 'Deploy from GitHub repo'"
    echo "   c) 选择 'tribridge-crossroads' 仓库"
    echo "   d) 设置 Root Directory 为 'backend'"
    echo "   e) 添加 PostgreSQL 和 Redis 插件"
    echo "   f) 配置环境变量 (参考 .env.railway)"
    echo ""
    echo "2. 🌐 部署前端到Vercel:"
    echo "   a) 访问 https://vercel.com/dashboard"
    echo "   b) 选择 'Import Git Repository'"
    echo "   c) 选择 'tribridge-crossroads' 仓库"
    echo "   d) Framework: Vite, Build Command: npm run build"
    echo "   e) 配置环境变量 (参考 .env.vercel)"
    echo "   f) 将VITE_API_URL设置为Railway后端URL"
    echo ""
    echo "3. 🔄 更新CORS配置:"
    echo "   a) 在Railway后端添加环境变量:"
    echo "   b) FRONTEND_URL=https://your-vercel-app.vercel.app"
    echo ""
    echo "4. ✅ 验证部署:"
    echo "   a) 访问Vercel URL确认前端正常"
    echo "   b) 测试API调用: curl https://railway-url/health"
    echo ""
    echo "📖 详细文档: ./VERCEL_RAILWAY_DEPLOYMENT.md"
}

# 主函数
main() {
    check_tools
    install_cli
    prepare_project
    check_git
    show_env_template
    deployment_guide
    
    echo ""
    echo "🎉 部署准备完成!"
    echo "请按照上述指导完成Vercel和Railway的部署配置"
    echo ""
    echo "📚 查看完整部署指南: ./VERCEL_RAILWAY_DEPLOYMENT.md"
}

# 运行主函数
main "$@"