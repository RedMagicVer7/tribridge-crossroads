import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Star, Clock, Shield, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface OTCOrder {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  fiatCurrency: string;
  cryptoCurrency: string;
  fiatAmount: number;
  cryptoAmount: number;
  price: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  timeLimit: number;
  status: string;
  merchantRating: number;
  completedOrders: number;
  remarks?: string;
  trustLevel: string;
}

interface P2PTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  fiatAmount: number;
  cryptoAmount: number;
  price: number;
  paymentMethod: string;
  status: string;
  chatMessages: ChatMessage[];
  releaseCode?: string;
  startTime: string;
  expiryTime: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  type: string;
}

const OTCTrading: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<{ fiat: string; crypto: string }>({
    fiat: 'CNY',
    crypto: 'USDT'
  });
  const [orderBook, setOrderBook] = useState<{ buy: OTCOrder[]; sell: OTCOrder[] }>({
    buy: [],
    sell: []
  });
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OTCOrder | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<P2PTransaction | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 支持的货币对
  const currencies = {
    fiat: [
      { code: 'CNY', name: '人民币', flag: '🇨🇳' },
      { code: 'RUB', name: '俄罗斯卢布', flag: '🇷🇺' },
      { code: 'USD', name: '美元', flag: '🇺🇸' }
    ],
    crypto: [
      { code: 'USDT', name: 'Tether USD' },
      { code: 'USDC', name: 'USD Coin' }
    ]
  };

  // 支付方式
  const paymentMethods = {
    CNY: [
      { id: 'alipay', name: '支付宝', icon: '💰' },
      { id: 'wechat', name: '微信支付', icon: '💚' },
      { id: 'bank_transfer', name: '银行转账', icon: '🏦' }
    ],
    RUB: [
      { id: 'sberbank', name: 'Сбербанк', icon: '🏦' },
      { id: 'vtb', name: 'ВТБ', icon: '🏦' },
      { id: 'yoomoney', name: 'ЮMoney', icon: '💳' },
      { id: 'qiwi', name: 'QIWI', icon: '🔶' }
    ],
    USD: [
      { id: 'bank_transfer', name: 'Wire Transfer', icon: '🏦' },
      { id: 'paypal', name: 'PayPal', icon: '💙' }
    ]
  };

  useEffect(() => {
    loadOrderBook();
  }, [selectedCurrency]);

  const loadOrderBook = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      const mockData = {
        buy: [
          {
            id: 'OTC001',
            userId: 'user1',
            type: 'buy' as const,
            fiatCurrency: selectedCurrency.fiat,
            cryptoCurrency: selectedCurrency.crypto,
            fiatAmount: 10000,
            cryptoAmount: 1366.12,
            price: selectedCurrency.fiat === 'CNY' ? 7.32 : 96.8,
            minAmount: 500,
            maxAmount: 10000,
            paymentMethods: selectedCurrency.fiat === 'CNY' ? ['alipay', 'wechat'] : ['sberbank', 'yoomoney'],
            timeLimit: 15,
            status: 'active',
            merchantRating: 4.8,
            completedOrders: 1250,
            remarks: selectedCurrency.fiat === 'CNY' ? '秒放币，支持支付宝、微信' : 'Быстрая покупка USDT',
            trustLevel: 'verified'
          }
        ],
        sell: [
          {
            id: 'OTC002',
            userId: 'user2',
            type: 'sell' as const,
            fiatCurrency: selectedCurrency.fiat,
            cryptoCurrency: selectedCurrency.crypto,
            fiatAmount: 20000,
            cryptoAmount: 2732.24,
            price: selectedCurrency.fiat === 'CNY' ? 7.32 : 96.8,
            minAmount: 1000,
            maxAmount: 20000,
            paymentMethods: selectedCurrency.fiat === 'CNY' ? ['alipay', 'bank_transfer'] : ['sberbank', 'vtb'],
            timeLimit: 20,
            status: 'active',
            merchantRating: 4.9,
            completedOrders: 2100,
            remarks: selectedCurrency.fiat === 'CNY' ? '大额交易优先，实时放币' : 'Крупные сделки приветствуются',
            trustLevel: 'premium'
          }
        ]
      };
      setOrderBook(mockData);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载订单簿数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order: OTCOrder) => {
    setSelectedOrder(order);
    setShowTransaction(true);
  };

  const createTransaction = async (order: OTCOrder, amount: number, paymentMethod: string) => {
    try {
      // 模拟创建交易
      const transaction: P2PTransaction = {
        id: `TXN${Date.now()}`,
        orderId: order.id,
        buyerId: order.type === 'buy' ? order.userId : 'currentUser',
        sellerId: order.type === 'sell' ? order.userId : 'currentUser',
        fiatAmount: amount,
        cryptoAmount: amount / order.price,
        price: order.price,
        paymentMethod,
        status: 'pending',
        chatMessages: [
          {
            id: 'msg1',
            senderId: 'system',
            message: '交易已创建，请按照流程进行交易',
            timestamp: new Date().toISOString(),
            type: 'system'
          }
        ],
        releaseCode: 'ABC123',
        startTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + order.timeLimit * 60 * 1000).toISOString()
      };

      setCurrentTransaction(transaction);
      toast({
        title: "交易创建成功",
        description: "请按照交易流程完成支付",
      });
    } catch (error) {
      toast({
        title: "创建交易失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  const getTrustLevelBadge = (level: string) => {
    const variants = {
      verified: { variant: "default" as const, icon: <Shield className="w-3 h-3" />, text: "已认证" },
      premium: { variant: "secondary" as const, icon: <Star className="w-3 h-3" />, text: "高级" },
      standard: { variant: "outline" as const, icon: null, text: "标准" }
    };
    
    const config = variants[level as keyof typeof variants] || variants.standard;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "等待付款" },
      paid: { variant: "default" as const, text: "已付款" },
      released: { variant: "default" as const, text: "已放币" },
      completed: { variant: "default" as const, text: "已完成" },
      disputed: { variant: "destructive" as const, text: "争议中" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const renderOrderCard = (order: OTCOrder) => (
    <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">
              {order.type === 'buy' ? '收购' : '出售'} {order.cryptoCurrency}
            </div>
            {getTrustLevelBadge(order.trustLevel)}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              ¥{order.price.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">单价</div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">限额:</span>
            <span>¥{order.minAmount.toLocaleString()} - ¥{order.maxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">支付方式:</span>
            <div className="flex space-x-1">
              {order.paymentMethods.slice(0, 2).map(method => {
                const methodInfo = paymentMethods[order.fiatCurrency as keyof typeof paymentMethods]?.find(p => p.id === method);
                return methodInfo ? (
                  <span key={method} className="text-xs px-1 py-0.5 bg-muted rounded">
                    {methodInfo.icon} {methodInfo.name}
                  </span>
                ) : null;
              })}
              {order.paymentMethods.length > 2 && (
                <span className="text-xs text-muted-foreground">+{order.paymentMethods.length - 2}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{order.merchantRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({order.completedOrders}笔)</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{order.timeLimit}分钟</span>
          </div>
        </div>

        {order.remarks && (
          <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {order.remarks}
          </div>
        )}

        <Button 
          onClick={() => handleOrderClick(order)}
          className="w-full"
          variant={order.type === 'buy' ? "default" : "secondary"}
        >
          {order.type === 'buy' ? '出售给商家' : '从商家购买'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 头部选择器 */}
      <Card>
        <CardHeader>
          <CardTitle>OTC场外交易</CardTitle>
          <CardDescription>安全便捷的点对点加密货币交易</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="space-y-2">
              <Label>法币</Label>
              <Select 
                value={selectedCurrency.fiat} 
                onValueChange={(value) => setSelectedCurrency(prev => ({ ...prev, fiat: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.fiat.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>加密货币</Label>
              <Select 
                value={selectedCurrency.crypto} 
                onValueChange={(value) => setSelectedCurrency(prev => ({ ...prev, crypto: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.crypto.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setShowCreateOrder(true)}>
                发布广告
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订单簿 */}
      <Tabs defaultValue="sell" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sell">购买 {selectedCurrency.crypto}</TabsTrigger>
          <TabsTrigger value="buy">出售 {selectedCurrency.crypto}</TabsTrigger>
        </TabsList>

        <TabsContent value="sell" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : orderBook.sell.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orderBook.sell.map(renderOrderCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无出售订单
            </div>
          )}
        </TabsContent>

        <TabsContent value="buy" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : orderBook.buy.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orderBook.buy.map(renderOrderCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无收购订单
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 交易对话框 */}
      <Dialog open={showTransaction} onOpenChange={setShowTransaction}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>P2P交易</DialogTitle>
            <DialogDescription>
              {selectedOrder && `与商家进行 ${selectedOrder.cryptoCurrency} 交易`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && !currentTransaction && (
            <TransactionForm 
              order={selectedOrder} 
              onCreateTransaction={createTransaction}
              paymentMethods={paymentMethods[selectedOrder.fiatCurrency as keyof typeof paymentMethods] || []}
            />
          )}

          {currentTransaction && (
            <TransactionChat 
              transaction={currentTransaction}
              onSendMessage={setNewMessage}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 交易表单组件
const TransactionForm: React.FC<{
  order: OTCOrder;
  onCreateTransaction: (order: OTCOrder, amount: number, paymentMethod: string) => void;
  paymentMethods: Array<{ id: string; name: string; icon: string }>;
}> = ({ order, onCreateTransaction, paymentMethods }) => {
  const [amount, setAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount >= order.minAmount && numAmount <= order.maxAmount && selectedPayment) {
      onCreateTransaction(order, numAmount, selectedPayment);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">订单信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>价格:</span>
              <span className="font-medium">¥{order.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>限额:</span>
              <span>¥{order.minAmount.toLocaleString()} - ¥{order.maxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>时限:</span>
              <span>{order.timeLimit}分钟</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">交易详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>交易金额 ({order.fiatCurrency})</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`最小 ${order.minAmount}`}
                min={order.minAmount}
                max={order.maxAmount}
              />
              {amount && (
                <div className="text-sm text-muted-foreground mt-1">
                  将获得: {(parseFloat(amount) / order.price).toFixed(6)} {order.cryptoCurrency}
                </div>
              )}
            </div>

            <div>
              <Label>支付方式</Label>
              <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                <SelectTrigger>
                  <SelectValue placeholder="选择支付方式" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.icon} {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button type="submit" className="w-full" disabled={!amount || !selectedPayment}>
        创建交易
      </Button>
    </form>
  );
};

// 交易聊天组件
const TransactionChat: React.FC<{
  transaction: P2PTransaction;
  onSendMessage: (message: string) => void;
}> = ({ transaction, onSendMessage }) => {
  const [message, setMessage] = useState('');
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
      case 'paid': return <CheckCircle className="h-4 w-4 text-warning" />;
      case 'released': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
      paid: 'secondary',
      released: 'default'
    } as const;
    
    const labels = {
      completed: '已完成',
      pending: '处理中',
      failed: '失败',
      cancelled: '已取消',
      paid: '已付款',
      released: '已放币'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="flex items-center space-x-1">
        {getStatusIcon(status)}
        <span>{labels[status as keyof typeof labels] || status}</span>
      </Badge>
    );
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="space-y-4">
      {/* 交易状态 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">交易 #{transaction.id}</h3>
              <p className="text-sm text-muted-foreground">
                ¥{transaction.fiatAmount.toLocaleString()} → {transaction.cryptoAmount.toFixed(6)} {transaction.price > 10 ? 'USDT' : 'BTC'}
              </p>
            </div>
            {getStatusBadge(transaction.status)}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={`p-3 rounded-lg ${transaction.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
              <div className="text-sm font-medium">1. 确认订单</div>
              <CheckCircle className="w-4 h-4 mx-auto mt-1" />
            </div>
            <div className={`p-3 rounded-lg ${transaction.status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
              <div className="text-sm font-medium">2. 付款确认</div>
              <Clock className="w-4 h-4 mx-auto mt-1" />
            </div>
            <div className={`p-3 rounded-lg ${transaction.status === 'released' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
              <div className="text-sm font-medium">3. 放币完成</div>
              <Shield className="w-4 h-4 mx-auto mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 聊天区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            交易沟通
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {transaction.chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === 'currentUser' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.type === 'system' 
                    ? 'bg-muted text-muted-foreground text-center' 
                    : msg.senderId === 'currentUser'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="输入消息..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>发送</Button>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex space-x-2">
        {transaction.status === 'pending' && (
          <Button className="flex-1">
            确认付款
          </Button>
        )}
        {transaction.status === 'paid' && transaction.sellerId === 'currentUser' && (
          <Button className="flex-1">
            放币 (释放码: {transaction.releaseCode})
          </Button>
        )}
        <Button variant="outline" className="flex-1">
          <AlertTriangle className="w-4 h-4 mr-2" />
          申请仲裁
        </Button>
      </div>
    </div>
  );
};

export default OTCTrading;