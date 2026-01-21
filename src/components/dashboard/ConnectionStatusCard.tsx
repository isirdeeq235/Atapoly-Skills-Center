import { 
  Database, 
  Mail, 
  CreditCard, 
  HardDrive, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useConnectionStatus, ConnectionStatus, ConnectionStatusType } from "@/hooks/useConnectionStatus";
import { cn } from "@/lib/utils";

interface ConnectionItemProps {
  connection: ConnectionStatus;
  icon: React.ReactNode;
}

function ConnectionItem({ connection, icon }: ConnectionItemProps) {
  const getStatusIcon = (status: ConnectionStatusType) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "not_configured":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case "disconnected":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      case "checking":
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ConnectionStatusType) => {
    switch (status) {
      case "connected":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Connected</Badge>;
      case "error":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Error</Badge>;
      case "not_configured":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Not Configured</Badge>;
      case "disconnected":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Disconnected</Badge>;
      case "checking":
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Checking...</Badge>;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border transition-colors",
            connection.status === "connected" && "border-success/20 bg-success/5",
            connection.status === "error" && "border-destructive/20 bg-destructive/5",
            connection.status === "not_configured" && "border-warning/20 bg-warning/5",
            connection.status === "disconnected" && "border-border bg-muted/30",
            connection.status === "checking" && "border-border bg-muted/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                connection.status === "connected" && "bg-success/10 text-success",
                connection.status === "error" && "bg-destructive/10 text-destructive",
                connection.status === "not_configured" && "bg-warning/10 text-warning",
                connection.status === "disconnected" && "bg-muted text-muted-foreground",
                connection.status === "checking" && "bg-muted text-muted-foreground"
              )}>
                {icon}
              </div>
              <div>
                <p className="font-medium text-sm">{connection.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {connection.message || "No status message"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(connection.status)}
              {getStatusIcon(connection.status)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{connection.name}</p>
            <p className="text-sm text-muted-foreground">{connection.message}</p>
            {connection.lastChecked && (
              <p className="text-xs text-muted-foreground">
                Last checked: {new Date(connection.lastChecked).toLocaleTimeString()}
              </p>
            )}
            {connection.details && (
              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                {Object.entries(connection.details).map(([key, value]) => (
                  <p key={key}>{key}: {JSON.stringify(value)}</p>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ConnectionStatusCardProps {
  showHeader?: boolean;
  compact?: boolean;
}

export function ConnectionStatusCard({ showHeader = true, compact = false }: ConnectionStatusCardProps) {
  const { connections, isLoading, refetch, overallStatus, connectedCount, totalCount } = useConnectionStatus();

  const connectionItems = [
    { key: "database", icon: <Database className="w-5 h-5" /> },
    { key: "storage", icon: <HardDrive className="w-5 h-5" /> },
    { key: "smtp", icon: <Mail className="w-5 h-5" /> },
    { key: "paystack", icon: <CreditCard className="w-5 h-5" /> },
    { key: "flutterwave", icon: <CreditCard className="w-5 h-5" /> },
  ];

  const getOverallStatusBadge = () => {
    switch (overallStatus) {
      case "connected":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Connection Issues
          </Badge>
        );
      case "checking":
        return (
          <Badge className="bg-muted text-muted-foreground">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        );
      default:
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Some Services Unavailable
          </Badge>
        );
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getOverallStatusBadge()}
        <span className="text-sm text-muted-foreground">
          {connectedCount}/{totalCount} services
        </span>
      </div>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Connection Status
              </CardTitle>
              <CardDescription>
                Real-time status of all system connections
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getOverallStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(!showHeader && "pt-6")}>
        <div className="space-y-3">
          {connectionItems.map(({ key, icon }) => (
            <ConnectionItem
              key={key}
              connection={connections[key as keyof typeof connections]}
              icon={icon}
            />
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            {connectedCount} of {totalCount} services connected • Auto-refreshes every 60s
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
