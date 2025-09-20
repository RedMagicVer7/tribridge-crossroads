import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  ArrowUpDown, 
  Globe,
  BarChart3,
  DollarSign,
  Users,
  Route
} from 'lucide-react';

interface BRICSStablecoin {
  id: string;
  symbol: string;
  name: string;
  country: string;
  countryCode: string;
  exchangeRate: number;
  marketCap: string;
  isActive: boolean;
}

const BRICSModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stablecoins, setStablecoins] = useState<BRICSStablecoin[]>([]);
  const [exchangeForm, setExchangeForm] = useState({
    fromCoin: 'BCNY',
    toCoin: 'BRUB',
    amount: ''
  });

  useEffect(() => {
    // 模拟BRICS稳定币数据
    const mockStablecoins: BRICSStablecoin[] = [
      {
        id: 'brics_cny',
        symbol: 'BCNY',
        name: 'BRICS Digital Yuan',
        country: 'China',
        countryCode: 'CN',
        exchangeRate: 0.1389,
        marketCap: '4448000000',
        isActive: true
      },
      {
        id: 'brics_rub',
        symbol: 'BRUB',
        name: 'BRICS Digital Ruble',
        country: 'Russia',
        countryCode: 'RU',
        exchangeRate: 0.0108,
        marketCap: '12960000000',
        isActive: true
      },
      {
        id: 'brics_inr',
        symbol: 'BINR',
        name: 'BRICS Digital Rupee',
        country: 'India',
        countryCode: 'IN',
        exchangeRate: 0.012,
        marketCap: '3600000000',
        isActive: true
      },
      {
        id: 'brics_brl',
        symbol: 'BBRL',
        name: 'BRICS Digital Real',
        country: 'Brazil',
        countryCode: 'BR',
        exchangeRate: 0.1998,
        marketCap: '12987000000',
        isActive: true
      },
      {
        id: 'brics_zar',
        symbol: 'BZAR',
        name: 'BRICS Digital Rand',
        country: 'South Africa',
        countryCode: 'ZA',
        exchangeRate: 0.0532,
        marketCap: '2394000000',
        isActive: true
      },
      {
        id: 'brics_unified',
        symbol: 'BRICS',
        name: 'BRICS Unified Stablecoin',
        country: 'Multi-National',
        countryCode: 'BRICS',
        exchangeRate: 1.0,
        marketCap: '5000000000',
        isActive: true
      }
    ];
    setStablecoins(mockStablecoins);
  }, []);

  const formatNumber = (num: string | number) => {
    return new Intl.NumberFormat().format(Number(num));
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'CN': '🇨🇳', 'RU': '🇷🇺', 'IN': '🇮🇳', 'BR': '🇧🇷', 'ZA': '🇿🇦', 'BRICS': '🌐'
    };
    return flags[countryCode] || '🏳️';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Coins className="h-6 w-6" />
        <h1 className="text-2xl font-bold">BRICS稳定币生态系统</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="stablecoins">稳定币</TabsTrigger>
          <TabsTrigger value="exchange">兑换</TabsTrigger>
          <TabsTrigger value="payments">跨境支付</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 总体统计 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">总市值</p>
                    <p className="text-2xl font-bold">$41.39B</p>
                    <p className="text-sm text-green-600">+5.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">24h交易量</p>
                    <p className="text-2xl font-bold">$2.8B</p>
                    <p className="text-sm text-blue-600">+12.8%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">活跃用户</p>
                    <p className="text-2xl font-bold">1.2M</p>
                    <p className="text-sm text-purple-600">+8.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">支持国家</p>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-orange-600">BRICS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BRICS网络状态 */}
          <Card>
            <CardHeader>
              <CardTitle>BRICS支付网络状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { country: 'China', code: 'CN', status: 'online', latency: 45 },
                  { country: 'Russia', code: 'RU', status: 'online', latency: 52 },
                  { country: 'India', code: 'IN', status: 'online', latency: 38 },
                  { country: 'Brazil', code: 'BR', status: 'online', latency: 67 },
                  { country: 'South Africa', code: 'ZA', status: 'online', latency: 78 }
                ].map((node) => (
                  <div key={node.code} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">{getCountryFlag(node.code)}</div>
                    <p className="font-medium">{node.country}</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                      在线
                    </Badge>
                    <p className="text-sm text-gray-600">延迟: {node.latency}ms</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stablecoins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BRICS稳定币</CardTitle>
              <CardDescription>基于BRICS国家法定货币的数字稳定币</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stablecoins.map((coin) => (
                  <Card key={coin.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getCountryFlag(coin.countryCode)}</div>
                          <div>
                            <h3 className="font-bold">{coin.symbol}</h3>
                            <p className="text-sm text-gray-600">{coin.name}</p>
                          </div>
                        </div>
                        <Badge variant={coin.isActive ? 'default' : 'secondary'}>
                          {coin.isActive ? '活跃' : '暂停'}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">国家:</span>
                          <span className="text-sm font-medium">{coin.country}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">市值:</span>
                          <span className="text-sm font-medium">${formatNumber(coin.marketCap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">汇率 (USD):</span>
                          <span className="text-sm font-medium">${coin.exchangeRate.toFixed(4)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchange" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>稳定币兑换</CardTitle>
              <CardDescription>在BRICS稳定币之间进行快速兑换</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fromCoin">从</Label>
                    <select
                      id="fromCoin"
                      value={exchangeForm.fromCoin}
                      onChange={(e) => setExchangeForm(prev => ({ ...prev, fromCoin: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {stablecoins.map(coin => (
                        <option key={coin.symbol} value={coin.symbol}>
                          {coin.symbol} - {coin.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="amount">数量</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={exchangeForm.amount}
                      onChange={(e) => setExchangeForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="输入兑换数量"
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExchangeForm(prev => ({
                        ...prev,
                        fromCoin: prev.toCoin,
                        toCoin: prev.fromCoin
                      }))}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="toCoin">到</Label>
                    <select
                      id="toCoin"
                      value={exchangeForm.toCoin}
                      onChange={(e) => setExchangeForm(prev => ({ ...prev, toCoin: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {stablecoins.map(coin => (
                        <option key={coin.symbol} value={coin.symbol}>
                          {coin.symbol} - {coin.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button className="w-full">开始兑换</Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">兑换详情</h3>
                  {exchangeForm.amount && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>兑换费用 (0.25%):</span>
                        <span>{(parseFloat(exchangeForm.amount) * 0.0025).toFixed(6)} {exchangeForm.fromCoin}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>预计时间:</span>
                        <span>~15分钟</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>预计获得:</span>
                        <span>{(parseFloat(exchangeForm.amount) * 12.85).toFixed(6)} {exchangeForm.toCoin}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>跨境支付路由</CardTitle>
              <CardDescription>使用BRICS稳定币进行高效跨境支付</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">热门路由</h3>
                  {[
                    { from: 'China', to: 'Russia', fromCoin: 'BCNY', toCoin: 'BRUB', time: '50分钟', cost: '0.6%', savings: '80%' },
                    { from: 'India', to: 'Brazil', fromCoin: 'BINR', toCoin: 'BBRL', time: '50分钟', cost: '0.65%', savings: '78%' },
                    { from: 'South Africa', to: 'China', fromCoin: 'BZAR', toCoin: 'BCNY', time: '45分钟', cost: '0.7%', savings: '76%' }
                  ].map((route, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{route.from} → {route.to}</span>
                        <Badge className="bg-green-100 text-green-800">省{route.savings}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>路径: {route.fromCoin} → {route.toCoin}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>时间: {route.time}</span>
                        <span>费用: {route.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">与传统SWIFT对比</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">BRICS支付网络</span>
                      <div className="text-right text-sm">
                        <div className="font-medium text-green-600">平均50分钟</div>
                        <div className="text-gray-600">费用: 0.6%</div>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">传统SWIFT</span>
                      <div className="text-right text-sm">
                        <div className="font-medium text-red-600">平均3天</div>
                        <div className="text-gray-600">费用: 3%</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">优势</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 处理时间减少95%</li>
                      <li>• 交易成本降低80%</li>
                      <li>• 24/7全天候服务</li>
                      <li>• 实时状态追踪</li>
                      <li>• 绕过传统银行限制</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BRICSModule;