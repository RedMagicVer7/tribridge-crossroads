import TransactionHistory from "@/components/Transactions/TransactionHistory";
import Header from "@/components/Layout/Header";

const TransactionsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8">
        <TransactionHistory />
      </main>
    </div>
  );
};

export default TransactionsPage;