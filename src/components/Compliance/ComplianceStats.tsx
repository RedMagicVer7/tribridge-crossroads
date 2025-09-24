/**
 * 合规检查统计组件
 * 从ComplianceModule中提取的统计展示逻辑
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

import { formatNumber, formatPercentage } from '../../lib/utils';
import type { ComplianceCheck } from '../../lib/types';

interface ComplianceStatsProps {
  stats: {
    totalChecks: number;
    riskDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
  };
  recentChecks: ComplianceCheck[];
  loading?: boolean;
}

export const ComplianceStats: React.FC<ComplianceStatsProps> = ({
  stats,
  recentChecks,
  loading = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'requires_review':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const calculateRiskPercentage = (count: number) => {
    return stats.totalChecks > 0 ? (count / stats.totalChecks) * 100 : 0;
  };

  const getPassRate = () => {
    const approvedCount = stats.statusDistribution.approved || 0;
    return stats.totalChecks > 0 ? (approvedCount / stats.totalChecks) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 概览统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总检查数</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalChecks)}</div>
            <p className="text-xs text-muted-foreground">
              累计合规检查次数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">通过率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatPercentage(getPassRate() / 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              审核通过比例
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatNumber(stats.statusDistribution.pending || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              等待审核的检查
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">高风险</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatNumber((stats.riskDistribution.high || 0) + (stats.riskDistribution.critical || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              高风险及严重风险
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 风险分布 */}
      <Card>
        <CardHeader>
          <CardTitle>风险等级分布</CardTitle>
          <CardDescription>各风险等级的占比情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(stats.riskDistribution).map(([level, count]) => {
            const percentage = calculateRiskPercentage(count);
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getRiskLevelColor(level)}>
                      {level === 'low' && '低风险'}
                      {level === 'medium' && '中风险'}
                      {level === 'high' && '高风险'}
                      {level === 'critical' && '严重风险'}
                    </Badge>
                    <span className="text-sm font-medium">{formatNumber(count)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatPercentage(percentage / 100)}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 状态分布 */}
      <Card>
        <CardHeader>
          <CardTitle>审核状态分布</CardTitle>
          <CardDescription>各审核状态的统计情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(stats.statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status)}
                  <div>
                    <p className="font-medium">
                      {status === 'approved' && '已通过'}
                      {status === 'rejected' && '已拒绝'}
                      {status === 'pending' && '待处理'}
                      {status === 'requires_review' && '需要审核'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(count)} 个检查
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {formatPercentage((count / stats.totalChecks) || 0)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 最近检查 */}
      <Card>
        <CardHeader>
          <CardTitle>最近检查</CardTitle>
          <CardDescription>最新的合规检查记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentChecks.slice(0, 5).map((check) => (
              <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium text-sm">{check.checkType.toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(check.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getRiskLevelColor(check.result.riskLevel)}>
                    {check.result.riskLevel}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    评分: {check.result.score}/100
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};