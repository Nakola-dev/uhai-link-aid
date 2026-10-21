import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OfflineBanner } from "@/components/OfflineBanner";
import RouteMeta from "@/components/RouteMeta";

// Lazy-loaded pages — only downloaded when the route is visited (F-026)
const Index = lazy(() => import("@/pages/public/Index"));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));
const Auth = lazy(() => import("@/pages/public/Auth"));
const About = lazy(() => import("@/pages/public/About"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const Services = lazy(() => import("@/pages/public/Services"));
const Learn = lazy(() => import("@/pages/public/Learn"));
const Onboarding = lazy(() => import("@/pages/public/Onboarding"));
const PrivacyPolicy = lazy(() => import("@/pages/public/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/public/TermsOfService"));
const MedicalDisclaimer = lazy(() => import("@/pages/public/MedicalDisclaimer"));
const ResponderDemo = lazy(() => import("@/pages/public/ResponderDemo"));
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
const OfflinePage = lazy(() => import("@/pages/public/OfflinePage"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background" role="status">
    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
    <span className="sr-only">Loading…</span>
  </div>
);

/** Signed-in pages, each available at its current path and its older /dashboard/user/* alias. */
const userPages: Array<[string, JSX.Element]> = [
  ["", <UserDashboard />],
  ["profile", <UserProfilePage />],
  ["qr", <UserQRPage />],
  ["learn", <UserLearn />],
  ["emergency", <UserEmergency />],
  ["assistant", <UserAIAssistant />],
  ["buy-qr", <BuyQRTag />],
  ["settings", <UserSettings />],
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster position="top-center" closeButton />
      <OfflineBanner />
      <BrowserRouter>
        <RouteMeta />
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
            <Route path="/demo/responder" element={<ResponderDemo />} />
            <Route path="/profile/:token" element={<PublicProfileView />} />
            <Route path="/offline" element={<OfflinePage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            {/* Signed-in area (requires completed onboarding + consent) */}
            <Route element={<ProtectedRoute requireOnboarding />}>
              {userPages.map(([path, element]) => (
                <Route key={`main-${path}`} path={path ? `/dashboard/${path}` : "/dashboard"} element={element} />
              ))}
              {/* Backwards-compatible aliases (old paths) */}
              {userPages.filter(([path]) => path !== "emergency").map(([path, element]) => (
                <Route key={`alias-${path}`} path={path ? `/dashboard/user/${path}` : "/dashboard/user"} element={element} />
              ))}
            </Route>

            {/* Admin area: requires auth + admin role (enforced server-side by RLS/has_role) */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/emergencies" element={<AdminEmergencyDashboard />} />
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/emergencies" element={<AdminEmergencyDashboard />} />
            </Route>

            {/* Catch-all - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
