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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {
      "X-Client-Info": "tesla-charging-queue",
    },
  },
});

// Test connection on initialization
(async () => {
  try {
    const { error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    if (error) {
      console.error("Supabase connection test failed:", error);
    } else {
      console.log("Supabase connection established successfully");
    }
  } catch (error) {
    console.error("Supabase connection error:", error);
  }
})();
