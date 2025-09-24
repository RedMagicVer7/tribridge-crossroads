import React from 'react';
import Header from "../components/Layout/Header";
import TransactionHistory from "../components/Transactions/TransactionHistory";

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