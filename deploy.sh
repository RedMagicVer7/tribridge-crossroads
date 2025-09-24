#!/bin/bash

# TriBridge 生产环境部署脚本
# 版本: v3.0
# 日期: 2025-09-23

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "系统依赖检查完成"
}

# 创建必要目录
create_directories() {
    log_info "创建必要目录..."
    
    mkdir -p logs
    mkdir -p ssl
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p scripts
    
    log_success "目录创建完成"
}

# 环境配置检查
check_environment() {
    log_info "检查环境配置..."
    
    if [ ! -f ".env.production" ]; then
        log_error "未找到 .env.production 文件，请先配置环境变量"
        exit 1
    fi
    
    # 检查关键环境变量
    source .env.production
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL 未配置"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        log_error "JWT_SECRET 未配置"
        exit 1
    fi
    
    if [ -z "$POLYGON_RPC_URL" ]; then
        log_error "POLYGON_RPC_URL 未配置"
        exit 1
    fi
    
    log_success "环境配置检查完成"
}

# SSL 证书检查
check_ssl() {
    log_info "检查 SSL 证书..."
    
    if [ ! -f "ssl/tribridge.crt" ] || [ ! -f "ssl/tribridge.key" ]; then
        log_warning "SSL 证书未找到，生成自签名证书用于测试..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/tribridge.key \
            -out ssl/tribridge.crt \
            -subj "/C=US/ST=CA/L=SF/O=TriBridge/OU=IT/CN=tribridge.com"
        
        log_success "自签名证书生成完成"
    else
        log_success "SSL 证书检查完成"
    fi
}

# 数据库初始化脚本
create_db_init() {
    log_info "创建数据库初始化脚本..."
    
    cat > scripts/init-db.sql << 'EOF'
-- TriBridge 生产数据库初始化脚本

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    country VARCHAR(2) NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    kyc_level INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建交易表
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- 'otc', 'escrow', 'settlement'
    status VARCHAR(20) DEFAULT 'pending',
    amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    tx_hash VARCHAR(66),
    block_number BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建托管订单表
CREATE TABLE IF NOT EXISTS escrow_orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id),
    seller_id INTEGER REFERENCES users(id),
    amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'created',
    contract_address VARCHAR(42),
    logistics_tracking VARCHAR(100),
    release_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建合规检查表
CREATE TABLE IF NOT EXISTS compliance_checks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    check_type VARCHAR(20) NOT NULL, -- 'kyc', 'sanctions', 'aml'
    status VARCHAR(20) DEFAULT 'pending',
    result JSONB,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_buyer_id ON escrow_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_seller_id ON escrow_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_user_id ON compliance_checks(user_id);

-- 插入管理员用户 (密码: admin123)
INSERT INTO users (email, password_hash, full_name, country, kyc_status, kyc_level) 
VALUES ('admin@tribridge.com', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Administrator', 'US', 'approved', 3)
ON CONFLICT (email) DO NOTHING;
EOF
    
    log_success "数据库初始化脚本创建完成"
}

# 监控配置
create_monitoring_config() {
    log_info "创建监控配置..."
    
    # Prometheus 配置
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'tribridge-backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'

  - job_name: 'tribridge-frontend'
    static_configs:
      - targets: ['frontend:3000']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF

    # Grafana 数据源配置
    mkdir -p monitoring/grafana/datasources
    cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    log_success "监控配置创建完成"
}

# 部署函数
deploy() {
    log_info "开始部署 TriBridge 生产环境..."
    
    # 停止现有服务
    log_info "停止现有服务..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # 拉取最新镜像
    log_info "拉取基础镜像..."
    docker-compose -f docker-compose.prod.yml pull postgres redis nginx prometheus grafana
    
    # 构建应用镜像
    log_info "构建应用镜像..."
    docker-compose -f docker-compose.prod.yml build
    
    # 启动服务
    log_info "启动服务..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 健康检查
    log_info "执行健康检查..."
    
    # 检查后端健康状态
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log_success "后端服务启动成功"
    else
        log_error "后端服务启动失败"
        docker-compose -f docker-compose.prod.yml logs backend
        exit 1
    fi
    
    # 检查前端
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "前端服务启动成功"
    else
        log_error "前端服务启动失败"
        docker-compose -f docker-compose.prod.yml logs frontend
        exit 1
    fi
    
    log_success "TriBridge 生产环境部署完成！"
}

# 显示服务状态
show_status() {
    log_info "服务状态："
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    log_info "访问地址："
    echo "前端: https://localhost"
    echo "后端 API: https://localhost/api"
    echo "Grafana 监控: http://localhost:3001 (admin/admin_password_here)"
    echo "Prometheus: http://localhost:9090"
}

# 主函数
main() {
    echo "=========================================="
    echo "  TriBridge 生产环境部署脚本 v3.0"
    echo "=========================================="
    
    check_dependencies
    create_directories
    check_environment
    check_ssl
    create_db_init
    create_monitoring_config
    deploy
    show_status
    
    log_success "部署完成！请查看上方的访问地址"
}

# 执行主函数
main "$@"