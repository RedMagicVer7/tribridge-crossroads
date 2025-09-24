/**
 * Toast通知工具函数
 * 统一管理Toast通知，避免重复代码
 */

import { toast } from '../hooks/use-toast';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from './constants';

// ========== 基础Toast函数 ==========

/**
 * 成功提示
 */
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'default',
  });
};

/**
 * 错误提示
 */
export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'destructive',
  });
};

/**
 * 警告提示
 */
export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'default',
  });
};

/**
 * 信息提示
 */
export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: 'default',
  });
};

// ========== 业务特定Toast函数 ==========

/**
 * 交易相关Toast
 */
export const transactionToast = {
  success: (transactionId: string) => {
    showSuccessToast(
      SUCCESS_MESSAGES.TRANSACTION_SUCCESS,
      `交易 ${transactionId} 已成功完成`
    );
  },

  failed: (reason?: string) => {
    showErrorToast(
      '交易失败',
      reason || '交易处理失败，请稍后重试'
    );
  },

  processing: (transactionId: string) => {
    showInfoToast(
      '交易处理中',
      `交易 ${transactionId} 正在处理，请等待...`
    );
  },

  cancelled: (transactionId: string) => {
    showWarningToast(
      '交易已取消',
      `交易 ${transactionId} 已被取消`
    );
  }
};

/**
 * 保存操作Toast
 */
export const saveToast = {
  success: () => {
    showSuccessToast(SUCCESS_MESSAGES.SAVE_SUCCESS, '您的更改已保存');
  },

  error: () => {
    showErrorToast('保存失败', '无法保存您的更改，请重试');
  }
};

/**
 * 更新操作Toast
 */
export const updateToast = {
  success: () => {
    showSuccessToast(SUCCESS_MESSAGES.UPDATE_SUCCESS, '信息已更新');
  },

  error: () => {
    showErrorToast('更新失败', '无法更新信息，请重试');
  }
};

/**
 * 删除操作Toast
 */
export const deleteToast = {
  success: (itemName?: string) => {
    showSuccessToast(
      SUCCESS_MESSAGES.DELETE_SUCCESS,
      itemName ? `${itemName}已删除` : '项目已删除'
    );
  },

  error: () => {
    showErrorToast('删除失败', '无法删除项目，请重试');
  }
};

/**
 * 复制操作Toast
 */
export const copyToast = {
  success: (content?: string) => {
    showSuccessToast(
      '已复制',
      content ? `${content}已复制到剪贴板` : '内容已复制到剪贴板'
    );
  },

  error: () => {
    showErrorToast('复制失败', '无法复制到剪贴板');
  }
};

/**
 * 钱包操作Toast
 */
export const walletToast = {
  connected: (address: string) => {
    showSuccessToast(
      '钱包已连接',
      `地址: ${address.slice(0, 6)}...${address.slice(-4)}`
    );
  },

  disconnected: () => {
    showInfoToast('钱包已断开', '钱包连接已断开');
  },

  error: (message?: string) => {
    showErrorToast('钱包错误', message || '钱包操作失败');
  },

  networkChanged: (networkName: string) => {
    showInfoToast('网络已切换', `已切换到 ${networkName}`);
  }
};

/**
 * KYC相关Toast
 */
export const kycToast = {
  submitted: () => {
    showSuccessToast('KYC已提交', '您的身份验证资料已提交审核');
  },

  approved: () => {
    showSuccessToast('KYC已通过', '您的身份验证已通过审核');
  },

  rejected: (reason?: string) => {
    showErrorToast(
      'KYC被拒绝',
      reason || '您的身份验证被拒绝，请重新提交'
    );
  },

  expired: () => {
    showWarningToast('KYC即将过期', '您的身份验证将在7天后过期，请及时更新');
  }
};

/**
 * 通知相关Toast
 */
export const notificationToast = {
  markAllRead: () => {
    showSuccessToast('全部标记为已读', '所有通知已标记为已读');
  },

  cleared: () => {
    showSuccessToast('通知已清空', '所有通知已清除');
  },

  deleted: () => {
    showSuccessToast('通知已删除', '通知已从列表中移除');
  },

  settingsSaved: () => {
    showSuccessToast('设置已保存', '通知设置已成功更新');
  }
};

/**
 * 合规检查Toast
 */
export const complianceToast = {
  checkStarted: () => {
    showInfoToast('合规检查已开始', '正在进行合规性检查...');
  },

  checkCompleted: (riskLevel: string) => {
    if (riskLevel === 'low') {
      showSuccessToast('合规检查通过', '风险评估：低风险');
    } else if (riskLevel === 'medium') {
      showWarningToast('合规检查警告', '风险评估：中等风险');
    } else {
      showErrorToast('合规检查失败', '风险评估：高风险，需要人工审核');
    }
  },

  checkFailed: () => {
    showErrorToast('合规检查失败', '无法完成合规性检查，请联系客服');
  }
};

/**
 * 投资相关Toast
 */
export const investmentToast = {
  success: (amount: string, currency: string) => {
    showSuccessToast('投资成功', `已成功投资 ${amount} ${currency}`);
  },

  failed: () => {
    showErrorToast('投资失败', '投资操作失败，请稍后重试');
  },

  withdrawn: (amount: string, currency: string) => {
    showSuccessToast('提取成功', `已成功提取 ${amount} ${currency}`);
  }
};

/**
 * 安全相关Toast
 */
export const securityToast = {
  passwordChanged: () => {
    showSuccessToast('密码已更改', '您的密码已成功更新');
  },

  twoFactorEnabled: () => {
    showSuccessToast('双重认证已启用', '您的账户安全性已提升');
  },

  twoFactorDisabled: () => {
    showWarningToast('双重认证已关闭', '建议保持双重认证以确保安全');
  },

  loginAlert: (ip: string) => {
    showWarningToast(
      '新设备登录',
      `检测到从 ${ip} 的登录，如果不是您操作，请立即更改密码`
    );
  },

  sessionExpired: () => {
    showErrorToast('会话已过期', '请重新登录');
  }
};

/**
 * 网络相关Toast
 */
export const networkToast = {
  offline: () => {
    showErrorToast('网络连接断开', '请检查您的网络连接');
  },

  online: () => {
    showSuccessToast('网络已恢复', '网络连接已恢复正常');
  },

  slowConnection: () => {
    showWarningToast('网络连接较慢', '当前网络连接较慢，可能影响操作响应时间');
  },

  timeout: () => {
    showErrorToast('请求超时', '网络请求超时，请重试');
  }
};

/**
 * 系统相关Toast
 */
export const systemToast = {
  maintenanceMode: () => {
    showWarningToast(
      '系统维护中',
      '系统正在进行维护，部分功能可能暂时不可用'
    );
  },

  maintenanceComplete: () => {
    showSuccessToast('维护完成', '系统维护已完成，所有功能恢复正常');
  },

  updateAvailable: () => {
    showInfoToast('有新版本', '检测到新版本，请刷新页面获取最新功能');
  },

  featureDisabled: (featureName: string) => {
    showWarningToast('功能不可用', `${featureName} 功能暂时不可用`);
  }
};

/**
 * 通用错误Toast - 根据错误类型自动选择合适的提示
 */
export const errorToast = (error: any) => {
  if (typeof error === 'string') {
    showErrorToast('操作失败', error);
    return;
  }

  if (error?.code) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        networkToast.offline();
        break;
      case 'TIMEOUT_ERROR':
        networkToast.timeout();
        break;
      case 'UNAUTHORIZED':
        securityToast.sessionExpired();
        break;
      case 'VALIDATION_ERROR':
        showErrorToast('输入错误', error.message || '请检查输入数据');
        break;
      default:
        showErrorToast('系统错误', error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  } else {
    showErrorToast('未知错误', error?.message || '发生未知错误，请重试');
  }
};

/**
 * 操作确认Toast - 显示操作结果
 */
export const operationToast = (
  operation: 'save' | 'update' | 'delete' | 'create' | 'send',
  success: boolean,
  details?: string
) => {
  const operations = {
    save: { success: '保存成功', error: '保存失败' },
    update: { success: '更新成功', error: '更新失败' },
    delete: { success: '删除成功', error: '删除失败' },
    create: { success: '创建成功', error: '创建失败' },
    send: { success: '发送成功', error: '发送失败' }
  };

  const message = operations[operation];
  
  if (success) {
    showSuccessToast(message.success, details);
  } else {
    showErrorToast(message.error, details);
  }
};