import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings, User, Menu, LogOut, UserCircle, CreditCard, HelpCircle, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { MobileMenu } from "./MobileMenu";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const userInfo = {
    name: "张三",
    email: "zhangsan@example.com",
    avatar: "ZS"
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TB</span>
            </div>
            <span className="font-bold text-xl">TriBridge</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/">
              <Button variant={isActive('/') ? 'default' : 'ghost'} className="text-sm font-medium">
                Dashboard
              </Button>
            </Link>
            <Link to="/transactions">
              <Button variant={isActive('/transactions') ? 'default' : 'ghost'} className="text-sm font-medium">
                Transactions
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant={isActive('/analytics') ? 'default' : 'ghost'} className="text-sm font-medium">
                Analytics
              </Button>
            </Link>
            <Link to="/wallet">
              <Button variant={isActive('/wallet') ? 'default' : 'ghost'} className="text-sm font-medium">
                Wallet
              </Button>
            </Link>
            <Link to="/compliance">
              <Button variant={isActive('/compliance') ? 'default' : 'ghost'} className="text-sm font-medium">
                Compliance
              </Button>
            </Link>
          </nav>
        </div>

        {/* Status and User Actions */}
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="hidden sm:flex bg-success/10 text-success border-success/20">
            <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
            System Operational
          </Badge>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>通知中心</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">交易完成</p>
                  <p className="text-xs text-muted-foreground">您的USDC转账已成功完成</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">KYC审核通过</p>
                  <p className="text-xs text-muted-foreground">您的身份验证已通过审核</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="w-full text-center">
                  查看所有通知
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={userInfo.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userInfo.avatar}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userInfo.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userInfo.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  个人资料
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/wallet" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  钱包管理
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                帮助支持
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu Toggle */}
          <MobileMenu isOpen={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} />
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;