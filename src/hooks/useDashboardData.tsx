import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboardData } from "@/lib/applications.supabase";


export const useDashboardData = () => {
  const { user, isAdmin, isCounselor, isAgent } = useAuth();

  return useQuery({
    queryKey: ["dashboardData", user?.id, isAdmin, isCounselor, isAgent],
    queryFn: () => fetchDashboardData(user, isAdmin, isCounselor, isAgent),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });
};