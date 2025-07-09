import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

if (
  supabaseUrl.includes("placeholder") ||
  supabaseAnonKey.includes("placeholder")
) {
  throw new Error(
    "Please replace placeholder values in your .env file with actual Supabase credentials."
  );
}

console.log("🔧 Supabase client initializing with CONSERVATIVE settings...");
console.log("🌐 URL:", supabaseUrl.substring(0, 30) + "...");
console.log("🔑 Key:", supabaseAnonKey.substring(0, 20) + "...");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  realtime: {
    params: {
      eventsPerSecond: 5,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => {
      const delay = Math.min(1000 * 2 ** tries, 60000); // 2s, 4s, 8s, ... up to 1m
      console.log(`🔄 Realtime reconnect attempt ${tries} in ${delay / 1000}s`);
      return delay;
    },
  },
  global: {
    headers: {
      "X-Client-Info": "tesla-charging-queue-v2",
    },
  },
});

// Test connection on initialization
(async () => {
  try {
    console.log("🔍 Testing Supabase connection...");
    const { error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    if (error) {
      console.error("❌ Supabase connection test failed:", error);
    } else {
      console.log("✅ Supabase connection established successfully");
    }
  } catch (error) {
    console.error("❌ Supabase connection error:", error);
  }
})();
