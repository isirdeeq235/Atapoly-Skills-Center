import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TraineeOnboardingGuard, ProfileCompletionGuard, RequireFullEnrollment } from "@/components/auth/TraineeOnboardingGuard";
import { DynamicHead } from "@/components/DynamicHead";
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
import AdminApplications from "./pages/dashboard/AdminApplications";
import AdminPrograms from "./pages/dashboard/AdminPrograms";
import AdminReports from "./pages/dashboard/AdminReports";
import TraineeIDCard from "./pages/dashboard/TraineeIDCard";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import AdminUsers from "./pages/dashboard/AdminUsers";
import AdminHeroSlides from "./pages/dashboard/AdminHeroSlides";
import CompleteProfile from "./pages/dashboard/CompleteProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DynamicHead />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/programs" element={<Programs />} />
            
            {/* Trainee Complete Profile - First step after registration */}
            <Route path="/dashboard/complete-profile" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <ProfileCompletionGuard>
                  <CompleteProfile />
                </ProfileCompletionGuard>
              </ProtectedRoute>
            } />
            
            {/* Trainee Dashboard - Requires full enrollment */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <RequireFullEnrollment>
                  <TraineeDashboard />
                </RequireFullEnrollment>
              </ProtectedRoute>
            } />
            
            {/* Apply for Program - Allowed for profile-complete trainees */}
            <Route path="/dashboard/apply" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <TraineeOnboardingGuard allowedSteps={['apply_program', 'pay_application_fee', 'fully_enrolled']}>
                  <ApplyForProgram />
                </TraineeOnboardingGuard>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/apply/:programId" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <TraineeOnboardingGuard allowedSteps={['apply_program', 'pay_application_fee', 'fully_enrolled']}>
                  <ApplyForProgram />
                </TraineeOnboardingGuard>
              </ProtectedRoute>
            } />
            
            {/* Applications page - viewable for status tracking */}
            <Route path="/dashboard/applications" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <TraineeOnboardingGuard allowedSteps={['pending_approval', 'pay_registration_fee', 'fully_enrolled', 'rejected']}>
                  <MyApplications />
                </TraineeOnboardingGuard>
              </ProtectedRoute>
            } />
            
            {/* Payments - Requires full enrollment */}
            <Route path="/dashboard/payments" element={
              <ProtectedRoute allowedRoles={['trainee', 'admin', 'super_admin', 'instructor']}>
                <RequireFullEnrollment>
                  <PaymentHistory />
                </RequireFullEnrollment>
              </ProtectedRoute>
            } />
            
            {/* ID Card - Requires full enrollment */}
            <Route path="/dashboard/id-card" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <RequireFullEnrollment>
                  <TraineeIDCard />
                </RequireFullEnrollment>
              </ProtectedRoute>
            } />
            
            {/* Profile Settings - Requires full enrollment */}
            <Route path="/dashboard/profile" element={
              <ProtectedRoute allowedRoles={['trainee', 'admin', 'super_admin', 'instructor']}>
                <RequireFullEnrollment>
                  <ProfileSettings />
                </RequireFullEnrollment>
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/applications" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminApplications />
              </ProtectedRoute>
            } />
            <Route path="/admin/programs" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminPrograms />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
                <AdminReports />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <PaymentHistory />
              </ProtectedRoute>
            } />
            <Route path="/admin/hero-slides" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminHeroSlides />
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
