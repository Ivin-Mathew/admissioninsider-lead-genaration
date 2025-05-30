"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit } from "lucide-react";
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
import { ApplicationStatus } from "@/types/application";
import ApplicationNotes from "@/components/applications/ApplicationNotes";
import EditApplicationModal from "@/components/applications/EditApplicationModal";
import { useApplicationsWithCounselors, useUpdateApplicationStatus } from "@/hooks/useApplicationsData";
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
  const { isAdmin, isCounselor } = useAuth();
  const { data: applications = [], isLoading, error, refetch } = useApplicationsWithCounselors();
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handle application update from edit modal
  const handleApplicationUpdate = () => {
    // Refresh applications data
    refetch();
  };

  // Handle error display
  if (error) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading applications: {error.message}</p>
        </div>
      </RoleBasedLayout>
    );
  }

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
                            {/* Application details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Client Information</h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">Name:</span> {application.client_name}</p>
                                  <p><span className="font-medium">Email:</span> {application.client_email || "N/A"}</p>
                                  <p><span className="font-medium">Phone:</span> {application.phone_number}</p>
                                  <p><span className="font-medium">Completed Course:</span> {application.completed_course}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Preferences</h4>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">Planned Courses:</span> {application.planned_courses?.join(", ")}</p>
                                  <p><span className="font-medium">Preferred Locations:</span> {application.preferred_locations?.join(", ")}</p>
                                  <p><span className="font-medium">Preferred Colleges:</span> {application.preferred_colleges?.join(", ") || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            <ApplicationNotes
                              applicationId={application.application_id}
                              notes={application.notes || []}
                              onNotesUpdate={refetch}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>

                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}

                      {isCounselor && (
                        <Select
                          value={application.application_status}
                          onValueChange={(value) =>
                            updateStatus({ applicationId: application.application_id, newStatus: value as ApplicationStatus })
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

      {/* Edit Modal - Only for admin */}
      {isAdmin && selectedApplication && (
        <EditApplicationModal
          application={selectedApplication}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleApplicationUpdate}
        />
      )}
    </RoleBasedLayout>
  );
}
