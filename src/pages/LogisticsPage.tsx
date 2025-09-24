import React, { useState } from 'react';
import Header from "../components/Layout/Header";
import BackButton from "../components/common/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useTranslation } from "../contexts/TranslationContext";
import { useToast } from "../hooks/use-toast";
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Ship,
  Plane,
  Navigation,
  Search
} from "lucide-react";

interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
  icon: React.ReactNode;
}

const LogisticsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [trackingNumber, setTrackingNumber] = useState('TRI-RU-2024-001');
  const [selectedShipment, setSelectedShipment] = useState('TRI-RU-2024-001');

  const trackingEvents: TrackingEvent[] = [
    {
      id: '1',
      timestamp: '2024-01-20 14:30',
      location: '莫斯科物流中心',
      status: 'delivered',
      description: '货物已送达收货人',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    },
    {
      id: '2',
      timestamp: '2024-01-20 09:15',
      location: '莫斯科配送站',
      status: 'out_for_delivery',
      description: '货物派送中',
      icon: <Truck className="h-5 w-5 text-blue-500" />
    },
    {
      id: '3',
      timestamp: '2024-01-19 16:45',
      location: '莫斯科海关',
      status: 'customs_cleared',
      description: '海关清关完成',
      icon: <FileText className="h-5 w-5 text-purple-500" />
    },
    {
      id: '4',
      timestamp: '2024-01-18 11:20',
      location: '符拉迪沃斯托克港',
      status: 'arrived_port',
      description: '货物抵达目的港',
      icon: <Ship className="h-5 w-5 text-teal-500" />
    },
    {
      id: '5',
      timestamp: '2024-01-15 08:30',
      location: '上海港',
      status: 'departed',
      description: '货物离港',
      icon: <Ship className="h-5 w-5 text-orange-500" />
    },
    {
      id: '6',
      timestamp: '2024-01-10 10:00',
      location: '上海制造工厂',
      status: 'shipped',
      description: '货物已发出',
      icon: <Package className="h-5 w-5 text-green-500" />
    }
  ];

  const activeShipments = [
    {
      id: 'TRI-RU-2024-001',
      from: '上海',
      to: '莫斯科',
      status: 'delivered',
      value: '25,000 USDT',
      type: '重型挖掘设备',
      progress: 100
    },
    {
      id: 'TRI-RU-2024-002',
      from: '广州',
      to: '圣彼得堡',
      status: 'in_transit',
      value: '15,000 USDT',
      type: '矿业设备',
      progress: 65
    },
    {
      id: 'TRI-RU-2024-003',
      from: '深圳',
      to: '新西伯利亚',
      status: 'customs',
      value: '35,000 USDT',
      type: '能源设备',
      progress: 45
    }
  ];

  const handleTrack = () => {
    if (!trackingNumber) {
      toast({
        title: "错误",
        description: "请输入追踪单号",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedShipment(trackingNumber);
    toast({
      title: "追踪查询成功",
      description: `正在显示 ${trackingNumber} 的物流信息`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      delivered: { variant: 'default' as const, text: '已送达' },
      in_transit: { variant: 'secondary' as const, text: '运输中' },
      customs: { variant: 'outline' as const, text: '海关' },
      out_for_delivery: { variant: 'secondary' as const, text: '派送中' },
      shipped: { variant: 'outline' as const, text: '已发出' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { variant: 'outline' as const, text: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8 space-y-8">
        <BackButton />
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            物流追踪中心
          </h1>
          <p className="text-lg text-muted-foreground">
            实时货物追踪和物流状态管理
          </p>
        </div>

        {/* Tracking Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              物流追踪
            </CardTitle>
            <CardDescription>
              输入追踪单号查询货物状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="tracking-number">追踪单号</Label>
                <Input
                  id="tracking-number"
                  placeholder="输入追踪单号，如: TRI-RU-2024-001"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleTrack}>
                  <Search className="h-4 w-4 mr-2" />
                  查询
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  物流轨迹 - {selectedShipment}
                </CardTitle>
                <CardDescription>
                  货物运输的详细轨迹信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingEvents.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {event.icon}
                        {index < trackingEvents.length - 1 && (
                          <div className="w-px h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{event.description}</p>
                          <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Shipments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  活跃货运
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeShipments.map((shipment) => (
                  <div 
                    key={shipment.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedShipment === shipment.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedShipment(shipment.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{shipment.id}</span>
                      {getStatusBadge(shipment.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {shipment.from} → {shipment.to}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {shipment.type} • {shipment.value}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${shipment.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      进度: {shipment.progress}%
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Methods */}
            <Card>
              <CardHeader>
                <CardTitle>运输方式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                  <Ship className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">海运</p>
                    <p className="text-xs text-muted-foreground">主要运输方式</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <Truck className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">陆运</p>
                    <p className="text-xs text-muted-foreground">最后一公里配送</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded">
                  <Plane className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">空运</p>
                    <p className="text-xs text-muted-foreground">紧急货运</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Stats */}
            <Card>
              <CardHeader>
                <CardTitle>配送统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>在途货物</span>
                  <span className="font-medium">8 票</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>已送达</span>
                  <span className="font-medium">156 票</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>平均时效</span>
                  <span className="font-medium">12 天</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>签收率</span>
                  <span className="font-medium">98.5%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LogisticsPage;