import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Layout/Header";
import RussiaOTCTrading from "../components/Russia/RussiaOTCTrading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useTranslation } from "../contexts/TranslationContext";
import { useToast } from "../hooks/use-toast";
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Truck, 
  Users, 
  CheckCircle,
  Clock,
  AlertCircle,
  Globe,
  ArrowLeftRight,
  Calculator,
  FileText,
  Upload,
  Package,
  MapPin,
  Search,
  User,
  Building,
  ExternalLink
} from "lucide-react";

const RussiaPage = () => {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Tab 相关状态
  const [activeTab, setActiveTab] = useState('trading');
  
  // 增强 Tab 切换反馈
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // 添加 Toast 反馈
    const tabMessages = {
      trading: '切换到 OTC 交易功能',
      logistics: '切换到物流追踪功能', 
      compliance: '切换到合规检查功能'
    };
    
    toast({
      title: '功能切换',
      description: tabMessages[value as keyof typeof tabMessages] || '功能已切换',
      duration: 2000
    });
  };
  
  // Trading 相关状态
  const [fromCurrency, setFromCurrency] = useState('RUB');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [exchangeRate] = useState(88.5);
  
  // Logistics 相关状态
  const [trackingNumber, setTrackingNumber] = useState('TRI-RU-2024-001');
  
  // Compliance 相关状态
  const [uploading, setUploading] = useState(false);
  
  // 导航到详细页面
  const handleViewDetails = (type: 'trading' | 'logistics' | 'compliance') => {
    const routes = {
      trading: '/trading',
      logistics: '/logistics', 
      compliance: '/compliance-new'
    };
    
    const messages = {
      trading: '正在跳转到完整的 OTC 交易页面...',
      logistics: '正在跳转到完整的物流追踪页面...',
      compliance: '正在跳转到完整的合规检查页面...'
    };
    
    navigate(routes[type]);
    toast({
      title: '跳转详情页面',
      description: messages[type],
      duration: 2000
    });
  };
  const calculateExchange = () => {
    if (!amount) return '0';
    const numAmount = parseFloat(amount);
    if (fromCurrency === 'RUB' && toCurrency === 'USDT') {
      return (numAmount / exchangeRate).toFixed(4);
    } else if (fromCurrency === 'USDT' && toCurrency === 'RUB') {
      return (numAmount * exchangeRate).toFixed(2);
    }
    return amount;
  };

  // 处理交易
  const handleTrade = () => {
    if (!amount) {
      toast({
        title: "错误",
        description: "请输入交易金额",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "交易已提交",
      description: `正在处理 ${amount} ${fromCurrency} → ${toCurrency} 的交易`,
    });
  };

  // 处理物流查询
  const handleTrack = () => {
    if (!trackingNumber) {
      toast({
        title: "错误",
        description: "请输入追踪单号",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "追踪查询成功",
      description: `正在显示 ${trackingNumber} 的物流信息`,
    });
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        toast({
          title: "文件上传成功",
          description: `${file.name} 已成功上传，等待审核`,
        });
      }, 2000);
    }
  };

  // 处理合规检查
  const handleComplianceCheck = () => {
    toast({
      title: "合规检查已启动",
      description: "正在进行 KYC/AML 合规性检查...",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8 space-y-8">
        {/* Hero Section with Russian Focus */}
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="text-3xl">🇷🇺</span>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t('russia.title')}
            </h1>
            <span className="text-3xl">🇨🇳</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('russia.subtitle')}
          </p>
        </div>

        {/* Development Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-800">
                  {t('russia.smart_contracts')}
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">✅</div>
              <p className="text-xs text-green-600 mt-1">
                {t('russia.smart_contracts_desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-800">
                  {t('russia.otc_exchange')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">✅</div>
              <p className="text-xs text-blue-600 mt-1">
                {t('russia.otc_exchange_desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-800">
                  {t('russia.logistics')}
                </CardTitle>
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">✅</div>
              <p className="text-xs text-purple-600 mt-1">
                {t('russia.logistics_desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-800">
                  {t('russia.compliance')}
                </CardTitle>
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">✅</div>
              <p className="text-xs text-orange-600 mt-1">
                {t('russia.compliance_desc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Tabs */}
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
              <TabsTrigger 
                value="trading" 
                className="flex items-center gap-2 transition-all duration-200 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                <Wallet className="h-4 w-4" />
                Start Trading
              </TabsTrigger>
              <TabsTrigger 
                value="logistics" 
                className="flex items-center gap-2 transition-all duration-200 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                <Truck className="h-4 w-4" />
                Track Logistics
              </TabsTrigger>
              <TabsTrigger 
                value="compliance" 
                className="flex items-center gap-2 transition-all duration-200 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                <Shield className="h-4 w-4" />
                Check Compliance
              </TabsTrigger>
            </TabsList>
            
            {/* Trading Tab Content */}
            <TabsContent value="trading" className="space-y-4 mt-6 animate-in fade-in-50 duration-200">
              <div className="border-l-4 border-primary pl-4 mb-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  OTC 交易中心
                </h3>
                <p className="text-sm text-muted-foreground">快速安全的卢布/USDT兑换服务</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5" />
                      OTC 交易
                    </CardTitle>
                    <CardDescription>
                      快速卢布/USDT兑换服务
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">当前汇率</span>
                        <span className="text-lg font-bold">1 USDT = {exchangeRate} RUB</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>支付金额</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="输入金额"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={fromCurrency} onValueChange={setFromCurrency}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RUB">RUB</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>接收金额</Label>
                      <div className="flex gap-2">
                        <Input
                          value={calculateExchange()}
                          readOnly
                          className="flex-1 bg-gray-50"
                        />
                        <Select value={toCurrency} onValueChange={setToCurrency}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="RUB">RUB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button className="w-full hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]" onClick={handleTrade}>
                      <Calculator className="h-4 w-4 mr-2" />
                      确认交易
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>账户信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>USDT 余额</span>
                      <span className="font-bold">1,250.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RUB 余额</span>
                      <span className="font-bold">45,780.00</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">24小时交易限额</p>
                      <p className="font-bold">50,000 USDT</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* 查看详情按钮 */}
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => handleViewDetails('trading')}
                >
                  <ExternalLink className="h-4 w-4" />
                  查看完整 OTC 交易页面
                </Button>
              </div>
            </TabsContent>
            
            {/* Logistics Tab Content */}
            <TabsContent value="logistics" className="space-y-4 mt-6 animate-in fade-in-50 duration-200">
              <div className="border-l-4 border-blue-500 pl-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  物流追踪中心
                </h3>
                <p className="text-sm text-muted-foreground">实时货物追踪和运输状态管理</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      物流追踪
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>追踪单号</Label>
                      <Input
                        placeholder="输入追踪单号"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                    </div>
                    
                    <Button className="w-full hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]" onClick={handleTrack}>
                      <Search className="h-4 w-4 mr-2" />
                      查询物流
                    </Button>
                    
                    <div className="space-y-3 pt-4">
                      <div className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        <div>
                          <p className="font-medium text-sm">货物已送达收货人</p>
                          <p className="text-xs text-muted-foreground">莫斯科物流中心 • 2024-01-20 14:30</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Truck className="h-5 w-5 text-blue-500 mt-1" />
                        <div>
                          <p className="font-medium text-sm">货物派送中</p>
                          <p className="text-xs text-muted-foreground">莫斯科配送站 • 2024-01-20 09:15</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <FileText className="h-5 w-5 text-purple-500 mt-1" />
                        <div>
                          <p className="font-medium text-sm">海关清关完成</p>
                          <p className="text-xs text-muted-foreground">莫斯科海关 • 2024-01-19 16:45</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      活跃货运
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">TRI-RU-2024-001</span>
                        <Badge variant="default">已送达</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">上海 → 莫斯科 • 重型挖掘设备</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-green-600 h-1.5 rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">TRI-RU-2024-002</span>
                        <Badge variant="secondary">运输中</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">广州 → 圣彼得堡 • 矿业设备</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">TRI-RU-2024-003</span>
                        <Badge variant="outline">海关</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">深圳 → 新西伯利亚 • 能源设备</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-orange-600 h-1.5 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* 查看详情按钮 */}
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => handleViewDetails('logistics')}
                >
                  <ExternalLink className="h-4 w-4" />
                  查看完整物流追踪页面
                </Button>
              </div>
            </TabsContent>
            
            {/* Compliance Tab Content */}
            <TabsContent value="compliance" className="space-y-4 mt-6 animate-in fade-in-50 duration-200">
              <div className="border-l-4 border-orange-500 pl-4 mb-4">
                <h3 className="text-lg font-semibold text-orange-700 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  合规检查中心
                </h3>
                <p className="text-sm text-muted-foreground">KYC/AML 合规性检查与认证管理</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      KYC 认证状态
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">KYC Level 2</p>
                          <p className="text-sm text-muted-foreground">身份认证已完成</p>
                        </div>
                      </div>
                      <Badge variant="default">已认证</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>上传额外文档</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="document-upload"
                          accept=".pdf,.jpg,.png"
                        />
                        <label htmlFor="document-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">点击上传文件</p>
                        </label>
                      </div>
                      {uploading && (
                        <p className="text-sm text-blue-600">正在上传...</p>
                      )}
                    </div>
                    
                    <Button className="w-full hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02]" onClick={handleComplianceCheck}>
                      <Shield className="h-4 w-4 mr-2" />
                      重新检查合规
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>合规评分</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">92/100</div>
                      <p className="text-sm text-muted-foreground">优秀</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>身份验证</span>
                        <span>25/25</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>地址验证</span>
                        <span>20/25</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>资金来源</span>
                        <span>22/25</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>AML 检查</span>
                        <span>25/25</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* 查看详情按钮 */}
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => handleViewDetails('compliance')}
                >
                  <ExternalLink className="h-4 w-4" />
                  查看完整合规检查页面
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Russian OTC Trading Component */}
          <div className="lg:col-span-2">
            <RussiaOTCTrading />
          </div>

          {/* Beta Test Users */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('russia.beta_users')}
                </CardTitle>
                <CardDescription>
                  8 {t('russia.beta_ready')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-sm">🇷🇺 Ivan Petrov</p>
                      <p className="text-xs text-muted-foreground">RusMach - {t('russia.job.procurement')}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">KYC-2</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-sm">🇨🇳 Zhang Wei</p>
                      <p className="text-xs text-muted-foreground">ChinaEquip - {t('russia.job.sales')}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">KYC-3</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-sm">🇷🇺 Anna Komarova</p>
                      <p className="text-xs text-muted-foreground">SibMining - {t('russia.job.director')}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">KYC-2</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-sm">🇨🇳 Li Ming</p>
                      <p className="text-xs text-muted-foreground">HeavyInd - {t('russia.job.export')}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">KYC-3</Badge>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    + 4 {t('russia.additional_users')}
                  </p>
                  <p className="text-xs text-center mt-1">
                    <span className="text-green-600 font-medium">{t('russia.password_all')}: test123</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('russia.active_scenarios')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-sm">RusMach → ChinaEquip</p>
                  <p className="text-xs text-muted-foreground">{t('russia.heavy_mining')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">25,000 USDT</p>
                  <Badge variant="default" className="text-xs">{t('russia.escrow')}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-sm">SibMining → HeavyInd</p>
                  <p className="text-xs text-muted-foreground">{t('russia.mining_equipment')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">15,000 USDT</p>
                  <Badge variant="secondary" className="text-xs">{t('russia.in_transit')}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-sm">EnergyRus → ManufactureCN</p>
                  <p className="text-xs text-muted-foreground">{t('russia.energy_equipment')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">35,000 USDT</p>
                  <Badge variant="outline" className="text-xs">{t('russia.created')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('russia.system_architecture')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">React Frontend</div>
                  <span>→</span>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs">Node.js API</div>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">PostgreSQL</div>
                  <span>+</span>
                  <div className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs">Redis Cache</div>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-xs">Polygon Network</div>
                  <span>+</span>
                  <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs">USDT Contract</div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>15{t('russia.stats.code_files_count')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>8 {t('russia.stats.modules_count')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{t('russia.stats.docker_status')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{t('russia.stats.deployment_status')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RussiaPage;