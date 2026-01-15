import { Link, useLocation } from "react-router-dom";
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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
  ],
  instructor: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Programs", href: "/admin/programs", icon: BookOpen },
    { label: "Trainees", href: "/admin/trainees", icon: Users },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Programs", href: "/admin/programs", icon: BookOpen },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  ],
  "super-admin": [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Programs", href: "/admin/programs", icon: BookOpen },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = roleNavItems[role] || roleNavItems.trainee;

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
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">TrainHub</span>
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
          to="/dashboard/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-1"
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Notifications</span>}
        </Link>
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors mb-1"
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Profile</span>}
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
