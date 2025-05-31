import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, School, User, Clock } from "lucide-react";
import { Application } from "@/types/application";

interface RowDataModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

const RowDataModal: React.FC<RowDataModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Application Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about {application.client_name}'s application
          </DialogDescription>
        </DialogHeader>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Client Name</p>
                    <p className="text-base">{application.client_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a
                      href={`mailto:${application.client_email}`}
                      className="text-base text-primary hover:underline"
                    >
                      {application.client_email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone Number</p>
                    <a
                      href={`tel:${application.phone_number}`}
                      className="text-base text-primary hover:underline"
                    >
                      {application.phone_number}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Preferred Locations</p>
                    <p className="text-base">
                      {application.preferred_locations.join(", ")}
                    </p>
                  </div>
                </div>

                {application.preferred_colleges && (
                  <div className="flex items-start gap-2">
                    <School className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Preferred Colleges</p>
                      <p className="text-base">
                        {application.preferred_colleges.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Assigned Counselor</p>
                  <p className="text-base">{application.counselor_name || "Not Assigned"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Application Status</p>
                  <p className="text-base">{application.application_status}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-base">
                      {new Date(application.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-base">
                      {new Date(application.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RowDataModal;
