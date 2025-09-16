import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";

const RecentTransactions = () => {
  const transactions = [
    {
      id: "TX001",
      type: "exchange",
      from: { currency: "RUB", amount: "50,000", flag: "🇷🇺" },
      to: { currency: "USD", amount: "543.21", flag: "🇺🇸" },
      status: "completed",
      timestamp: "2 minutes ago",
      fee: "$1.08"
    },
    {
      id: "TX002", 
      type: "exchange",
      from: { currency: "USD", amount: "1,200", flag: "🇺🇸" },
      to: { currency: "RMB", amount: "8,640", flag: "🇨🇳" },
      status: "processing",
      timestamp: "5 minutes ago",
      fee: "$2.40"
    },
    {
      id: "TX003",
      type: "exchange", 
      from: { currency: "RMB", amount: "10,000", flag: "🇨🇳" },
      to: { currency: "RUB", amount: "138,500", flag: "🇷🇺" },
      status: "completed",
      timestamp: "12 minutes ago",
      fee: "$2.88"
    },
    {
      id: "TX004",
      type: "exchange",
      from: { currency: "RUB", amount: "25,000", flag: "🇷🇺" },
      to: { currency: "USD", amount: "271.60", flag: "🇺🇸" },
      status: "failed",
      timestamp: "18 minutes ago",
      fee: "$0.00"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "processing":
        return <Clock className="h-4 w-4 text-warning" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-success/10 text-success border-success/20",
      processing: "bg-warning/10 text-warning border-warning/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20"
    };
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <Card className="shadow-soft border-0">
      <CardHeader className="bg-gradient-subtle border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
            View All
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">{transaction.from.flag}</div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl">{transaction.to.flag}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-sm">
                      {transaction.from.amount} {transaction.from.currency} → {transaction.to.amount} {transaction.to.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.id} • {transaction.timestamp}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">Fee: {transaction.fee}</div>
                    <div className="text-xs text-muted-foreground">Network: USDT</div>
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t bg-muted/20">
          <Button variant="outline" className="w-full">
            Load More Transactions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;