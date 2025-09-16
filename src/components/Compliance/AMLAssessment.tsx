import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Globe, 
  CreditCard,
  Activity
} from "lucide-react";

interface RiskFactor {
  id: string;
  name: string;
  description: string;
  score: number;
  maxScore: number;
  status: 'low' | 'medium' | 'high';
  details: string[];
}

interface AMLReport {
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
  factors: RiskFactor[];
  recommendations: string[];
}

const AMLAssessment = () => {
  const [amlReport, setAmlReport] = useState<AMLReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟AML风险评估
    const simulateAMLAssessment = () => {
      setTimeout(() => {
        const mockReport: AMLReport = {
          overallRiskScore: 35,
          riskLevel: 'low',
          lastUpdated: new Date().toISOString(),
          factors: [
            {
              id: 'geographic',
              name: '地理风险',
              description: '基于交易对手所在地区的风险评估',
              score: 8,
              maxScore: 20,
              status: 'low',
              details: [
                '主要交易区域: 中国大陆 (低风险)',
                '次要交易区域: 俄罗斯 (中等风险)',
                '无高风险地区交易记录'
              ]
            },
            {
              id: 'transaction_pattern',
              name: '交易模式',
              description: '交易频率、金额和时间模式分析',
              score: 12,
              maxScore: 25,
              status: 'low',
              details: [
                '交易频率: 正常 (平均每周3-5笔)',
                '交易金额: 合理 (单笔<$50,000)',
                '交易时间: 规律性强'
              ]
            },
            {
              id: 'counterparty',
              name: '交易对手风险',
              description: '交易对手的身份验证和历史记录',
              score: 5,
              maxScore: 20,
              status: 'low',
              details: [
                '95%交易对手已完成KYC验证',
                '无黑名单匹配记录',
                '交易对手信用记录良好'
              ]
            },
            {
              id: 'behavioral',
              name: '行为分析',
              description: '用户行为模式和异常活动检测',
              score: 10,
              maxScore: 15,
              status: 'medium',
              details: [
                '登录行为: 正常',
                '交易时间偏好: 一致',
                '近期有1次异常大额交易预警'
              ]
            }
          ],
          recommendations: [
            '建议定期更新KYC信息',
            '建议启用交易双重验证',
            '建议设置大额交易自动审核',
            '关注异常交易模式变化'
          ]
        };
        
        setAmlReport(mockReport);
        setIsLoading(false);
      }, 2000);
    };

    simulateAMLAssessment();
  }, []);

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
    }
  };

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            AML风险评估
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-primary animate-pulse mb-4" />
              <h3 className="text-lg font-medium mb-2">正在分析风险因素...</h3>
              <p className="text-muted-foreground">
                正在评估交易模式、地理风险、交易对手风险等因素
              </p>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!amlReport) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-warning mb-4" />
            <h3 className="text-lg font-medium mb-2">无法获取风险评估</h3>
            <p className="text-muted-foreground">请稍后重试或联系技术支持</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              重新评估
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 总体风险概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                AML风险评估报告
              </CardTitle>
              <CardDescription>
                最后更新: {new Date(amlReport.lastUpdated).toLocaleString('zh-CN')}
              </CardDescription>
            </div>
            <Badge className={getRiskColor(amlReport.riskLevel)}>
              {getRiskIcon(amlReport.riskLevel)}
              <span className="ml-1">
                {amlReport.riskLevel === 'low' && '低风险'}
                {amlReport.riskLevel === 'medium' && '中等风险'}
                {amlReport.riskLevel === 'high' && '高风险'}
              </span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* 风险评分 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {amlReport.overallRiskScore}/100
              </div>
              <p className="text-muted-foreground">综合风险评分</p>
              <Progress 
                value={amlReport.overallRiskScore} 
                className="mt-4 h-3"
              />
            </div>

            <Separator />

            {/* 风险因素详情 */}
            <div className="grid gap-4 md:grid-cols-2">
              {amlReport.factors.map((factor) => (
                <Card key={factor.id} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {factor.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={getRiskColor(factor.status)}
                      >
                        {factor.score}/{factor.maxScore}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {factor.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Progress 
                      value={(factor.score / factor.maxScore) * 100} 
                      className="mb-3 h-2"
                    />
                    <div className="space-y-1">
                      {factor.details.map((detail, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-start">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 mr-2 flex-shrink-0" />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* 建议措施 */}
            <div>
              <h3 className="font-medium mb-4 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                风险管理建议
              </h3>
              <div className="space-y-2">
                {amlReport.recommendations.map((recommendation, index) => (
                  <Alert key={index} className="border-primary/20">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {recommendation}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()}>
                重新评估
              </Button>
              <Button variant="outline">
                下载报告
              </Button>
              <Button variant="outline">
                设置警报
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速风险指标 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">地理风险</p>
                <p className="text-2xl font-bold text-success">低</p>
              </div>
              <Globe className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">交易对手</p>
                <p className="text-2xl font-bold text-success">低</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">交易模式</p>
                <p className="text-2xl font-bold text-success">正常</p>
              </div>
              <CreditCard className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">行为分析</p>
                <p className="text-2xl font-bold text-warning">注意</p>
              </div>
              <Activity className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AMLAssessment;