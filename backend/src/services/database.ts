import { Pool, PoolConfig } from 'pg'
import { logger } from '../utils/logger'

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl?: boolean
  max?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
}

export class DatabaseService {
  private pool: Pool
  private config: DatabaseConfig

  constructor(config?: Partial<DatabaseConfig>) {
    // 优先使用DATABASE_URL（Railway提供）
    if (process.env.DATABASE_URL && !config) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      })
      
      // 记录配置信息用于日志
      this.config = {
        host: 'Railway Managed',
        port: 5432,
        database: 'tribridge',
        user: 'railway',
        password: '***',
        ssl: process.env.NODE_ENV === 'production'
      }
    } else {
      // 使用分解配置（本地开发）
      this.config = {
        host: config?.host || process.env.DB_HOST || 'localhost',
        port: config?.port || parseInt(process.env.DB_PORT || '5432'),
        database: config?.database || process.env.DB_NAME || 'tribridge',
        user: config?.user || process.env.DB_USER || 'postgres',
        password: config?.password || process.env.DB_PASSWORD || 'password',
        ssl: config?.ssl || process.env.DB_SSL === 'true',
        max: config?.max || 20,
        idleTimeoutMillis: config?.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: config?.connectionTimeoutMillis || 2000
      }

      const poolConfig: PoolConfig = {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: this.config.max,
        idleTimeoutMillis: this.config.idleTimeoutMillis,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis
      }

      if (this.config.ssl) {
        poolConfig.ssl = { rejectUnauthorized: false }
      }

      this.pool = new Pool(poolConfig)
    }

    // 监听连接事件
    this.pool.on('connect', () => {
      logger.info('数据库连接已建立')
    })

    this.pool.on('error', (err: Error) => {
      logger.error('数据库连接错误:', err)
    })
  }

  // 获取数据库连接
  async getClient() {
    try {
      return await this.pool.connect()
    } catch (error) {
      logger.error('获取数据库连接失败:', error)
      throw error
    }
  }

  // 执行查询
  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now()
    try {
      const result = await this.pool.query(text, params)
      const duration = Date.now() - start
      logger.debug(`数据库查询完成 - ${duration}ms: ${text}`)
      return result
    } catch (error) {
      const duration = Date.now() - start
      logger.error(`数据库查询失败 - ${duration}ms: ${text}`, error)
      throw error
    }
  }

  // 执行事务
  async transaction(callback: (client: any) => Promise<any>): Promise<any> {
    const client = await this.getClient()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      logger.error('事务回滚:', error)
      throw error
    } finally {
      client.release()
    }
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1')
      logger.info('数据库连接测试成功')
      return true
    } catch (error) {
      logger.error('数据库连接测试失败:', error)
      return false
    }
  }

  // 初始化数据库表
  async initializeTables(): Promise<void> {
    try {
      // 用户表
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          kyc_status VARCHAR(50) DEFAULT 'pending',
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 钱包表
      await this.query(`
        CREATE TABLE IF NOT EXISTS wallets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          chain VARCHAR(50) NOT NULL,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 交易表
      await this.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          from_chain VARCHAR(50) NOT NULL,
          to_chain VARCHAR(50) NOT NULL,
          from_token VARCHAR(50) NOT NULL,
          to_token VARCHAR(50) NOT NULL,
          amount DECIMAL(20, 8) NOT NULL,
          from_address VARCHAR(255) NOT NULL,
          to_address VARCHAR(255) NOT NULL,
          tx_hash VARCHAR(255),
          block_number BIGINT,
          confirmations INTEGER DEFAULT 0,
          fee DECIMAL(20, 8),
          gas_used BIGINT,
          exchange_rate DECIMAL(20, 8),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP
        )
      `)

      // KYC表
      await this.query(`
        CREATE TABLE IF NOT EXISTS kyc_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          provider VARCHAR(50) NOT NULL,
          external_id VARCHAR(255),
          status VARCHAR(50) NOT NULL,
          level VARCHAR(50) DEFAULT 'basic',
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified_at TIMESTAMP,
          rejected_at TIMESTAMP,
          rejection_reason TEXT,
          documents JSONB,
          personal_info JSONB,
          limits JSONB
        )
      `)

      // 清算订单表
      await this.query(`
        CREATE TABLE IF NOT EXISTS settlement_orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          from_chain VARCHAR(50) NOT NULL,
          to_chain VARCHAR(50) NOT NULL,
          from_token VARCHAR(50) NOT NULL,
          to_token VARCHAR(50) NOT NULL,
          amount DECIMAL(20, 8) NOT NULL,
          from_address VARCHAR(255) NOT NULL,
          to_address VARCHAR(255) NOT NULL,
          exchange_rate DECIMAL(20, 8),
          slippage DECIMAL(5, 4),
          estimated_fee DECIMAL(20, 8),
          actual_fee DECIMAL(20, 8),
          steps JSONB,
          transactions JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          expires_at TIMESTAMP
        )
      `)

      logger.info('数据库表初始化完成')
    } catch (error) {
      logger.error('数据库表初始化失败:', error)
      throw error
    }
  }

  // 关闭连接池
  async close(): Promise<void> {
    try {
      await this.pool.end()
      logger.info('数据库连接池已关闭')
    } catch (error) {
      logger.error('关闭数据库连接池失败:', error)
      throw error
    }
  }

  // 获取连接池状态
  getPoolStatus() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    }
  }
}

// 创建默认数据库实例
export const database = new DatabaseService()