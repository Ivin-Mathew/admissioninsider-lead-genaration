import { ApplicationFormData } from '@/types/application';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function submitApplication(applicationData:ApplicationFormData) {

    const { data, error } = await supabase
      .from('applications')
      .insert([
        {
          client_name: applicationData.clientName,
          client_email: applicationData.clientEmail || null,
          phone_number: applicationData.phoneNumber,
          completed_course: applicationData.completedCourse,
          planned_courses: applicationData.plannedCourses,
          preferred_locations: applicationData.preferredLocations,
          preferred_colleges: applicationData.preferredColleges || [],
          application_status: 'pending',
          agent_id: applicationData.agentId || null,
        }
      ])
      .select()
    console.log(data)
    if (error) {
      throw new Error(error.message)
    }
  
    return data[0]
  }