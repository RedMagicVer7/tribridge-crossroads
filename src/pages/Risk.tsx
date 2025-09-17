import RiskMonitoring from "../components/Risk/RiskMonitoring";
import SiteNavigation from "../components/Layout/SiteNavigation";

const RiskPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteNavigation />
      
      <main className="container mx-auto py-8">
        <RiskMonitoring />
      </main>
    </div>
  );
};

export default RiskPage;