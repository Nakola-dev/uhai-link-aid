import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy-loaded pages — only downloaded when the route is visited (F-026)
const Index = lazy(() => import("@/pages/public/Index"));
const Auth = lazy(() => import("@/pages/public/Auth"));
const About = lazy(() => import("@/pages/public/About"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const Services = lazy(() => import("@/pages/public/Services"));
const Learn = lazy(() => import("@/pages/public/Learn"));
const Onboarding = lazy(() => import("@/pages/public/Onboarding"));
const PrivacyPolicy = lazy(() => import("@/pages/public/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/public/TermsOfService"));
const MedicalDisclaimer = lazy(() => import("@/pages/public/MedicalDisclaimer"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));
const UserProfilePage = lazy(() => import("@/pages/user/UserProfilePage"));
const UserQRPage = lazy(() => import("@/pages/user/UserQRPage"));
const UserLearn = lazy(() => import("@/pages/user/UserLearn"));
const UserEmergency = lazy(() => import("@/pages/user/UserEmergency"));
const UserAIAssistant = lazy(() => import("@/pages/user/UserAIAssistant"));
const BuyQRTag = lazy(() => import("@/pages/public/BuyQRTag"));
const UserSettings = lazy(() => import("@/pages/user/UserSettings"));
const PublicProfileView = lazy(() => import("@/pages/public/PublicProfileView"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminEmergencyDashboard = lazy(() => import("@/pages/admin/AdminEmergencyDashboard"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/services" element={<Services />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/medical-disclaimer" element={<MedicalDisclaimer />} />
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

          {/* Admin routes: require auth + admin role */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/emergencies" element={<ProtectedRoute requireAdmin><AdminEmergencyDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin/emergencies" element={<ProtectedRoute requireAdmin><AdminEmergencyDashboard /></ProtectedRoute>} />

          {/* Catch-all - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
