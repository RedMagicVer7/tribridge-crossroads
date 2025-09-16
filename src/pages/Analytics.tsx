import Analytics from "../components/Analytics/Analytics";
import Header from "../components/Layout/Header";

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8">
        <Analytics />
      </main>
    </div>
  );
};

export default AnalyticsPage;