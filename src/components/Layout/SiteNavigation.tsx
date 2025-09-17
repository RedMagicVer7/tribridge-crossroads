"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { 
  Home, 
  BarChart3, 
  Shield, 
  Bell, 
  User, 
  Settings,
  Menu
} from "lucide-react";
import { MobileMenu } from "./MobileMenu";

const SiteNavigation = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { name: "首页", path: "/", icon: Home },
    { name: "分析", path: "/analytics", icon: BarChart3 },
    { name: "合规", path: "/compliance", icon: Shield },
    { name: "通知", path: "/notifications", icon: Bell },
    { name: "个人资料", path: "/profile", icon: User },
    { name: "设置", path: "/settings", icon: Settings },
  ];

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TriBridge
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">打开菜单</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onOpenChange={setIsMobileMenuOpen} 
      />
    </header>
  );
};

export default SiteNavigation;