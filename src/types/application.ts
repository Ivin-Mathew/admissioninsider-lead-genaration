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
    PENDING = 'pending',
    REVIEW = 'review',
    INTERVIEW = 'interview',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    DEFERRED = 'deferred'
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
    agentId?: string;
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
    agent_id: string | null;
    counselor_id: string | null;
    application_status: ApplicationStatus;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
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