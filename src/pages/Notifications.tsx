import NotificationCenter from "../components/Notifications/NotificationCenter";
import Header from "../components/Layout/Header";

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto py-8">
        <NotificationCenter />
      </main>
    </div>
  );
};

export default NotificationsPage;