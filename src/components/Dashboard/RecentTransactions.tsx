import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RecentTransactions = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  
  const allTransactions = [
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
    },
    {
      id: "TX005",
      type: "exchange",
      from: { currency: "USD", amount: "800", flag: "🇺🇸" },
      to: { currency: "RMB", amount: "5,760", flag: "🇨🇳" },
      status: "completed",
      timestamp: "25 minutes ago",
      fee: "$1.60"
    },
    {
      id: "TX006",
      type: "exchange",
      from: { currency: "RMB", amount: "15,000", flag: "🇨🇳" },
      to: { currency: "USD", amount: "2,083.33", flag: "🇺🇸" },
      status: "completed",
      timestamp: "32 minutes ago",
      fee: "$4.17"
    },
    {
      id: "TX007",
      type: "exchange",
      from: { currency: "RUB", amount: "75,000", flag: "🇷🇺" },
      to: { currency: "RMB", amount: "6,921", flag: "🇨🇳" },
      status: "processing",
      timestamp: "45 minutes ago",
      fee: "$1.85"
    },
    {
      id: "TX008",
      type: "exchange",
      from: { currency: "USD", amount: "2,500", flag: "🇺🇸" },
      to: { currency: "RUB", amount: "230,000", flag: "🇷🇺" },
      status: "completed",
      timestamp: "1 hour ago",
      fee: "$5.00"
    }
  ];

  const visibleTransactions = allTransactions.slice(0, visibleCount);
  const hasMoreTransactions = visibleCount < allTransactions.length;

  const loadMoreTransactions = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setVisibleCount(prev => Math.min(prev + 4, allTransactions.length));
    setIsLoading(false);
  };

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
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary-hover"
            onClick={() => navigate('/transactions')}
          >
            View All
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {visibleTransactions.map((transaction) => (
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
        
        {hasMoreTransactions && (
          <div className="p-4 border-t bg-muted/20">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={loadMoreTransactions}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Transactions'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;