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
  const [agents, setAgents] = useState<UserOption[]>([]);
  const [counselors, setCounselors] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const form = useForm({
    defaultValues: {
      client_name: application.client_name,
      client_email: application.client_email || "",
      phone_number: application.phone_number,
      application_status: application.application_status,
      agent_id: application.agent_id || "none",
      counselor_id: application.counselor_id || "none",
    },
  });

  // Fetch agents and counselors when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      
      // Reset form with current application values
      form.reset({
        client_name: application.client_name,
        client_email: application.client_email || "",
        phone_number: application.phone_number,
        application_status: application.application_status,
        agent_id: application.agent_id || "none",
        counselor_id: application.counselor_id || "none",
      });
    }
  }, [isOpen, application, form]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      // Fetch agents - with corrected field selection (id, role, email)
      const { data: agentsData, error: agentsError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("role", "agent");

      if (agentsError) {
        console.error("Error fetching agents:", agentsError);
        throw new Error(agentsError.message);
      }
      
      // Make sure we have valid data before setting state
      if (agentsData) {
        // Use role or ID for display instead of name
        const processedAgents = agentsData.map(agent => ({
          id: agent.id,
          role: agent.role || "agent",
        }));
        setAgents(processedAgents);
      } else {
        setAgents([]);
      }

      // Fetch counselors - with corrected field selection
      const { data: counselorsData, error: counselorsError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("role", "counselor");

      if (counselorsError) {
        console.error("Error fetching counselors:", counselorsError);
        throw new Error(counselorsError.message);
      }
      
      // Make sure we have valid data before setting state
      if (counselorsData) {
        // Use role or ID for display instead of name
        const processedCounselors = counselorsData.map(counselor => ({
          id: counselor.id,
          role: counselor.role || "counselor",
        }));
        setCounselors(processedCounselors);
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
      const agent_id = values.agent_id === "none" ? null : values.agent_id;
      const counselor_id = values.counselor_id === "none" ? null : values.counselor_id;
      
      // Update application in Supabase
      const { data, error } = await supabase
        .from("applications")
        .update({
          client_name: values.client_name,
          client_email: values.client_email,
          phone_number: values.phone_number,
          application_status: values.application_status,
          agent_id: agent_id,
          counselor_id: counselor_id,
          updated_at: new Date().toISOString(),
        })
        .eq("application_id", application.application_id)
        .select()
        .single();

      if (error) throw error;

      // Get agent display information
      let agent_name = "Not Assigned";
      if (agent_id) {
        const foundAgent = agents.find(agent => agent.id === agent_id);
        agent_name = foundAgent ? (foundAgent.email || "Agent") : "Unknown Agent";
      }

      // Get counselor display information
      let counselor_name = "Not Assigned";
      if (counselor_id) {
        const foundCounselor = counselors.find(counselor => counselor.id === counselor_id);
        counselor_name = foundCounselor ? (foundCounselor.email || "Counselor") : "Unknown Counselor";
      }

      // Create updated application with names included
      const updatedApplication = {
        ...data,
        agent_name,
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="review">In Review</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Agent</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.email || `Agent (${agent.id.substring(0, 6)})`}
                          </SelectItem>
                        ))}
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
            </div>

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