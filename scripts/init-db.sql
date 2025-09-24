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
