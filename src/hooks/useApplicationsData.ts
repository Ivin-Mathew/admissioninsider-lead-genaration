import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Application, ApplicationStatus } from "@/types/application";
import { useAuth } from "@/context/AuthContext";

export interface ApplicationWithCounselorName extends Application {
  counselor_name: string | null;
}

export interface UpdateApplicationData {
  application_id: string;
  client_name?: string;
  client_email?: string;
  phone_number?: string;
  application_status?: ApplicationStatus;
  counselor_id?: string | null;
}

// Fetch applications with counselor names
const fetchApplicationsWithCounselors = async (
  userId: string,
  _isAdmin: boolean, // Prefixed with underscore to indicate intentionally unused
  isCounselor: boolean
): Promise<ApplicationWithCounselorName[]> => {
  let query = supabase
    .from("applications")
    .select("*");

  // If counselor, only show their assigned applications
  if (isCounselor) {
    query = query.eq("counselor_id", userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;

  if (!data) return [];

  // Get counselor usernames for applications that have counselor_id
  const applicationsWithNames = await Promise.all(
    data.map(async (app) => {
      let counselor_name = null;
      if (app.counselor_id) {
        try {
          // Get username from profiles table
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", app.counselor_id)
            .single();

          if (!profileError && profile) {
            counselor_name = profile.username || "Unknown Counselor";
          }
        } catch (error) {
          console.error("Error fetching counselor username:", error);
          counselor_name = "Unknown Counselor";
        }
      }
      return {
        ...app,
        counselor_name,
      };
    })
  );

  return applicationsWithNames;
};

// Update application
const updateApplication = async (data: UpdateApplicationData): Promise<ApplicationWithCounselorName> => {
  const { application_id, ...updateData } = data;

  // Handle none value to be null for counselor_id
  if (updateData.counselor_id === "none") {
    updateData.counselor_id = null;
  }

  // Update application in Supabase
  const { data: updatedApp, error } = await supabase
    .from("applications")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("application_id", application_id)
    .select()
    .single();

  if (error) throw error;

  // Get counselor username if counselor_id exists
  let counselor_name = null;
  if (updatedApp.counselor_id) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", updatedApp.counselor_id)
        .single();

      if (!profileError && profile) {
        counselor_name = profile.username || "Unknown Counselor";
      }
    } catch (error) {
      console.error("Error fetching counselor username:", error);
      counselor_name = "Unknown Counselor";
    }
  }

  return {
    ...updatedApp,
    counselor_name,
  };
};

// Update application status only
const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
  const { error } = await supabase
    .from("applications")
    .update({
      application_status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("application_id", applicationId);

  if (error) throw error;
};

// Hook to fetch applications with counselor information
export const useApplicationsWithCounselors = () => {
  const { user, isAdmin, isCounselor } = useAuth();

  return useQuery({
    queryKey: ["applications", "with-counselors", user?.id, isAdmin, isCounselor],
    queryFn: () => {
      if (!user) throw new Error("User not authenticated");
      return fetchApplicationsWithCounselors(user.id, isAdmin, isCounselor);
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    retry: 1,
  });
};

// Hook to update an application
export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApplication,
    onSuccess: (updatedApplication) => {
      // Update the applications cache with the new data
      queryClient.setQueryData(
        ["applications", "with-counselors"],
        (oldData: ApplicationWithCounselorName[] | undefined) => {
          if (!oldData) return [updatedApplication];
          return oldData.map(app =>
            app.application_id === updatedApplication.application_id
              ? updatedApplication
              : app
          );
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["counselors", "stats"] });

      toast.success("Application updated successfully");
    },
    onError: (error: any) => {
      console.error("Error updating application:", error);
      toast.error("Failed to update application: " + (error.message || "Unknown error"));
    },
  });
};

// Hook to update application status
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, newStatus }: { applicationId: string; newStatus: ApplicationStatus }) =>
      updateApplicationStatus(applicationId, newStatus),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["counselors", "stats"] });

      toast.success("Application status updated");
    },
    onError: (error: any) => {
      console.error("Error updating status:", error);
      toast.error("Failed to update status: " + (error.message || "Unknown error"));
    },
  });
};
