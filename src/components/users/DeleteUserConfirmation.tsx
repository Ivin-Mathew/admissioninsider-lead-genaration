/* import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { useDeleteUser } from "@/hooks/useUsers";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DialogTrigger } from "@radix-ui/react-dialog";

interface DeleteUserDialogProps {
  userId: string;
}

export const DeleteUserDialog = ({ userId }: DeleteUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteUserMutation = useDeleteUser();

  const handleDelete = () => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        console.log("User deleted successfully");
        setIsOpen(false); // Close dialog after successful deletion
      },
      onError: (error) => {
        console.error("Error deleting user:", error.message);
      },
    });
  };

  const handleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant={"secondary"}
            onClick={handleOpen}
            className="w-fit p-0 font-normal bg-tranparent hover:bg-transparent  h-fit text-destructive"
          >
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
 */