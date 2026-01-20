import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format

    console.log(`Running batch status update for date: ${today}`);

    // Update batches to 'ongoing' where start_date has passed and status is 'open' or 'upcoming'
    const { data: ongoingUpdates, error: ongoingError } = await supabase
      .from("batches")
      .update({ status: "ongoing", updated_at: new Date().toISOString() })
      .lte("start_date", today)
      .in("status", ["open", "upcoming"])
      .select("id, batch_name");

    if (ongoingError) {
      console.error("Error updating to ongoing:", ongoingError);
      throw ongoingError;
    }

    console.log(`Updated ${ongoingUpdates?.length || 0} batches to 'ongoing'`);

    // Update batches to 'completed' where end_date has passed and status is 'ongoing'
    const { data: completedUpdates, error: completedError } = await supabase
      .from("batches")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .lt("end_date", today)
      .eq("status", "ongoing")
      .not("end_date", "is", null)
      .select("id, batch_name");

    if (completedError) {
      console.error("Error updating to completed:", completedError);
      throw completedError;
    }

    console.log(`Updated ${completedUpdates?.length || 0} batches to 'completed'`);

    const result = {
      success: true,
      date: today,
      updates: {
        ongoing: ongoingUpdates?.map(b => b.batch_name) || [],
        completed: completedUpdates?.map(b => b.batch_name) || [],
      },
      summary: {
        ongoingCount: ongoingUpdates?.length || 0,
        completedCount: completedUpdates?.length || 0,
      },
    };

    console.log("Batch status update completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in update-batch-statuses:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
