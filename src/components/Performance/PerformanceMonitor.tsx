import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Server,
  Wifi,
  Database
} from "lucide-react";

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'critical'>('healthy');
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    // Initialize and update performance metrics
    const updateMetrics = () => {
      const now = Date.now();
      const baseMetrics: PerformanceMetric[] = [
        {
          id: 'processing_time',
          name: '平均处理时间',
          value: 0.8 + Math.random() * 0.4, // 0.8-1.2s
          unit: 's',
          target: 1.0,
          status: 'excellent',
          trend: 'stable',
          description: '从交易提交到完成的平均时间'
        },
        {
          id: 'success_rate',
          name: '交易成功率',
          value: 99.7 + Math.random() * 0.3, // 99.7-100%
          unit: '%',
          target: 99.5,
          status: 'excellent',
          trend: 'stable',
          description: '最近24小时内成功完成的交易比例'
        },
        {
          id: 'throughput',
          name: '交易吞吐量',
          value: 145 + Math.random() * 20, // 145-165 TPS
          unit: 'TPS',
          target: 150,
          status: 'good',
          trend: 'up',
          description: '每秒处理的交易笔数'
        },
        {
          id: 'latency',
          name: 'API响应延迟',
          value: 85 + Math.random() * 30, // 85-115ms
          unit: 'ms',
          target: 100,
          status: 'good',
          trend: 'stable',
          description: 'API请求的平均响应时间'
        },
        {
          id: 'uptime',
          name: '系统可用性',
          value: 99.95 + Math.random() * 0.05, // 99.95-100%
          unit: '%',
          target: 99.9,
          status: 'excellent',
          trend: 'stable',
          description: '系统正常运行时间比例'
        },
        {
          id: 'error_rate',
          name: '错误率',
          value: Math.random() * 0.5, // 0-0.5%
          unit: '%',
          target: 1.0,
          status: 'excellent',
          trend: 'down',
          description: '系统错误发生的频率'
        }
      ];

      // Determine status based on target comparison
      baseMetrics.forEach(metric => {
        if (metric.id === 'error_rate') {
          // Lower is better for error rate
          if (metric.value <= metric.target * 0.3) metric.status = 'excellent';
          else if (metric.value <= metric.target * 0.6) metric.status = 'good';
          else if (metric.value <= metric.target) metric.status = 'warning';
          else metric.status = 'critical';
        } else {
          // Higher is better for other metrics
          if (metric.value >= metric.target * 1.05) metric.status = 'excellent';
          else if (metric.value >= metric.target * 0.95) metric.status = 'good';
          else if (metric.value >= metric.target * 0.85) metric.status = 'warning';
          else metric.status = 'critical';
        }
      });

      setMetrics(baseMetrics);
      setLastUpdate(new Date().toLocaleString('zh-CN'));

      // Determine overall system health
      const criticalCount = baseMetrics.filter(m => m.status === 'critical').length;
      const warningCount = baseMetrics.filter(m => m.status === 'warning').length;
      
      if (criticalCount > 0) setSystemHealth('critical');
      else if (warningCount > 1) setSystemHealth('degraded');
      else setSystemHealth('healthy');
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: PerformanceMetric['trend'], status: PerformanceMetric['status']) => {
    const colorClass = status === 'excellent' || status === 'good' ? 'text-success' : 
                      status === 'warning' ? 'text-warning' : 'text-destructive';
    
    switch (trend) {
      case 'up': return <TrendingUp className={`h-3 w-3 ${colorClass}`} />;
      case 'down': return <TrendingUp className={`h-3 w-3 ${colorClass} rotate-180`} />;
      case 'stable': return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getHealthBadge = () => {
    switch (systemHealth) {
      case 'healthy':
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            系统健康
          </Badge>
        );
      case 'degraded':
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <AlertTriangle className="h-3 w-3 mr-1" />
            性能下降
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            系统异常
          </Badge>
        );
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === '%') return `${value.toFixed(2)}%`;
    if (unit === 's') return `${value.toFixed(1)}s`;
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === 'TPS') return `${Math.round(value)} TPS`;
    return `${value.toFixed(2)} ${unit}`;
  };

  const getProgressValue = (metric: PerformanceMetric): number => {
    if (metric.id === 'error_rate') {
      // For error rate, we want to show how close we are to 0% (good)
      return Math.max(0, 100 - (metric.value / metric.target) * 100);
    } else {
      // For other metrics, show percentage of target achieved
      return Math.min(100, (metric.value / metric.target) * 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                系统性能监控
              </CardTitle>
              <CardDescription>
                实时监控系统关键性能指标 • 最后更新: {lastUpdate}
              </CardDescription>
            </div>
            {getHealthBadge()}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Server className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">99.97%</div>
              <div className="text-sm text-blue-700">系统可用性</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">0.8s</div>
              <div className="text-sm text-green-700">平均处理时间</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">155</div>
              <div className="text-sm text-purple-700">TPS 吞吐量</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric) => (
          <Card key={metric.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {metric.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend, metric.status)}
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(metric.status)}
                  >
                    {getStatusIcon(metric.status)}
                    <span className="ml-1">{formatValue(metric.value, metric.unit)}</span>
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-xs">
                {metric.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">目标值</span>
                  <span className="font-medium">{formatValue(metric.target, metric.unit)}</span>
                </div>
                
                <Progress 
                  value={getProgressValue(metric)} 
                  className="h-2"
                />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="text-center">
                    {metric.id === 'error_rate' ? '错误率 (越低越好)' : '性能指标'}
                  </span>
                  <span>{formatValue(metric.target, metric.unit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Infrastructure Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            基础设施状态
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <div>
                <div className="font-medium text-sm">API服务器</div>
                <div className="text-xs text-success">正常运行</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <div>
                <div className="font-medium text-sm">数据库</div>
                <div className="text-xs text-success">连接正常</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <div>
                <div className="font-medium text-sm">区块链网络</div>
                <div className="text-xs text-success">同步完成</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <Wifi className="h-4 w-4 text-success" />
              <div>
                <div className="font-medium text-sm">外部API</div>
                <div className="text-xs text-success">连接稳定</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            性能优化建议
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-sm">
                <div className="font-medium">系统运行良好</div>
                <div className="text-muted-foreground">
                  当前所有关键指标都在正常范围内，系统性能表现优秀
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
              <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">优化建议</div>
                <div className="text-muted-foreground">
                  继续监控交易量增长，考虑在高峰时段增加服务器资源
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;