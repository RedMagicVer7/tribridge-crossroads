import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Globe,
  DollarSign,
  Users,
  FileCheck
} from 'lucide-react';

interface ComplianceCheck {
  id: string;
  userId: string;
  transactionId: string;
  checkType: 'sanction' | 'aml' | 'kyc' | 'geographical';
  status: 'pending' | 'approved' | 'rejected' | 'requires_review';
  result: {
    score: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    flags: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
    recommendations: string[];
    blockedCountries?: string[];
    sanctionMatches?: Array<{
      listName: string;
      entityName: string;
      matchScore: number;
    }>;
  };
  createdAt: string;
}

interface ComplianceStats {
  totalChecks: number;
  riskDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

const ComplianceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);

  // 新检查表单状态
  const [checkForm, setCheckForm] = useState({
    userId: '',
    transactionId: '',
    userCountry: '',
    destinationCountry: '',
    amount: '',
    currency: 'USDT',
    userInfo: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      idDocument: ''
    }
  });

  useEffect(() => {
    loadComplianceStats();
    loadRecentChecks();
  }, []);

  const loadComplianceStats = async () => {
    try {
      // 模拟API调用
      const mockStats: ComplianceStats = {
        totalChecks: 1247,
        riskDistribution: {
          low: 856,
          medium: 231,
          high: 124,
          critical: 36
        },
        statusDistribution: {
          pending: 23,
          approved: 1089,
          rejected: 48,
          requires_review: 87
        }
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load compliance stats:', error);
    }
  };

  const loadRecentChecks = async () => {
    try {
      // 模拟最近的合规检查数据
      const mockChecks: ComplianceCheck[] = [
        {
          id: 'comp_001',
          userId: 'user_123',
          transactionId: 'tx_456',
          checkType: 'sanction',
          status: 'approved',
          result: {
            score: 85,
            riskLevel: 'low',
            flags: [],
            recommendations: ['Standard processing approved']
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp_002',
          userId: 'user_789',
          transactionId: 'tx_101',
          checkType: 'geographical',
          status: 'requires_review',
          result: {
            score: 25,
            riskLevel: 'high',
            flags: [
              {
                type: 'high_risk_country',
                severity: 'high',
                description: 'User from high-risk country: Russia'
              }
            ],
            recommendations: ['进行增强尽职调查', '收集额外文档']
          },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'comp_003',
          userId: 'user_456',
          transactionId: 'tx_789',
          checkType: 'aml',
          status: 'rejected',
          result: {
            score: 5,
            riskLevel: 'critical',
            flags: [
              {
                type: 'sanction_list',
                severity: 'critical',
                description: 'Potential sanction list match found'
              }
            ],
            recommendations: ['立即阻止交易', '联系合规团队'],
            sanctionMatches: [
              {
                listName: 'OFAC',
                entityName: 'Suspicious Entity',
                matchScore: 0.95
              }
            ]
          },
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      setChecks(mockChecks);
    } catch (error) {
      console.error('Failed to load compliance checks:', error);
    }
  };

  const handleNewCheck = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCheck: ComplianceCheck = {
        id: `comp_${Date.now()}`,
        userId: checkForm.userId,
        transactionId: checkForm.transactionId,
        checkType: 'sanction',
        status: 'pending',
        result: {
          score: Math.floor(Math.random() * 100),
          riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          flags: [],
          recommendations: []
        },
        createdAt: new Date().toISOString()
      };

      setChecks(prev => [newCheck, ...prev]);
      setCheckForm({
        userId: '',
        transactionId: '',
        userCountry: '',
        destinationCountry: '',
        amount: '',
        currency: 'USDT',
        userInfo: {
          fullName: '',
          dateOfBirth: '',
          address: '',
          idDocument: ''
        }
      });
    } catch (error) {
      console.error('Failed to create compliance check:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'requires_review': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">合规与制裁检查</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">仪表板</TabsTrigger>
          <TabsTrigger value="new-check">新建检查</TabsTrigger>
          <TabsTrigger value="checks">检查记录</TabsTrigger>
          <TabsTrigger value="sanctions">制裁名单</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* 统计概览 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">总检查数</p>
                      <p className="text-2xl font-bold">{stats.totalChecks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">已通过</p>
                      <p className="text-2xl font-bold">{stats.statusDistribution.approved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">需审查</p>
                      <p className="text-2xl font-bold">{stats.statusDistribution.requires_review}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">已拒绝</p>
                      <p className="text-2xl font-bold">{stats.statusDistribution.rejected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 风险分布 */}
          <Card>
            <CardHeader>
              <CardTitle>风险等级分布</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.riskDistribution).map(([level, count]) => (
                    <div key={level} className="text-center">
                      <Badge className={getRiskLevelColor(level)}>
                        {level.toUpperCase()}
                      </Badge>
                      <p className="text-2xl font-bold mt-2">{count}</p>
                      <p className="text-sm text-gray-600">
                        {((count / stats.totalChecks) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最近检查 */}
          <Card>
            <CardHeader>
              <CardTitle>最近检查</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checks.slice(0, 5).map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium">{check.transactionId}</p>
                        <p className="text-sm text-gray-600">
                          用户: {check.userId} | 风险评分: {check.result.score}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRiskLevelColor(check.result.riskLevel)}>
                        {check.result.riskLevel}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCheck(check)}>
                        查看
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-check" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>创建新的合规检查</CardTitle>
              <CardDescription>
                为交易或用户创建新的合规检查，系统将自动进行制裁名单、地理位置和反洗钱检查
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">用户ID</Label>
                  <Input
                    id="userId"
                    value={checkForm.userId}
                    onChange={(e) => setCheckForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="输入用户ID"
                  />
                </div>
                <div>
                  <Label htmlFor="transactionId">交易ID</Label>
                  <Input
                    id="transactionId"
                    value={checkForm.transactionId}
                    onChange={(e) => setCheckForm(prev => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="输入交易ID"
                  />
                </div>
                <div>
                  <Label htmlFor="userCountry">用户国家</Label>
                  <Input
                    id="userCountry"
                    value={checkForm.userCountry}
                    onChange={(e) => setCheckForm(prev => ({ ...prev, userCountry: e.target.value }))}
                    placeholder="例如: CN, US, RU"
                  />
                </div>
                <div>
                  <Label htmlFor="destinationCountry">目标国家</Label>
                  <Input
                    id="destinationCountry"
                    value={checkForm.destinationCountry}
                    onChange={(e) => setCheckForm(prev => ({ ...prev, destinationCountry: e.target.value }))}
                    placeholder="例如: CN, US, RU"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">交易金额</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={checkForm.amount}
                    onChange={(e) => setCheckForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="输入金额"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">货币</Label>
                  <select
                    id="currency"
                    value={checkForm.currency}
                    onChange={(e) => setCheckForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USD">USD</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">用户信息 (KYC)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">全名</Label>
                    <Input
                      id="fullName"
                      value={checkForm.userInfo.fullName}
                      onChange={(e) => setCheckForm(prev => ({
                        ...prev,
                        userInfo: { ...prev.userInfo, fullName: e.target.value }
                      }))}
                      placeholder="用户全名"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">出生日期</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={checkForm.userInfo.dateOfBirth}
                      onChange={(e) => setCheckForm(prev => ({
                        ...prev,
                        userInfo: { ...prev.userInfo, dateOfBirth: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">地址</Label>
                    <Input
                      id="address"
                      value={checkForm.userInfo.address}
                      onChange={(e) => setCheckForm(prev => ({
                        ...prev,
                        userInfo: { ...prev.userInfo, address: e.target.value }
                      }))}
                      placeholder="完整地址"
                    />
                  </div>
                  <div>
                    <Label htmlFor="idDocument">身份证件</Label>
                    <Input
                      id="idDocument"
                      value={checkForm.userInfo.idDocument}
                      onChange={(e) => setCheckForm(prev => ({
                        ...prev,
                        userInfo: { ...prev.userInfo, idDocument: e.target.value }
                      }))}
                      placeholder="身份证件号码"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleNewCheck} disabled={loading} className="w-full">
                {loading ? '检查中...' : '开始合规检查'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>检查记录</CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input placeholder="搜索检查记录..." className="max-w-sm" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checks.map((check) => (
                  <div key={check.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <p className="font-medium">{check.transactionId}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(check.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskLevelColor(check.result.riskLevel)}>
                          {check.result.riskLevel}
                        </Badge>
                        <span className="text-sm font-medium">评分: {check.result.score}</span>
                      </div>
                    </div>

                    {check.result.flags.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">风险标记:</p>
                        <div className="space-y-1">
                          {check.result.flags.map((flag, index) => (
                            <Alert key={index}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <span className="font-medium">{flag.type}:</span> {flag.description}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {check.result.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">建议:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {check.result.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sanctions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>制裁名单管理</CardTitle>
              <CardDescription>
                管理和监控各种制裁名单，包括OFAC、EU、UN等国际制裁清单
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">OFAC</p>
                        <p className="text-sm text-gray-600">美国财政部制裁名单</p>
                        <p className="text-sm">最后更新: 2024-01-15</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">EU Sanctions</p>
                        <p className="text-sm text-gray-600">欧盟制裁名单</p>
                        <p className="text-sm">最后更新: 2024-01-14</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">UN Sanctions</p>
                        <p className="text-sm text-gray-600">联合国制裁名单</p>
                        <p className="text-sm">最后更新: 2024-01-13</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">受限国家/地区</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { code: 'KP', name: '朝鲜', status: '完全禁止', reason: 'UN制裁' },
                    { code: 'IR', name: '伊朗', status: '完全禁止', reason: 'OFAC制裁' },
                    { code: 'SY', name: '叙利亚', status: '完全禁止', reason: '多重制裁' },
                    { code: 'RU', name: '俄罗斯', status: '增强审查', reason: 'EU/US制裁' },
                    { code: 'BY', name: '白俄罗斯', status: '增强审查', reason: 'EU制裁' },
                    { code: 'AF', name: '阿富汗', status: '增强审查', reason: '政治不稳定' }
                  ].map((country) => (
                    <div key={country.code} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{country.name} ({country.code})</p>
                          <p className="text-sm text-gray-600">{country.reason}</p>
                        </div>
                        <Badge variant={country.status === '完全禁止' ? 'destructive' : 'secondary'}>
                          {country.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 检查详情模态框 */}
      {selectedCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>检查详情</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedCheck(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">检查ID</p>
                  <p className="font-medium">{selectedCheck.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">状态</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedCheck.status)}
                    <span>{selectedCheck.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">风险评分</p>
                  <p className="font-medium">{selectedCheck.result.score}/100</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">风险等级</p>
                  <Badge className={getRiskLevelColor(selectedCheck.result.riskLevel)}>
                    {selectedCheck.result.riskLevel}
                  </Badge>
                </div>
              </div>

              {selectedCheck.result.flags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">风险标记</h3>
                  <div className="space-y-2">
                    {selectedCheck.result.flags.map((flag, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <span className="font-medium">{flag.type} ({flag.severity}):</span> {flag.description}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {selectedCheck.result.sanctionMatches && selectedCheck.result.sanctionMatches.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">制裁名单匹配</h3>
                  <div className="space-y-2">
                    {selectedCheck.result.sanctionMatches.map((match, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">{match.entityName}</p>
                        <p className="text-sm text-red-600">
                          名单: {match.listName} | 匹配度: {(match.matchScore * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCheck.result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">建议措施</h3>
                  <ul className="space-y-1">
                    {selectedCheck.result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComplianceModule;