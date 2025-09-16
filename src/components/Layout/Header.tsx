import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, User, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TB</span>
            </div>
            <span className="font-bold text-xl">TriBridge</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-sm font-medium">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Exchange
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Transactions
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Analytics
            </Button>
          </nav>
        </div>

        {/* Status and User Actions */}
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
            System Operational
          </Badge>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;