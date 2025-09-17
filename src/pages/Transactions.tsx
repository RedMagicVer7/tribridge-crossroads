import TransactionHistory from "../components/Transactions/TransactionHistory";
import SiteNavigation from "../components/Layout/SiteNavigation";

const TransactionsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteNavigation />
      
      <main className="container mx-auto py-8">
        <TransactionHistory />
      </main>
    </div>
  );
};

export default TransactionsPage;