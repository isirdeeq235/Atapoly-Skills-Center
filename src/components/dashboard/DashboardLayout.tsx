import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "trainee" | "instructor" | "admin" | "super-admin";
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, role, title, subtitle }: DashboardLayoutProps) {
  const { profile } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdminRole = role === 'admin' || role === 'super-admin' || role === 'instructor';
  const notificationsPath = isAdminRole ? "/admin/notifications" : "/dashboard/notifications";
  const profilePath = isAdminRole ? "/admin/profile" : "/dashboard/profile";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar role={role} />

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9 w-64 bg-secondary/50 border-0"
              />
            </div>

            {/* Notifications */}
            <Link to={notificationsPath}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </Button>
            </Link>

            {/* User Avatar */}
            <Link to={profilePath}>
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(profile?.full_name || "U")}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
