#!/bin/bash

# TriBridge Beta 测试用户准备脚本
# 用于准备 8 个测试用户及其测试数据

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

# 检查数据库连接
check_database() {
    log_info "检查数据库连接..."
    
    # 等待数据库启动
    for i in {1..30}; do
        if docker exec tribridge-crossroads-postgres-1 pg_isready -U ${DB_USER:-tribridge_user} -d ${POSTGRES_DB:-tribridge_production} > /dev/null 2>&1; then
            log_success "数据库连接成功"
            return 0
        fi
        echo "等待数据库启动... ($i/30)"
        sleep 2
    done
    
    log_error "数据库连接失败"
    exit 1
}

# 创建测试用户
create_test_users() {
    log_info "创建 8 个 Beta 测试用户..."
    
    # Beta 测试用户数据
    cat > /tmp/beta_users.sql << 'EOF'
-- Beta 测试用户数据

-- 俄罗斯买方用户
INSERT INTO users (email, password_hash, full_name, country, kyc_status, kyc_level) VALUES
('ivan.petrov@rusmach.ru', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Ivan Petrov', 'RU', 'approved', 2),
('anna.komarova@sibmining.ru', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Anna Komarova', 'RU', 'approved', 2),
('dmitri.volkov@energyrus.ru', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Dmitri Volkov', 'RU', 'approved', 1),
('elena.smirnova@ruslogistics.ru', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Elena Smirnova', 'RU', 'approved', 2)
ON CONFLICT (email) DO NOTHING;

-- 中国卖方用户
INSERT INTO users (email, password_hash, full_name, country, kyc_status, kyc_level) VALUES
('zhang.wei@chinaequip.com', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Zhang Wei', 'CN', 'approved', 3),
('li.ming@heavyind.com', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Li Ming', 'CN', 'approved', 3),
('wang.fang@manufacturecn.com', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Wang Fang', 'CN', 'approved', 2),
('chen.hao@chinatrade.com', '$2b$10$8K1p/a0drtIzU.7QGH9ZGeWKZy4BYNApN.v9L2xWm7BX0cw1jUqZi', 'Chen Hao', 'CN', 'approved', 3)
ON CONFLICT (email) DO NOTHING;

-- 创建测试交易数据
INSERT INTO transactions (user_id, type, status, amount, currency, from_address, to_address, tx_hash) VALUES
(1, 'otc', 'completed', 50000.00, 'RUB', '0x742d35...', '0x8ba1f1...', '0xabc123...'),
(2, 'otc', 'completed', 75000.00, 'RUB', '0x831c46...', '0x9cb2g2...', '0xdef456...'),
(5, 'escrow', 'pending', 25000.00, 'USDT', '0x9cb2g2...', '0x742d35...', '0x789xyz...'),
(6, 'escrow', 'in_transit', 15000.00, 'USDT', '0x1ac3h3...', '0x831c46...', '0x456abc...');

-- 创建测试托管订单
INSERT INTO escrow_orders (buyer_id, seller_id, amount, currency, status, contract_address, logistics_tracking) VALUES
(1, 5, 25000.00, 'USDT', 'funded', '0x1234567890123456789012345678901234567890', 'DHL123456789'),
(2, 6, 15000.00, 'USDT', 'in_transit', '0x2345678901234567890123456789012345678901', 'FEDEX987654321'),
(3, 7, 35000.00, 'USDT', 'created', '0x3456789012345678901234567890123456789012', NULL),
(4, 8, 45000.00, 'USDT', 'negotiating', '0x4567890123456789012345678901234567890123', NULL);

-- 创建合规检查记录
INSERT INTO compliance_checks (user_id, check_type, status, result) VALUES
(1, 'kyc', 'passed', '{"document_verified": true, "address_verified": true, "sanctions_check": "clear"}'),
(2, 'kyc', 'passed', '{"document_verified": true, "address_verified": true, "sanctions_check": "clear"}'),
(5, 'kyc', 'passed', '{"document_verified": true, "address_verified": true, "sanctions_check": "clear"}'),
(6, 'kyc', 'passed', '{"document_verified": true, "address_verified": true, "sanctions_check": "clear"}'),
(1, 'sanctions', 'passed', '{"ofac_check": "clear", "eu_check": "clear", "russia_check": "clear"}'),
(2, 'sanctions', 'passed', '{"ofac_check": "clear", "eu_check": "clear", "russia_check": "clear"}'),
(5, 'sanctions', 'passed', '{"ofac_check": "clear", "eu_check": "clear", "russia_check": "clear"}'),
(6, 'sanctions', 'passed', '{"ofac_check": "clear", "eu_check": "clear", "russia_check": "clear"}');
EOF

    # 执行 SQL 脚本
    docker exec -i tribridge-crossroads-postgres-1 psql -U ${DB_USER:-tribridge_user} -d ${POSTGRES_DB:-tribridge_production} < /tmp/beta_users.sql
    
    # 清理临时文件
    rm /tmp/beta_users.sql
    
    log_success "Beta 测试用户创建完成"
}

# 生成测试文档
generate_test_docs() {
    log_info "生成测试文档..."
    
    cat > beta_test_guide.md << 'EOF'
# TriBridge Beta 测试指南

## 测试环境信息

- 前端地址: https://localhost
- 后端 API: https://localhost/api
- 监控面板: http://localhost:3001 (admin/admin_password_here)

## Beta 测试用户账号

### 俄罗斯买方用户 (4名)

1. **Ivan Petrov** - RusMach 采购经理
   - 邮箱: ivan.petrov@rusmach.ru
   - 密码: test123
   - 角色: 工程设备采购
   - KYC 级别: 2 (中级)

2. **Anna Komarova** - SibMining 设备总监
   - 邮箱: anna.komarova@sibmining.ru
   - 密码: test123
   - 角色: 矿业设备采购
   - KYC 级别: 2 (中级)

3. **Dmitri Volkov** - EnergyRus 项目经理
   - 邮箱: dmitri.volkov@energyrus.ru
   - 密码: test123
   - 角色: 能源设备采购
   - KYC 级别: 1 (初级)

4. **Elena Smirnova** - RusLogistics 物流总监
   - 邮箱: elena.smirnova@ruslogistics.ru
   - 密码: test123
   - 角色: 物流服务采购
   - KYC 级别: 2 (中级)

### 中国卖方用户 (4名)

1. **Zhang Wei** - ChinaEquip 销售总监
   - 邮箱: zhang.wei@chinaequip.com
   - 密码: test123
   - 角色: 设备制造商
   - KYC 级别: 3 (高级)

2. **Li Ming** - HeavyInd 出口经理
   - 邮箱: li.ming@heavyind.com
   - 密码: test123
   - 角色: 重工业设备供应商
   - KYC 级别: 3 (高级)

3. **Wang Fang** - ManufactureCN 产品经理
   - 邮箱: wang.fang@manufacturecn.com
   - 密码: test123
   - 角色: 制造设备供应商
   - KYC 级别: 2 (中级)

4. **Chen Hao** - ChinaTrade 贸易经理
   - 邮箱: chen.hao@chinatrade.com
   - 密码: test123
   - 角色: 贸易公司
   - KYC 级别: 3 (高级)

## 测试场景

### 场景 1: RusMach 采购重型挖掘机
- 买方: Ivan Petrov (ivan.petrov@rusmach.ru)
- 卖方: Zhang Wei (zhang.wei@chinaequip.com)
- 金额: 25,000 USDT
- 物流: DHL 追踪号 DHL123456789
- 状态: 资金已托管

### 场景 2: SibMining 采购矿业设备
- 买方: Anna Komarova (anna.komarova@sibmining.ru)
- 卖方: Li Ming (li.ming@heavyind.com)
- 金额: 15,000 USDT
- 物流: FedEx 追踪号 FEDEX987654321
- 状态: 运输中

### 场景 3: EnergyRus 采购发电设备
- 买方: Dmitri Volkov (dmitri.volkov@energyrus.ru)
- 卖方: Wang Fang (wang.fang@manufacturecn.com)
- 金额: 35,000 USDT
- 状态: 订单已创建

### 场景 4: RusLogistics 采购物流设备
- 买方: Elena Smirnova (elena.smirnova@ruslogistics.ru)
- 卖方: Chen Hao (chen.hao@chinatrade.com)
- 金额: 45,000 USDT
- 状态: 价格协商中

## 测试流程

### 1. 用户登录测试
- 使用上述账号登录系统
- 验证俄语界面显示
- 检查用户权限和 KYC 状态

### 2. OTC 兑换测试
- 卢布到 USDT 兑换
- 俄罗斯支付方式测试 (Sberbank, VTB, YooMoney)
- 汇率和手续费计算

### 3. 托管交易测试
- 创建新的托管订单
- 资金托管确认
- 物流信息上传

### 4. 物流验证测试
- 物流跟踪号验证
- 发货凭证上传
- 收货确认流程

### 5. 清算结算测试
- 境外节点清算
- B2B 闭环支付
- 多签钱包功能

### 6. 合规检查测试
- 制裁名单检查
- KYC 文档验证
- AML 风险评估

## 测试数据

- 所有用户密码: test123
- 测试钱包地址已预配置
- 测试交易数据已初始化
- 物流跟踪号已设置

## 注意事项

1. 这是测试环境，使用测试网络和模拟数据
2. 所有金额为测试数据，不涉及真实资金
3. 物流跟踪为模拟数据
4. 合规检查使用测试接口

## 问题反馈

测试过程中如遇问题，请记录：
- 操作步骤
- 错误信息
- 浏览器和版本
- 用户账号
- 测试时间

技术支持: admin@tribridge.com
EOF

    log_success "测试文档生成完成: beta_test_guide.md"
}

# 创建测试脚本
create_test_scripts() {
    log_info "创建自动化测试脚本..."
    
    cat > test_api.sh << 'EOF'
#!/bin/bash

# API 测试脚本

BASE_URL="https://localhost/api"

echo "=== TriBridge API 测试 ==="

# 测试健康检查
echo "1. 健康检查..."
curl -k -s "$BASE_URL/health" | jq .

# 测试用户登录
echo "2. 用户登录测试..."
LOGIN_RESPONSE=$(curl -k -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ivan.petrov@rusmach.ru","password":"test123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "获取到 Token: ${TOKEN:0:20}..."

# 测试获取用户信息
echo "3. 获取用户信息..."
curl -k -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/user/profile" | jq .

# 测试 OTC 汇率
echo "4. 获取 OTC 汇率..."
curl -k -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/otc/rates" | jq .

# 测试托管订单列表
echo "5. 获取托管订单..."
curl -k -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/escrow/orders" | jq .

echo "=== API 测试完成 ==="
EOF

    chmod +x test_api.sh
    
    log_success "测试脚本创建完成: test_api.sh"
}

# 主函数
main() {
    echo "=========================================="
    echo "  TriBridge Beta 测试用户准备工具"
    echo "=========================================="
    
    check_database
    create_test_users
    generate_test_docs
    create_test_scripts
    
    log_success "Beta 测试环境准备完成！"
    echo ""
    echo "📋 测试指南: beta_test_guide.md"
    echo "🔧 API 测试: ./test_api.sh"
    echo "🌐 前端地址: https://localhost"
    echo "📊 监控面板: http://localhost:3001"
    echo ""
    echo "8个 Beta 测试用户已就绪，可以开始测试！"
}

# 执行主函数
main "$@"