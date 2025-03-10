import { submitApplication } from "@/lib/applications.supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Custom hook for handling application mutations using React Query.
 * Provides functionality to create a new application and manage loading/error states.
 */


export const useApplicationMutation = () => {
  const queryClient = useQueryClient();

  // Mutation to create a new application
  const createApplicationMutation = useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      // Invalidate related queries to ensure fresh data after mutation
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      toast.success("New lot created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating lot: ${(error as Error).message}`);
    },
  });

  return {
    createApplication: createApplicationMutation.mutate, // Function to trigger the mutation
    isLoading: createApplicationMutation.isPending, // Loading state indicator
    error: createApplicationMutation.error, // Error state if mutation fails
  };
};
