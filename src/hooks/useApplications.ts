import { submitApplication } from "@/lib/applications.supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export const useApplicationMutation = () => {
    const queryClient = useQueryClient();
  
    
  
  
    const createApplicationMutation = useMutation({
      mutationFn: submitApplication,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lots'] });
        toast.success('New lot created successfully');
      },
      onError: (error) => {
        toast.error(`Error creating lot: ${(error as Error).message}`);
      },
    });
  
    
  
    
  
    
  
    return {
      
     
      createApplication: createApplicationMutation.mutate,
      
      isLoading: 
        createApplicationMutation.isPending ,
       
  
      error:
        createApplicationMutation.error 
    };
  };
  
  