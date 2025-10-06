import { createClient, RedisClientType } from 'redis'
import { logger } from '../utils/logger'

export interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
  retryDelayOnFailover?: number
  maxRetriesPerRequest?: number
}

export class RedisService {
  private client: RedisClientType
  private config: RedisConfig
  private isConnected: boolean = false

  constructor(config?: Partial<RedisConfig>) {
    // 优先使用REDIS_URL（Railway提供）
    if (process.env.REDIS_URL && !config) {
      this.client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries >= 3) {
              logger.error('Redis重连失败，超过最大重试次数')
              return false
            }
            return Math.min(retries * 100, 3000)
          }
        }
      })
      
      // 记录配置信息用于日志
      this.config = {
        host: 'Railway Managed',
        port: 6379,
        password: '***',
        db: 0
      }
    } else {
      // 使用分解配置（本地开发）
      this.config = {
        host: config?.host || process.env.REDIS_HOST || 'localhost',
        port: config?.port || parseInt(process.env.REDIS_PORT || '6379'),
        password: config?.password || process.env.REDIS_PASSWORD,
        db: config?.db || parseInt(process.env.REDIS_DB || '0'),
        retryDelayOnFailover: config?.retryDelayOnFailover || 100,
        maxRetriesPerRequest: config?.maxRetriesPerRequest || 3
      }

      // 创建Redis客户端
      const redisUrl = this.config.password 
        ? `redis://:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.db}`
        : `redis://${this.config.host}:${this.config.port}/${this.config.db}`

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries >= 3) {
              logger.error('Redis重连失败，超过最大重试次数')
              return false
            }
            return Math.min(retries * 100, 3000)
          }
        }
      })
    }

    // 监听连接事件
    this.client.on('connect', () => {
      logger.info('Redis连接已建立')
      this.isConnected = true
    })

    this.client.on('ready', () => {
      logger.info('Redis客户端准备就绪')
    })

    this.client.on('error', (error) => {
      logger.error('Redis连接错误:', error)
      this.isConnected = false
    })

    this.client.on('end', () => {
      logger.warn('Redis连接已断开')
      this.isConnected = false
    })
  }

  // 连接Redis
  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect()
        this.isConnected = true
        logger.info('Redis连接成功')
      }
    } catch (error) {
      logger.error('Redis连接失败:', error)
      throw error
    }
  }

  // 断开连接
  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect()
        this.isConnected = false
        logger.info('Redis连接已断开')
      }
    } catch (error) {
      logger.error('Redis断开连接失败:', error)
      throw error
    }
  }

  // 测试连接
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping()
      return result === 'PONG'
    } catch (error) {
      logger.error('Redis ping失败:', error)
      return false
    }
  }

  // 字符串操作
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value)
      } else {
        await this.client.set(key, value)
      }
    } catch (error) {
      logger.error(`Redis SET操作失败: ${key}`, error)
      throw error
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key)
    } catch (error) {
      logger.error(`Redis GET操作失败: ${key}`, error)
      throw error
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key)
    } catch (error) {
      logger.error(`Redis DEL操作失败: ${key}`, error)
      throw error
    }
  }

  async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key)
    } catch (error) {
      logger.error(`Redis EXISTS操作失败: ${key}`, error)
      throw error
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      return Boolean(await this.client.expire(key, seconds))
    } catch (error) {
      logger.error(`Redis EXPIRE操作失败: ${key}`, error)
      throw error
    }
  }

  // 哈希操作
  async hSet(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hSet(key, field, value)
    } catch (error) {
      logger.error(`Redis HSET操作失败: ${key}`, error)
      throw error
    }
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    try {
      return await this.client.hGet(key, field)
    } catch (error) {
      logger.error(`Redis HGET操作失败: ${key}`, error)
      throw error
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key)
    } catch (error) {
      logger.error(`Redis HGETALL操作失败: ${key}`, error)
      throw error
    }
  }

  async hDel(key: string, field: string): Promise<number> {
    try {
      return await this.client.hDel(key, field)
    } catch (error) {
      logger.error(`Redis HDEL操作失败: ${key}`, error)
      throw error
    }
  }

  // 列表操作
  async lPush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lPush(key, value)
    } catch (error) {
      logger.error(`Redis LPUSH操作失败: ${key}`, error)
      throw error
    }
  }

  async rPop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key)
    } catch (error) {
      logger.error(`Redis RPOP操作失败: ${key}`, error)
      throw error
    }
  }

  async lLen(key: string): Promise<number> {
    try {
      return await this.client.lLen(key)
    } catch (error) {
      logger.error(`Redis LLEN操作失败: ${key}`, error)
      throw error
    }
  }

  // 集合操作
  async sAdd(key: string, member: string): Promise<number> {
    try {
      return await this.client.sAdd(key, member)
    } catch (error) {
      logger.error(`Redis SADD操作失败: ${key}`, error)
      throw error
    }
  }

  async sMembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key)
    } catch (error) {
      logger.error(`Redis SMEMBERS操作失败: ${key}`, error)
      throw error
    }
  }

  async sRem(key: string, member: string): Promise<number> {
    try {
      return await this.client.sRem(key, member)
    } catch (error) {
      logger.error(`Redis SREM操作失败: ${key}`, error)
      throw error
    }
  }

  // 有序集合操作
  async zAdd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.client.zAdd(key, { score, value: member })
    } catch (error) {
      logger.error(`Redis ZADD操作失败: ${key}`, error)
      throw error
    }
  }

  async zRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.zRange(key, start, stop)
    } catch (error) {
      logger.error(`Redis ZRANGE操作失败: ${key}`, error)
      throw error
    }
  }

  async zRem(key: string, member: string): Promise<number> {
    try {
      return await this.client.zRem(key, member)
    } catch (error) {
      logger.error(`Redis ZREM操作失败: ${key}`, error)
      throw error
    }
  }

  // 缓存辅助方法
  async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    const jsonValue = JSON.stringify(value)
    await this.set(key, jsonValue, ttl)
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key)
    if (value) {
      try {
        return JSON.parse(value) as T
      } catch (error) {
        logger.error(`JSON解析失败: ${key}`, error)
        return null
      }
    }
    return null
  }

  // 分布式锁
  async acquireLock(key: string, ttl: number = 30): Promise<boolean> {
    try {
      const lockKey = `lock:${key}`
      const result = await this.client.set(lockKey, 'locked', {
        EX: ttl,
        NX: true
      })
      return result === 'OK'
    } catch (error) {
      logger.error(`获取分布式锁失败: ${key}`, error)
      return false
    }
  }

  async releaseLock(key: string): Promise<boolean> {
    try {
      const lockKey = `lock:${key}`
      const result = await this.del(lockKey)
      return result > 0
    } catch (error) {
      logger.error(`释放分布式锁失败: ${key}`, error)
      return false
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isReady: this.client.isReady,
      config: {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db
      }
    }
  }
}

// 创建默认Redis实例
export const redis = new RedisService()