import React, { useEffect } from "react";
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
import { useCounselorOptions } from "@/hooks/useCounselors";
import { useUpdateApplication } from "@/hooks/useApplicationsData";

interface EditApplicationModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  application,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { data: counselors = [], isLoading: counselorsLoading } = useCounselorOptions();
  const { mutate: updateApplication, isPending: isUpdating } = useUpdateApplication();

  const form = useForm({
    defaultValues: {
      client_name: application.client_name,
      client_email: application.client_email || "",
      phone_number: application.phone_number,
      application_status: application.application_status,
      counselor_id: application.counselor_id || "none",
    },
  });

  // Reset form when modal opens or application changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        client_name: application.client_name,
        client_email: application.client_email || "",
        phone_number: application.phone_number,
        application_status: application.application_status,
        counselor_id: application.counselor_id || "none",
      });
    }
  }, [isOpen, application, form]);

  const onSubmit = (values: any) => {
    updateApplication({
      application_id: application.application_id,
      client_name: values.client_name,
      client_email: values.client_email,
      phone_number: values.phone_number,
      application_status: values.application_status,
      counselor_id: values.counselor_id,
    }, {
      onSuccess: () => {
        onUpdate();
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>

        {counselorsLoading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
            Loading counselors...
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
                          {counselor.username || `Counselor (${counselor.id.substring(0, 6)})`}
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
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditApplicationModal;