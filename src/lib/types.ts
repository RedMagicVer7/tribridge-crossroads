/**
 * 通用类型定义
 * 统一管理所有TypeScript类型和接口
 */

import { 
  type Currency,
  type TransactionStatus, 
  type KYCStatus,
  type RiskLevel,
  type WalletStatus,
  type NotificationType,
  type NotificationCategory,
  type SupportedLanguage,
  type PaymentSystem
} from './constants';

// ========== 基础数据类型 ==========

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// ========== 用户相关类型 ==========

export interface User extends BaseEntity {
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  kycStatus: KYCStatus;
  role: 'user' | 'admin' | 'premium';
  settings: UserSettings;
  profile: UserProfile;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: UserAddress;
  businessInfo?: BusinessInfo;
}

export interface UserAddress {
  country: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
}

export interface BusinessInfo {
  companyName: string;
  businessType: string;
  registrationNumber: string;
  taxId?: string;
}

export interface UserSettings {
  language: SupportedLanguage;
  theme: 'light' | 'dark' | 'system';
  currency: Currency;
  notifications: NotificationSettings;
  security: SecuritySettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: Record<NotificationCategory, boolean>;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  sessionTimeout: number; // 分钟
  trustedDevices: string[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  dataSharing: boolean;
  analyticsTracking: boolean;
}

// ========== 交易相关类型 ==========

export interface Transaction extends BaseEntity {
  userId: string;
  type: 'exchange' | 'transfer' | 'deposit' | 'withdraw';
  status: TransactionStatus;
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fee: number;
  feePercentage: number;
  processingTime?: number; // 毫秒
  blockchainTxId?: string;
  counterparty?: string;
  notes?: string;
  metadata?: TransactionMetadata;
}

export interface TransactionMetadata {
  riskScore?: number;
  complianceChecks?: ComplianceCheck[];
  performanceMetrics?: PerformanceMetrics;
  sourceIP?: string;
  userAgent?: string;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  steps: TransactionStep[];
  totalDuration: number;
}

export interface TransactionStep {
  name: string;
  startTime: number;
  endTime: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration: number;
  errorMessage?: string;
}

export interface TransactionRequest {
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  userId?: string;
  metadata?: Partial<TransactionMetadata>;
}

export interface TransactionPreview {
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fee: number;
  feePercentage: number;
  processingTime: string;
  priceImpact: number;
  estimatedGasFee?: number;
  warnings?: string[];
}

// ========== 钱包相关类型 ==========

export interface Wallet extends BaseEntity {
  userId: string;
  name: string;
  type: 'metamask' | 'ledger' | 'trezor' | 'walletconnect';
  address: string;
  status: WalletStatus;
  balances: WalletBalance[];
  isDefault: boolean;
  lastUsed?: string;
  metadata?: WalletMetadata;
}

export interface WalletBalance {
  currency: Currency;
  available: number;
  locked: number;
  total: number;
  usdValue?: number;
  lastUpdated: string;
}

export interface WalletMetadata {
  chainId: number;
  networkName: string;
  isHardware: boolean;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
}

// ========== 合规相关类型 ==========

export interface ComplianceCheck extends BaseEntity {
  userId: string;
  transactionId?: string;
  checkType: 'kyc' | 'aml' | 'sanction' | 'pep' | 'fatf';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result: ComplianceResult;
  provider: string;
  metadata?: ComplianceMetadata;
}

export interface ComplianceResult {
  score: number; // 0-100
  riskLevel: RiskLevel;
  passed: boolean;
  flags: ComplianceFlag[];
  recommendations: string[];
  sanctionMatches?: SanctionMatch[];
}

export interface ComplianceFlag {
  type: 'warning' | 'error' | 'info';
  code: string;
  message: string;
  severity: number; // 1-10
}

export interface SanctionMatch {
  entityName: string;
  listName: string;
  matchScore: number; // 0-1
  details: string;
}

export interface ComplianceMetadata {
  sourceCountry: string;
  destinationCountry: string;
  amount: number;
  currency: Currency;
  checkDuration: number;
}

// ========== KYC相关类型 ==========

export interface KYCData extends BaseEntity {
  userId: string;
  status: KYCStatus;
  level: 1 | 2 | 3; // KYC等级
  documents: KYCDocument[];
  verificationResult?: KYCVerificationResult;
  expiryDate?: string;
  renewalRequired?: boolean;
}

export interface KYCDocument {
  id: string;
  type: 'passport' | 'id_card' | 'driving_license' | 'utility_bill' | 'selfie';
  filename: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  expiryDate?: string;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  fileSize: number;
  mimeType: string;
  dimensions?: { width: number; height: number };
  extractedData?: Record<string, any>;
}

export interface KYCVerificationResult {
  provider: string;
  confidence: number; // 0-1
  checks: KYCCheck[];
  riskAssessment: RiskAssessment;
  completedAt: string;
}

export interface KYCCheck {
  type: string;
  result: 'pass' | 'fail' | 'warning';
  details: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  factors: RiskFactor[];
}

export interface RiskFactor {
  type: string;
  weight: number;
  description: string;
}

// ========== 通知相关类型 ==========

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: NotificationAction[];
  metadata?: NotificationMetadata;
  expiresAt?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link';
  url?: string;
  action?: string;
  style?: 'primary' | 'secondary' | 'destructive';
}

export interface NotificationMetadata {
  source: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  templateId?: string;
  variables?: Record<string, any>;
}

// ========== 汇率相关类型 ==========

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: number;
  source: string;
  spread?: number;
  confidence?: number;
}

export interface PriceData {
  [currency: string]: {
    usd: number;
    cny: number;
    rub: number;
    eur?: number;
    timestamp?: number;
  };
}

// ========== OTC相关类型 ==========

export interface OTCOrder extends BaseEntity {
  userId: string;
  type: 'buy' | 'sell';
  fromCurrency: Currency;
  toCurrency: Currency;
  amount: number;
  price: number;
  totalValue: number;
  status: 'active' | 'filled' | 'cancelled' | 'expired';
  paymentMethods: string[];
  trustLevel: 'standard' | 'premium' | 'verified';
  businessType: 'individual' | 'company' | 'machinery_dealer';
  location: string;
  description?: string;
  expiresAt: string;
  fills?: OTCFill[];
}

export interface OTCFill {
  id: string;
  amount: number;
  price: number;
  filledAt: string;
  counterpartyId: string;
}

// ========== 俄罗斯特定类型 ==========

export interface RussiaPaymentMethod {
  id: string;
  type: 'sberbank' | 'vtb' | 'yoomoney' | 'gazprombank';
  name: string;
  accountDetails: string;
  isVerified: boolean;
  limits: PaymentLimits;
  processingTime: number; // 分钟
}

export interface PaymentLimits {
  min: number;
  max: number;
  daily: number;
  monthly: number;
}

// ========== 表单相关类型 ==========

export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'file';
  value: T;
  required: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: FormOption[];
  validation?: ValidationRule[];
  error?: string;
}

export interface FormOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// ========== 错误相关类型 ==========

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  stack?: string;
}

export interface ValidationError extends AppError {
  field: string;
  rejectedValue: any;
}

// ========== 配置相关类型 ==========

export interface AppConfig {
  api: ApiConfig;
  blockchain: BlockchainConfig;
  security: SecurityConfig;
  features: FeatureFlags;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  rateLimiting: RateLimitConfig;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  burstLimit: number;
}

export interface BlockchainConfig {
  networks: NetworkConfig[];
  defaultNetwork: string;
  explorerUrls: Record<string, string>;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl: string;
}

export interface SecurityConfig {
  encryptionKey: string;
  jwtSecret: string;
  sessionDuration: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export interface FeatureFlags {
  betaFeatures: boolean;
  debugMode: boolean;
  maintenanceMode: boolean;
  newUserRegistration: boolean;
  advancedTrading: boolean;
}

// ========== Hook相关类型 ==========

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

export interface UsePaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

// ========== 导出工具类型 ==========

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NonNullable<T> = T extends null | undefined ? never : T;