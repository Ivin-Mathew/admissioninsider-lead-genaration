import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Application } from "@/types/application";

interface RowDataModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

const RowDataModal: React.FC<RowDataModalProps> = ({ application, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Detailed information about the application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <strong>Client Name:</strong> {application.client_name}
          </div>
          <div>
            <strong>Email:</strong> {application.client_email}
          </div>
          <div>
            <strong>Phone Number:</strong> {application.phone_number}
          </div>
          <div>
            <strong>Preferred Locations:</strong> {application.preferred_locations.join(", ")}
          </div>
          <div>
            <strong>Preferred Colleges:</strong> {application.preferred_colleges?.join(", ")}
          </div>
          <div>
            <strong>Agent ID:</strong> {application.agent_id}
          </div>
          <div>
            <strong>Counselor ID:</strong> {application.counselor_id}
          </div>
          <div>
            <strong>Application Status:</strong> {application.application_status}
          </div>
          <div>
            <strong>Created At:</strong> {new Date(application.created_at).toLocaleString()}
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date(application.updated_at).toLocaleString()}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RowDataModal;