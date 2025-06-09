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
import { useApplicationMutation } from "@/hooks/useApplications";
import {
  useApplicationsWithCounselors,
  useUpdateApplicationStatus,
} from "@/hooks/useApplicationsData";
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
import Papa from "papaparse";
import { ApplicationFormData } from "@/types/application";
import { create } from "domain";

export default function ApplicationsPage() {
  const { isAdmin, isCounselor } = useAuth();
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useApplicationsWithCounselors();
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });
  const { createApplication } = useApplicationMutation();

  // CSV Upload and Processing Function
  const handleCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset upload results
    setUploadResults({ success: 0, failed: 0, errors: [] });
    setIsUploading(true);

    try {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: async (results) => {
          console.log("Parsed CSV data:", results.data);

          let successCount = 0;
          let failedCount = 0;
          const errors: string[] = [];

          // Process each row
          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i] as any;

            try {
              // Validate required fields
              if (!row.client_name || !row.phone_number) {
                errors.push(
                  `Row ${
                    i + 1
                  }: Missing required fields (client_name or phone_number)`
                );
                failedCount++;
                continue;
              }

              // Map CSV columns to ApplicationFormData
              const applicationData: ApplicationFormData = {
                clientName: row.client_name?.toString().trim() || "",
                clientEmail: row.client_email?.toString().trim() || "",
                phoneNumber: row.phone_number?.toString().trim() || "",
                completedCourse: row.completed_course?.toString().trim() || "",
                plannedCourses: parseArrayField(row.planned_courses),
                preferredLocations: parseArrayField(row.preferred_locations),
                preferredColleges: parseArrayField(row.preferred_colleges),
                counselorId: row.counselor_id?.toString().trim() || null,
              };

              // Submit application
              const response = createApplication(applicationData);
              successCount++;
            } catch (error) {
              console.error(`Error processing row ${i + 1}:`, error);
              errors.push(
                `Row ${i + 1}: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
              failedCount++;
            }
          }

          // Update results
          setUploadResults({
            success: successCount,
            failed: failedCount,
            errors,
          });

          // Refresh the applications list
          refetch();
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          setUploadResults({
            success: 0,
            failed: 0,
            errors: [`CSV parsing failed: ${error.message}`],
          });
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      setUploadResults({
        success: 0,
        failed: 0,
        errors: [
          `File upload failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ],
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      event.target.value = "";
    }
  };

  // Helper function to parse array fields from CSV
  const parseArrayField = (value: any): string[] => {
    if (!value) return [];

    if (typeof value === "string") {
      // Handle comma-separated values or JSON array strings
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          return JSON.parse(value);
        } catch {
          // If JSON parsing fails, treat as comma-separated
          return value
            .slice(1, -1)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      } else {
        // Comma-separated values
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    if (Array.isArray(value)) {
      return value.map((item) => item?.toString().trim()).filter(Boolean);
    }

    return [];
  };

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
          <p className="text-red-500">
            Error loading applications: {error.message}
          </p>
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
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
          <div>
            {(isAdmin || isCounselor) && (
              <div className="flex items-center gap-2">
                {isCounselor && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Application
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsCSVModalOpen(true)}
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload CSV
                </Button>
              </div>
            )}
          </div>
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
                      <Badge
                        className={getStatusColor(
                          application.application_status
                        )}
                      >
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
                      <p className="font-medium">
                        {application.client_email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <div className="flex gap-5 items-center">
                        <p className="font-medium">
                          {application.phone_number}
                        </p>
                        <Button>
                          <a href={`tel:${application.phone_number}`}>Call</a>
                        </Button>
                      </div>
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
                            <DialogTitle>
                              Application Details - {application.client_name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Application details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Client Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="font-medium">Name:</span>{" "}
                                    {application.client_name}
                                  </p>
                                  <p>
                                    <span className="font-medium">Email:</span>{" "}
                                    {application.client_email || "N/A"}
                                  </p>
                                  <p>
                                    <span className="font-medium">Phone:</span>{" "}
                                    {application.phone_number}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Completed Course:
                                    </span>{" "}
                                    {application.completed_course}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Preferences
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="font-medium">
                                      Planned Courses:
                                    </span>{" "}
                                    {application.planned_courses?.join(", ")}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Preferred Locations:
                                    </span>{" "}
                                    {application.preferred_locations?.join(
                                      ", "
                                    )}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Preferred Colleges:
                                    </span>{" "}
                                    {application.preferred_colleges?.join(
                                      ", "
                                    ) || "N/A"}
                                  </p>
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
                            updateStatus({
                              applicationId: application.application_id,
                              newStatus: value as ApplicationStatus,
                            })
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ApplicationStatus.STARTED}>
                              Started
                            </SelectItem>
                            <SelectItem value={ApplicationStatus.PROCESSING}>
                              Processing
                            </SelectItem>
                            <SelectItem
                              value={ApplicationStatus.DOCUMENTS_SUBMITTED}
                            >
                              Documents Submitted
                            </SelectItem>
                            <SelectItem
                              value={ApplicationStatus.PAYMENTS_PROCESSED}
                            >
                              Payments Processed
                            </SelectItem>
                            <SelectItem value={ApplicationStatus.COMPLETED}>
                              Completed
                            </SelectItem>
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
        <Dialog open={isCSVModalOpen} onOpenChange={setIsCSVModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Applications from CSV</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="csv-upload-modal"
                />

                <div className="space-y-4">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      />
                    </svg>
                  </div>

                  <div>
                    <label
                      htmlFor="csv-upload-modal"
                      className={`cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isUploading
                          ? "opacity-50 cursor-not-allowed bg-gray-400"
                          : ""
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-5 w-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Select CSV File
                        </>
                      )}
                    </label>
                  </div>

                  <p className="text-sm text-gray-500">
                    Upload a CSV file containing application data
                  </p>
                </div>
              </div>

              {/* Upload Results */}
              {(uploadResults.success > 0 || uploadResults.failed > 0) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Upload Results</h4>
                  <div className="space-y-2">
                    {uploadResults.success > 0 && (
                      <div className="flex items-center text-green-600">
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Successfully uploaded: {uploadResults.success}{" "}
                        applications
                      </div>
                    )}

                    {uploadResults.failed > 0 && (
                      <div className="flex items-center text-red-600">
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Failed: {uploadResults.failed} applications
                      </div>
                    )}

                    {uploadResults.errors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-red-600 mb-2">
                          Errors:
                        </h5>
                        <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded p-3 text-sm">
                          {uploadResults.errors.map((error, index) => (
                            <p key={index} className="text-red-700 mb-1">
                              {error}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sample CSV Download */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Create and download sample CSV
                    const sampleCSV = `client_name,client_email,phone_number,completed_course,planned_courses,preferred_locations,preferred_colleges,counselor_id
John Doe,john@example.com,+1234567890,High School,"Engineering,Computer Science","New York,California","MIT,Stanford",
Jane Smith,jane@example.com,+0987654321,Bachelor's,"Medicine,Biology","Texas,Florida","Harvard,Johns Hopkins",`;

                    const blob = new Blob([sampleCSV], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "sample_applications.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  Download Sample CSV
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCSVModalOpen(false);
                      setUploadResults({ success: 0, failed: 0, errors: [] });
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
