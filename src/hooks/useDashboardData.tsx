import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboardData } from "@/lib/applications.supabase";

export const useDashboardData = () => {
  const { user, isAdmin, isCounselor } = useAuth();

  return useQuery({
    queryKey: ["dashboardData", user?.id, isAdmin, isCounselor],
    queryFn: async () => {
      try {
        if (!user) {
          throw new Error("User not authenticated");
        }
        return await fetchDashboardData(user, isAdmin, isCounselor, false); // isAgent is always false now
      } catch (error) {
        console.error("Error in useDashboardData:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    retry: 1, // Only retry once on failure
  });
};