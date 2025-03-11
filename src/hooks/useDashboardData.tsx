import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Application } from "@/types/application";

interface DashboardStats {
  totalApplications: number;
  newApplications: number;
  inProgressApplications: number;
  completedApplications: number;
  rejectedApplications: number;
  totalCounselors: number;
  totalAgents: number;
}

interface StatusCount {
  application_status: string;
  count: string;
}

// Extended Application type with name fields
interface ExtendedApplication extends Application {
  counselor_name?: string;
  agent_name?: string;
}

const fetchDashboardData = async (user: any, isAdmin: boolean, isCounselor: boolean, isAgent: boolean) => {
  if (!user) return { stats: {}, applicationData: [] };

  try {
    let applicationsQuery = supabase
      .from("applications")
      .select("*", { count: "exact" });

    if (isAgent) {
      applicationsQuery = applicationsQuery.eq("agent_id", user.id);
    }

    if (isCounselor) {
      applicationsQuery = applicationsQuery.eq("counselor_id", user.id);
    }

    const { count: totalApplications, error: totalError } = await applicationsQuery;

    if (totalError) throw totalError;

    const { data: statusCounts, error: statusError } = await supabase.rpc(
      "get_application_status_counts",
      isAgent
        ? { agent_filter: user.id }
        : isCounselor
        ? { counselor_filter: user.id }
        : { agent_filter: null, counselor_filter: null }
    );

    let newCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let rejectedCount = 0;
    let totalCounselors = 0;
    let totalAgents = 0;

    if (statusError) {
      console.error("Status count error:", statusError);

      let statusQuery = supabase
        .from("applications")
        .select("application_status, count(*)");

      if (isAgent) {
        statusQuery = statusQuery.eq("agent_id", user.id);
      } else if (isCounselor) {
        statusQuery = statusQuery.eq("counselor_id", user.id);
      }

      const { data: fallbackStatusCounts, error: fallbackError } = await statusQuery;

      if (fallbackError) throw fallbackError;

      fallbackStatusCounts?.forEach((item: any) => {
        if (item.application_status === "pending") {
          newCount = parseInt(item.count);
        } else if (
          ["review", "interview"].includes(item.application_status)
        ) {
          inProgressCount += parseInt(item.count);
        } else if (item.application_status === "accepted") {
          completedCount = parseInt(item.count);
        } else if (item.application_status === "rejected") {
          rejectedCount = parseInt(item.count);
        }
      });
    } else {
      statusCounts?.forEach((item: StatusCount) => {
        if (item.application_status === "pending") {
          newCount = parseInt(item.count);
        } else if (
          ["review", "interview"].includes(item.application_status)
        ) {
          inProgressCount += parseInt(item.count);
        } else if (item.application_status === "accepted") {
          completedCount = parseInt(item.count);
        } else if (item.application_status === "rejected") {
          rejectedCount = parseInt(item.count);
        }
      });
    }

    if (isAdmin) {
      const { count: counselorCount, error: counselorError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("role", "counselor");
      if (counselorError) throw counselorError;

      const { count: agentCount, error: agentError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("role", "agent");
      if (agentError) throw agentError;

      totalCounselors = counselorCount || 0;
      totalAgents = agentCount || 0;
    }

    // First get all profiles to use for lookups
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, role");

    if (profilesError) throw profilesError;

    // Create counselor and agent maps for quick lookup
    const profileMap = new Map();
    
    profiles?.forEach(profile => {
      profileMap.set(profile.id, profile.role);
    });

    // Fetch application data for the table
    let applicationQuery = supabase.from("applications").select("*");

    if (isAgent) {
      applicationQuery = applicationQuery.eq("agent_id", user.id);
    }

    if (isCounselor) {
      applicationQuery = applicationQuery.eq("counselor_id", user.id);
    }

    const { data: applications, error: applicationError } = await applicationQuery;

    if (applicationError) throw applicationError;

    // Add names to application data
    const processedApplications: ExtendedApplication[] = applications?.map((app: any) => ({
      ...app,
      counselor_name: app.counselor_id ? profileMap.get(app.counselor_id) || 'Not Found' : 'Not Assigned',
      agent_name: app.agent_id ? profileMap.get(app.agent_id) || 'Not Found' : 'Not Assigned',
    })) || [];

    return {
      stats: {
        totalApplications: totalApplications || 0,
        newApplications: newCount,
        inProgressApplications: inProgressCount,
        completedApplications: completedCount,
        rejectedApplications: rejectedCount,
        totalCounselors,
        totalAgents,
      },
      applicationData: processedApplications,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

export const useDashboardData = () => {
  const { user, isAdmin, isCounselor, isAgent } = useAuth();

  return useQuery({
    queryKey: ["dashboardData", user?.id, isAdmin, isCounselor, isAgent],
    queryFn: () => fetchDashboardData(user, isAdmin, isCounselor, isAgent),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });
};