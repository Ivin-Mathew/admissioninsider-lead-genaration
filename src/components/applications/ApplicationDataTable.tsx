import React, { useState, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable, ColumnDef,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Application, ApplicationStatus } from "@/types/application";
import RowDataModal from "./RowDataModal"; // Import the new modal component

interface ApplicationDataTableProps {
  userType: "admin" | "agent" | "counselor" | "client";
  applicationData: Application[];
}

const ApplicationDataTable: React.FC<ApplicationDataTableProps> = ({
  userType = "admin",
  applicationData = [],
}) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Define column helper
  const columnHelper = createColumnHelper<Application>();

  // Function to format date strings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to format array to comma-separated string
  const formatArray = (arr: string[] | null) => {
    if (!arr) return "None";
    return arr.join(", ");
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define columns based on user type and screen width
  const getColumns = () => {
    // Common columns for all user types
    const commonColumns = [
      columnHelper.accessor("client_name", {
        header: "Client Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("application_status", {
        header: "Status",
        cell: (info) => (
          <Badge
            className={
              info.getValue() === "pending"
                ? "bg-yellow-500"
                : info.getValue() === ApplicationStatus.ACCEPTED
                  ? "bg-green-500"
                  : info.getValue() === ApplicationStatus.REVIEW
                    ? "bg-blue-500"
                    : "bg-gray-500"
            }
          >
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        cell: (info) => formatDate(info.getValue()),
      }),
    ];

    // Admin sees everything
    if (userType === "admin") {
      return [
        columnHelper.accessor("application_id", {
          header: "ID",
          cell: (info) => (
            <span className="text-xs text-gray-500">
              {info.getValue()?.substring(0, 8) ?? "N/A"}...
            </span>
          ),
        }),
        ...commonColumns,
        windowWidth > 768 && columnHelper.accessor("client_email", {
          header: "Email",
          cell: (info) => info.getValue(),
        }),
        windowWidth > 1024 && columnHelper.accessor("phone_number", {
          header: "Phone",
          cell: (info) => info.getValue(),
        }),
        windowWidth > 1280 && columnHelper.accessor("preferred_locations", {
          header: "Locations",
          cell: (info) => formatArray(info.getValue()),
        }),
        windowWidth > 1280 && columnHelper.accessor("preferred_colleges", {
          header: "Colleges",
          cell: (info) => formatArray(info.getValue()),
        }),
        windowWidth > 1440 && columnHelper.accessor("agent_name", {
          header: "Agent",
          cell: (info) => (
            <span className="text-xs">
              {info.getValue()?.substring(0, 8) ?? "N/A"}...
            </span>
          ),
        }),
        windowWidth > 1440 && columnHelper.accessor("counselor_name", {
          header: "Counselor",
          cell: (info) =>
            info.getValue() ? (
              <span className="text-xs">
                {info.getValue()?.substring(0, 8) ?? "N/A"}...
              </span>
            ) : (
              <Button>Assign</Button>
            ),
        }),/* 
        windowWidth > 768 && columnHelper.accessor("updated_at", {
          header: "Last Updated",
          cell: (info) => formatDate(info.getValue()),
        }), */
        columnHelper.display({
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedApplication(row.original);
                setIsModalOpen(true);
              }}
            >
              View Details
            </Button>
          ),
        }),
      ].filter(Boolean); // Filter out undefined columns
    }

    // Agent view
    else if (userType === "agent") {
      return [
        ...commonColumns,
        windowWidth > 768 && columnHelper.accessor("client_email", {
          header: "Email",
          cell: (info) => info.getValue(),
        }),
        windowWidth > 1024 && columnHelper.accessor("phone_number", {
          header: "Phone",
          cell: (info) => info.getValue(),
        }),
        windowWidth > 1280 && columnHelper.accessor("preferred_locations", {
          header: "Locations",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedApplication(row.original);
                setIsModalOpen(true);
              }}
            >
              View Details
            </Button>
          ),
        }),
      ].filter(Boolean); // Filter out undefined columns
    }

    // Counselor view
    else if (userType === "counselor") {
      return [
        ...commonColumns,
        windowWidth > 768 && columnHelper.accessor("completed_course", {
          header: "Completed Course",
          cell: (info) => info.getValue(),
        }),
        windowWidth > 1024 && columnHelper.accessor("planned_courses", {
          header: "Planned Courses",
          cell: (info) => formatArray(info.getValue()),
        }),
        windowWidth > 1280 && columnHelper.accessor("preferred_locations", {
          header: "Locations",
          cell: (info) => formatArray(info.getValue()),
        }),
        windowWidth > 1280 && columnHelper.accessor("preferred_colleges", {
          header: "Colleges",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedApplication(row.original);
                setIsModalOpen(true);
              }}
            >
              View Details
            </Button>
          ),
        }),
      ].filter(Boolean); // Filter out undefined columns
    }

    // Client view (limited)
    else if (userType === "client") {
      return [
        columnHelper.accessor("application_id", {
          header: "Application ID",
          cell: (info) => (
            <span className="text-xs">
              {info.getValue().substring(0, 8)}...
            </span>
          ),
        }),
        ...commonColumns,
        windowWidth > 768 && columnHelper.accessor("planned_courses", {
          header: "Planned Courses",
          cell: (info) => formatArray(info.getValue()),
        }),
        windowWidth > 1024 && columnHelper.accessor("preferred_locations", {
          header: "Locations",
          cell: (info) => formatArray(info.getValue()),
        }),
        windowWidth > 1280 && columnHelper.accessor("preferred_colleges", {
          header: "Selected Colleges",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedApplication(row.original);
                setIsModalOpen(true);
              }}
            >
              View Details
            </Button>
          ),
        }),
      ].filter(Boolean); // Filter out undefined columns
    }

    // Default fallback
    return commonColumns;
  };

  const columns = getColumns().filter(Boolean) as ColumnDef<Application, any>[];

  const table = useReactTable({
    data: applicationData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Generate user type options for demo
  const userTypes = ["admin", "agent", "counselor", "client"];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Application Data</CardTitle>
        <div className="flex gap-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          {/* This select is just for demo purposes */}
          <Select value={userType} disabled>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="User Type" />
            </SelectTrigger>
            <SelectContent>
              {userTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded border">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-gray-100">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-2 text-left font-medium text-sm"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-4 text-center text-gray-500"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
      {selectedApplication && (
        <RowDataModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Card>
  );
};

export default ApplicationDataTable;