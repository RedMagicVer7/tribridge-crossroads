/**
 * 应用程序常量定义
 * 统一管理所有硬编码值和配置项
 */

// 货币相关常量
export const CURRENCIES = {
  FIAT: ['USD', 'CNY', 'RUB', 'EUR', 'GBP'] as const,
  CRYPTO: ['USDT', 'USDC', 'ETH', 'BTC'] as const,
  BRICS: ['BCNY', 'BRUB', 'BINR', 'BBRL', 'BZAR'] as const,
} as const;

export const CURRENCY_SYMBOLS = {
  USD: '$',
  CNY: '¥',
  RUB: '₽',
  EUR: '€',
  GBP: '£',
  USDT: 'USDT',
  USDC: 'USDC',
  ETH: 'ETH',
  BTC: 'BTC',
} as const;

// 状态枚举
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const KYC_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const WALLET_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  PENDING: 'pending',
} as const;

// 通知类型
export const NOTIFICATION_TYPE = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  SECURITY: 'security',
} as const;

export const NOTIFICATION_CATEGORY = {
  TRANSACTION: 'transaction',
  SECURITY: 'security',
  SYSTEM: 'system',
  MARKETING: 'marketing',
} as const;

// 业务配置
export const BUSINESS_CONFIG = {
  // 手续费配置
  FEES: {
    DEFAULT_PERCENTAGE: 0.002, // 0.2%
    MIN_FEE: 1,
    MAX_FEE: 100,
  },
  
  // 交易限额
  TRANSACTION_LIMITS: {
    MIN_AMOUNT: 1,
    MAX_AMOUNT: 1000000,
    DAILY_LIMIT: 100000,
  },
  
  // 缓存时间 (毫秒)
  CACHE_DURATION: {
    EXCHANGE_RATE: 30000, // 30秒
    USER_DATA: 300000,    // 5分钟
    STATIC_DATA: 3600000, // 1小时
  },
  
  // API 超时时间
  API_TIMEOUT: 5000, // 5秒
} as const;

// 国家代码和标志
export const COUNTRY_FLAGS = {
  CN: '🇨🇳',
  RU: '🇷🇺', 
  IN: '🇮🇳',
  BR: '🇧🇷',
  ZA: '🇿🇦',
  US: '🇺🇸',
  BRICS: '🌐',
} as const;

// 支付系统
export const PAYMENT_SYSTEMS = {
  CIPS: 'CIPS',
  NPS: 'NPS', 
  SWIFT: 'SWIFT',
  SPFS: 'SPFS',
} as const;

// 支持的语言
export const SUPPORTED_LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
  RU_RU: 'ru-RU',
} as const;

// UI相关常量
export const UI_CONFIG = {
  // 动画持续时间
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  
  // 表格配置
  TABLE: {
    DEFAULT_VISIBLE_ROWS: 5,
    LOAD_MORE_INCREMENT: 5,
  },
} as const;

// 验证规则
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  WALLET_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  
  // 长度限制
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 50,
  MAX_MESSAGE_LENGTH: 500,
} as const;

// 网络配置
export const NETWORK_CONFIG = {
  ETHEREUM: {
    CHAIN_ID: 1,
    NAME: 'Ethereum Mainnet',
    RPC_URL: 'https://mainnet.infura.io/v3/',
  },
  POLYGON: {
    CHAIN_ID: 137,
    NAME: 'Polygon Mainnet', 
    RPC_URL: 'https://polygon-rpc.com/',
  },
  BSC: {
    CHAIN_ID: 56,
    NAME: 'BNB Smart Chain',
    RPC_URL: 'https://bsc-dataseed1.binance.org/',
  },
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查网络连接',
  UNAUTHORIZED: '未授权访问，请重新登录',
  VALIDATION_ERROR: '输入数据验证失败',
  SERVER_ERROR: '服务器内部错误，请稍后重试',
  TIMEOUT_ERROR: '请求超时，请重试',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  TRANSACTION_SUCCESS: '交易完成',
  SAVE_SUCCESS: '保存成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
} as const;

// 路由路径
export const ROUTES = {
  HOME: '/',
  WALLET: '/wallet',
  TRANSACTIONS: '/transactions',
  ANALYTICS: '/analytics',
  COMPLIANCE: '/compliance',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  RUSSIA: '/russia',
} as const;

// 导出类型定义
export type Currency = typeof CURRENCIES.FIAT[number] | typeof CURRENCIES.CRYPTO[number] | typeof CURRENCIES.BRICS[number];
export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];
export type KYCStatus = typeof KYC_STATUS[keyof typeof KYC_STATUS];
export type RiskLevel = typeof RISK_LEVEL[keyof typeof RISK_LEVEL];
export type WalletStatus = typeof WALLET_STATUS[keyof typeof WALLET_STATUS];
export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
export type NotificationCategory = typeof NOTIFICATION_CATEGORY[keyof typeof NOTIFICATION_CATEGORY];
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];
export type PaymentSystem = typeof PAYMENT_SYSTEMS[keyof typeof PAYMENT_SYSTEMS];