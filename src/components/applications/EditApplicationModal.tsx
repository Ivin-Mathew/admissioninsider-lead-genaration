import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Application, ApplicationStatus } from "@/types/application";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface EditApplicationModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedApplication: Application) => void;
}

interface UserOption {
  id: string;
  role: string;
  email?: string;
}

const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  application,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [counselors, setCounselors] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const form = useForm({
    defaultValues: {
      client_name: application.client_name,
      client_email: application.client_email || "",
      phone_number: application.phone_number,
      application_status: application.application_status,
      counselor_id: application.counselor_id || "none",
    },
  });

  // Fetch counselors when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();

      // Reset form with current application values
      form.reset({
        client_name: application.client_name,
        client_email: application.client_email || "",
        phone_number: application.phone_number,
        application_status: application.application_status,
        counselor_id: application.counselor_id || "none",
      });
    }
  }, [isOpen, application, form]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      // Fetch counselors with email information
      const { data: counselorsData, error: counselorsError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("role", "counselor");

      if (counselorsError) {
        console.error("Error fetching counselors:", counselorsError);
        throw new Error(counselorsError.message);
      }

      // Get email information for each counselor from auth.users
      if (counselorsData) {
        const counselorsWithEmails = await Promise.all(
          counselorsData.map(async (counselor) => {
            try {
              const { data: userData } = await supabase.auth.admin.getUserById(counselor.id);
              return {
                id: counselor.id,
                role: counselor.role || "counselor",
                email: userData?.user?.email || "Unknown",
              };
            } catch (error) {
              console.error("Error fetching user email:", error);
              return {
                id: counselor.id,
                role: counselor.role || "counselor",
                email: "Unknown",
              };
            }
          })
        );
        setCounselors(counselorsWithEmails);
      } else {
        setCounselors([]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setFetchError(error.message || "Failed to load users");
      toast.error("Failed to load users: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Handle none value to be null
      const counselor_id = values.counselor_id === "none" ? null : values.counselor_id;

      // Update application in Supabase
      const { data, error } = await supabase
        .from("applications")
        .update({
          client_name: values.client_name,
          client_email: values.client_email,
          phone_number: values.phone_number,
          application_status: values.application_status,
          counselor_id: counselor_id,
          updated_at: new Date().toISOString(),
        })
        .eq("application_id", application.application_id)
        .select()
        .single();

      if (error) throw error;

      // Get counselor display information
      let counselor_name = null;
      if (counselor_id) {
        const foundCounselor = counselors.find(counselor => counselor.id === counselor_id);
        counselor_name = foundCounselor ? (foundCounselor.email || "Counselor") : "Unknown Counselor";
      }

      // Create updated application with names included
      const updatedApplication = {
        ...data,
        counselor_name
      };

      toast.success("Application updated successfully");
      onUpdate(updatedApplication);
      onClose();
    } catch (error: any) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error loading data: {fetchError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="application_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ApplicationStatus.STARTED}>Started</SelectItem>
                      <SelectItem value={ApplicationStatus.PROCESSING}>Processing</SelectItem>
                      <SelectItem value={ApplicationStatus.DOCUMENTS_SUBMITTED}>Documents Submitted</SelectItem>
                      <SelectItem value={ApplicationStatus.PAYMENTS_PROCESSED}>Payments Processed</SelectItem>
                      <SelectItem value={ApplicationStatus.COMPLETED}>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="counselor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Counselor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a counselor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {counselors.map((counselor) => (
                        <SelectItem key={counselor.id} value={counselor.id}>
                          {counselor.email || `Counselor (${counselor.id.substring(0, 6)})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditApplicationModal;