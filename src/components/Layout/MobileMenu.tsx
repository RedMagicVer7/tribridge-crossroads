/**
 * 移动端菜单组件
 * @author RedMagicVer7
 */

import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { 
  Menu, 
  Home, 
  CreditCard, 
  BarChart, 
  Wallet, 
  Shield, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  HelpCircle
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

interface MobileMenuProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileMenu({ isOpen, onOpenChange }: MobileMenuProps) {
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  const userInfo = {
    name: "张三",
    email: "zhangsan@example.com",
    avatar: "ZS"
  }

  const menuItems = [
    { icon: Home, label: "仪表板", path: "/" },
    { icon: CreditCard, label: "交易记录", path: "/transactions" },
    { icon: BarChart, label: "数据分析", path: "/analytics" },
    { icon: Wallet, label: "钱包管理", path: "/wallet" },
    { icon: Shield, label: "合规中心", path: "/compliance" },
    { icon: Bell, label: "通知中心", path: "/notifications" },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={userInfo.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInfo.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <SheetTitle className="text-base">{userInfo.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{userInfo.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <div className="w-2 h-2 rounded-full bg-success mr-1"></div>
                在线
              </Badge>
              <Badge className="bg-green-500 text-white">已认证</Badge>
            </div>
          </SheetHeader>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start gap-3 h-12"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          <Separator />

          {/* Footer Actions */}
          <div className="p-4 space-y-2">
            <Link to="/profile" onClick={() => onOpenChange(false)}>
              <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                <User className="h-5 w-5" />
                <span>个人资料</span>
              </Button>
            </Link>
            
            <Link to="/settings" onClick={() => onOpenChange(false)}>
              <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                <Settings className="h-5 w-5" />
                <span>设置</span>
              </Button>
            </Link>
            
            <Button variant="ghost" className="w-full justify-start gap-3 h-12">
              <HelpCircle className="h-5 w-5" />
              <span>帮助支持</span>
            </Button>
            
            <Separator className="my-2" />
            
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-600 hover:bg-red-50">
              <LogOut className="h-5 w-5" />
              <span>退出登录</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}