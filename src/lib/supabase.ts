import { createClient } from "@supabase/supabase-js";

// Retrieve Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Ensure Supabase credentials are available, otherwise throw an error
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key");
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Retrieves the current authenticated user along with their role.
 * 
 * @returns The user object with role information, or null if no session exists.
 */
export async function getCurrentUser() {
  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null; // Return null if no session is found

  // Fetch the user's role from the "profiles" table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role") // Only fetch the role column for efficiency
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error.message);
  }

  return {
    ...session.user,
    role: profile?.role || "agent", // Default to "agent" if role is not found
  };
}
