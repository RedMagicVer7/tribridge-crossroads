import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Globe,
  Save,
  Key,
  Smartphone,
  Mail,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import SiteNavigation from "../components/Layout/SiteNavigation";

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    timezone: string;
    language: string;
  };
  security: {
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    loginAlerts: boolean;
  };
  preferences: {
    theme: string;
    currency: string;
    notifications: boolean;
    autoLogout: string;
  };
}

const SettingsPage = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      firstName: "张",
      lastName: "三",
      email: "zhangsan@example.com",
      phone: "+86 138 0000 0000",
      timezone: "Asia/Shanghai",
      language: "zh-CN"
    },
    security: {
      twoFactorEnabled: true,
      emailNotifications: true,
      smsNotifications: false,
      loginAlerts: true
    },
    preferences: {
      theme: "system",
      currency: "USD",
      notifications: true,
      autoLogout: "30"
    }
  });

  const handleSave = () => {
    toast({
      title: "设置已保存",
      description: "您的设置已成功更新"
    });
  };

  const resetPassword = () => {
    toast({
      title: "重置密码邮件已发送",
      description: "请检查您的邮箱以重置密码"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteNavigation />
      
      <main className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">账户设置</h1>
          <p className="text-muted-foreground">管理您的账户信息和偏好设置</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
            <TabsTrigger value="profile" className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 h-12 md:h-10">
              <User className="h-4 w-4" />
              <span className="text-xs md:text-sm">个人资料</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 h-12 md:h-10">
              <Shield className="h-4 w-4" />
              <span className="text-xs md:text-sm">安全</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 h-12 md:h-10">
              <Bell className="h-4 w-4" />
              <span className="text-xs md:text-sm">通知</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 h-12 md:h-10">
              <Settings className="h-4 w-4" />
              <span className="text-xs md:text-sm">偏好</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  个人资料
                </CardTitle>
                <CardDescription>更新您的基本信息和个人详情</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">名字</Label>
                    <Input
                      id="firstName"
                      value={settings.profile.firstName}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, firstName: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">姓氏</Label>
                    <Input
                      id="lastName"
                      value={settings.profile.lastName}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, lastName: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">电话号码</Label>
                  <Input
                    id="phone"
                    value={settings.profile.phone}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">时区</Label>
                    <Select 
                      value={settings.profile.timezone}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, timezone: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Shanghai">中国标准时间 (UTC+8)</SelectItem>
                        <SelectItem value="Europe/Moscow">莫斯科时间 (UTC+3)</SelectItem>
                        <SelectItem value="America/New_York">东部时间 (UTC-5)</SelectItem>
                        <SelectItem value="UTC">协调世界时 (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">语言</Label>
                    <Select 
                      value={settings.profile.language}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, language: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-CN">简体中文</SelectItem>
                        <SelectItem value="en-US">English</SelectItem>
                        <SelectItem value="ru-RU">Русский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  保存更改
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>密码安全</CardTitle>
                  <CardDescription>管理您的登录密码</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入当前密码"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="请输入新密码"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="请再次输入新密码"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={handleSave}>更新密码</Button>
                    <Button variant="outline" onClick={resetPassword}>
                      忘记密码？
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>双重验证</CardTitle>
                  <CardDescription>增强您的账户安全性</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <p className="font-medium">短信验证</p>
                        <p className="text-sm text-muted-foreground">使用手机短信接收验证码</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactorEnabled: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5" />
                      <div>
                        <p className="font-medium">TOTP应用</p>
                        <p className="text-sm text-muted-foreground">使用Google Authenticator等应用</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">设置</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>安全提醒</CardTitle>
                  <CardDescription>管理安全通知设置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5" />
                      <div>
                        <p className="font-medium">邮件提醒</p>
                        <p className="text-sm text-muted-foreground">异常登录时发送邮件通知</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.security.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, emailNotifications: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <p className="font-medium">短信提醒</p>
                        <p className="text-sm text-muted-foreground">异常登录时发送短信通知</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.security.smsNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, smsNotifications: checked }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>通知设置</CardTitle>
                <CardDescription>控制您接收的通知类型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">交易通知</p>
                      <p className="text-sm text-muted-foreground">交易完成、失败等状态更新</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">安全通知</p>
                      <p className="text-sm text-muted-foreground">登录提醒、密码更改等安全相关通知</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">系统维护通知</p>
                      <p className="text-sm text-muted-foreground">系统更新和维护时间通知</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">营销信息</p>
                      <p className="text-sm text-muted-foreground">产品更新、优惠活动等营销信息</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">通知方式</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-4 w-4" />
                        <span>浏览器推送</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4" />
                        <span>邮件通知</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-4 w-4" />
                        <span>短信通知</span>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>系统偏好</CardTitle>
                <CardDescription>自定义您的使用体验</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">主题</Label>
                    <Select 
                      value={settings.preferences.theme}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, theme: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">浅色主题</SelectItem>
                        <SelectItem value="dark">深色主题</SelectItem>
                        <SelectItem value="system">跟随系统</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">默认货币</Label>
                    <Select 
                      value={settings.preferences.currency}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, currency: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">美元 (USD)</SelectItem>
                        <SelectItem value="RMB">人民币 (RMB)</SelectItem>
                        <SelectItem value="RUB">卢布 (RUB)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autoLogout">自动登出时间</Label>
                  <Select 
                    value={settings.preferences.autoLogout}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, autoLogout: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15分钟</SelectItem>
                      <SelectItem value="30">30分钟</SelectItem>
                      <SelectItem value="60">1小时</SelectItem>
                      <SelectItem value="never">永不</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">启用声音通知</p>
                    <p className="text-sm text-muted-foreground">交易完成时播放提示音</p>
                  </div>
                  <Switch 
                    checked={settings.preferences.notifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, notifications: checked }
                    }))}
                  />
                </div>
                
                <Button onClick={handleSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  保存偏好设置
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SettingsPage;