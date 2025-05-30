// types/application.ts

// Enum for education level options
export enum EducationLevel {
    SCIENCE = 'science',
    COMMERCE = 'commerce',
    ARTS = 'arts',
    VOCATIONAL = 'vocational',
    OTHER = 'other'
  }

  // Enum for application status
  export enum ApplicationStatus {
    STARTED = 'started',
    PROCESSING = 'processing',
    DOCUMENTS_SUBMITTED = 'documents_submitted',
    PAYMENTS_PROCESSED = 'payments_processed',
    COMPLETED = 'completed'
  }

  // Interface for the application form data
  export interface ApplicationFormData {
    clientName: string;
    clientEmail?: string;
    phoneNumber: string;
    completedCourse: EducationLevel;
    plannedCourses: string[];
    preferredLocations: string[];
    preferredColleges?: string[];
    counselorId?: string;
  }

  // Interface for the application database record
  export interface Application {
    application_id: string; // UUID
    client_name: string;
    client_email: string | null;
    phone_number: string;
    completed_course: EducationLevel;
    planned_courses: string[];
    preferred_locations: string[];
    preferred_colleges: string[] | null;
    counselor_id: string | null;
    counselor_name: string | null;
    application_status: ApplicationStatus;
    notes: any[] | null; // JSONB array for notes
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
  }

  // Extended Application type with name fields
export interface ExtendedApplication extends Application {
  counselor_name: string | null;
}

  // Type for server response when creating a new application
  export type ApplicationCreateResponse = {
    data: Application | null;
    error: {
      message: string;
      code?: string;
    } | null;
  }

  // Type for application status update
  export interface ApplicationStatusUpdate {
    application_id: string;
    application_status: ApplicationStatus;
  }

  // Type for application with additional frontend metadata
  export interface ApplicationWithMeta extends Application {
    isNew?: boolean;
    statusChangedAt?: string;
  }

  // Type for application filtering/sorting options
  export interface ApplicationListOptions {
    status?: ApplicationStatus;
    sortBy?: 'created_at' | 'updated_at' | 'client_name';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }

  // Type for paginated applications response
  export interface PaginatedApplications {
    data: Application[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }