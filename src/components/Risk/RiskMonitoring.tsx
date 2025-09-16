import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Eye,
  Settings,
  RefreshCw,
  CheckCircle,
  Clock
} from "lucide-react";

interface RiskMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  status: 'safe' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const RiskMonitoring = () => {
  const [metrics, setMetrics] = useState<RiskMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    // 模拟实时风险监控数据
    const updateMetrics = () => {
      const newMetrics: RiskMetric[] = [
        {
          id: 'liquidity',
          name: '流动性风险',
          value: 15,
          threshold: 30,
          status: 'safe',
          trend: 'stable',
          description: '当前流动性充足，各货币对都有足够的储备'
        },
        {
          id: 'volatility',
          name: '波动率风险',
          value: 45,
          threshold: 50,
          status: 'warning',
          trend: 'up',
          description: '市场波动率较高，建议谨慎进行大额交易'
        },
        {
          id: 'counterparty',
          name: '交易对手风险',
          value: 8,
          threshold: 25,
          status: 'safe',
          trend: 'down',
          description: '交易对手信用状况良好，违约风险较低'
        },
        {
          id: 'operational',
          name: '操作风险',
          value: 12,
          threshold: 40,
          status: 'safe',
          trend: 'stable',
          description: '系统运行稳定，操作风险可控'
        },
        {
          id: 'compliance',
          name: '合规风险',
          value: 5,
          threshold: 20,
          status: 'safe',
          trend: 'stable',
          description: '合规检查通过，监管风险较低'
        },
        {
          id: 'concentration',
          name: '集中度风险',
          value: 62,
          threshold: 60,
          status: 'critical',
          trend: 'up',
          description: '单一货币对集中度过高，建议分散投资组合'
        }
      ];
      
      setMetrics(newMetrics);
      setLastUpdate(new Date().toLocaleString('zh-CN'));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: RiskMetric['status']) => {
    switch (status) {
      case 'safe': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
    }
  };

  const getStatusBadge = (status: RiskMetric['status']) => {
    const variants = {
      safe: 'default',
      warning: 'secondary',
      critical: 'destructive'
    } as const;
    
    const labels = {
      safe: '安全',
      warning: '警告',
      critical: '危险'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getTrendIcon = (trend: RiskMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-destructive" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-success rotate-180" />;
      case 'stable': return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const criticalRisks = metrics.filter(m => m.status === 'critical');
  const warningRisks = metrics.filter(m => m.status === 'warning');
  const overallRiskScore = Math.round(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">风险监控</h1>
          <p className="text-muted-foreground">实时监控系统风险指标</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <span className="text-sm text-muted-foreground">
              {isMonitoring ? '实时监控' : '监控暂停'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? '暂停监控' : '开始监控'}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            配置
          </Button>
        </div>
      </div>

      {/* 关键警报 */}
      {(criticalRisks.length > 0 || warningRisks.length > 0) && (
        <div className="space-y-4">
          {criticalRisks.map((risk) => (
            <Alert key={risk.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>严重风险警报:</strong> {risk.name}超过临界值 ({risk.value}% &gt; {risk.threshold}%)
              </AlertDescription>
            </Alert>
          ))}
          
          {warningRisks.map((risk) => (
            <Alert key={risk.id} className="border-warning">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription>
                <strong>风险提醒:</strong> {risk.name}接近警戒线 ({risk.value}% 接近 {risk.threshold}%)
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* 风险概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                风险概览
              </CardTitle>
              <CardDescription>
                最后更新: {lastUpdate}
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{overallRiskScore}%</div>
              <div className="text-sm text-muted-foreground">综合风险评分</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallRiskScore} className="h-3" />
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-success/5 rounded-lg">
                <div className="text-2xl font-bold text-success">{metrics.filter(m => m.status === 'safe').length}</div>
                <div className="text-sm text-muted-foreground">安全指标</div>
              </div>
              
              <div className="text-center p-4 bg-warning/5 rounded-lg">
                <div className="text-2xl font-bold text-warning">{warningRisks.length}</div>
                <div className="text-sm text-muted-foreground">警告指标</div>
              </div>
              
              <div className="text-center p-4 bg-destructive/5 rounded-lg">
                <div className="text-2xl font-bold text-destructive">{criticalRisks.length}</div>
                <div className="text-sm text-muted-foreground">危险指标</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细风险指标 */}
      <div className="grid gap-6 md:grid-cols-2">
        {metrics.map((metric) => (
          <Card key={metric.id} className={`transition-all ${
            metric.status === 'critical' ? 'border-destructive/50 bg-destructive/5' :
            metric.status === 'warning' ? 'border-warning/50 bg-warning/5' :
            'border-success/50 bg-success/5'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metric.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  {getStatusBadge(metric.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>当前值</span>
                  <span className={`font-medium ${getStatusColor(metric.status)}`}>
                    {metric.value}%
                  </span>
                </div>
                
                <Progress 
                  value={metric.value} 
                  className="h-2"
                />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>阈值: {metric.threshold}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {metric.description}
              </p>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  详情
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3 mr-1" />
                  设置
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 风险管理建议 */}
      <Card>
        <CardHeader>
          <CardTitle>风险管理建议</CardTitle>
          <CardDescription>基于当前风险状况的管理建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalRisks.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  立即降低集中度风险：建议分散投资组合，减少单一货币对的暴露度
                </AlertDescription>
              </Alert>
            )}
            
            {warningRisks.length > 0 && (
              <Alert className="border-warning">
                <Clock className="h-4 w-4 text-warning" />
                <AlertDescription>
                  关注市场波动：建议暂时降低交易规模，等待市场稳定
                </AlertDescription>
              </Alert>
            )}
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                继续保持现有的风险控制措施，定期审查风险参数设置
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskMonitoring;