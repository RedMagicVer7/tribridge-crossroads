/**
 * 状态Badge组件库
 * 统一管理各种状态的Badge显示，避免重复代码
 */

import React from 'react';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  User,
  Building,
  Star,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';

import {
  getTransactionStatusVariant,
  getKYCStatusVariant,
  getRiskLevelVariant,
  getWalletStatusVariant,
  getRiskLevelColor
} from '../../lib/utils';

import type {
  TransactionStatus,
  KYCStatus,
  RiskLevel,
  WalletStatus,
  NotificationType
} from '../../lib/constants';

// ========== 基础状态Badge ==========

interface StatusBadgeProps {
  status: TransactionStatus | KYCStatus | RiskLevel | WalletStatus;
  showIcon?: boolean;
  className?: string;
}

/**
 * 交易状态Badge
 */
export const TransactionStatusBadge: React.FC<{
  status: TransactionStatus;
  showIcon?: boolean;
  className?: string;
}> = ({ status, showIcon = true, className }) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-3 w-3" />;
      case 'failed':
        return <XCircle className="h-3 w-3" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    const labels = {
      completed: '已完成',
      pending: '待处理',
      processing: '处理中',
      failed: '失败',
      cancelled: '已取消'
    };
    return labels[status] || status;
  };

  return (
    <Badge 
      variant={getTransactionStatusVariant(status)} 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

/**
 * KYC状态Badge
 */
export const KYCStatusBadge: React.FC<{
  status: KYCStatus;
  showIcon?: boolean;
  className?: string;
}> = ({ status, showIcon = true, className }) => {
  const getIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />;
      case 'in_review':
        return <Clock className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      case 'pending':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    const labels = {
      pending: '待提交',
      in_review: '审核中',
      approved: '已通过',
      rejected: '已拒绝'
    };
    return labels[status] || status;
  };

  return (
    <Badge 
      variant={getKYCStatusVariant(status)} 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

/**
 * 风险等级Badge
 */
export const RiskLevelBadge: React.FC<{
  level: RiskLevel;
  showIcon?: boolean;
  className?: string;
}> = ({ level, showIcon = true, className }) => {
  const getIcon = () => {
    switch (level) {
      case 'low':
        return <CheckCircle className="h-3 w-3" />;
      case 'medium':
        return <AlertTriangle className="h-3 w-3" />;
      case 'high':
      case 'critical':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    const labels = {
      low: '低风险',
      medium: '中风险',
      high: '高风险',
      critical: '严重风险'
    };
    return labels[level] || level;
  };

  return (
    <Badge 
      variant={getRiskLevelVariant(level)} 
      className={`flex items-center gap-1 ${getRiskLevelColor(level)} ${className || ''}`}
    >
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

/**
 * 钱包状态Badge
 */
export const WalletStatusBadge: React.FC<{
  status: WalletStatus;
  showIcon?: boolean;
  className?: string;
}> = ({ status, showIcon = true, className }) => {
  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-3 w-3" />;
      case 'disconnected':
        return <WifiOff className="h-3 w-3" />;
      case 'pending':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    const labels = {
      connected: '已连接',
      disconnected: '未连接',
      pending: '连接中'
    };
    return labels[status] || status;
  };

  return (
    <Badge 
      variant={getWalletStatusVariant(status)} 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

/**
 * 通知类型Badge
 */
export const NotificationTypeBadge: React.FC<{
  type: NotificationType;
  showIcon?: boolean;
  className?: string;
}> = ({ type, showIcon = true, className }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      case 'error':
        return <XCircle className="h-3 w-3" />;
      case 'info':
        return <AlertCircle className="h-3 w-3" />;
      case 'security':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'info':
        return 'outline';
      case 'security':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getLabel = () => {
    const labels = {
      success: '成功',
      warning: '警告',
      error: '错误',
      info: '信息',
      security: '安全'
    };
    return labels[type] || type;
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

// ========== 业务特定Badge ==========

/**
 * 信任等级Badge
 */
export const TrustLevelBadge: React.FC<{
  level: 'standard' | 'premium' | 'verified';
  showIcon?: boolean;
  className?: string;
}> = ({ level, showIcon = true, className }) => {
  const getIcon = () => {
    switch (level) {
      case 'verified':
        return <Shield className="h-3 w-3" />;
      case 'premium':
        return <Star className="h-3 w-3" />;
      case 'standard':
        return null;
      default:
        return null;
    }
  };

  const getVariant = () => {
    switch (level) {
      case 'verified':
        return 'default';
      case 'premium':
        return 'secondary';
      case 'standard':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getLabel = () => {
    const labels = {
      verified: '已验证',
      premium: '高级',
      standard: '标准'
    };
    return labels[level] || level;
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

/**
 * 业务类型Badge
 */
export const BusinessTypeBadge: React.FC<{
  type: 'individual' | 'company' | 'machinery_dealer';
  showIcon?: boolean;
  className?: string;
}> = ({ type, showIcon = true, className }) => {
  const getIcon = () => {
    switch (type) {
      case 'individual':
        return <User className="h-3 w-3" />;
      case 'company':
      case 'machinery_dealer':
        return <Building className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    const labels = {
      individual: '个人',
      company: '公司',
      machinery_dealer: '设备商'
    };
    return labels[type] || type;
  };

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

/**
 * 网络状态Badge
 */
export const NetworkBadge: React.FC<{
  chainId: number;
  showIcon?: boolean;
  className?: string;
}> = ({ chainId, showIcon = false, className }) => {
  const getNetworkInfo = () => {
    switch (chainId) {
      case 1:
        return { name: 'Ethereum', color: 'bg-blue-500' };
      case 137:
        return { name: 'Polygon', color: 'bg-purple-500' };
      case 56:
        return { name: 'BSC', color: 'bg-yellow-500' };
      default:
        return { name: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const { name, color } = getNetworkInfo();

  return (
    <Badge 
      className={`${color} text-white ${className || ''}`}
    >
      <span>{name}</span>
    </Badge>
  );
};

// ========== 组合Badge ==========

/**
 * 通用状态Badge - 自动识别状态类型
 */
export const StatusBadge: React.FC<{
  status: string;
  type?: 'transaction' | 'kyc' | 'risk' | 'wallet' | 'notification';
  showIcon?: boolean;
  className?: string;
}> = ({ status, type, showIcon = true, className }) => {
  // 根据type和status自动选择合适的Badge组件
  switch (type) {
    case 'transaction':
      return (
        <TransactionStatusBadge 
          status={status as TransactionStatus}
          showIcon={showIcon}
          className={className}
        />
      );
    case 'kyc':
      return (
        <KYCStatusBadge 
          status={status as KYCStatus}
          showIcon={showIcon}
          className={className}
        />
      );
    case 'risk':
      return (
        <RiskLevelBadge 
          level={status as RiskLevel}
          showIcon={showIcon}
          className={className}
        />
      );
    case 'wallet':
      return (
        <WalletStatusBadge 
          status={status as WalletStatus}
          showIcon={showIcon}
          className={className}
        />
      );
    case 'notification':
      return (
        <NotificationTypeBadge 
          type={status as NotificationType}
          showIcon={showIcon}
          className={className}
        />
      );
    default:
      // 默认显示文本Badge
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
};