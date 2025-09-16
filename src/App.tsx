import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CompliancePage from "./pages/Compliance";
import WalletPage from "./pages/Wallet";
import AnalyticsPage from "./pages/Analytics";
import NotificationsPage from "./pages/Notifications";
import TransactionsPage from "./pages/Transactions";
import SettingsPage from "./pages/Settings";
import ProfilePage from "./pages/Profile";
import RiskPage from "./pages/Risk";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TranslationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/risk" element={<RiskPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TranslationProvider>
  </QueryClientProvider>
);

export default App;
