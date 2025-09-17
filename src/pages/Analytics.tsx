import Analytics from "../components/Analytics/Analytics";
import SiteNavigation from "../components/Layout/SiteNavigation";

const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteNavigation />
      
      <main className="container mx-auto py-8">
        <Analytics />
      </main>
    </div>
  );
};

export default AnalyticsPage;