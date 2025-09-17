import SiteNavigation from "../components/Layout/SiteNavigation";
import NotificationCenter from "../components/Notifications/NotificationCenter";

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteNavigation />
      
      <main className="container mx-auto py-8">
        <NotificationCenter />
      </main>
    </div>
  );
};

export default NotificationsPage;