import { ApplicationFormData } from "@/types/application";
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
        application_status: "pending", // Default status for new applications
        agent_id: applicationData.agentId || null, // Default to null if not provided
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
