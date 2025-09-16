import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

interface AnalyticsData {
  volumeData: { date: string; volume: number; transactions: number }[];
  currencyData: { currency: string; volume: number; percentage: number; color: string }[];
  performanceMetrics: {
    totalVolume: number;
    totalTransactions: number;
    averageAmount: number;
    successRate: number;
    growthRate: number;
  };
  timeSeriesData: { time: string; price: number; volume: number }[];
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    const loadAnalyticsData = () => {
      setTimeout(() => {
        const mockData: AnalyticsData = {
          volumeData: [
            { date: "2024-01-01", volume: 125000, transactions: 45 },
            { date: "2024-01-02", volume: 148000, transactions: 52 },
            { date: "2024-01-03", volume: 162000, transactions: 38 },
            { date: "2024-01-04", volume: 135000, transactions: 65 },
            { date: "2024-01-05", volume: 189000, transactions: 71 },
            { date: "2024-01-06", volume: 176000, transactions: 58 },
            { date: "2024-01-07", volume: 198000, transactions: 82 }
          ],
          currencyData: [
            { currency: "USD", volume: 450000, percentage: 45, color: "#22c55e" },
            { currency: "RMB", volume: 350000, percentage: 35, color: "#3b82f6" },
            { currency: "RUB", volume: 200000, percentage: 20, color: "#f59e0b" }
          ],
          performanceMetrics: {
            totalVolume: 1000000,
            totalTransactions: 311,
            averageAmount: 3215.43,
            successRate: 99.7,
            growthRate: 15.2
          },
          timeSeriesData: Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            price: 1 + Math.random() * 0.02,
            volume: Math.random() * 10000
          }))
        };
        
        setAnalyticsData(mockData);
        setIsLoading(false);
      }, 1000);
    };

    loadAnalyticsData();
  }, [timeRange]);

  if (isLoading || !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">分析报表</h1>
          <div className="flex items-center space-x-4">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-muted animate-pulse rounded-lg" />
          <div className="h-80 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  const { volumeData, currencyData, performanceMetrics, timeSeriesData } = analyticsData;

  return (
    <div className="space-y-6">
      {/* 页面标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">分析报表</h1>
          <p className="text-muted-foreground">交易数据分析和性能指标</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今日</SelectItem>
              <SelectItem value="7d">7天</SelectItem>
              <SelectItem value="30d">30天</SelectItem>
              <SelectItem value="90d">90天</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总交易量</p>
                <p className="text-2xl font-bold">${performanceMetrics.totalVolume.toLocaleString()}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{performanceMetrics.growthRate}%
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">交易笔数</p>
                <p className="text-2xl font-bold">{performanceMetrics.totalTransactions}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8.2%
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <Activity className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均金额</p>
                <p className="text-2xl font-bold">${performanceMetrics.averageAmount.toFixed(2)}</p>
                <p className="text-xs text-warning flex items-center mt-1">
                  <ArrowDownLeft className="h-3 w-3 mr-1" />
                  -2.1%
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">成功率</p>
                <p className="text-2xl font-bold">{performanceMetrics.successRate}%</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3%
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <Tabs defaultValue="volume" className="space-y-6">
        <TabsList>
          <TabsTrigger value="volume">交易量趋势</TabsTrigger>
          <TabsTrigger value="currency">货币分布</TabsTrigger>
          <TabsTrigger value="performance">性能分析</TabsTrigger>
          <TabsTrigger value="realtime">实时数据</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>交易量趋势</CardTitle>
                <CardDescription>过去7天的交易量变化</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getMonth() + 1 + '/' + new Date(value).getDate()} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '交易量']}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>交易笔数趋势</CardTitle>
                <CardDescription>每日交易笔数统计</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getMonth() + 1 + '/' + new Date(value).getDate()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [value, '交易笔数']}
                    />
                    <Bar dataKey="transactions" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>货币分布</CardTitle>
                <CardDescription>各货币交易量占比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currencyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="volume"
                      label={({ currency, percentage }) => `${currency} ${percentage}%`}
                    >
                      {currencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '交易量']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>货币统计</CardTitle>
                <CardDescription>详细交易数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currencyData.map((currency) => (
                    <div key={currency.currency} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: currency.color }}
                        />
                        <div>
                          <p className="font-medium">{currency.currency}</p>
                          <p className="text-sm text-muted-foreground">${currency.volume.toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{currency.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>性能指标</CardTitle>
              <CardDescription>系统性能和交易效率分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">平均处理时间</span>
                    <span className="text-sm font-medium">0.8s</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full w-[80%]" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">系统可用性</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[99%]" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">客户满意度</span>
                    <span className="text-sm font-medium">4.8/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full w-[96%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>实时交易数据</CardTitle>
              <CardDescription>24小时实时交易监控</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;