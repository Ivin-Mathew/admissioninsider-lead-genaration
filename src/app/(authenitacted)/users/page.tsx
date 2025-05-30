"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
import AddCounselorModal from "@/components/users/AddCounselorModal";
import { useCounselorsWithStats } from "@/hooks/useCounselors";

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const { data: counselors = [], isLoading, error, refetch } = useCounselorsWithStats();



  // Handle error display
  if (error) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading counselors: {error.message}</p>
        </div>
      </RoleBasedLayout>
    );
  }

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
          <AddCounselorModal onCounselorAdded={refetch} />
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
                      {counselor.username}
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
