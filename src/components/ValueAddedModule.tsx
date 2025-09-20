import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lock, 
  CreditCard, 
  Shield, 
  Award, 
  Users, 
  Star,
  Gift
} from 'lucide-react';

const ValueAddedModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rateLockForm, setRateLockForm] = useState({
    fromCurrency: 'USDT',
    toCurrency: 'CNY',
    amount: '',
    lockDuration: 24
  });

  const formatNumber = (num: string | number) => {
    return new Intl.NumberFormat().format(Number(num));
  };

  // 模拟数据
  const creditProfile = {
    creditScore: 750,
    creditLimit: '100000',
    usedCredit: '25000',
    availableCredit: '75000',
    riskLevel: 'low'
  };

  const loyaltyProgram = {
    tier: 'gold',
    points: 12500,
    totalEarned: 25000,
    benefits: ['0.5%手续费折扣', '专属客服', '优先处理', '高级分析工具'],
    nextTierRequirement: 37500,
    discountRate: 0.5
  };

  const rateLocks = [
    {
      id: 'lock001',
      fromCurrency: 'USDT',
      toCurrency: 'CNY',
      lockedRate: 7.2,
      amount: '10000',
      lockDuration: 24,
      fee: '10',
      status: 'active',
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'diamond': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    if (score >= 500) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Star className="h-6 w-6" />
        <h1 className="text-2xl font-bold">增值服务</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="rate-lock">汇率锁定</TabsTrigger>
          <TabsTrigger value="credit">信用管理</TabsTrigger>
          <TabsTrigger value="loyalty">忠诚度计划</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 服务概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">活跃汇率锁定</p>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">信用评分</p>
                    <p className={`text-2xl font-bold ${getCreditScoreColor(creditProfile.creditScore)}`}>
                      {creditProfile.creditScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">忠诚度等级</p>
                    <p className="text-lg font-bold capitalize">{loyaltyProgram.tier}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">忠诚度积分</p>
                    <p className="text-2xl font-bold">{formatNumber(loyaltyProgram.points)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 忠诚度计划详情 */}
          <Card>
            <CardHeader>
              <CardTitle>忠诚度计划状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getTierColor(loyaltyProgram.tier)}>
                      {loyaltyProgram.tier.toUpperCase()} 会员
                    </Badge>
                    <span className="text-sm text-gray-600">
                      折扣率: {loyaltyProgram.discountRate}%
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm">当前积分</span>
                      <span className="font-medium">{formatNumber(loyaltyProgram.points)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">总计获得</span>
                      <span className="font-medium">{formatNumber(loyaltyProgram.totalEarned)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">下一等级需要</span>
                      <span className="font-medium">{formatNumber(loyaltyProgram.nextTierRequirement - loyaltyProgram.totalEarned)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(loyaltyProgram.totalEarned / loyaltyProgram.nextTierRequirement) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">会员权益</h4>
                  <ul className="space-y-2">
                    {loyaltyProgram.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-lock" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>创建汇率锁定</CardTitle>
                <CardDescription>锁定当前汇率，避免汇率波动风险</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromCurrency">从货币</Label>
                    <select
                      id="fromCurrency"
                      value={rateLockForm.fromCurrency}
                      onChange={(e) => setRateLockForm(prev => ({ ...prev, fromCurrency: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="toCurrency">到货币</Label>
                    <select
                      id="toCurrency"
                      value={rateLockForm.toCurrency}
                      onChange={(e) => setRateLockForm(prev => ({ ...prev, toCurrency: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="CNY">CNY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">锁定金额</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={rateLockForm.amount}
                    onChange={(e) => setRateLockForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="输入锁定金额"
                  />
                </div>

                <div>
                  <Label htmlFor="lockDuration">锁定时长 (小时)</Label>
                  <select
                    id="lockDuration"
                    value={rateLockForm.lockDuration}
                    onChange={(e) => setRateLockForm(prev => ({ ...prev, lockDuration: parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={1}>1小时</option>
                    <option value={6}>6小时</option>
                    <option value={24}>24小时</option>
                    <option value={72}>72小时</option>
                    <option value={168}>1周</option>
                  </select>
                </div>

                {rateLockForm.amount && (
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>当前汇率:</span>
                      <span>7.2500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>锁定费用:</span>
                      <span>{(parseFloat(rateLockForm.amount) * 0.001).toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>有效期:</span>
                      <span>{rateLockForm.lockDuration}小时</span>
                    </div>
                  </div>
                )}

                <Button className="w-full">创建汇率锁定</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>汇率锁定记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rateLocks.map((lock) => (
                    <div key={lock.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{lock.fromCurrency} → {lock.toCurrency}</span>
                        <Badge variant={lock.status === 'active' ? 'default' : 'secondary'}>
                          {lock.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>锁定汇率:</span>
                          <span>{lock.lockedRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>金额:</span>
                          <span>{formatNumber(lock.amount)} {lock.fromCurrency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>手续费:</span>
                          <span>{lock.fee} {lock.fromCurrency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>到期时间:</span>
                          <span>{new Date(lock.expiresAt).toLocaleString()}</span>
                        </div>
                      </div>
                      {lock.status === 'active' && (
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          使用锁定汇率
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="credit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>信用管理</CardTitle>
              <CardDescription>管理您的信用额度和支付历史</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-center p-6 border rounded-lg">
                    <div className={`text-4xl font-bold mb-2 ${getCreditScoreColor(creditProfile.creditScore)}`}>
                      {creditProfile.creditScore}
                    </div>
                    <div className="text-sm text-gray-600">信用评分 (满分1000)</div>
                    <Badge variant={creditProfile.riskLevel === 'low' ? 'default' : 'secondary'} className="mt-2">
                      低风险
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">信用额度使用情况</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">总额度:</span>
                        <span className="font-medium">${formatNumber(creditProfile.creditLimit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">已使用:</span>
                        <span className="font-medium">${formatNumber(creditProfile.usedCredit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">可用额度:</span>
                        <span className="font-medium text-green-600">${formatNumber(creditProfile.availableCredit)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full" 
                        style={{ 
                          width: `${(parseFloat(creditProfile.usedCredit) / parseFloat(creditProfile.creditLimit)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">信用评分因素</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">支付历史</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full w-[90%]"></div>
                        </div>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">信用利用率</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full w-[25%]"></div>
                        </div>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm">信用历史长度</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full w-[70%]"></div>
                        </div>
                        <span className="text-sm font-medium">8个月</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">提升建议</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 保持按时还款记录</li>
                      <li>• 降低信用额度使用率至30%以下</li>
                      <li>• 增加交易活跃度</li>
                      <li>• 完善身份验证信息</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>忠诚度计划</CardTitle>
              <CardDescription>赚取积分，享受专属权益</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                      <div className="text-center p-6 border rounded-lg">
                        <Badge className={`${getTierColor(loyaltyProgram.tier)} mb-4`}>
                          {loyaltyProgram.tier.toUpperCase()} 会员
                        </Badge>
                    <div className="text-3xl font-bold mb-2">{formatNumber(loyaltyProgram.points)}</div>
                    <div className="text-sm text-gray-600">当前积分</div>
                    <div className="text-sm text-green-600 mt-2">
                      享受 {loyaltyProgram.discountRate}% 手续费折扣
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">升级进度</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>距离白金级还需要:</span>
                        <span>{formatNumber(loyaltyProgram.nextTierRequirement - loyaltyProgram.totalEarned)} 积分</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-purple-500 h-3 rounded-full" 
                          style={{ 
                            width: `${(loyaltyProgram.totalEarned / loyaltyProgram.nextTierRequirement) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">会员权益</h4>
                  <div className="space-y-2">
                    {loyaltyProgram.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <h5 className="font-medium mb-2">积分获取方式</h5>
                    <ul className="text-sm space-y-1">
                      <li>• 完成交易: 每1 USDT = 1积分</li>
                      <li>• 邀请朋友: 500积分/人</li>
                      <li>• 每日签到: 10积分/天</li>
                      <li>• 完成任务: 50-200积分</li>
                    </ul>
                  </div>

                  <Button className="w-full">查看全部任务</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ValueAddedModule;