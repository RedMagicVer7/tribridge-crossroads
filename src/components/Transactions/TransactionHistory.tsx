import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface Transaction {
  id: string;
  type: 'exchange' | 'transfer' | 'deposit' | 'withdraw';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  fee: number;
  timestamp: string;
  processingTime: number; // in seconds
  blockchainTxId?: string;
  counterparty?: string;
  notes?: string;
}

const TransactionHistory = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟加载交易历史
    const loadTransactions = () => {
      setTimeout(() => {
        const mockTransactions: Transaction[] = [
          {
            id: "TX789012",
            type: "exchange",
            status: "completed",
            fromCurrency: "USD",
            toCurrency: "RMB",
            fromAmount: 1500.00,
            toAmount: 10950.00,
            exchangeRate: 7.30,
            fee: 3.00,
            timestamp: new Date(Date.now() - 300000).toISOString(),
            processingTime: 45,
            blockchainTxId: "0x8f3cf7ad51cb2cc8df4a...",
            counterparty: "Bank of China"
          },
          {
            id: "TX789011",
            type: "exchange",
            status: "pending",
            fromCurrency: "RUB",
            toCurrency: "USD",
            fromAmount: 50000.00,
            toAmount: 520.00,
            exchangeRate: 0.0104,
            fee: 10.00,
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            processingTime: 0,
            notes: "Waiting for compliance verification"
          },
          {
            id: "TX789010",
            type: "transfer",
            status: "completed",
            fromCurrency: "USDT",
            toCurrency: "USDT",
            fromAmount: 2000.00,
            toAmount: 2000.00,
            exchangeRate: 1.00,
            fee: 1.00,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            processingTime: 30,
            blockchainTxId: "0x742d35cc6bf326...9bc168e",
            counterparty: "0x8f3C...Cc8"
          },
          {
            id: "TX789009",
            type: "exchange",
            status: "failed",
            fromCurrency: "RMB",
            toCurrency: "USD",
            fromAmount: 5000.00,
            toAmount: 0,
            exchangeRate: 0.137,
            fee: 0,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            processingTime: 0,
            notes: "Insufficient liquidity"
          },
          {
            id: "TX789008",
            type: "deposit",
            status: "completed",
            fromCurrency: "USD",
            toCurrency: "USD",
            fromAmount: 10000.00,
            toAmount: 10000.00,
            exchangeRate: 1.00,
            fee: 0,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            processingTime: 120,
            blockchainTxId: "0x1a2b3c4d5e6f...",
            counterparty: "JPMorgan Chase"
          }
        ];
        
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        setIsLoading(false);
      }, 1000);
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.fromCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.toCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.counterparty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (statusFilter !== "all") {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // 类型过滤
    if (typeFilter !== "all") {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline'
    } as const;
    
    const labels = {
      completed: '已完成',
      pending: '处理中',
      failed: '失败',
      cancelled: '已取消'
    };

    return (
      <Badge variant={variants[status]} className="flex items-center space-x-1">
        {getStatusIcon(status)}
        <span>{labels[status]}</span>
      </Badge>
    );
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'exchange': return <RefreshCw className="h-4 w-4" />;
      case 'transfer': return <ArrowUpRight className="h-4 w-4" />;
      case 'deposit': return <ArrowDownLeft className="h-4 w-4" />;
      case 'withdraw': return <ArrowUpRight className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    const labels = {
      exchange: '兑换',
      transfer: '转账',
      deposit: '存入',
      withdraw: '提取'
    };
    return labels[type];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制",
      description: "内容已复制到剪贴板"
    });
  };

  const exportTransactions = () => {
    // 模拟导出功能
    toast({
      title: "导出完成",
      description: "交易记录已导出为CSV文件"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">交易历史</h1>
          <div className="flex space-x-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">交易历史</h1>
          <p className="text-muted-foreground">查看和管理您的所有交易记录</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 过滤和搜索 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="搜索交易ID、货币或交易对手..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="pending">处理中</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="exchange">兑换</SelectItem>
                <SelectItem value="transfer">转账</SelectItem>
                <SelectItem value="deposit">存入</SelectItem>
                <SelectItem value="withdraw">提取</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 交易统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{transactions.length}</div>
              <div className="text-sm text-muted-foreground">总交易数</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {transactions.filter(tx => tx.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">成功交易</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {transactions.filter(tx => tx.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">处理中</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${transactions
                  .filter(tx => tx.status === 'completed')
                  .reduce((sum, tx) => sum + tx.fromAmount, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">总交易量</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 交易列表 */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无交易记录</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                  ? "没有匹配的交易记录，请调整搜索条件" 
                  : "您还没有进行任何交易"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{transaction.id}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(transaction.id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getTypeLabel(transaction.type)} • {formatTimestamp(transaction.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {getStatusBadge(transaction.status)}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">发送</p>
                    <p className="font-medium">
                      {transaction.fromAmount.toLocaleString()} {transaction.fromCurrency}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">接收</p>
                    <p className="font-medium">
                      {transaction.toAmount.toLocaleString()} {transaction.toCurrency}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">汇率</p>
                    <p className="font-medium">
                      1 {transaction.fromCurrency} = {transaction.exchangeRate} {transaction.toCurrency}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">手续费</p>
                    <p className="font-medium">
                      {transaction.fee.toFixed(2)} {transaction.fromCurrency}
                    </p>
                  </div>
                </div>

                {(transaction.processingTime > 0 || transaction.blockchainTxId || transaction.counterparty || transaction.notes) && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid gap-4 md:grid-cols-2">
                      {transaction.processingTime > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">处理时间</p>
                          <p className="text-sm">{transaction.processingTime}秒</p>
                        </div>
                      )}
                      
                      {transaction.blockchainTxId && (
                        <div>
                          <p className="text-sm text-muted-foreground">区块链交易ID</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-mono">{transaction.blockchainTxId.substring(0, 16)}...</p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyToClipboard(transaction.blockchainTxId!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {transaction.counterparty && (
                        <div>
                          <p className="text-sm text-muted-foreground">交易对手</p>
                          <p className="text-sm">{transaction.counterparty}</p>
                        </div>
                      )}
                      
                      {transaction.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground">备注</p>
                          <p className="text-sm">{transaction.notes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;