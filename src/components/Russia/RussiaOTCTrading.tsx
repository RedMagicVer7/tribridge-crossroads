import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Star, Clock, Shield, User, Building, TrendingUp } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from '../../contexts/TranslationContext';

interface RussiaOTCOrder {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  fiatAmount: number;
  cryptoAmount: number;
  price: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: any[];
  timeLimit: number;
  merchantRating: number;
  completedOrders: number;
  remarks?: string;
  trustLevel: string;
  businessType: 'individual' | 'company' | 'machinery_dealer';
  companyInfo?: {
    name: string;
    inn: string;
    phone: string;
  };
}

const RussiaOTCTrading: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [orderBook, setOrderBook] = useState<{ buy: RussiaOTCOrder[]; sell: RussiaOTCOrder[] }>({
    buy: [],
    sell: []
  });
  const [currentRate, setCurrentRate] = useState<number>(96.8);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrderBook();
  }, []);

  const loadOrderBook = async () => {
    try {
      setLoading(true);
      const mockData = {
        buy: [
          {
            id: 'RU-OTC-001',
            userId: 'rusmach_user',
            type: 'buy' as const,
            fiatAmount: 2000000,
            cryptoAmount: 20661.16,
            price: 96.8,
            minAmount: 100000,
            maxAmount: 2000000,
            paymentMethods: [{ id: 'sberbank', name: t('otc.sberbank') || 'Сбербанк', icon: '🏦' }],
            timeLimit: 30,
            merchantRating: 4.9,
            completedOrders: 850,
            remarks: t('otc.machinery_purchase_remark') || 'Покупка USDT для закупки оборудования в Китае. Работаю с эскроу.',
            trustLevel: 'verified',
            businessType: 'machinery_dealer' as const,
            companyInfo: {
              name: t('otc.rusmash_company') || 'ООО "РусМаш"',
              inn: '7707083893',
              phone: '+7 (495) 123-45-67'
            }
          }
        ],
        sell: [
          {
            id: 'RU-OTC-002',
            userId: 'crypto_trader_ru',
            type: 'sell' as const,
            fiatAmount: 5000000,
            cryptoAmount: 51652.89,
            price: 96.8,
            minAmount: 200000,
            maxAmount: 5000000,
            paymentMethods: [
              { id: 'sberbank', name: t('otc.sberbank') || 'Сбербанк', icon: '🏦' },
              { id: 'yoomoney', name: t('otc.yoomoney') || 'ЮMoney', icon: '💳' }
            ],
            timeLimit: 20,
            merchantRating: 4.7,
            completedOrders: 1250,
            remarks: t('otc.usdt_sale_remark') || 'Продажа USDT за рубли. Быстрая обработка, работаю 24/7.',
            trustLevel: 'premium',
            businessType: 'individual' as const
          }
        ]
      };
      setOrderBook(mockData);
    } catch (error) {
      toast({
        title: t('otc.error_loading'),
        description: t('otc.failed_to_load'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrustLevelBadge = (level: string) => {
    const variants = {
      verified: { variant: "default" as const, icon: <Shield className="w-3 h-3" />, text: t('otc.verified') },
      premium: { variant: "secondary" as const, icon: <Star className="w-3 h-3" />, text: t('otc.premium') },
      standard: { variant: "outline" as const, icon: null, text: t('otc.standard') }
    };
    
    const config = variants[level as keyof typeof variants] || variants.standard;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const getBusinessTypeBadge = (type: string) => {
    const config = {
      individual: { icon: <User className="w-3 h-3" />, text: t('otc.individual') },
      company: { icon: <Building className="w-3 h-3" />, text: t('otc.company') },
      machinery_dealer: { icon: <Building className="w-3 h-3" />, text: t('otc.machinery_dealer') }
    };

    const businessConfig = config[type as keyof typeof config] || config.individual;
    return (
      <Badge variant="outline" className="text-xs">
        {businessConfig.icon}
        {businessConfig.text}
      </Badge>
    );
  };

  const formatRubAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderOrderCard = (order: RussiaOTCOrder) => (
    <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-red-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">
              {order.type === 'buy' ? t('otc.buy_usdt') : t('otc.sell_usdt')}
            </div>
            {getTrustLevelBadge(order.trustLevel)}
            {getBusinessTypeBadge(order.businessType)}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-red-600">
              {order.price.toFixed(2)} ₽
            </div>
            <div className="text-xs text-muted-foreground">{t('otc.per_usdt')}</div>
          </div>
        </div>

        {order.companyInfo && (
          <div className="mb-3 p-2 bg-blue-50 rounded-md">
            <div className="text-xs font-medium text-blue-800">{order.companyInfo.name}</div>
            <div className="text-xs text-blue-600">{t('otc.inn')}: {order.companyInfo.inn}</div>
          </div>
        )}

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('otc.limits')}:</span>
            <span>{formatRubAmount(order.minAmount)} - {formatRubAmount(order.maxAmount)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{order.merchantRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({order.completedOrders}{t('otc.orders')})</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{order.timeLimit}{t('otc.minutes')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-green-600">
            <Shield className="w-3 h-3 mr-1" />
            {t('otc.escrow_enabled')}
          </div>
          <Button 
            className="w-auto"
            variant={order.type === 'buy' ? "default" : "secondary"}
          >
            {order.type === 'buy' ? t('otc.sell_to_merchant') : t('otc.buy_from_merchant')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Заголовок с российской символикой */}
      <Card className="border-t-4 border-t-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🇷🇺</span>
            <span>{t('otc.title')}</span>
          </CardTitle>
          <CardDescription>{t('otc.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-medium">{t('otc.current_rate')}:</span>
                <span className="text-xl font-bold text-red-600">{currentRate.toFixed(2)} ₽/USDT</span>
              </div>
            </div>
            <Button>{t('otc.create_ad')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Книга заказов */}
      <Tabs defaultValue="sell" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sell" className="text-green-600">{t('otc.buy_usdt')}</TabsTrigger>
          <TabsTrigger value="buy" className="text-red-600">{t('otc.sell_usdt')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sell" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">{t('otc.loading')}</div>
          ) : orderBook.sell.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orderBook.sell.map(renderOrderCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('otc.no_active_orders')}
            </div>
          )}
        </TabsContent>

        <TabsContent value="buy" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">{t('otc.loading')}</div>
          ) : orderBook.buy.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orderBook.buy.map(renderOrderCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('otc.no_active_orders')}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RussiaOTCTrading;