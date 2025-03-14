"use client";

import { useState, useEffect } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import ApplicationFormModal from "@/components/applications/ApplicationModal";
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
import ApplicationDataTable from "@/components/applications/ApplicationDataTable";
import { Application } from "@/types/application";
import { toast } from "sonner";
import { updateApplication } from "@/lib/applications.supabase"; // Import the new function

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { data, isLoading, error, refetch } = useDashboardData();
  const [localApplicationData, setLocalApplicationData] = useState<Application[]>([]);
  const [statsData, setStatsData] = useState({
    totalApplications: 0,
    newApplications: 0,
    inProgressApplications: 0,
    completedApplications: 0,
    rejectedApplications: 0,
    totalCounselors: 0,
    totalAgents: 0,
  });

  // Update local state when the remote data changes
  useEffect(() => {
    if (data) {
      setLocalApplicationData(data.applicationData || []);
      setStatsData({
        totalApplications: data.stats?.totalApplications ?? 0,
        newApplications: data.stats?.newApplications ?? 0,
        inProgressApplications: data.stats?.inProgressApplications ?? 0,
        completedApplications: data.stats?.completedApplications ?? 0,
        rejectedApplications: data.stats?.rejectedApplications ?? 0,
        totalCounselors: data.stats?.totalCounselors ?? 0,
        totalAgents: data.stats?.totalAgents ?? 0,
      });
    }
  }, [data]);

  // Handle application updates
  const handleApplicationUpdate = async (updatedApplication: Application) => {
    try {
      // Update the local state first for immediate UI feedback
      setLocalApplicationData(prevData => 
        prevData.map(app => 
          app.application_id === updatedApplication.application_id 
            ? updatedApplication 
            : app
        )
      );
      
      // Find the original application to check if status changed
      const originalApp = localApplicationData.find(
        app => app.application_id === updatedApplication.application_id
      );
      
      // Update stats based on changes
      if (originalApp && updatedApplication.application_status !== originalApp.application_status) {
        // Refetch the dashboard data to get updated stats
        await refetch();
      }
      
      toast.success("Application updated successfully");
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
      
      // Revert local state to match server state on error
      refetch();
    }
  };

  // Handle new application creation
  const handleApplicationCreated = async () => {
    await refetch();
    toast.success("Application created successfully");
  };

  if (error) {
    console.error("Error loading dashboard data:", error);
    toast.error("Failed to load dashboard data");
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <ApplicationFormModal onApplicationCreated={handleApplicationCreated} />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Applications
                  </CardTitle>
                  <FileText className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsData.totalApplications}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">New</CardTitle>
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsData.newApplications}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsData.inProgressApplications}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsData.completedApplications}
                  </div>
                </CardContent>
              </Card>
            </div>

            {isAdmin && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Counselors
                    </CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsData.totalCounselors}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Agents
                    </CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsData.totalAgents}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
        <ApplicationDataTable
          userType={user?.role ?? "agent"}
          applicationData={localApplicationData}
          onApplicationUpdated={handleApplicationUpdate}
        />
      </div>
    </RoleBasedLayout>
  );
}