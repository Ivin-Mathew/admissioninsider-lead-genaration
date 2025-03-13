"use client";

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
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.warn("No active session found. Redirecting to login...");
          setUser(null);
          router.push("/login");
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        const authUser = userData.user;
        if (!authUser) {
          console.warn("No user session found. Redirecting to login...");
          setUser(null);
          router.push("/login");
          return;
        }
        else {
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
        }
      } catch (error) {
        console.error("Error fetching initial user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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
            }
          } catch (error) {
            console.error("Error updating user session:", error);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          router.push("/login");
        }
      })();
    });
  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
  
      await supabase.auth.refreshSession();
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
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user && role !== "agent") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", data.user.id);
      if (updateError) throw updateError;
    }

    return data;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
  
      setUser(null);
      await supabase.auth.getSession(); 
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
