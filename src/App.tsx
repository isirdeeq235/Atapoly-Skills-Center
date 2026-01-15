import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Programs from "./pages/Programs";
import TraineeDashboard from "./pages/dashboard/TraineeDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SuperAdminSettings from "./pages/dashboard/SuperAdminSettings";
import ApplyForProgram from "./pages/dashboard/ApplyForProgram";
import MyApplications from "./pages/dashboard/MyApplications";
import PaymentHistory from "./pages/dashboard/PaymentHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <TraineeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/apply" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <ApplyForProgram />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/apply/:programId" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <ApplyForProgram />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/applications" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <MyApplications />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/payments" element={
              <ProtectedRoute allowedRoles={['trainee', 'admin', 'super_admin', 'instructor']}>
                <PaymentHistory />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminSettings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
