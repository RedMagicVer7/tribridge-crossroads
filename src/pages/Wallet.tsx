import WalletManagement from "@/components/Wallet/WalletManagement";
import Header from "@/components/Layout/Header";

const WalletPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8">
        <WalletManagement />
      </main>
    </div>
  );
};

export default WalletPage;