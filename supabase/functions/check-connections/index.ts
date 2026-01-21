import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConnectionStatus {
  name: string;
  status: "connected" | "disconnected" | "error" | "not_configured";
  message: string;
  lastChecked: string;
  details?: Record<string, unknown>;
}

interface ConnectionsResponse {
  database: ConnectionStatus;
  smtp: ConnectionStatus;
  paystack: ConnectionStatus;
  flutterwave: ConnectionStatus;
  storage: ConnectionStatus;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date().toISOString();

    const connections: ConnectionsResponse = {
      database: { name: "Database", status: "disconnected", message: "", lastChecked: now },
      smtp: { name: "Email (SMTP)", status: "not_configured", message: "", lastChecked: now },
      paystack: { name: "Paystack", status: "not_configured", message: "", lastChecked: now },
      flutterwave: { name: "Flutterwave", status: "not_configured", message: "", lastChecked: now },
      storage: { name: "File Storage", status: "disconnected", message: "", lastChecked: now },
    };

    // Check Database Connection
    console.log("Checking database connection...");
    try {
      const { data, error } = await supabase.from("site_config").select("id").limit(1);
      if (error) throw error;
      connections.database = {
        name: "Database",
        status: "connected",
        message: "Database is connected and responding",
        lastChecked: now,
        details: { tables_accessible: true },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      connections.database = {
        name: "Database",
        status: "error",
        message: `Database error: ${errorMessage}`,
        lastChecked: now,
      };
    }

    // Check Storage Connection
    console.log("Checking storage connection...");
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      connections.storage = {
        name: "File Storage",
        status: "connected",
        message: `${data.length} storage buckets available`,
        lastChecked: now,
        details: { buckets: data.map(b => b.name) },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      connections.storage = {
        name: "File Storage",
        status: "error",
        message: `Storage error: ${errorMessage}`,
        lastChecked: now,
      };
    }

    // Check SMTP Configuration
    console.log("Checking SMTP configuration...");
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL");

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      // Just check if all required env vars are present
      // Actual connection test happens via send-email test
      connections.smtp = {
        name: "Email (SMTP)",
        status: "connected",
        message: "SMTP credentials are configured",
        lastChecked: now,
        details: { 
          host: smtpHost, 
          port: smtpPort,
          from_email: smtpFromEmail || "Not set",
        },
      };
    } else {
      const missingFields = [];
      if (!smtpHost) missingFields.push("SMTP_HOST");
      if (!smtpPort) missingFields.push("SMTP_PORT");
      if (!smtpUser) missingFields.push("SMTP_USER");
      if (!smtpPass) missingFields.push("SMTP_PASS");
      
      connections.smtp = {
        name: "Email (SMTP)",
        status: "not_configured",
        message: `Missing: ${missingFields.join(", ")}`,
        lastChecked: now,
      };
    }

    // Check Paystack Configuration
    console.log("Checking Paystack configuration...");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    
    if (paystackSecretKey && paystackSecretKey.length > 0) {
      try {
        const response = await fetch("https://api.paystack.co/balance", {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        });
        
        if (response.ok) {
          connections.paystack = {
            name: "Paystack",
            status: "connected",
            message: "Paystack API key is valid and connected",
            lastChecked: now,
            details: { api_accessible: true },
          };
        } else {
          const errorData = await response.json();
          connections.paystack = {
            name: "Paystack",
            status: "error",
            message: errorData.message || "Invalid API key",
            lastChecked: now,
          };
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        connections.paystack = {
          name: "Paystack",
          status: "error",
          message: `Connection failed: ${errorMessage}`,
          lastChecked: now,
        };
      }
    } else {
      connections.paystack = {
        name: "Paystack",
        status: "not_configured",
        message: "PAYSTACK_SECRET_KEY not configured",
        lastChecked: now,
      };
    }

    // Check Flutterwave Configuration
    console.log("Checking Flutterwave configuration...");
    const flutterwaveSecretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    
    if (flutterwaveSecretKey && flutterwaveSecretKey.length > 0) {
      try {
        const response = await fetch("https://api.flutterwave.com/v3/balances", {
          headers: {
            Authorization: `Bearer ${flutterwaveSecretKey}`,
          },
        });
        
        if (response.ok) {
          connections.flutterwave = {
            name: "Flutterwave",
            status: "connected",
            message: "Flutterwave API key is valid and connected",
            lastChecked: now,
            details: { api_accessible: true },
          };
        } else {
          const errorData = await response.json();
          connections.flutterwave = {
            name: "Flutterwave",
            status: "error",
            message: errorData.message || "Invalid API key",
            lastChecked: now,
          };
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        connections.flutterwave = {
          name: "Flutterwave",
          status: "error",
          message: `Connection failed: ${errorMessage}`,
          lastChecked: now,
        };
      }
    } else {
      connections.flutterwave = {
        name: "Flutterwave",
        status: "not_configured",
        message: "FLUTTERWAVE_SECRET_KEY not configured",
        lastChecked: now,
      };
    }

    console.log("Connection check completed:", connections);

    return new Response(
      JSON.stringify({ success: true, connections }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error checking connections:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
