import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { ArrowUpDown, Info, Zap, CheckCircle, Clock, AlertTriangle, Copy, Loader2, Shield, XCircle, TrendingUp, BarChart3 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { useToast } from "../../hooks/use-toast";
import { exchangeRateService, type ExchangeRate } from "../../services/exchangeRateService";
import { transactionService, type Transaction, type TransactionPreview } from "../../services/transactionService";

const CurrencyExchange = () => {
  const { toast } = useToast();
  
  // State variables
  const [fromAmount, setFromAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("CNY");
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [preview, setPreview] = useState<TransactionPreview | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  
  // Dialog states
  const [showPreview, setShowPreview] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  
  // Loading states
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    rateUpdateTime: 0,
    previewGenerationTime: 0,
    transactionProcessingTime: 0
  });

  // Supported currencies with enhanced metadata
  const currencies = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸", color: "text-blue-600", crypto: false },
    { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", color: "text-red-600", crypto: false },
    { code: "RUB", name: "Russian Ruble", flag: "🇷🇺", color: "text-blue-700", crypto: false },
    { code: "USDT", name: "Tether USD", flag: "💎", color: "text-green-600", crypto: true },
    { code: "USDC", name: "USD Coin", flag: "🔵", color: "text-blue-500", crypto: true },
    { code: "ETH", name: "Ethereum", flag: "⟠", color: "text-purple-600", crypto: true }
  ];

  // Load exchange rate when currencies change
  useEffect(() => {
    loadExchangeRate();
  }, [fromCurrency, toCurrency]);

  // Auto-refresh rates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadExchangeRate();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fromCurrency, toCurrency]);

  // Load exchange rate
  const loadExchangeRate = async () => {
    if (fromCurrency === toCurrency) return;
    
    setIsLoadingRate(true);
    const startTime = Date.now();
    
    try {
      const rate = await exchangeRateService.getExchangeRate(fromCurrency, toCurrency);
      setExchangeRate(rate);
      
      const loadTime = Date.now() - startTime;
      setPerformanceMetrics(prev => ({ ...prev, rateUpdateTime: loadTime }));
      
      // Generate preview automatically if amount is valid
      if (parseFloat(fromAmount) > 0) {
        generatePreview();
      }
    } catch (error) {
      toast({
        title: "汇率加载失败",
        description: "无法获取最新汇率，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Generate transaction preview
  const generatePreview = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setPreview(null);
      return;
    }

    setIsLoadingPreview(true);
    const startTime = Date.now();
    
    try {
      const previewData = await transactionService.getTransactionPreview({
        fromCurrency,
        toCurrency,
        fromAmount: parseFloat(fromAmount),
        userId: 'demo-user'
      });
      
      setPreview(previewData);
      
      const previewTime = Date.now() - startTime;
      setPerformanceMetrics(prev => ({ ...prev, previewGenerationTime: previewTime }));
    } catch (error) {
      toast({
        title: "预览生成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Execute transaction
  const executeTransaction = async () => {
    if (!preview) return;
    
    setShowPreview(false);
    setShowExecution(true);
    setIsExecuting(true);
    
    const startTime = Date.now();
    
    try {
      const transaction = await transactionService.executeTransaction({
        fromCurrency,
        toCurrency,
        fromAmount: parseFloat(fromAmount),
        userId: 'demo-user'
      });
      
      setCurrentTransaction(transaction);
      
      toast({
        title: "交易已提交",
        description: `交易ID: ${transaction.id}`,
      });
      
      // Monitor transaction progress
      monitorTransactionProgress(transaction.id);
      
    } catch (error) {
      toast({
        title: "交易提交失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
      setShowExecution(false);
    } finally {
      setIsExecuting(false);
    }
  };

  // Monitor transaction progress
  const monitorTransactionProgress = (transactionId: string) => {
    const interval = setInterval(() => {
      const transaction = transactionService.getTransactionById(transactionId);
      
      if (transaction) {
        setCurrentTransaction(transaction);
        
        if (transaction.status === 'completed' || transaction.status === 'failed') {
          clearInterval(interval);
          
          const processingTime = transaction.processingTime;
          setPerformanceMetrics(prev => ({ 
            ...prev, 
            transactionProcessingTime: processingTime 
          }));
          
          if (transaction.status === 'completed') {
            toast({
              title: "交易完成",
              description: `交易 ${transaction.id} 已成功完成`,
            });
          } else {
            toast({
              title: "交易失败",
              description: transaction.notes || "交易处理失败",
              variant: "destructive"
            });
          }
        }
      }
    }, 1000);
  };

  // Format currency display
  const formatCurrency = (amount: number, currency: string): string => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      CNY: '¥',
      RUB: '₽',
      USDT: 'USDT',
      USDC: 'USDC',
      ETH: 'ETH'
    };
    
    return `${currencySymbols[currency] || ''}${amount.toLocaleString()}`;
  };

  // Swap currencies
  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Copy transaction ID
  const copyTransactionId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "已复制", description: "交易ID已复制到剪贴板" });
  };

  // Calculate estimated amounts
  const estimatedToAmount = preview ? preview.toAmount : 
    (exchangeRate && parseFloat(fromAmount) > 0 ? parseFloat(fromAmount) * exchangeRate.rate : 0);
  
  const estimatedFee = preview ? preview.fee : 0;

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-medium border-0">
        <CardHeader className="bg-gradient-subtle border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Currency Exchange
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Fast, secure cross-border payments via stablecoins
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <Zap className="w-3 h-3 mr-1" />
                {exchangeRate?.source === 'coingecko' ? 'Live' : 'Mock'} Rates
              </Badge>
              {isLoadingRate && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
          </div>
          
          {/* Performance Metrics */}
          {(performanceMetrics.rateUpdateTime > 0 || performanceMetrics.previewGenerationTime > 0) && (
            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
              {performanceMetrics.rateUpdateTime > 0 && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Rate: {performanceMetrics.rateUpdateTime}ms</span>
                </div>
              )}
              {performanceMetrics.previewGenerationTime > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Preview: {performanceMetrics.previewGenerationTime}ms</span>
                </div>
              )}
              {performanceMetrics.transactionProcessingTime > 0 && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Processing: {(performanceMetrics.transactionProcessingTime / 1000).toFixed(1)}s</span>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* From Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">From</label>
            <div className="flex space-x-3">
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center space-x-2">
                        <span>{currency.flag}</span>
                        <span className={currency.color}>{currency.code}</span>
                        {currency.crypto && <Badge variant="outline" className="text-xs">Crypto</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value);
                  // Auto-generate preview when amount changes
                  setTimeout(() => generatePreview(), 500);
                }}
                placeholder="Amount"
                className="flex-1 text-lg font-semibold"
                type="number"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Exchange Rate Display */}
          {exchangeRate && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    1 {fromCurrency} = {exchangeRate.rate.toFixed(6)} {toCurrency}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {exchangeRate.source}
                  </Badge>
                </div>
              </div>
              {exchangeRate.timestamp && (
                <div className="text-xs text-muted-foreground mt-1">
                  Updated: {new Date(exchangeRate.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapCurrencies}
              className="rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              disabled={isLoadingRate}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">To</label>
            <div className="flex space-x-3">
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center space-x-2">
                        <span>{currency.flag}</span>
                        <span className={currency.color}>{currency.code}</span>
                        {currency.crypto && <Badge variant="outline" className="text-xs">Crypto</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex-1 px-3 py-2 bg-muted rounded-md border text-lg font-semibold flex items-center justify-between">
                <span>
                  {isLoadingPreview ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    estimatedToAmount.toFixed(4)
                  )}
                </span>
                {preview && (
                  <Badge variant="outline" className="text-xs">
                    Est. {preview.processingTime}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Preview */}
          {preview && (
            <div className="bg-gradient-subtle rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transaction Preview</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  <Info className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You Send</span>
                  <span className="font-medium">{formatCurrency(preview.fromAmount, fromCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You Receive</span>
                  <span className="font-medium text-primary">{formatCurrency(preview.toAmount, toCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee ({(preview.feePercentage * 100).toFixed(2)}%)</span>
                  <span className="font-medium">{formatCurrency(preview.fee, fromCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-medium">1 {fromCurrency} = {preview.exchangeRate.toFixed(6)} {toCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Time</span>
                  <span className="font-medium text-success">{preview.processingTime}</span>
                </div>
                {preview.priceImpact > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span className="font-medium text-warning">{(preview.priceImpact * 100).toFixed(3)}%</span>
                  </div>
                )}
                {preview.estimatedGasFee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Gas Fee</span>
                    <span className="font-medium">${preview.estimatedGasFee.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowPreview(true)}
              className="flex-1"
              disabled={!preview || isLoadingPreview || parseFloat(fromAmount) <= 0}
            >
              <Info className="w-4 h-4 mr-2" />
              Preview Transaction
            </Button>
            
            <Button 
              onClick={executeTransaction}
              variant="outline"
              className="flex-1"
              disabled={!preview || isLoadingPreview || parseFloat(fromAmount) <= 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Execute Now
            </Button>
          </div>

          {/* Alerts and Info */}
          {preview && preview.priceImpact > 0.01 && (
            <Alert className="border-warning">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription>
                <strong>High Price Impact:</strong> This large transaction may have a {(preview.priceImpact * 100).toFixed(2)}% price impact.
              </AlertDescription>
            </Alert>
          )}

          {/* Security & Compliance */}
          <div className="bg-success/5 border border-success/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div className="text-xs text-success">
                <p className="font-medium">Security Verified</p>
                <p className="text-muted-foreground">KYC/AML compliant • Multi-sig wallet • Regulated bridge</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {preview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Preview</DialogTitle>
              <DialogDescription>
                Review your transaction details before execution
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">
                    {formatCurrency(preview.fromAmount, fromCurrency)} → {formatCurrency(preview.toAmount, toCurrency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rate: 1 {fromCurrency} = {preview.exchangeRate.toFixed(6)} {toCurrency}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Processing Fee</span>
                  <span>{formatCurrency(preview.fee, fromCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time</span>
                  <span className="text-success">{preview.processingTime}</span>
                </div>
                {preview.estimatedGasFee && (
                  <div className="flex justify-between">
                    <span>Gas Fee</span>
                    <span>${preview.estimatedGasFee.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
              <Button onClick={executeTransaction} disabled={isExecuting}>
                {isExecuting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Execute Exchange
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Execution Dialog */}
      {currentTransaction && (
        <Dialog open={showExecution} onOpenChange={setShowExecution}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {currentTransaction.status === 'completed' && <CheckCircle className="h-5 w-5 text-success mr-2" />}
                {currentTransaction.status === 'failed' && <XCircle className="h-5 w-5 text-destructive mr-2" />}
                {currentTransaction.status === 'processing' && <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />}
                Transaction {currentTransaction.status === 'completed' ? 'Completed' : 
                           currentTransaction.status === 'failed' ? 'Failed' : 'Processing'}
              </DialogTitle>
              <DialogDescription>
                Transaction ID: {currentTransaction.id}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyTransactionId(currentTransaction.id)}
                  className="ml-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {currentTransaction.performanceMetrics?.steps && (
                <div className="space-y-2">
                  {currentTransaction.performanceMetrics.steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {step.status === 'completed' && <CheckCircle className="h-3 w-3 text-success" />}
                      {step.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                      {step.status === 'pending' && <Clock className="h-3 w-3 text-muted-foreground" />}
                      <span className={step.status === 'completed' ? 'text-success' : ''}>{step.name}</span>
                      {step.status === 'completed' && (
                        <span className="text-xs text-muted-foreground">({step.duration}ms)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {currentTransaction.status === 'completed' && (
                <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">
                      Transaction completed successfully in {(currentTransaction.processingTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              )}
              
              {currentTransaction.status === 'failed' && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      {currentTransaction.notes || 'Transaction failed'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => setShowExecution(false)}
                disabled={currentTransaction.status === 'processing'}
              >
                {currentTransaction.status === 'processing' ? 'Processing...' : 'Close'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CurrencyExchange;