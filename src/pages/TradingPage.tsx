import React, { useState, useEffect } from 'react';
import Header from "../components/Layout/Header";
import BackButton from "../components/common/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useTranslation } from "../contexts/TranslationContext";
import { useToast } from "../hooks/use-toast";
import { tradingService, type ExchangeRate, type WalletBalance, type TradeOrder } from "../services/tradingService";
import { 
  ArrowLeftRight, 
  Wallet, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Calculator
} from "lucide-react";

const TradingPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [fromCurrency, setFromCurrency] = useState('RUB');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);

  // 获取汇率
  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true);
      try {
        const rate = await tradingService.getExchangeRate(fromCurrency, toCurrency);
        setExchangeRate(rate);
      } catch (error) {
        toast({
          title: "错误",
          description: "无法获取汇率信息",
          variant: "destructive"
        });
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, [fromCurrency, toCurrency, toast]);

  // 获取钱包余额和交易历史
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balances, history] = await Promise.all([
          tradingService.getWalletBalances('user-1'),
          tradingService.getTradeHistory('user-1')
        ]);
        setWalletBalances(balances);
        setTradeHistory(history);
      } catch (error) {
        toast({
          title: "错误",
          description: "无法加载账户信息",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [toast]);
  
  const handleTrade = async () => {
    if (!amount || !exchangeRate) {
      toast({
        title: "错误",
        description: "请输入交易金额",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseFloat(amount);
    const userBalance = walletBalances.find(b => b.currency === fromCurrency)?.balance || 0;
    
    // 验证交易
    const validation = tradingService.validateTrade(numAmount, fromCurrency, userBalance);
    if (!validation.isValid) {
      toast({
        title: "交易验证失败",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const toAmount = tradingService.calculateExchange(numAmount, fromCurrency, toCurrency, exchangeRate.rate);
      
      const order = await tradingService.createTradeOrder({
        fromCurrency,
        toCurrency,
        fromAmount: numAmount,
        toAmount,
        rate: exchangeRate.rate,
        userId: 'user-1'
      });

      toast({
        title: "交易已提交",
        description: `订单 ${order.id} 已创建，正在处理中...`,
      });

      // 重新加载交易历史
      const newHistory = await tradingService.getTradeHistory('user-1');
      setTradeHistory(newHistory);
      setAmount('');
    } catch (error) {
      toast({
        title: "交易失败",
        description: "无法处理交易请求，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateExchange = () => {
    if (!amount || !exchangeRate) return '0';
    const numAmount = parseFloat(amount);
    return tradingService.calculateExchange(numAmount, fromCurrency, toCurrency, exchangeRate.rate).toFixed(fromCurrency === 'RUB' ? 4 : 2);
  };

  const getBalance = (currency: string) => {
    const balance = walletBalances.find(b => b.currency === currency);
    return balance ? balance.balance.toFixed(2) : '0.00';
  };

  const getStatusBadge = (status: TradeOrder['status']) => {
    const statusMap = {
      pending: { variant: 'outline' as const, text: '待处理' },
      processing: { variant: 'secondary' as const, text: '处理中' },
      completed: { variant: 'default' as const, text: '完成' },
      failed: { variant: 'destructive' as const, text: '失败' }
    };
    
    const statusInfo = statusMap[status] || { variant: 'outline' as const, text: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8 space-y-8">
        <BackButton />
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            OTC 交易中心
          </h1>
          <p className="text-lg text-muted-foreground">
            安全、快速的卢布/USDT OTC 交易服务
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Trading Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5" />
                  OTC 交易
                </CardTitle>
                <CardDescription>
                  支持卢布与 USDT 之间的即时兑换
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Exchange Rate Display */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">当前汇率</span>
                    {ratesLoading ? (
                      <span className="text-sm text-muted-foreground">加载中...</span>
                    ) : exchangeRate ? (
                      <span className="text-lg font-bold">1 USDT = {exchangeRate.rate} RUB</span>
                    ) : (
                      <span className="text-sm text-destructive">获取汇率失败</span>
                    )}
                  </div>
                </div>

                {/* From Currency */}
                <div className="space-y-2">
                  <Label htmlFor="from-amount">支付</Label>
                  <div className="flex gap-2">
                    <Input
                      id="from-amount"
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

                {/* Exchange Arrow */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFromCurrency(toCurrency);
                      setToCurrency(fromCurrency);
                    }}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Currency */}
                <div className="space-y-2">
                  <Label htmlFor="to-amount">收到</Label>
                  <div className="flex gap-2">
                    <Input
                      id="to-amount"
                      type="text"
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

                {/* Trading Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleTrade}
                  disabled={!amount || loading || !exchangeRate}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {loading ? '处理中...' : '确认交易'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trading Info */}
          <div className="space-y-6">
            {/* Account Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  账户余额
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>USDT</span>
                  <span className="font-bold">{getBalance('USDT')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>RUB</span>
                  <span className="font-bold">{getBalance('RUB')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  最近交易
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tradeHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground">暂无交易记录</p>
                ) : (
                  tradeHistory.slice(0, 3).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {trade.fromAmount} {trade.fromCurrency} → {trade.toAmount.toFixed(trade.toCurrency === 'USDT' ? 4 : 2)} {trade.toCurrency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(trade.status)}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Market Status */}
            <Card>
              <CardHeader>
                <CardTitle>市场状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">交易对可用</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">流动性充足</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">平均成交时间: 2-5分钟</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TradingPage;