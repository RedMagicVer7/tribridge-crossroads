/**
 * 通用工具函数库
 * 提取重复使用的工具函数，避免代码重复
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  CURRENCY_SYMBOLS, 
  COUNTRY_FLAGS,
  type Currency,
  type TransactionStatus,
  type KYCStatus,
  type RiskLevel,
  type WalletStatus,
  type NotificationType,
  VALIDATION_RULES
} from './constants';

// ========== 原有的基础工具函数 ==========

/**
 * Tailwind CSS 类名合并工具
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========== 格式化工具函数 ==========

/**
 * 统一的货币格式化函数
 */
export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '';
  
  // 加密货币显示更多小数位
  const decimals = ['USDT', 'USDC', 'ETH', 'BTC'].includes(currency) ? 4 : 2;
  
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

/**
 * 数字格式化 - 带千分位分隔符
 */
export const formatNumber = (num: string | number): string => {
  return new Intl.NumberFormat().format(Number(num));
};

/**
 * 百分比格式化
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 时间戳格式化
 */
export const formatTimestamp = (timestamp: string, locale: string = 'zh-CN'): string => {
  return new Date(timestamp).toLocaleString(locale);
};

/**
 * 相对时间格式化 (如：2小时前)
 */
export const formatRelativeTime = (timestamp: string): string => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`;
  
  return formatTimestamp(timestamp);
};

/**
 * 地址格式化 - 显示前6位和后4位
 */
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * 卢布金额格式化
 */
export const formatRubAmount = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
};

// ========== Badge/状态相关工具函数 ==========

/**
 * 交易状态到Badge变体的映射
 */
export const getTransactionStatusVariant = (status: TransactionStatus) => {
  const variants = {
    completed: 'default',
    pending: 'secondary', 
    processing: 'secondary',
    failed: 'destructive',
    cancelled: 'outline'
  } as const;
  
  return variants[status] || 'outline';
};

/**
 * KYC状态到Badge变体的映射
 */
export const getKYCStatusVariant = (status: KYCStatus) => {
  const variants = {
    pending: 'outline',
    in_review: 'secondary',
    approved: 'default',
    rejected: 'destructive'
  } as const;
  
  return variants[status] || 'outline';
};

/**
 * 风险等级到Badge变体的映射
 */
export const getRiskLevelVariant = (level: RiskLevel) => {
  const variants = {
    low: 'default',
    medium: 'secondary',
    high: 'destructive', 
    critical: 'destructive'
  } as const;
  
  return variants[level] || 'outline';
};

/**
 * 钱包状态到Badge变体的映射
 */
export const getWalletStatusVariant = (status: WalletStatus) => {
  const variants = {
    connected: 'default',
    disconnected: 'secondary',
    pending: 'outline'
  } as const;
  
  return variants[status] || 'outline';
};

/**
 * 获取状态对应的颜色类
 */
export const getStatusColor = (status: TransactionStatus): string => {
  const colors = {
    completed: 'text-success',
    pending: 'text-warning',
    processing: 'text-primary', 
    failed: 'text-destructive',
    cancelled: 'text-muted-foreground'
  };
  
  return colors[status] || 'text-muted-foreground';
};

/**
 * 获取风险等级颜色
 */
export const getRiskLevelColor = (level: RiskLevel): string => {
  const colors = {
    low: 'text-success bg-success/10 border-success/20',
    medium: 'text-warning bg-warning/10 border-warning/20',
    high: 'text-destructive bg-destructive/10 border-destructive/20',
    critical: 'text-destructive bg-destructive/20 border-destructive/30'
  };
  
  return colors[level] || 'text-muted-foreground';
};

// ========== 国家/国际化相关 ==========

/**
 * 获取国家旗帜
 */
export const getCountryFlag = (countryCode: string): string => {
  return COUNTRY_FLAGS[countryCode as keyof typeof COUNTRY_FLAGS] || '🏳️';
};

/**
 * 浏览器语言检测
 */
export const detectBrowserLanguage = (): 'zh-CN' | 'en-US' | 'ru-RU' => {
  const browserLang = navigator.language || navigator.languages[0];
  
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('ru')) return 'ru-RU';
  return 'en-US';
};

// ========== 验证工具函数 ==========

/**
 * 邮箱验证
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.test(email);
};

/**
 * 电话号码验证
 */
export const isValidPhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE.test(phone);
};

/**
 * 钱包地址验证
 */
export const isValidWalletAddress = (address: string): boolean => {
  return VALIDATION_RULES.WALLET_ADDRESS.test(address);
};

/**
 * 密码强度验证
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
} => {
  const issues: string[] = [];
  
  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    issues.push(`密码长度至少${VALIDATION_RULES.MIN_PASSWORD_LENGTH}位`);
  }
  
  if (!/[A-Z]/.test(password)) {
    issues.push('需要包含大写字母');
  }
  
  if (!/[a-z]/.test(password)) {
    issues.push('需要包含小写字母');
  }
  
  if (!/\d/.test(password)) {
    issues.push('需要包含数字');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('需要包含特殊字符');
  }
  
  const isValid = issues.length === 0;
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (isValid && password.length >= 12) {
    strength = 'strong';
  } else if (isValid || issues.length <= 2) {
    strength = 'medium';
  }
  
  return { isValid, strength, issues };
};

// ========== 数据处理工具函数 ==========

/**
 * 深拷贝
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 生成随机ID
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

/**
 * 安全的JSON解析
 */
export const safeJsonParse = <T>(str: string, defaultValue: T): T => {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// ========== 业务逻辑工具函数 ==========

/**
 * 计算处理时间
 */
export const estimateProcessingTime = (amount: number): string => {
  if (amount < 1000) return '< 30秒';
  if (amount < 10000) return '30-60秒';
  if (amount < 100000) return '1-2分钟';
  return '2-5分钟';
};

/**
 * 计算价格影响
 */
export const calculatePriceImpact = (amount: number, currency: string): number => {
  const baseLiquidity = 1000000; // 基础流动性
  return Math.min(0.005, amount / baseLiquidity * 0.1); // 最大0.5%影响
};

/**
 * 计算手续费
 */
export const calculateFee = (
  amount: number, 
  feePercentage: number = 0.002,
  minFee: number = 1,
  maxFee: number = 100
): number => {
  const calculatedFee = amount * feePercentage;
  return Math.min(Math.max(calculatedFee, minFee), maxFee);
};

/**
 * 获取网络Badge颜色
 */
export const getNetworkBadgeColor = (chainId: number): string => {
  const colors = {
    1: 'bg-blue-500',     // Ethereum
    137: 'bg-purple-500', // Polygon
    56: 'bg-yellow-500',  // BSC
  };
  
  return colors[chainId as keyof typeof colors] || 'bg-gray-500';
};

/**
 * 生成区块链交易ID
 */
export const generateBlockchainTxId = (): string => {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};