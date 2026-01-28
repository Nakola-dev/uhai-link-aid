import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/public/Index";
import Auth from "@/pages/public/Auth";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import Services from "@/pages/public/Services";
import Learn from "@/pages/public/Learn";
import Onboarding from "@/pages/public/Onboarding";
import UserDashboard from "@/pages/user/UserDashboard";
import UserProfilePage from "@/pages/user/UserProfilePage";
import UserQRPage from "@/pages/user/UserQRPage";
import UserLearn from "@/pages/user/UserLearn";
import UserEmergency from "@/pages/user/UserEmergency";
import UserAIAssistant from "@/pages/user/UserAIAssistant";
import BuyQRTag from "@/pages/public/BuyQRTag";
import UserSettings from "@/pages/user/UserSettings";
import PublicProfileView from "@/pages/public/PublicProfileView";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEmergencyDashboard from "@/pages/admin/AdminEmergencyDashboard";
import NotFound from "@/pages/public/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/services" element={<Services />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/profile/:token" element={<PublicProfileView />} />

          {/* Protected dashboard routes (require auth & onboarding) */}
          <Route path="/dashboard" element={<ProtectedRoute requireOnboarding><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute requireOnboarding><UserProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/qr" element={<ProtectedRoute requireOnboarding><UserQRPage /></ProtectedRoute>} />
          <Route path="/dashboard/learn" element={<ProtectedRoute requireOnboarding><UserLearn /></ProtectedRoute>} />
          <Route path="/dashboard/emergency" element={<ProtectedRoute requireOnboarding><UserEmergency /></ProtectedRoute>} />
          <Route path="/dashboard/assistant" element={<ProtectedRoute requireOnboarding><UserAIAssistant /></ProtectedRoute>} />
          <Route path="/dashboard/buy-qr" element={<ProtectedRoute requireOnboarding><BuyQRTag /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute requireOnboarding><UserSettings /></ProtectedRoute>} />

          {/* Backwards-compatible aliases (old paths) */}
          <Route path="/dashboard/user" element={<ProtectedRoute requireOnboarding><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/user/profile" element={<ProtectedRoute requireOnboarding><UserProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/user/qr" element={<ProtectedRoute requireOnboarding><UserQRPage /></ProtectedRoute>} />
          <Route path="/dashboard/user/learn" element={<ProtectedRoute requireOnboarding><UserLearn /></ProtectedRoute>} />
          <Route path="/dashboard/user/assistant" element={<ProtectedRoute requireOnboarding><UserAIAssistant /></ProtectedRoute>} />
          <Route path="/dashboard/user/buy-qr" element={<ProtectedRoute requireOnboarding><BuyQRTag /></ProtectedRoute>} />
          <Route path="/dashboard/user/settings" element={<ProtectedRoute requireOnboarding><UserSettings /></ProtectedRoute>} />

          {/* Admin routes: primary `/admin` and legacy `/dashboard/admin` */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/emergencies" element={<ProtectedRoute><AdminEmergencyDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin/emergencies" element={<ProtectedRoute><AdminEmergencyDashboard /></ProtectedRoute>} />

          {/* Catch-all - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
