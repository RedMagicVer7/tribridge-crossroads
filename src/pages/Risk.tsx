import RiskMonitoring from "../components/Risk/RiskMonitoring";
import Header from "../components/Layout/Header";

const RiskPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8">
        <RiskMonitoring />
      </main>
    </div>
  );
};

export default RiskPage;