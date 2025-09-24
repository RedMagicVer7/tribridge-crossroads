/**
 * 数据验证工具库
 * 提供统一的数据验证逻辑和错误处理
 */

import { VALIDATION_RULES } from './constants';
import type { ValidationRule, FormField, AppError } from './types';

// ========== 基础验证函数 ==========

/**
 * 必填验证
 */
export const validateRequired = (value: any): string | null => {
  if (value === null || value === undefined || value === '') {
    return '此字段为必填项';
  }
  if (typeof value === 'string' && value.trim() === '') {
    return '此字段不能为空';
  }
  if (Array.isArray(value) && value.length === 0) {
    return '请至少选择一项';
  }
  return null;
};

/**
 * 邮箱验证
 */
export const validateEmail = (value: string): string | null => {
  if (!value) return null; // 空值由required规则处理
  
  if (!VALIDATION_RULES.EMAIL.test(value)) {
    return '请输入有效的邮箱地址';
  }
  return null;
};

/**
 * 电话号码验证
 */
export const validatePhone = (value: string): string | null => {
  if (!value) return null;
  
  if (!VALIDATION_RULES.PHONE.test(value)) {
    return '请输入有效的电话号码';
  }
  return null;
};

/**
 * 密码验证
 */
export const validatePassword = (value: string): string | null => {
  if (!value) return null;
  
  if (value.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    return `密码长度至少${VALIDATION_RULES.MIN_PASSWORD_LENGTH}位`;
  }
  
  if (!/[A-Z]/.test(value)) {
    return '密码必须包含大写字母';
  }
  
  if (!/[a-z]/.test(value)) {
    return '密码必须包含小写字母';
  }
  
  if (!/\d/.test(value)) {
    return '密码必须包含数字';
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return '密码必须包含特殊字符';
  }
  
  return null;
};

/**
 * 钱包地址验证
 */
export const validateWalletAddress = (value: string): string | null => {
  if (!value) return null;
  
  if (!VALIDATION_RULES.WALLET_ADDRESS.test(value)) {
    return '请输入有效的钱包地址';
  }
  return null;
};

/**
 * 数值范围验证
 */
export const validateRange = (value: number, min?: number, max?: number): string | null => {
  if (min !== undefined && value < min) {
    return `值不能小于 ${min}`;
  }
  if (max !== undefined && value > max) {
    return `值不能大于 ${max}`;
  }
  return null;
};

/**
 * 字符串长度验证
 */
export const validateLength = (value: string, min?: number, max?: number): string | null => {
  if (!value) return null;
  
  if (min !== undefined && value.length < min) {
    return `长度不能少于 ${min} 个字符`;
  }
  if (max !== undefined && value.length > max) {
    return `长度不能超过 ${max} 个字符`;
  }
  return null;
};

/**
 * 正则表达式验证
 */
export const validatePattern = (value: string, pattern: RegExp, message: string): string | null => {
  if (!value) return null;
  
  if (!pattern.test(value)) {
    return message;
  }
  return null;
};

/**
 * 自定义验证函数
 */
export const validateCustom = (value: any, validator: (value: any) => boolean, message: string): string | null => {
  if (!validator(value)) {
    return message;
  }
  return null;
};

// ========== 复合验证函数 ==========

/**
 * 用户名验证（组合多个规则）
 */
export const validateUsername = (value: string): string[] => {
  const errors: string[] = [];
  
  const requiredError = validateRequired(value);
  if (requiredError) {
    errors.push(requiredError);
    return errors; // 如果必填验证失败，不进行后续验证
  }
  
  const lengthError = validateLength(value, 3, 20);
  if (lengthError) errors.push(lengthError);
  
  const patternError = validatePattern(
    value, 
    /^[a-zA-Z0-9_]+$/, 
    '用户名只能包含字母、数字和下划线'
  );
  if (patternError) errors.push(patternError);
  
  return errors;
};

/**
 * 交易金额验证
 */
export const validateTransactionAmount = (value: string | number, currency: string): string[] => {
  const errors: string[] = [];
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    errors.push('请输入有效的数字');
    return errors;
  }
  
  if (numValue <= 0) {
    errors.push('金额必须大于0');
  }
  
  // 根据货币类型设置不同的限制
  const limits = {
    USDT: { min: 1, max: 1000000 },
    CNY: { min: 10, max: 10000000 },
    RUB: { min: 100, max: 100000000 },
    USD: { min: 1, max: 1000000 }
  };
  
  const limit = limits[currency as keyof typeof limits];
  if (limit) {
    const rangeError = validateRange(numValue, limit.min, limit.max);
    if (rangeError) errors.push(rangeError);
  }
  
  return errors;
};

// ========== 表单验证器 ==========

/**
 * 执行单个验证规则
 */
export const executeValidationRule = (value: any, rule: ValidationRule): string | null => {
  switch (rule.type) {
    case 'required':
      return validateRequired(value);
    
    case 'email':
      return validateEmail(value);
    
    case 'min':
      if (typeof value === 'number') {
        return validateRange(value, rule.value);
      } else if (typeof value === 'string') {
        return validateLength(value, rule.value);
      }
      return null;
    
    case 'max':
      if (typeof value === 'number') {
        return validateRange(value, undefined, rule.value);
      } else if (typeof value === 'string') {
        return validateLength(value, undefined, rule.value);
      }
      return null;
    
    case 'pattern':
      return validatePattern(value, rule.value, rule.message);
    
    case 'custom':
      return rule.validator ? validateCustom(value, rule.validator, rule.message) : null;
    
    default:
      return null;
  }
};

/**
 * 验证单个字段
 */
export const validateField = (field: FormField): string[] => {
  const errors: string[] = [];
  
  if (!field.validation || field.validation.length === 0) {
    return errors;
  }
  
  for (const rule of field.validation) {
    const error = executeValidationRule(field.value, rule);
    if (error) {
      errors.push(error);
      
      // 如果是必填验证失败，停止后续验证
      if (rule.type === 'required') {
        break;
      }
    }
  }
  
  return errors;
};

/**
 * 验证表单对象
 */
export const validateForm = (fields: FormField[]): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  
  for (const field of fields) {
    const fieldErrors = validateField(field);
    if (fieldErrors.length > 0) {
      errors[field.name] = fieldErrors;
    }
  }
  
  return errors;
};

/**
 * 检查表单是否有效
 */
export const isFormValid = (fields: FormField[]): boolean => {
  const errors = validateForm(fields);
  return Object.keys(errors).length === 0;
};

// ========== 业务特定验证 ==========

/**
 * KYC表单验证
 */
export const validateKYCForm = (data: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  idDocument: string;
}): Record<string, string[]> => {
  const fields: FormField[] = [
    {
      name: 'firstName',
      label: '姓名',
      type: 'text',
      value: data.firstName,
      required: true,
      validation: [
        { type: 'required', message: '请输入姓名' },
        { type: 'min', value: 1, message: '姓名不能为空' },
        { type: 'max', value: 50, message: '姓名长度不能超过50个字符' }
      ]
    },
    {
      name: 'lastName',
      label: '姓氏',
      type: 'text',
      value: data.lastName,
      required: true,
      validation: [
        { type: 'required', message: '请输入姓氏' },
        { type: 'min', value: 1, message: '姓氏不能为空' },
        { type: 'max', value: 50, message: '姓氏长度不能超过50个字符' }
      ]
    },
    {
      name: 'dateOfBirth',
      label: '出生日期',
      type: 'text',
      value: data.dateOfBirth,
      required: true,
      validation: [
        { type: 'required', message: '请选择出生日期' },
        { 
          type: 'custom', 
          message: '年龄必须满18岁',
          validator: (value: string) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            return age >= 18;
          }
        }
      ]
    },
    {
      name: 'nationality',
      label: '国籍',
      type: 'text',
      value: data.nationality,
      required: true,
      validation: [
        { type: 'required', message: '请输入国籍' }
      ]
    },
    {
      name: 'idDocument',
      label: '身份证件',
      type: 'text',
      value: data.idDocument,
      required: true,
      validation: [
        { type: 'required', message: '请输入身份证件号码' },
        { type: 'min', value: 5, message: '身份证件号码至少5位' }
      ]
    }
  ];
  
  return validateForm(fields);
};

/**
 * 交易表单验证
 */
export const validateTransactionForm = (data: {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  toAddress?: string;
}): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  
  // 验证货币对
  if (!data.fromCurrency) {
    errors.fromCurrency = ['请选择发送货币'];
  }
  
  if (!data.toCurrency) {
    errors.toCurrency = ['请选择接收货币'];
  }
  
  if (data.fromCurrency === data.toCurrency) {
    errors.toCurrency = ['发送货币和接收货币不能相同'];
  }
  
  // 验证金额
  const amountErrors = validateTransactionAmount(data.amount, data.fromCurrency);
  if (amountErrors.length > 0) {
    errors.amount = amountErrors;
  }
  
  // 验证接收地址（如果是加密货币）
  if (data.toAddress && ['USDT', 'USDC', 'ETH', 'BTC'].includes(data.toCurrency)) {
    const addressError = validateWalletAddress(data.toAddress);
    if (addressError) {
      errors.toAddress = [addressError];
    }
  }
  
  return errors;
};

// ========== 错误处理工具 ==========

/**
 * 将验证错误转换为AppError格式
 */
export const validationErrorToAppError = (
  field: string, 
  errors: string[]
): AppError => {
  return {
    code: 'VALIDATION_ERROR',
    message: `字段 "${field}" 验证失败`,
    details: { field, errors },
    timestamp: new Date().toISOString()
  };
};

/**
 * 获取字段的第一个错误信息
 */
export const getFirstError = (errors: Record<string, string[]>, field: string): string | null => {
  const fieldErrors = errors[field];
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
};

/**
 * 检查是否有任何验证错误
 */
export const hasValidationErrors = (errors: Record<string, string[]>): boolean => {
  return Object.values(errors).some(fieldErrors => fieldErrors.length > 0);
};

/**
 * 获取所有错误信息的摘要
 */
export const getValidationSummary = (errors: Record<string, string[]>): string => {
  const errorMessages: string[] = [];
  
  for (const [field, fieldErrors] of Object.entries(errors)) {
    if (fieldErrors.length > 0) {
      errorMessages.push(`${field}: ${fieldErrors[0]}`);
    }
  }
  
  return errorMessages.join('; ');
};