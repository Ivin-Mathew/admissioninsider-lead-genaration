"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit } from "lucide-react";
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
import { supabase } from "@/lib/supabase";
import { Application, ApplicationStatus } from "@/types/application";
import { toast } from "sonner";
import ApplicationNotes from "@/components/applications/ApplicationNotes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ApplicationsPage() {
  const { user, isAdmin, isCounselor } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch applications based on user role
  const fetchApplications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("applications")
        .select(`
          *,
          profiles!counselor_id(id, role)
        `);

      // If counselor, only show their assigned applications
      if (isCounselor) {
        query = query.eq("counselor_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Get counselor names for applications
      const applicationsWithNames = await Promise.all(
        data.map(async (app) => {
          let counselor_name = null;
          if (app.counselor_id) {
            const { data: userData } = await supabase.auth.admin.getUserById(app.counselor_id);
            counselor_name = userData?.user?.email || "Unknown Counselor";
          }
          return {
            ...app,
            counselor_name,
          };
        })
      );

      setApplications(applicationsWithNames);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({
          application_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("application_id", applicationId);

      if (error) throw error;

      // Update local state
      setApplications(apps =>
        apps.map(app =>
          app.application_id === applicationId
            ? { ...app, application_status: newStatus }
            : app
        )
      );

      toast.success("Application status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user, isAdmin, isCounselor]);

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.STARTED:
        return "bg-blue-100 text-blue-800";
      case ApplicationStatus.PROCESSING:
        return "bg-yellow-100 text-yellow-800";
      case ApplicationStatus.DOCUMENTS_SUBMITTED:
        return "bg-purple-100 text-purple-800";
      case ApplicationStatus.PAYMENTS_PROCESSED:
        return "bg-orange-100 text-orange-800";
      case ApplicationStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: ApplicationStatus) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

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
          <h1 className="text-2xl font-bold">
            {isAdmin ? "All Applications" : "My Applications"}
          </h1>
          {isCounselor && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          )}
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No applications found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <Card key={application.application_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {application.client_name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(application.application_status)}>
                        {formatStatus(application.application_status)}
                      </Badge>
                      {isAdmin && application.counselor_name && (
                        <Badge variant="outline">
                          {application.counselor_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{application.client_email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{application.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Application Details - {application.client_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Application details would go here */}
                            <ApplicationNotes applicationId={application.application_id} />
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {isCounselor && (
                        <Select
                          value={application.application_status}
                          onValueChange={(value) => 
                            updateApplicationStatus(application.application_id, value as ApplicationStatus)
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ApplicationStatus.STARTED}>Started</SelectItem>
                            <SelectItem value={ApplicationStatus.PROCESSING}>Processing</SelectItem>
                            <SelectItem value={ApplicationStatus.DOCUMENTS_SUBMITTED}>Documents Submitted</SelectItem>
                            <SelectItem value={ApplicationStatus.PAYMENTS_PROCESSED}>Payments Processed</SelectItem>
                            <SelectItem value={ApplicationStatus.COMPLETED}>Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}
