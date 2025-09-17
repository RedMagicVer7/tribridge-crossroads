import WalletManagement from "../components/Wallet/WalletManagement";
import SiteNavigation from "../components/Layout/SiteNavigation";

const WalletPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteNavigation />
      
      <main className="container mx-auto py-8">
        <WalletManagement />
      </main>
    </div>
  );
};

export default WalletPage;