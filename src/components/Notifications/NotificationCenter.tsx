import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Settings,
  Mail,
  MessageCircle,
  Shield,
  DollarSign,
  Activity,
  Trash2,
  Eye
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'security';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'transaction' | 'security' | 'system' | 'marketing';
  actions?: {
    label: string;
    action: () => void;
  }[];
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    transaction: boolean;
    security: boolean;
    system: boolean;
    marketing: boolean;
  };
}

const NotificationCenter = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    categories: {
      transaction: true,
      security: true,
      system: true,
      marketing: false
    }
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // 模拟加载通知
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: '交易完成',
        message: '您的交易 #TX789012 已成功完成，金额为 $1,500.00',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5分钟前
        isRead: false,
        category: 'transaction',
        actions: [
          { label: '查看详情', action: () => console.log('查看交易详情') }
        ]
      },
      {
        id: '2',
        type: 'security',
        title: '安全提醒',
        message: '检测到来自新设备的登录，IP地址：192.168.1.100',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30分钟前
        isRead: false,
        category: 'security',
        actions: [
          { label: '确认是我', action: () => console.log('确认登录') },
          { label: '不是我', action: () => console.log('报告异常') }
        ]
      },
      {
        id: '3',
        type: 'warning',
        title: 'KYC文档即将过期',
        message: '您的身份验证文档将在7天后过期，请及时更新',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1小时前
        isRead: true,
        category: 'security',
        actions: [
          { label: '立即更新', action: () => console.log('更新KYC') }
        ]
      },
      {
        id: '4',
        type: 'info',
        title: '系统维护通知',
        message: '系统将于明日凌晨2:00-4:00进行例行维护，期间服务可能中断',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2小时前
        isRead: true,
        category: 'system'
      },
      {
        id: '5',
        type: 'info',
        title: '新功能上线',
        message: '我们推出了新的多重签名钱包功能，提升您的资金安全',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1天前
        isRead: false,
        category: 'marketing',
        actions: [
          { label: '了解更多', action: () => console.log('查看新功能') }
        ]
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error': return <X className="h-5 w-5 text-destructive" />;
      case 'security': return <Shield className="h-5 w-5 text-destructive" />;
      case 'info': return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'transaction': return <DollarSign className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'system': return <Activity className="h-4 w-4" />;
      case 'marketing': return <Mail className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: false } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "通知已删除",
      description: "通知已从列表中移除"
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({
      title: "全部标记为已读",
      description: "所有通知已标记为已读"
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "通知已清空",
      description: "所有通知已清除"
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.category === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BellRing className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">通知中心</h1>
            <p className="text-muted-foreground">
              管理您的通知和消息设置 
              {unreadCount > 0 && (
                <Badge className="ml-2">{unreadCount} 条未读</Badge>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            全部已读
          </Button>
          <Button variant="outline" onClick={clearAllNotifications} disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            清空全部
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="unread">未读</TabsTrigger>
          <TabsTrigger value="transaction">交易</TabsTrigger>
          <TabsTrigger value="security">安全</TabsTrigger>
          <TabsTrigger value="system">系统</TabsTrigger>
          <TabsTrigger value="marketing">资讯</TabsTrigger>
        </TabsList>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 通知列表 */}
          <div className="lg:col-span-2 space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无通知</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'unread' ? '所有通知都已阅读' : '没有相关通知'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all hover:shadow-md ${
                    !notification.isRead ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryIcon(notification.category)}
                              <span className="ml-1">{notification.category}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        
                        {notification.actions && (
                          <div className="flex items-center space-x-2 pt-2">
                            {notification.actions.map((action, index) => (
                              <Button 
                                key={index}
                                variant="outline" 
                                size="sm"
                                onClick={action.action}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {notification.isRead ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsUnread(notification.id)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                标为未读
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                标为已读
                              </Button>
                            )}
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 通知设置 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  通知设置
                </CardTitle>
                <CardDescription>
                  自定义您的通知偏好
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 通知渠道 */}
                <div className="space-y-4">
                  <h4 className="font-medium">通知渠道</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>邮件通知</span>
                      </Label>
                      <Switch
                        id="email"
                        checked={settings.email}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, email: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push" className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>推送通知</span>
                      </Label>
                      <Switch
                        id="push"
                        checked={settings.push}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, push: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms" className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>短信通知</span>
                      </Label>
                      <Switch
                        id="sms"
                        checked={settings.sms}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, sms: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* 通知类别 */}
                <div className="space-y-4">
                  <h4 className="font-medium">通知类别</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="transaction" className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>交易通知</span>
                      </Label>
                      <Switch
                        id="transaction"
                        checked={settings.categories.transaction}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            categories: { ...prev.categories, transaction: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="security" className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>安全通知</span>
                      </Label>
                      <Switch
                        id="security"
                        checked={settings.categories.security}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            categories: { ...prev.categories, security: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="system" className="flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>系统通知</span>
                      </Label>
                      <Switch
                        id="system"
                        checked={settings.categories.system}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            categories: { ...prev.categories, system: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>营销资讯</span>
                      </Label>
                      <Switch
                        id="marketing"
                        checked={settings.categories.marketing}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            categories: { ...prev.categories, marketing: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => {
                  toast({
                    title: "设置已保存",
                    description: "通知设置已成功更新"
                  });
                }}>
                  保存设置
                </Button>
              </CardContent>
            </Card>

            {/* 快速统计 */}
            <Card>
              <CardHeader>
                <CardTitle>通知统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">未读通知</span>
                    <Badge>{unreadCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">总通知数</span>
                    <Badge variant="outline">{notifications.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">今日通知</span>
                    <Badge variant="outline">
                      {notifications.filter(n => {
                        const today = new Date();
                        const notifDate = new Date(n.timestamp);
                        return notifDate.toDateString() === today.toDateString();
                      }).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;