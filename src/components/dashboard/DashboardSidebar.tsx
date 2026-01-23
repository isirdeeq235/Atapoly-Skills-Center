import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  CreditCard, 
  User, 
  Settings,
  LogOut,
  GraduationCap,
  Users,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Image,
  Award,
  Calendar,
  Palette,
  FileEdit,
  Layout,
  Blocks,
  BellRing,
  MailOpen,
  ShieldCheck,
  Sparkles,
  Receipt,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string; // Required permission to see this item
}

interface DashboardSidebarProps {
  role: "trainee" | "instructor" | "admin" | "super-admin";
}

const roleNavItems: Record<string, NavItem[]> = {
  trainee: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Apply", href: "/dashboard/apply", icon: BookOpen },
    { label: "My Applications", href: "/dashboard/applications", icon: FileText },
    { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { label: "ID Card", href: "/dashboard/id-card", icon: User },
    { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  ],
  instructor: [
    { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
    { label: "My Programs", href: "/admin/programs", icon: BookOpen, permission: "view_assigned_programs" },
    { label: "Reports", href: "/admin/reports", icon: BarChart3, permission: "view_reports" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Applications", href: "/admin/applications", icon: FileText, permission: "view_applications" },
    { label: "Programs", href: "/admin/programs", icon: BookOpen, permission: "view_programs" },
    { label: "Batches", href: "/admin/batches", icon: Calendar, permission: "view_batches" },
    { label: "Certificates", href: "/admin/certificates", icon: Award, permission: "view_certificates" },
    { label: "Users", href: "/admin/users", icon: Users, permission: "view_users" },
    { label: "Payments", href: "/admin/payments", icon: CreditCard, permission: "view_payments" },
    { label: "Reports", href: "/admin/reports", icon: BarChart3, permission: "view_reports" },
  ],
  "super-admin": [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Programs", href: "/admin/programs", icon: BookOpen },
    { label: "Batches", href: "/admin/batches", icon: Calendar },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Audit Trail", href: "/admin/status-history", icon: History },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Hero Slides", href: "/admin/hero-slides", icon: Image },
    { label: "Homepage", href: "/admin/homepage", icon: Layout },
    { label: "Theme", href: "/admin/theme", icon: Palette },
    { label: "Templates", href: "/admin/templates", icon: FileEdit },
    { label: "Form Builder", href: "/admin/form-builder", icon: Blocks },
    { label: "Notifications", href: "/admin/notifications-settings", icon: BellRing },
    { label: "Email Templates", href: "/admin/email-templates", icon: MailOpen },
    { label: "Receipt Template", href: "/admin/receipt-template", icon: Receipt },
    { label: "Permissions", href: "/admin/role-permissions", icon: ShieldCheck },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const allNavItems = roleNavItems[role] || roleNavItems.trainee;
  const { data: siteConfig } = useSiteConfig();
  const { signOut, role: userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const { data: onboardingStatus } = useOnboardingStatus();

  // Check if trainee is fully enrolled
  const isFullyEnrolled = onboardingStatus?.currentStep === 'fully_enrolled';
  
  // For trainees not fully enrolled, show onboarding link
  const traineeNavItems = role === 'trainee' && !isFullyEnrolled
    ? [
        { label: "Getting Started", href: "/dashboard/onboarding", icon: Sparkles },
        { label: "Apply", href: "/dashboard/apply", icon: BookOpen },
        { label: "My Applications", href: "/dashboard/applications", icon: FileText },
      ]
    : allNavItems;

  // Filter nav items based on permissions (super-admin sees all, others are filtered)
  const navItems = role === 'super-admin' 
    ? allNavItems 
    : role === 'trainee'
      ? traineeNavItems
      : allNavItems.filter(item => {
          // If no permission required, show the item
          if (!item.permission) return true;
          // Check if user has the required permission
          return hasPermission(item.permission);
        });

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  // Determine the correct profile and notifications paths based on role
  const isAdminRole = role === 'admin' || role === 'super-admin' || role === 'instructor';
  const profilePath = isAdminRole ? "/admin/profile" : "/dashboard/profile";
  const notificationsPath = isAdminRole ? "/admin/notifications" : "/dashboard/notifications";

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          {siteConfig?.logo_url ? (
            <img src={siteConfig.logo_url} alt={siteConfig.site_name} className="w-10 h-10 rounded-lg object-contain flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
          )}
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">{siteConfig?.site_name || 'TrainHub'}</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          to={notificationsPath}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-1",
            location.pathname === notificationsPath && "bg-sidebar-primary text-sidebar-primary-foreground"
          )}
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Notifications</span>}
        </Link>
        <Link
          to={profilePath}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-1",
            location.pathname === profilePath && "bg-sidebar-primary text-sidebar-primary-foreground"
          )}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Profile</span>}
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
