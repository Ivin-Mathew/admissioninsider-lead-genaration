import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ApplicationStatus } from "@/types/application";
import { queryKeys, logQueryInfo, logMutationInfo } from "@/lib/query-utils";

export interface CounselorStats {
  id: string;
  username: string;
  totalApplications: number;
  startedApplications: number;
  processingApplications: number;
  documentsSubmittedApplications: number;
  paymentsProcessedApplications: number;
  completedApplications: number;
}

export interface CounselorOption {
  id: string;
  role: string;
  username: string;
}

export interface CreateCounselorData {
  username: string;
  email: string;
  password: string;
}

// Fetch all counselors with their statistics
const fetchCounselorsWithStats = async (): Promise<CounselorStats[]> => {
  // Get all counselors from profiles with usernames
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, role, username")
    .eq("role", "counselor");

  if (profilesError) throw profilesError;

  // Get application stats for each counselor
  const counselorStats = await Promise.all(
    profiles.map(async (profile) => {
      // Get application statistics
      const { data: applications, error: appsError } = await supabase
        .from("applications")
        .select("application_status")
        .eq("counselor_id", profile.id);

      if (appsError) {
        console.error("Error fetching applications for counselor:", appsError);
        return {
          id: profile.id,
          username: profile.username || "Unknown",
          totalApplications: 0,
          startedApplications: 0,
          processingApplications: 0,
          documentsSubmittedApplications: 0,
          paymentsProcessedApplications: 0,
          completedApplications: 0,
        };
      }

      const stats = {
        id: profile.id,
        username: profile.username || "Unknown",
        totalApplications: applications.length,
        startedApplications: applications.filter(app => app.application_status === ApplicationStatus.STARTED).length,
        processingApplications: applications.filter(app => app.application_status === ApplicationStatus.PROCESSING).length,
        documentsSubmittedApplications: applications.filter(app => app.application_status === ApplicationStatus.DOCUMENTS_SUBMITTED).length,
        paymentsProcessedApplications: applications.filter(app => app.application_status === ApplicationStatus.PAYMENTS_PROCESSED).length,
        completedApplications: applications.filter(app => app.application_status === ApplicationStatus.COMPLETED).length,
      };

      return stats;
    })
  );

  return counselorStats;
};

// Fetch counselors for dropdown options
const fetchCounselorOptions = async (): Promise<CounselorOption[]> => {
  // Fetch counselors with usernames directly from profiles
  const { data: counselorsData, error: counselorsError } = await supabase
    .from("profiles")
    .select("id, role, username")
    .eq("role", "counselor");

  if (counselorsError) throw counselorsError;

  if (!counselorsData) return [];

  // Map to the expected format
  const counselorsWithUsernames = counselorsData.map((counselor) => ({
    id: counselor.id,
    role: counselor.role || "counselor",
    username: counselor.username || "Unknown",
  }));

  return counselorsWithUsernames;
};

// Create a new counselor
const createCounselor = async (data: CreateCounselorData) => {
  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.username,
        role: "counselor",
      },
    },
  });

  if (authError) throw authError;

  if (authData.user) {
    // Create or update the profile with username
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        role: "counselor",
        username: data.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;
  }

  return authData;
};

// Hook to fetch counselors with statistics
export const useCounselorsWithStats = () => {
  return useQuery({
    queryKey: queryKeys.counselors.stats(),
    queryFn: async () => {
      const data = await fetchCounselorsWithStats();
      logQueryInfo(queryKeys.counselors.stats(), data, 'success');
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });
};

// Hook to fetch counselor options for dropdowns
export const useCounselorOptions = () => {
  return useQuery({
    queryKey: queryKeys.counselors.options(),
    queryFn: async () => {
      const data = await fetchCounselorOptions();
      logQueryInfo(queryKeys.counselors.options(), data, 'success');
      return data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });
};

// Hook to create a new counselor
export const useCreateCounselor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCounselorData) => {
      logMutationInfo('createCounselor', data, 'loading');
      const result = await createCounselor(data);
      logMutationInfo('createCounselor', data, 'success');
      return result;
    },
    onSuccess: () => {
      // Invalidate counselor queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.counselors.all });
      toast.success("Counselor created successfully");
    },
    onError: (error: any, variables) => {
      logMutationInfo('createCounselor', variables, 'error');
      console.error("Error creating counselor:", error);
      toast.error("Failed to create counselor: " + (error.message || "Unknown error"));
    },
  });
};
