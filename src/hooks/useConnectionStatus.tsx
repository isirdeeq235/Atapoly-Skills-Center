import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invokeFunction } from "@/lib/functionsClient";
import { useEffect } from "react";

export type ConnectionStatusType = "connected" | "disconnected" | "error" | "not_configured" | "checking";

export interface ConnectionStatus {
  name: string;
  status: ConnectionStatusType;
  message: string;
  lastChecked: string;
  details?: Record<string, unknown>;
}

export interface ConnectionsData {
  database: ConnectionStatus;
  smtp: ConnectionStatus;
  paystack: ConnectionStatus;
  flutterwave: ConnectionStatus;
  storage: ConnectionStatus;
}

const defaultConnections: ConnectionsData = {
  database: { name: "Database", status: "checking", message: "Checking connection...", lastChecked: "" },
  smtp: { name: "Email (SMTP)", status: "checking", message: "Checking connection...", lastChecked: "" },
  paystack: { name: "Paystack", status: "checking", message: "Checking connection...", lastChecked: "" },
  flutterwave: { name: "Flutterwave", status: "checking", message: "Checking connection...", lastChecked: "" },
  storage: { name: "File Storage", status: "checking", message: "Checking connection...", lastChecked: "" },
};

export function useConnectionStatus() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["connection-status"],
    queryFn: async (): Promise<ConnectionsData> => {
      const { data, error } = await invokeFunction("check-connections");
      
      if (error) {
        throw new Error(error.message || 'Failed to call check-connections');
      }
      
      if (!data?.success) {
        throw new Error(data?.error || "Failed to check connections");
      }
      
      return data.connections;
    },
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
    retry: 2,
  });

  // Polling/refetching is sufficient for connection status in a BFF architecture.
  useEffect(() => {
    const interval = setInterval(() => queryClient.invalidateQueries({ queryKey: ["connection-status"] }), 15000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const connections = data || defaultConnections;

  const getOverallStatus = (): ConnectionStatusType => {
    if (isLoading) return "checking";
    if (error) return "error";
    
    const statuses = Object.values(connections).map(c => c.status);
    if (statuses.some(s => s === "error")) return "error";
    if (statuses.some(s => s === "disconnected")) return "disconnected";
    if (statuses.every(s => s === "connected" || s === "not_configured")) return "connected";
    return "checking";
  };

  const getConnectedCount = () => {
    return Object.values(connections).filter(c => c.status === "connected").length;
  };

  const getTotalCount = () => {
    return Object.values(connections).length;
  };

  return {
    connections,
    isLoading,
    error,
    refetch,
    overallStatus: getOverallStatus(),
    connectedCount: getConnectedCount(),
    totalCount: getTotalCount(),
  };
} 
