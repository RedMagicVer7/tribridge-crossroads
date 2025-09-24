/**
 * 合规检查表单组件
 * 从ComplianceModule中提取的新检查创建逻辑
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2, Plus, User, CreditCard, Shield, FileText } from 'lucide-react';

import { generateId } from '../../lib/utils';
import { complianceToast } from '../../lib/toast-utils';
import type { ComplianceCheck, UserProfile } from '../../lib/types';

interface ComplianceCheckFormProps {
  onSubmit: (checkData: Partial<ComplianceCheck>) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

interface CheckFormData {
  userId: string;
  transactionId: string;
  checkType: 'kyc' | 'aml' | 'sanction' | 'pep' | 'fatf';
  userCountry: string;
  destinationCountry: string;
  amount: string;
  currency: string;
  userInfo: Partial<UserProfile>;
  description: string;
}

const initialFormData: CheckFormData = {
  userId: '',
  transactionId: '',
  checkType: 'sanction',
  userCountry: '',
  destinationCountry: '',
  amount: '',
  currency: 'USDT',
  userInfo: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: {
      country: '',
      province: '',
      city: '',
      street: '',
      postalCode: ''
    }
  },
  description: ''
};

export const ComplianceCheckForm: React.FC<ComplianceCheckFormProps> = ({
  onSubmit,
  loading = false,
  disabled = false
}) => {
  const [formData, setFormData] = useState<CheckFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateUserInfo = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      userInfo: {
        ...prev.userInfo,
        [field]: value
      }
    }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      userInfo: {
        ...prev.userInfo,
        address: {
          ...prev.userInfo.address,
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting || disabled) return;

    // 基本验证
    if (!formData.userId || !formData.checkType) {
      complianceToast.checkFailed();
      return;
    }

    setSubmitting(true);
    complianceToast.checkStarted();

    try {
      const checkData: Partial<ComplianceCheck> = {
        id: generateId('comp'),
        userId: formData.userId,
        transactionId: formData.transactionId || undefined,
        checkType: formData.checkType,
        status: 'pending',
        result: {
          score: 0,
          riskLevel: 'medium',
          passed: false,
          flags: [],
          recommendations: []
        },
        provider: 'internal',
        metadata: {
          sourceCountry: formData.userCountry,
          destinationCountry: formData.destinationCountry,
          amount: parseFloat(formData.amount) || 0,
          currency: formData.currency as any,
          checkDuration: 0
        },
        createdAt: new Date().toISOString()
      };

      await onSubmit(checkData);
      
      // 重置表单
      setFormData(initialFormData);
      
    } catch (error) {
      complianceToast.checkFailed();
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.userId && formData.checkType;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          新建合规检查
        </CardTitle>
        <CardDescription>
          创建新的合规性检查任务
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              基本信息
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="userId">用户ID *</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => updateFormData('userId', e.target.value)}
                  placeholder="输入用户ID"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId">交易ID</Label>
                <Input
                  id="transactionId"
                  value={formData.transactionId}
                  onChange={(e) => updateFormData('transactionId', e.target.value)}
                  placeholder="输入交易ID（可选）"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkType">检查类型 *</Label>
                <Select
                  value={formData.checkType}
                  onValueChange={(value) => updateFormData('checkType', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kyc">KYC 身份验证</SelectItem>
                    <SelectItem value="aml">AML 反洗钱</SelectItem>
                    <SelectItem value="sanction">制裁名单检查</SelectItem>
                    <SelectItem value="pep">PEP 政治敏感人员</SelectItem>
                    <SelectItem value="fatf">FATF 金融行动特别工作组</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">货币</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => updateFormData('currency', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="RUB">RUB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="userCountry">用户国家</Label>
                <Input
                  id="userCountry"
                  value={formData.userCountry}
                  onChange={(e) => updateFormData('userCountry', e.target.value)}
                  placeholder="如：中国"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationCountry">目标国家</Label>
                <Input
                  id="destinationCountry"
                  value={formData.destinationCountry}
                  onChange={(e) => updateFormData('destinationCountry', e.target.value)}
                  placeholder="如：俄罗斯"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">金额</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => updateFormData('amount', e.target.value)}
                  placeholder="输入金额"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              用户信息
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">姓名</Label>
                <Input
                  id="firstName"
                  value={formData.userInfo.firstName || ''}
                  onChange={(e) => updateUserInfo('firstName', e.target.value)}
                  placeholder="输入姓名"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">姓氏</Label>
                <Input
                  id="lastName"
                  value={formData.userInfo.lastName || ''}
                  onChange={(e) => updateUserInfo('lastName', e.target.value)}
                  placeholder="输入姓氏"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">出生日期</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.userInfo.dateOfBirth || ''}
                  onChange={(e) => updateUserInfo('dateOfBirth', e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">国籍</Label>
                <Input
                  id="nationality"
                  value={formData.userInfo.nationality || ''}
                  onChange={(e) => updateUserInfo('nationality', e.target.value)}
                  placeholder="输入国籍"
                  disabled={disabled}
                />
              </div>
            </div>

            {/* 地址信息 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">国家</Label>
                <Input
                  id="country"
                  value={formData.userInfo.address?.country || ''}
                  onChange={(e) => updateAddress('country', e.target.value)}
                  placeholder="输入国家"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">城市</Label>
                <Input
                  id="city"
                  value={formData.userInfo.address?.city || ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  placeholder="输入城市"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="description">备注说明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="输入检查的备注说明..."
              rows={3}
              disabled={disabled}
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isFormValid() || submitting || disabled || loading}
              className="min-w-[120px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  创建检查
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};