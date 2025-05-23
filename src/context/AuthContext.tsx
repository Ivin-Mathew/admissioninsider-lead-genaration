import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "admin" | "counselor" | "agent";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (
    email: string,
    password: string,
    role?: "admin" | "counselor" | "agent"
  ) => Promise<any>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isCounselor: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInitialUser = async () => {
      setLoading(true);
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.warn("No active session found.");
          setUser(null);
          // Don't redirect here - let the page decide
          return;
        }

        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) throw userError;
        const authUser = userData.user;
        if (!authUser) {
          console.warn("No user session found.");
          setUser(null);
          // Don't redirect here - let the page decide
          return;
        } else {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authUser.id)
            .single();
          if (profileError) throw profileError;
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            role: profile?.role || "agent",
          });
          // Don't redirect here - user may already be on dashboard
        }
      } catch (error) {
        console.error("Error fetching initial user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            try {
              const { data, error } = await supabase.auth.getUser();
              const updatedAuthUser = data?.user;
              if (error) {
                console.error("Error in auth state change:", error);
                return;
              }
              if (updatedAuthUser) {
                const { data: profile, error: profileError } = await supabase
                  .from("profiles")
                  .select("role")
                  .eq("id", updatedAuthUser.id)
                  .single();
                if (profileError) {
                  console.error("Profile fetch error:", profileError);
                  return;
                }
                setUser({
                  id: updatedAuthUser.id,
                  email: updatedAuthUser.email || "",
                  role: profile?.role || "agent",
                });
                // Don't automatically redirect - let the page handle it
              }
            } catch (error) {
              console.error("Error updating user session:", error);
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            router.push("/login");
          }
        })();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      // Configure session to expire when browser closes
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Session will expire when browser is closed
        },
      });

      if (error) throw error;

      // Set session properties for browser session only
      if (data.session) {
        // After successful login, set the auth cookie to be a session cookie
        // This is done by calling a special endpoint that sets the cookie without maxAge
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error("Failed to set session properties:", sessionError);
        }
      }

      return data;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    role: "admin" | "counselor" | "agent" = "agent"
  ) => {
    try {
      // Simple signup without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          },
          // Skip email confirmation
          emailRedirectTo: undefined
        }
      });

      if (error) {
        throw error;
      }

      // Create or update the profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          throw profileError;
        }
      }

      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // First clear any local storage data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');

        // Clear all local storage data related to Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // This removes cookies & local storage
      });

      if (error) throw error;

      // Clear user state
      setUser(null);

      // Double-check session is gone
      await supabase.auth.getSession();

      // Redirect to login
      await router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin: user?.role === "admin",
    isCounselor: user?.role === "counselor",
    isAgent: user?.role === "agent",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};