import Header from "../components/Layout/Header";
import StatsCards from "../components/Dashboard/StatsCards";
import CurrencyExchange from "../components/Exchange/CurrencyExchange";
import RecentTransactions from "../components/Dashboard/RecentTransactions";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TriBridge Payment System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seamless cross-border payments between RUB, RMB, and USD using advanced stablecoin technology. 
            Fast, secure, and compliant with global regulations.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CurrencyExchange />
          </div>
          <div className="lg:col-span-1">
            <RecentTransactions />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
