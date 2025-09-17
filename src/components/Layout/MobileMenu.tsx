/**
 * 移动端菜单组件
 * @author RedMagicVer7
 */

import React from 'react'
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { X, Home, Wallet, TrendingUp, Shield, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ isOpen, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname();
  
  const menuItems = [
    { href: "/", label: "首页", icon: Home },
    { href: "/wallet", label: "钱包", icon: Wallet },
    { href: "/transactions", label: "交易", icon: TrendingUp },
    { href: "/compliance", label: "合规", icon: Shield },
    { href: "/settings", label: "设置", icon: Settings },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>TriBridge</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => onOpenChange(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-4 mt-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600">
              <LogOut className="h-5 w-5 mr-3" />
              退出登录
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
