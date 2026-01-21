import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications, NotificationType } from "@/hooks/useNotifications";
import { 
  Bell, 
  CheckCircle2, 
  FileText, 
  CreditCard, 
  AlertCircle,
  Clock,
  Trash2,
  CheckCheck,
  Loader2,
  Megaphone,
  UserCheck,
  XCircle,
  Award,
  BookOpen
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Notifications = () => {
  const { role } = useAuth();
  const { 
    notifications, 
    isLoading, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll,
    isMarkingAllRead
  } = useNotifications();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'application_submitted': 
        return <FileText className="w-5 h-5 text-primary" />;
      case 'application_approved': 
        return <UserCheck className="w-5 h-5 text-success" />;
      case 'application_rejected': 
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'payment_success': 
        return <CreditCard className="w-5 h-5 text-success" />;
      case 'payment_failed': 
        return <CreditCard className="w-5 h-5 text-destructive" />;
      case 'registration_complete': 
        return <Award className="w-5 h-5 text-accent" />;
      case 'system_announcement': 
        return <Megaphone className="w-5 h-5 text-info" />;
      case 'program_update': 
        return <BookOpen className="w-5 h-5 text-primary" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    const labels: Record<NotificationType, string> = {
      application_submitted: 'Application',
      application_approved: 'Approved',
      application_rejected: 'Rejected',
      payment_success: 'Payment',
      payment_failed: 'Payment Failed',
      payment_verified: 'Verified',
      registration_complete: 'Enrolled',
      system_announcement: 'Announcement',
      program_update: 'Program',
      new_application_for_review: 'New Application',
    };
    
    const variants: Record<NotificationType, 'default' | 'approved' | 'rejected' | 'pending' | 'outline'> = {
      application_submitted: 'default',
      application_approved: 'approved',
      application_rejected: 'rejected',
      payment_success: 'approved',
      payment_failed: 'rejected',
      payment_verified: 'approved',
      registration_complete: 'approved',
      system_announcement: 'outline',
      program_update: 'default',
      new_application_for_review: 'pending',
    };

    return <Badge variant={variants[type]}>{labels[type]}</Badge>;
  };

  const dashboardRole = role === 'super_admin' ? 'super-admin' : 
                        role === 'admin' ? 'admin' : 
                        role === 'instructor' ? 'instructor' : 'trainee';

  if (isLoading) {
    return (
      <DashboardLayout 
        role={dashboardRole as any} 
        title="Notifications"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={dashboardRole as any} 
      title="Notifications" 
      subtitle="Stay updated with your activity"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead}
              >
                {isMarkingAllRead ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4 mr-2" />
                )}
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear all
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your notifications. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => clearAll()} className="bg-destructive hover:bg-destructive/90">
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! Check back later for updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all ${!notification.read ? 'bg-accent/5 border-accent/20 shadow-sm' : 'hover:bg-muted/50'}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-foreground">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            )}
                            {getTypeBadge(notification.type)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span title={format(new Date(notification.created_at), 'PPpp')}>
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
