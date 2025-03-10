import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get current user with role
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  // Get the user's role from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  return {
    ...session.user,
    role: profile?.role || 'agent', // Default to agent if role not found
  };
}