import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Clock, 
  Shield, 
  AlertTriangle,
  PieChart,
  BarChart3,
  Wallet,
  Target,
  Trophy
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface LiquidityPool {
  id: string;
  name: string;
  currency: string;
  totalAmount: number;
  availableAmount: number;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  lockPeriod: number;
  minInvestment: number;
  strategyType: string;
  description: string;
  statistics?: {
    totalInvestors: number;
    utilizationRate: number;
  };
}

interface UserInvestment {
  id: string;
  poolId: string;
  principal: number;
  currentValue: number;
  earnedInterest: number;
  status: string;
}

const LiquidityPoolManagement: React.FC = () => {
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const { toast } = useToast();

  // 风险等级配置
  const riskConfig = {
    low: { color: 'bg-green-100 text-green-800', icon: <Shield className="w-4 h-4" />, text: '低风险' },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-4 h-4" />, text: '中风险' },
    high: { color: 'bg-red-100 text-red-800', icon: <TrendingUp className="w-4 h-4" />, text: '高风险' }
  };

  // 策略类型配置
  const strategyConfig = {
    lending: { name: '借贷收益', icon: <DollarSign className="w-4 h-4" /> },
    arbitrage: { name: '套利交易', icon: <BarChart3 className="w-4 h-4" /> },
    yield_farming: { name: '流动性挖矿', icon: <Trophy className="w-4 h-4" /> },
    staking: { name: '质押收益', icon: <Target className="w-4 h-4" /> }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // 模拟数据
      const mockPools: LiquidityPool[] = [
        {
          id: 'POOL_USD_001',
          name: 'USD稳定币收益池',
          currency: 'USD',
          totalAmount: 5000000,
          availableAmount: 3200000,
          apy: 0.085,
          riskLevel: 'low',
          lockPeriod: 90,
          minInvestment: 1000,
          strategyType: 'lending',
          description: '通过借贷协议为稳定币提供流动性，获得稳定收益',
          statistics: {
            totalInvestors: 1245,
            utilizationRate: 0.64
          }
        },
        {
          id: 'POOL_CNY_001',
          name: '人民币套利池',
          currency: 'CNY',
          totalAmount: 36000000,
          availableAmount: 22000000,
          apy: 0.12,
          riskLevel: 'medium',
          lockPeriod: 180,
          minInvestment: 5000,
          strategyType: 'arbitrage',
          description: '利用CNY/USDT汇率差异进行套利交易',
          statistics: {
            totalInvestors: 856,
            utilizationRate: 0.72
          }
        }
      ];
      setPools(mockPools);

      const mockInvestments: UserInvestment[] = [
        {
          id: 'INV_001',
          poolId: 'POOL_USD_001',
          principal: 10000,
          currentValue: 10425,
          earnedInterest: 425,
          status: 'active'
        }
      ];
      setUserInvestments(mockInvestments);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!selectedPool || !investmentAmount) return;

    try {
      setLoading(true);
      
      const newInvestment: UserInvestment = {
        id: `INV_${Date.now()}`,
        poolId: selectedPool.id,
        principal: parseFloat(investmentAmount),
        currentValue: parseFloat(investmentAmount),
        earnedInterest: 0,
        status: 'active'
      };

      setUserInvestments(prev => [...prev, newInvestment]);
      setShowInvestDialog(false);
      setInvestmentAmount('');
      
      toast({
        title: "投资成功",
        description: `已成功投资 ${investmentAmount} ${selectedPool.currency}`,
      });
    } catch (error) {
      toast({
        title: "投资失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = { USD: '$', CNY: '¥', RUB: '₽' };
    return `${symbols[currency as keyof typeof symbols] || ''}${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  const getRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const config = riskConfig[riskLevel];
    return (
      <Badge className={config.color}>
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </Badge>
    );
  };

  const getStrategyBadge = (strategyType: string) => {
    const config = strategyConfig[strategyType as keyof typeof strategyConfig];
    return config ? (
      <Badge variant="outline">
        {config.icon}
        <span className="ml-1">{config.name}</span>
      </Badge>
    ) : null;
  };

  // 计算投资组合总览
  const portfolioOverview = {
    totalInvested: userInvestments.reduce((sum, inv) => sum + inv.principal, 0),
    totalCurrentValue: userInvestments.reduce((sum, inv) => sum + inv.currentValue, 0),
    totalReturns: userInvestments.reduce((sum, inv) => sum + inv.earnedInterest, 0),
    activeInvestments: userInvestments.filter(inv => inv.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* 投资组合概览 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">总投资</p>
                <p className="text-2xl font-bold">${portfolioOverview.totalInvested.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">当前价值</p>
                <p className="text-2xl font-bold">${portfolioOverview.totalCurrentValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">总收益</p>
                <p className="text-2xl font-bold text-green-600">
                  ${portfolioOverview.totalReturns.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">活跃投资</p>
                <p className="text-2xl font-bold">{portfolioOverview.activeInvestments}</p>
              </div>
              <Percent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pools">资金池</TabsTrigger>
          <TabsTrigger value="investments">我的投资</TabsTrigger>
        </TabsList>

        {/* 资金池列表 */}
        <TabsContent value="pools" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pools.map((pool) => (
                <Card key={pool.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pool.name}</CardTitle>
                      {getRiskBadge(pool.riskLevel)}
                    </div>
                    <CardDescription className="flex items-center space-x-2">
                      {getStrategyBadge(pool.strategyType)}
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {pool.lockPeriod}天
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">年化收益率</span>
                      <span className="text-lg font-semibold text-green-600">
                        {formatPercentage(pool.apy)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>资金利用率</span>
                        <span>{formatPercentage(pool.statistics?.utilizationRate || 0)}</span>
                      </div>
                      <Progress value={(pool.statistics?.utilizationRate || 0) * 100} className="h-2" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最小投资:</span>
                        <span>{formatCurrency(pool.minInvestment, pool.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">投资者数量:</span>
                        <span>{pool.statistics?.totalInvestors.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {pool.description}
                    </p>

                    <Button 
                      onClick={() => {
                        setSelectedPool(pool);
                        setShowInvestDialog(true);
                      }}
                      className="w-full"
                    >
                      立即投资
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 我的投资 */}
        <TabsContent value="investments" className="space-y-4">
          {userInvestments.length > 0 ? (
            <div className="space-y-4">
              {userInvestments.map((investment) => {
                const pool = pools.find(p => p.id === investment.poolId);
                
                return (
                  <Card key={investment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{pool?.name}</h3>
                        </div>
                        <Badge variant="default">进行中</Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">本金</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(investment.principal, pool?.currency || 'USD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">当前价值</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(investment.currentValue, pool?.currency || 'USD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">已赚收益</p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(investment.earnedInterest, pool?.currency || 'USD')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">暂无投资记录</h3>
                <p className="text-muted-foreground mb-4">开始您的第一笔投资，获取稳定收益</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* 投资对话框 */}
      <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>投资 {selectedPool?.name}</DialogTitle>
            <DialogDescription>
              年化收益率 {selectedPool && formatPercentage(selectedPool.apy)}，锁定期 {selectedPool?.lockPeriod} 天
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>投资金额 ({selectedPool?.currency})</Label>
              <Input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder={`最小 ${selectedPool?.minInvestment.toLocaleString()}`}
                min={selectedPool?.minInvestment}
              />
            </div>

            <Button onClick={handleInvest} className="w-full" disabled={loading || !investmentAmount}>
              {loading ? '处理中...' : '确认投资'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiquidityPoolManagement;