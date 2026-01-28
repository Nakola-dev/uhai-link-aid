import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/public/Index";
import Auth from "@/pages/public/Auth";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import Services from "@/pages/public/Services";
import Learn from "@/pages/public/Learn";
import UserDashboard from "@/pages/user/UserDashboard";
import UserProfilePage from "@/pages/user/UserProfilePage";
import UserQRPage from "@/pages/user/UserQRPage";
import UserLearn from "@/pages/user/UserLearn";
import AIAssistant from "@/pages/public/AIAssistant";
import BuyQRTag from "@/pages/public/BuyQRTag";
import UserSettings from "@/pages/user/UserSettings";
import PublicProfileView from "@/pages/public/PublicProfileView";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/public/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/services" element={<Services />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* User dashboard routes (primary) */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/profile" element={<UserProfilePage />} />
          <Route path="/dashboard/qr" element={<UserQRPage />} />
          <Route path="/dashboard/learn" element={<UserLearn />} />
          <Route path="/dashboard/assistant" element={<AIAssistant />} />
          <Route path="/dashboard/buy-qr" element={<BuyQRTag />} />
          <Route path="/dashboard/settings" element={<UserSettings />} />

          {/* Backwards-compatible aliases (old paths) */}
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/user/profile" element={<UserProfilePage />} />
          <Route path="/dashboard/user/qr" element={<UserQRPage />} />
          <Route path="/dashboard/user/learn" element={<UserLearn />} />
          <Route path="/dashboard/user/assistant" element={<AIAssistant />} />
          <Route path="/dashboard/user/buy-qr" element={<BuyQRTag />} />
          <Route path="/dashboard/user/settings" element={<UserSettings />} />

          {/* Admin routes: primary `/admin` and legacy `/dashboard/admin` */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/profile/:token" element={<PublicProfileView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
