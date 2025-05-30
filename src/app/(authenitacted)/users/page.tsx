"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, FileText, CheckCircle, Clock } from "lucide-react";
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ApplicationStatus } from "@/types/application";

interface CounselorStats {
  id: string;
  email: string;
  totalApplications: number;
  startedApplications: number;
  processingApplications: number;
  documentsSubmittedApplications: number;
  paymentsProcessedApplications: number;
  completedApplications: number;
}

export default function UsersPage() {
  const { user, isAdmin } = useAuth();
  const [counselors, setCounselors] = useState<CounselorStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch counselors and their statistics
  const fetchCounselors = async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    try {
      // Get all counselors from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("role", "counselor");

      if (profilesError) throw profilesError;

      // Get user details and application stats for each counselor
      const counselorStats = await Promise.all(
        profiles.map(async (profile) => {
          // Get user email from auth
          const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
          const email = userData?.user?.email || "Unknown";

          // Get application statistics
          const { data: applications, error: appsError } = await supabase
            .from("applications")
            .select("application_status")
            .eq("counselor_id", profile.id);

          if (appsError) {
            console.error("Error fetching applications for counselor:", appsError);
            return {
              id: profile.id,
              email,
              totalApplications: 0,
              startedApplications: 0,
              processingApplications: 0,
              documentsSubmittedApplications: 0,
              paymentsProcessedApplications: 0,
              completedApplications: 0,
            };
          }

          // Calculate statistics
          const stats = {
            id: profile.id,
            email,
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

      setCounselors(counselorStats);
    } catch (error) {
      console.error("Error fetching counselors:", error);
      toast.error("Failed to load counselors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCounselors();
    }
  }, [isAdmin]);

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Access denied. Admin privileges required.</p>
        </div>
      </RoleBasedLayout>
    );
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Counselors</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Counselor
          </Button>
        </div>

        {counselors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No counselors found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {counselors.map((counselor) => (
              <Card key={counselor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {counselor.email}
                    </CardTitle>
                    <Badge variant="secondary">Counselor</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {counselor.totalApplications}
                      </p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {counselor.startedApplications}
                      </p>
                      <p className="text-sm text-gray-500">Started</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {counselor.processingApplications}
                      </p>
                      <p className="text-sm text-gray-500">Processing</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {counselor.documentsSubmittedApplications}
                      </p>
                      <p className="text-sm text-gray-500">Docs Submitted</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {counselor.paymentsProcessedApplications}
                      </p>
                      <p className="text-sm text-gray-500">Payments</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {counselor.completedApplications}
                      </p>
                      <p className="text-sm text-gray-500">Completed</p>
                    </div>
                  </div>
                  
                  {counselor.totalApplications > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Completion Rate:</span>
                        <span className="font-medium">
                          {Math.round((counselor.completedApplications / counselor.totalApplications) * 100)}%
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(counselor.completedApplications / counselor.totalApplications) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
