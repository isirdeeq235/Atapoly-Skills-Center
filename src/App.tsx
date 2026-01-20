import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PermissionsProvider } from "@/hooks/usePermissions";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { TraineeOnboardingGuard, ProfileCompletionGuard, RequireFullEnrollment } from "@/components/auth/TraineeOnboardingGuard";
import { DynamicHead } from "@/components/DynamicHead";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Programs from "./pages/Programs";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQs from "./pages/FAQs";
import TraineeDashboard from "./pages/dashboard/TraineeDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import InstructorDashboard from "./pages/dashboard/InstructorDashboard";
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
import Notifications from "./pages/dashboard/Notifications";
import MyCertificates from "./pages/dashboard/MyCertificates";
import AdminBatches from "./pages/dashboard/AdminBatches";
import AdminCertificates from "./pages/dashboard/AdminCertificates";
import AdminThemeManager from "./pages/dashboard/AdminThemeManager";
import AdminHomepageEditor from "./pages/dashboard/AdminHomepageEditor";
import AdminTemplateEditor from "./pages/dashboard/AdminTemplateEditor";
import AdminFormBuilder from "./pages/dashboard/AdminFormBuilder";
import AdminNotificationTemplates from "./pages/dashboard/AdminNotificationTemplates";
import AdminEmailTemplates from "./pages/dashboard/AdminEmailTemplates";
import AdminRolePermissions from "./pages/dashboard/AdminRolePermissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <PermissionsProvider>
            <DynamicHead />
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/faqs" element={<FAQs />} />
            
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
            
            {/* Trainee Notifications */}
            <Route path="/dashboard/notifications" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <RequireFullEnrollment>
                  <Notifications />
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
            
            {/* Trainee Payments - Requires full enrollment */}
            <Route path="/dashboard/payments" element={
              <ProtectedRoute allowedRoles={['trainee']}>
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
            
            {/* Trainee Certificates */}
            <Route path="/dashboard/certificates" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <RequireFullEnrollment>
                  <MyCertificates />
                </RequireFullEnrollment>
              </ProtectedRoute>
            } />
            
            {/* Trainee Profile Settings - Requires full enrollment */}
            <Route path="/dashboard/profile" element={
              <ProtectedRoute allowedRoles={['trainee']}>
                <RequireFullEnrollment>
                  <ProfileSettings />
                </RequireFullEnrollment>
              </ProtectedRoute>
            } />
            
            {/* Instructor Dashboard */}
            <Route path="/instructor" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Notifications */}
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
                <Notifications />
              </ProtectedRoute>
            } />
            
            {/* Admin Profile */}
            <Route path="/admin/profile" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
                <ProfileSettings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/applications" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <PermissionGuard requiredPermission="view_applications">
                  <AdminApplications />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/programs" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
                <PermissionGuard requiredPermission="view_programs">
                  <AdminPrograms />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
                <PermissionGuard requiredPermission="view_reports">
                  <AdminReports />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <PermissionGuard requiredPermission="view_users">
                  <AdminUsers />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <PermissionGuard requiredPermission="view_payments">
                  <PaymentHistory />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/hero-slides" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminHeroSlides />
              </ProtectedRoute>
            } />
            <Route path="/admin/batches" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <PermissionGuard requiredPermission="view_batches">
                  <AdminBatches />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/certificates" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <PermissionGuard requiredPermission="view_certificates">
                  <AdminCertificates />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            
            {/* God Mode Super Admin Routes */}
            <Route path="/admin/theme" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminThemeManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/homepage" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminHomepageEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/templates" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminTemplateEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/form-builder" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminFormBuilder />
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications-settings" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminNotificationTemplates />
              </ProtectedRoute>
            } />
            <Route path="/admin/email-templates" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminEmailTemplates />
              </ProtectedRoute>
            } />
            <Route path="/admin/role-permissions" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminRolePermissions />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </PermissionsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
