import { Application, ApplicationFormData, ExtendedApplication } from "@/types/application";
import { StatusCount } from "@/types/dashboard";
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
 * Submits an application to the "applications" table in Supabase.
 *
 * @param applicationData - The application form data to be inserted.
 * @returns The newly created application record.
 * @throws An error if the insertion fails.
 */
export async function submitApplication(applicationData: ApplicationFormData) {
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        client_name: applicationData.clientName,
        client_email: applicationData.clientEmail || null, // Default to null if empty
        phone_number: applicationData.phoneNumber,
        completed_course: applicationData.completedCourse,
        planned_courses: applicationData.plannedCourses,
        preferred_locations: applicationData.preferredLocations,
        preferred_colleges: applicationData.preferredColleges || [], // Default to empty array if not provided
        application_status: "started", // Default status for new applications
        counselor_id: applicationData.counselorId || null, // Default to null if not provided
        notes: [], // Initialize with empty notes array
      },
    ])
    .select(); // Fetch the inserted record

  // Log the response data (useful for debugging)
  console.log(data);

  // Handle potential errors
  if (error) {
    throw new Error(error.message);
  }

  return data[0]; // Return the newly created application record
}




export const fetchDashboardData = async (user: any, isAdmin: boolean, isCounselor: boolean, isAgent: boolean) => {
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

/**
 * Updates an application in the database
 * @param applicationId The ID of the application to update
 * @param updates The fields to update
 * @returns The updated application
 */
export async function updateApplication(applicationId: string, updates: Partial<Application>) {
  try {
    const { data, error } = await supabase
      .from("applications")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("application_id", applicationId)
      .select("*")
      .single();

    if (error) throw error;

    // If the application has an agent or counselor, fetch their names
    let extendedData: ExtendedApplication = { ...data };

    if (data.agent_id || data.counselor_id) {
      const idsToFetch = [
        ...(data.agent_id ? [data.agent_id] : []),
        ...(data.counselor_id ? [data.counselor_id] : []),
      ];

      if (idsToFetch.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", idsToFetch);

        if (profileError) throw profileError;

        const profileMap = new Map();
        profiles?.forEach(profile => {
          profileMap.set(profile.id, { name: profile.name || profile.email || "Unknown" });
        });

        extendedData.agent_name = data.agent_id && profileMap.get(data.agent_id)
          ? profileMap.get(data.agent_id).name
          : 'Not Assigned';

        extendedData.counselor_name = data.counselor_id && profileMap.get(data.counselor_id)
          ? profileMap.get(data.counselor_id).name
          : 'Not Assigned';
      }
    }

    return extendedData;
  } catch (error) {
    console.error("Error updating application:", error);
    throw error;
  }
}