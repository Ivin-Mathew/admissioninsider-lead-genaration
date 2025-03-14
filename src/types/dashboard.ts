export interface DashboardStats {
  totalApplications: number;
  newApplications: number;
  inProgressApplications: number;
  completedApplications: number;
  rejectedApplications: number;
  totalCounselors: number;
  totalAgents: number;
}

export interface StatusCount {
  application_status: string;
  count: string;
}
