import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Info, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CurrencyExchange = () => {
  const [fromAmount, setFromAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("RUB");
  const [toCurrency, setToCurrency] = useState("USD");

  const currencies = [
    { code: "RUB", name: "Russian Ruble", flag: "🇷🇺", color: "text-currency-rub" },
    { code: "RMB", name: "Chinese Yuan", flag: "🇨🇳", color: "text-currency-rmb" },
    { code: "USD", name: "US Dollar", flag: "🇺🇸", color: "text-currency-usd" }
  ];

  const exchangeRate = 0.011; // Example rate
  const toAmount = (parseFloat(fromAmount) * exchangeRate).toFixed(2);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-medium border-0">
      <CardHeader className="bg-gradient-subtle border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Currency Exchange</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Fast, secure cross-border payments via stablecoins
            </p>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <Zap className="w-3 h-3 mr-1" />
            Live Rates
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* From Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">From</label>
          <div className="flex space-x-3">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center space-x-2">
                      <span>{currency.flag}</span>
                      <span className={currency.color}>{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 text-lg font-semibold"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={swapCurrencies}
            className="rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">To</label>
          <div className="flex space-x-3">
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center space-x-2">
                      <span>{currency.flag}</span>
                      <span className={currency.color}>{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex-1 px-3 py-2 bg-muted rounded-md border text-lg font-semibold">
              {toAmount}
            </div>
          </div>
        </div>

        {/* Exchange Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="font-medium">1 {fromCurrency} = {exchangeRate} {toCurrency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee</span>
            <span className="font-medium text-success">0.2% (≈ $2.84)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Time</span>
            <span className="font-medium">&lt; 60 seconds</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1">
            Preview Transaction
          </Button>
          <Button className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity">
            Execute Exchange
          </Button>
        </div>

        {/* Security Note */}
        <div className="flex items-start space-x-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            All transactions are secured with multi-signature wallets and comply with KYC/AML regulations. 
            Funds are processed through regulated stablecoin bridges.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyExchange;