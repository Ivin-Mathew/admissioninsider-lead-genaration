/* "use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger, // Import DialogTrigger from the same UI library
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUpdateUserStatus } from "@/hooks/useUsers";
import { User } from "@/types/user";

interface ChangeUserStatusDialogProps {
  userId: string;
  currentStatus: User["status"];
}

interface FormData {
  reason: string;
}

export const ChangeUserStatusDialog = ({
  userId,
  currentStatus,
}: ChangeUserStatusDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const updateUserStatusMutation = useUpdateUserStatus();

  const onSubmit = (data: FormData) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    updateUserStatusMutation.mutate({
      userId,
      statusData: { status: newStatus, reason: data.reason },
    });
    setIsOpen(false); // Close dialog after submission
  };

  const handleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsOpen(true);
  };

  // Add this function to prevent closing when clicking inside the modal
  const handleDialogClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          onClick={handleOpen}
          className="w-fit p-0 font-normal bg-transparent hover:bg-transparent h-fit text-destructive"
        >
          {currentStatus === "active" ? "Suspend User" : "Activate User"}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg" onClick={handleDialogClick}>
        <DialogHeader>
          <DialogTitle>
            {currentStatus === "active" ? "Suspend User" : "Activate User"}
          </DialogTitle>
          <DialogDescription>
            {currentStatus === "active"
              ? "Are you sure you want to suspend this user? Please provide a reason."
              : "Are you sure you want to activate this user? Please provide a reason."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                {...register("reason", { required: "Reason is required" })}
                placeholder="Enter the reason for this action..."
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateUserStatusMutation.isPending}
              className={
                currentStatus === "active"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={(e) => e.stopPropagation()}
            >
              {updateUserStatusMutation.isPending
                ? "Updating..."
                : currentStatus === "active"
                ? "Suspend User"
                : "Activate User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
 */