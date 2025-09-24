import React from 'react';
import Header from "../components/Layout/Header";
import RussiaOTCTrading from "../components/Russia/RussiaOTCTrading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
  Globe
} from "lucide-react";

const RussiaPage = () => {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  
  const handleStartTrading = () => {
    toast({
      title: t('russia.action.start_trading'),
      description: t('russia.trading_description') || '正在启动 OTC 交易模块...',
    });
    // 这里可以添加导航到交易页面的逻辑
    // navigate('/otc');
  };

  const handleCheckCompliance = () => {
    toast({
      title: t('russia.action.check_compliance'),
      description: t('russia.compliance_description') || '正在检查 KYC/AML 合规状态...',
    });
    // 这里可以添加导航到合规页面的逻辑
    // navigate('/compliance');
  };

  const handleTrackLogistics = () => {
    toast({
      title: t('russia.action.track_logistics'),
      description: t('russia.logistics_description') || '正在查看物流跟踪信息...',
    });
    // 这里可以添加导航到物流页面的逻辑
    // navigate('/logistics');
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

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-6">
          <Button 
            size="lg" 
            className="flex items-center gap-2"
            onClick={handleStartTrading}
          >
            <Wallet className="h-4 w-4" />
            {t('russia.action.start_trading')}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="flex items-center gap-2"
            onClick={handleCheckCompliance}
          >
            <Shield className="h-4 w-4" />
            {t('russia.action.check_compliance')}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="flex items-center gap-2"
            onClick={handleTrackLogistics}
          >
            <Truck className="h-4 w-4" />
            {t('russia.action.track_logistics')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RussiaPage;