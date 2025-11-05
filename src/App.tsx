import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Learn from "./pages/Learn";
import UserDashboard from "./pages/UserDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import UserQRPage from "./pages/UserQRPage";
import PublicProfileView from "./pages/PublicProfileView";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

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
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/user/profile" element={<UserProfilePage />} />
          <Route path="/dashboard/user/qr" element={<UserQRPage />} />
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
