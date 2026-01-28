/**
 * Route configuration for the application
 * Centralized route definitions for easier maintenance
 */

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Programs from "@/pages/Programs";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import FAQs from "@/pages/FAQs";
import TraineeDashboard from "@/pages/dashboard/TraineeDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import InstructorDashboard from "@/pages/dashboard/InstructorDashboard";
import SuperAdminSettings from "@/pages/dashboard/SuperAdminSettings";
import ApplyForProgram from "@/pages/dashboard/ApplyForProgram";
import MyApplications from "@/pages/dashboard/MyApplications";
import OnboardingHub from "@/pages/dashboard/OnboardingHub";
import PaymentHistory from "@/pages/dashboard/PaymentHistory";
import AdminApplications from "@/pages/dashboard/AdminApplications";
import AdminPrograms from "@/pages/dashboard/AdminPrograms";
import AdminReports from "@/pages/dashboard/AdminReports";
import TraineeIDCard from "@/pages/dashboard/TraineeIDCard";
import ProfileSettings from "@/pages/dashboard/ProfileSettings";
import AdminUsers from "@/pages/dashboard/AdminUsers";
import AdminHeroSlides from "@/pages/dashboard/AdminHeroSlides";
import CompleteProfile from "@/pages/dashboard/CompleteProfile";
import ApplicationForm from "@/pages/dashboard/ApplicationForm";
import Notifications from "@/pages/dashboard/Notifications";
import MyCertificates from "@/pages/dashboard/MyCertificates";
import AdminBatches from "@/pages/dashboard/AdminBatches";
import AdminCertificates from "@/pages/dashboard/AdminCertificates";
import AdminThemeManager from "@/pages/dashboard/AdminThemeManager";
import AdminHomepageEditor from "@/pages/dashboard/AdminHomepageEditor";
import AdminTemplateEditor from "@/pages/dashboard/AdminTemplateEditor";
import AdminFormBuilder from "@/pages/dashboard/AdminFormBuilder";
import AdminNotificationTemplates from "@/pages/dashboard/AdminNotificationTemplates";
import AdminEmailTemplates from "@/pages/dashboard/AdminEmailTemplates";
import AdminRolePermissions from "@/pages/dashboard/AdminRolePermissions";
import AdminReceiptTemplate from "@/pages/dashboard/AdminReceiptTemplate";
import AdminPayments from "@/pages/dashboard/AdminPayments";
import AdminStatusHistory from "@/pages/dashboard/AdminStatusHistory";
import NotFound from "@/pages/NotFound";

export type AppRoute = {
  path: string;
  element: React.ReactNode;
  guard?: 'public' | 'protected';
  allowedRoles?: string[];
  permission?: string;
  customWrapper?: boolean;
};

/**
 * Public routes - accessible to everyone
 */
export const publicRoutes: AppRoute[] = [
  { path: "/", element: <Index />, guard: 'public' },
  { path: "/login", element: <Login />, guard: 'public' },
  { path: "/admin-login", element: <AdminLogin />, guard: 'public' },
  { path: "/register", element: <Register />, guard: 'public' },
  { path: "/forgot-password", element: <ForgotPassword />, guard: 'public' },
  { path: "/programs", element: <Programs />, guard: 'public' },
  { path: "/about", element: <About />, guard: 'public' },
  { path: "/contact", element: <Contact />, guard: 'public' },
  { path: "/privacy-policy", element: <PrivacyPolicy />, guard: 'public' },
  { path: "/terms-of-service", element: <TermsOfService />, guard: 'public' },
  { path: "/faqs", element: <FAQs />, guard: 'public' },
];

/**
 * Trainee routes - requires trainee role
 */
export const traineeRoutes: AppRoute[] = [
  {
    path: "/dashboard/complete-profile",
    element: <CompleteProfile />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/application-form/:applicationId",
    element: <ApplicationForm />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/onboarding",
    element: <OnboardingHub />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard",
    element: <TraineeDashboard />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/notifications",
    element: <Notifications />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/apply",
    element: <ApplyForProgram />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/apply/:programId",
    element: <ApplyForProgram />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/applications",
    element: <MyApplications />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/payments",
    element: <PaymentHistory />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/id-card",
    element: <TraineeIDCard />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/certificates",
    element: <MyCertificates />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
  {
    path: "/dashboard/profile",
    element: <ProfileSettings />,
    guard: 'protected',
    allowedRoles: ['trainee'],
    customWrapper: true,
  },
];

/**
 * Instructor routes
 */
export const instructorRoutes: AppRoute[] = [
  {
    path: "/instructor",
    element: <InstructorDashboard />,
    guard: 'protected',
    allowedRoles: ['instructor'],
  },
];

/**
 * Admin routes - requires admin or super_admin role
 */
export const adminRoutes: AppRoute[] = [
  {
    path: "/admin",
    element: <AdminDashboard />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin'],
  },
  {
    path: "/admin/notifications",
    element: <Notifications />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin', 'instructor'],
  },
  {
    path: "/admin/profile",
    element: <ProfileSettings />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin', 'instructor'],
  },
  {
    path: "/admin/applications",
    element: <AdminApplications />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin'],
    permission: 'view_applications',
  },
  {
    path: "/admin/programs",
    element: <AdminPrograms />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin', 'instructor'],
    permission: 'view_programs',
  },
  {
    path: "/admin/reports",
    element: <AdminReports />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin', 'instructor'],
    permission: 'view_reports',
  },
  {
    path: "/admin/users",
    element: <AdminUsers />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin'],
    permission: 'view_users',
  },
  {
    path: "/admin/payments",
    element: <AdminPayments />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin'],
    permission: 'view_payments',
  },
  {
    path: "/admin/status-history",
    element: <AdminStatusHistory />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin'],
  },
  {
    path: "/admin/batches",
    element: <AdminBatches />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin'],
    permission: 'view_batches',
  },
  {
    path: "/admin/certificates",
    element: <AdminCertificates />,
    guard: 'protected',
    allowedRoles: ['admin', 'super_admin'],
    permission: 'view_certificates',
  },
];

/**
 * Super admin only routes
 */
export const superAdminRoutes: AppRoute[] = [
  {
    path: "/admin/settings",
    element: <SuperAdminSettings />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/hero-slides",
    element: <AdminHeroSlides />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/theme",
    element: <AdminThemeManager />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/homepage",
    element: <AdminHomepageEditor />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/templates",
    element: <AdminTemplateEditor />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/form-builder",
    element: <AdminFormBuilder />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/notifications-settings",
    element: <AdminNotificationTemplates />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/email-templates",
    element: <AdminEmailTemplates />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/role-permissions",
    element: <AdminRolePermissions />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
  {
    path: "/admin/receipt-template",
    element: <AdminReceiptTemplate />,
    guard: 'protected',
    allowedRoles: ['super_admin'],
  },
];

/**
 * Error routes
 */
export const errorRoutes: AppRoute[] = [
  { path: "*", element: <NotFound />, guard: 'public' },
];

/**
 * All routes combined
 */
export const allRoutes: AppRoute[] = [
  ...publicRoutes,
  ...traineeRoutes,
  ...instructorRoutes,
  ...adminRoutes,
  ...superAdminRoutes,
  ...errorRoutes,
];
