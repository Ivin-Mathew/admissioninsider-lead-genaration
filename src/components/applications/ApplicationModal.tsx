import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  PlusCircle,
  MinusCircle,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useApplicationMutation } from "@/hooks/useApplications";
// Import shadcn UI components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EducationLevel } from "@/types/application";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  clientName: string;
  clientEmail: string;
  phoneNumber: string;
  completedCourse: string;
  plannedCourses: string[];
  preferredLocations: string[];
  preferredColleges: string[];
}

// Add the onApplicationCreated prop to the component
interface ApplicationFormModalProps {
  onApplicationCreated?: () => Promise<void>;
}

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  onApplicationCreated = async () => {} // Default empty function if not provided
}) => {
  const { user } = useAuth();
  const [plannedCourses, setPlannedCourses] = React.useState<string[]>([""]);
  const [preferredLocations, setPreferredLocations] = React.useState<string[]>([
    "",
  ]);
  const [preferredColleges, setPreferredColleges] = React.useState<string[]>([
    "",
  ]);
  const { createApplication, isLoading, error } = useApplicationMutation();
  const [formError, setFormError] = React.useState<string>("");
  const [formSuccess, setFormSuccess] = React.useState<boolean>(false);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      clientName: "",
      clientEmail: "",
      phoneNumber: "",
      completedCourse: "",
      plannedCourses: [],
      preferredLocations: [],
      preferredColleges: [],
    },
  });

  // Mock function to submit to Supabase
  const submitApplication = async (data: FormData) => {
    console.log(data);
    // In a real app, you would use Supabase client here
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to submit application");
    }

    return response.json();
  };

  const handleAddField = (type: "course" | "location" | "college") => {
    if (type === "course") {
      setPlannedCourses([...plannedCourses, ""]);
    } else if (type === "location") {
      setPreferredLocations([...preferredLocations, ""]);
    } else if (type === "college") {
      setPreferredColleges([...preferredColleges, ""]);
    }
  };

  const handleRemoveField = (
    type: "course" | "location" | "college",
    index: number
  ) => {
    if (type === "course" && plannedCourses.length > 1) {
      const newCourses = [...plannedCourses];
      newCourses.splice(index, 1);
      setPlannedCourses(newCourses);
    } else if (type === "location" && preferredLocations.length > 1) {
      const newLocations = [...preferredLocations];
      newLocations.splice(index, 1);
      setPreferredLocations(newLocations);
    } else if (type === "college" && preferredColleges.length > 1) {
      const newColleges = [...preferredColleges];
      newColleges.splice(index, 1);
      setPreferredColleges(newColleges);
    }
  };

  const handleFieldChange = (
    type: "course" | "location" | "college",
    index: number,
    value: string
  ) => {
    if (type === "course") {
      const newCourses = [...plannedCourses];
      newCourses[index] = value;
      setPlannedCourses(newCourses);
    } else if (type === "location") {
      const newLocations = [...preferredLocations];
      newLocations[index] = value;
      setPreferredLocations(newLocations);
    } else if (type === "college") {
      const newColleges = [...preferredColleges];
      newColleges[index] = value;
      setPreferredColleges(newColleges);
    }
  };

  const onSubmit = async (data: FormData) => {
    // Filter out empty values from arrays
    const filteredCourses = plannedCourses.filter(
      (course) => course.trim() !== ""
    );
    const filteredLocations = preferredLocations.filter(
      (location) => location.trim() !== ""
    );
    const filteredColleges = preferredColleges.filter(
      (college) => college.trim() !== ""
    );

    if (filteredCourses.length === 0) {
      setFormError("Please add at least one planned course");
      return;
    }

    if (filteredLocations.length === 0) {
      setFormError("Please add at least one preferred location");
      return;
    }

    try {
      const submissionData = {
        ...data,
        completedCourse: data.completedCourse as EducationLevel,
        plannedCourses: filteredCourses,
        preferredLocations: filteredLocations,
        preferredColleges: filteredColleges,
        counselorId: user?.role === 'counselor' ? user?.id : undefined,
      };

      console.log(submissionData);
      const response = await createApplication(submissionData);

      // Call the onApplicationCreated callback after successful creation
      await onApplicationCreated();

      handleClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      setFormError("An error occurred while submitting the application.");
    }
  };

  function handleClose() {
    reset();
    setPlannedCourses([""]);
    setPreferredLocations([""]);
    setPreferredColleges([""]);
    setFormError("");
    setFormSuccess(false);
    setIsOpen(false);
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-6 w-6" />
          Create Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Student Application</DialogTitle>
          <DialogDescription>
            Fill in your details to submit a new application
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {formSuccess && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <Check className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your application has been submitted successfully!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName" className="text-base">
                  Full Name *
                </Label>
                <Input
                  id="clientName"
                  placeholder="Enter your full name"
                  className="mt-1"
                  {...register("clientName", { required: "Name is required" })}
                />
                {errors.clientName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.clientName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientEmail" className="text-base">
                    Email Address
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    className="mt-1"
                    {...register("clientEmail", {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.clientEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.clientEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-base">
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 123 456 7890"
                    className="mt-1"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                    })}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="completedCourse" className="text-base">
                  Completed 12th Course *
                </Label>
                <Select
                  onValueChange={(value) => setValue("completedCourse", value)}
                  required
                >
                  <SelectTrigger id="completedCourse" className="mt-1">
                    <SelectValue placeholder="Select your completed course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="vocational">Vocational</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.completedCourse && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.completedCourse.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-base">Planned Courses *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddField("course")}
                    className="h-8"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add Course
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {plannedCourses.map((course, index) => (
                    <div key={`course-${index}`} className="flex gap-2">
                      <Input
                        placeholder={`Course ${index + 1}`}
                        value={course}
                        onChange={(e) =>
                          handleFieldChange("course", index, e.target.value)
                        }
                        className="flex-1"
                      />
                      {plannedCourses.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveField("course", index)}
                          className="h-10 w-10"
                        >
                          <MinusCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-base">
                    Preferred Study Locations *
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddField("location")}
                    className="h-8"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add Location
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {preferredLocations.map((location, index) => (
                    <div key={`location-${index}`} className="flex gap-2">
                      <Input
                        placeholder={`Location ${index + 1}`}
                        value={location}
                        onChange={(e) =>
                          handleFieldChange("location", index, e.target.value)
                        }
                        className="flex-1"
                      />
                      {preferredLocations.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveField("location", index)}
                          className="h-10 w-10"
                        >
                          <MinusCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-base">
                    Preferred Colleges (Optional)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddField("college")}
                    className="h-8"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add College
                  </Button>
                </div>
                <div className="space-y-2 mt-2">
                  {preferredColleges.map((college, index) => (
                    <div key={`college-${index}`} className="flex gap-2">
                      <Input
                        placeholder={`College ${index + 1}`}
                        value={college}
                        onChange={(e) =>
                          handleFieldChange("college", index, e.target.value)
                        }
                        className="flex-1"
                      />
                      {preferredColleges.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveField("college", index)}
                          className="h-10 w-10"
                        >
                          <MinusCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* ... */}
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setPlannedCourses([""]);
                setPreferredLocations([""]);
                setPreferredColleges([""]);
                setFormError("");
                setFormSuccess(false);
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </CardFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationFormModal;
