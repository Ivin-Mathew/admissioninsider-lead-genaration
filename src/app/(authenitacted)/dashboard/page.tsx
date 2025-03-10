"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import ApplicationFormModal from "@/components/applications/ApplicationModal";
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
import ApplicationDataTable from "@/components/applications/ApplicationDataTable";
import { Application } from "@/types/application";
import { User } from "next-auth";

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

export default function Dashboard() {
  const { user, isAdmin, isCounselor, isAgent } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    newApplications: 0,
    inProgressApplications: 0,
    completedApplications: 0,
    rejectedApplications: 0,
    totalCounselors: 0,
    totalAgents: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [applicationData, setApplicationData] = useState<Application[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);
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

        const { count: totalApplications, error: totalError } =
          await applicationsQuery;

        if (totalError) throw totalError;

        const { data: statusCounts, error: statusError } = await supabase.rpc(
          "get_application_status_counts",
          isAgent
            ? { agent_filter: user.id }
            : isCounselor
            ? { counselor_filter: user.id }
            : { agent_filter: null, counselor_filter: null }
        );

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

          const { data: fallbackStatusCounts, error: fallbackError } =
            await statusQuery;

          if (fallbackError) throw fallbackError;

          let newCount = 0;
          let inProgressCount = 0;
          let completedCount = 0;
          let rejectedCount = 0;

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

          let totalCounselors = 0;
          let totalAgents = 0;

          if (isAdmin) {
            const { count: counselorCount, error: counselorError } =
              await supabase
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

          setStats({
            totalApplications: totalApplications || 0,
            newApplications: newCount,
            inProgressApplications: inProgressCount,
            completedApplications: completedCount,
            rejectedApplications: rejectedCount,
            totalCounselors,
            totalAgents,
          });
        } else {
          let newCount = 0;
          let inProgressCount = 0;
          let completedCount = 0;
          let rejectedCount = 0;

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

          let totalCounselors = 0;
          let totalAgents = 0;

          if (isAdmin) {
            const { count: counselorCount, error: counselorError } =
              await supabase
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

          setStats({
            totalApplications: totalApplications || 0,
            newApplications: newCount,
            inProgressApplications: inProgressCount,
            completedApplications: completedCount,
            rejectedApplications: rejectedCount,
            totalCounselors,
            totalAgents,
          });
        }

        // Fetch application data for the table
        let applicationQuery = supabase.from("applications").select("*");

        if (isAgent) {
          applicationQuery = applicationQuery.eq("agent_id", user.id);
        }

        if (isCounselor) {
          applicationQuery = applicationQuery.eq("counselor_id", user.id);
        }

        const { data: applications, error: applicationError } =
          await applicationQuery;

        if (applicationError) throw applicationError;

        setApplicationData(applications || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, isAdmin, isCounselor, isAgent]);

  return (
    <RoleBasedLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <ApplicationFormModal />
        </div>
        {loading ? (
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
                    {stats.totalApplications}
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
                    {stats.newApplications}
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
                    {stats.inProgressApplications}
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
                    {stats.completedApplications}
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
                      {stats.totalCounselors}
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
                      {stats.totalAgents}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
        <ApplicationDataTable
          userType={user?.role ?? "admin"}
          applicationData={applicationData}
        />
      </div>
    </RoleBasedLayout>
  );
}
