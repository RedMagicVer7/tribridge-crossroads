import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletInfo {
  id: string;
  name: string;
  type: 'metamask' | 'trust' | 'ledger' | 'trezor' | 'coinbase';
  address: string;
  balance: {
    usdt: number;
    usdc: number;
    eth: number;
  };
  status: 'connected' | 'disconnected' | 'pending';
  lastUsed: string;
  isDefault: boolean;
}

const WalletManagement = () => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAddresses, setShowAddresses] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // 模拟加载已连接的钱包
    const mockWallets: WalletInfo[] = [
      {
        id: '1',
        name: 'MetaMask 主钱包',
        type: 'metamask',
        address: '0x742d35Cc6B...9Bc168E',
        balance: { usdt: 1500.50, usdc: 2300.75, eth: 0.85 },
        status: 'connected',
        lastUsed: new Date(Date.now() - 3600000).toISOString(),
        isDefault: true
      },
      {
        id: '2',
        name: 'Ledger 硬件钱包',
        type: 'ledger',
        address: '0x8f3CF7ad...51CB2cc8',
        balance: { usdt: 5000.00, usdc: 0, eth: 2.15 },
        status: 'connected',
        lastUsed: new Date(Date.now() - 86400000).toISOString(),
        isDefault: false
      }
    ];
    setWallets(mockWallets);
  }, []);

  const getWalletIcon = (type: WalletInfo['type']) => {
    // 在实际项目中，这里会返回对应的钱包图标
    return <Wallet className="h-6 w-6" />;
  };

  const getStatusBadge = (status: WalletInfo['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />已连接</Badge>;
      case 'disconnected':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />未连接</Badge>;
      case 'pending':
        return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />连接中</Badge>;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制",
      description: "地址已复制到剪贴板"
    });
  };

  const connectWallet = async (type: WalletInfo['type']) => {
    setIsConnecting(true);
    
    // 模拟钱包连接过程
    setTimeout(() => {
      const newWallet: WalletInfo = {
        id: Date.now().toString(),
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} 钱包`,
        type,
        address: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        balance: { usdt: 0, usdc: 0, eth: 0 },
        status: 'connected',
        lastUsed: new Date().toISOString(),
        isDefault: false
      };
      
      setWallets(prev => [...prev, newWallet]);
      setIsConnecting(false);
      
      toast({
        title: "钱包连接成功",
        description: `${newWallet.name} 已成功连接`
      });
    }, 2000);
  };

  const disconnectWallet = (walletId: string) => {
    setWallets(prev => prev.filter(w => w.id !== walletId));
    toast({
      title: "钱包已断开",
      description: "钱包连接已断开"
    });
  };

  const setDefaultWallet = (walletId: string) => {
    setWallets(prev => prev.map(w => ({
      ...w,
      isDefault: w.id === walletId
    })));
    toast({
      title: "默认钱包已设置",
      description: "该钱包已设为默认钱包"
    });
  };

  const refreshBalance = async (walletId: string) => {
    // 模拟刷新余额
    const randomBalance = () => Math.random() * 1000;
    
    setWallets(prev => prev.map(w => 
      w.id === walletId 
        ? {
            ...w,
            balance: {
              usdt: randomBalance(),
              usdc: randomBalance(),
              eth: Math.random() * 5
            }
          }
        : w
    ));
    
    toast({
      title: "余额已更新",
      description: "钱包余额已刷新"
    });
  };

  const toggleAddressVisibility = (walletId: string) => {
    setShowAddresses(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">钱包管理</h1>
          <p className="text-muted-foreground">管理您的数字钱包和查看余额</p>
        </div>
        <Button onClick={() => {}} disabled={isConnecting}>
          <Plus className="h-4 w-4 mr-2" />
          {isConnecting ? '连接中...' : '连接新钱包'}
        </Button>
      </div>

      {/* 连接新钱包 */}
      <Card>
        <CardHeader>
          <CardTitle>连接钱包</CardTitle>
          <CardDescription>选择要连接的钱包类型</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'metamask' as const, name: 'MetaMask', popular: true },
              { type: 'trust' as const, name: 'Trust Wallet', popular: false },
              { type: 'ledger' as const, name: 'Ledger', popular: false },
              { type: 'coinbase' as const, name: 'Coinbase Wallet', popular: false }
            ].map((wallet) => (
              <Card 
                key={wallet.type} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                onClick={() => connectWallet(wallet.type)}
              >
                <CardContent className="p-4 text-center">
                  {getWalletIcon(wallet.type)}
                  <h3 className="font-medium mt-2">{wallet.name}</h3>
                  {wallet.popular && (
                    <Badge variant="secondary" className="mt-1 text-xs">推荐</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 已连接的钱包 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">已连接的钱包</h2>
        
        {wallets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无连接的钱包</h3>
              <p className="text-muted-foreground">连接您的第一个钱包开始使用TriBridge</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className={`transition-all ${wallet.isDefault ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getWalletIcon(wallet.type)}
                      <div>
                        <CardTitle className="text-lg">{wallet.name}</CardTitle>
                        <CardDescription>
                          最后使用: {new Date(wallet.lastUsed).toLocaleString('zh-CN')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {wallet.isDefault && (
                        <Badge className="bg-primary">默认</Badge>
                      )}
                      {getStatusBadge(wallet.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 钱包地址 */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">
                        {showAddresses[wallet.id] ? wallet.address : formatAddress(wallet.address)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAddressVisibility(wallet.id)}
                      >
                        {showAddresses[wallet.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallet.address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 余额显示 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">余额</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => refreshBalance(wallet.id)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium">{wallet.balance.usdt.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">USDT</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium">{wallet.balance.usdc.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">USDC</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium">{wallet.balance.eth.toFixed(4)}</div>
                        <div className="text-xs text-muted-foreground">ETH</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    {!wallet.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDefaultWallet(wallet.id)}
                      >
                        设为默认
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => disconnectWallet(wallet.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      断开连接
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 安全提示 */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>安全提示:</strong> 
          请确保只在可信设备上连接钱包，不要在公共网络或设备上进行操作。TriBridge不会存储您的私钥信息。
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default WalletManagement;