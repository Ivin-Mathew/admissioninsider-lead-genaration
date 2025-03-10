// src/components/users/UserManagementTable.tsx
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "suspended";
}

const UserManagementTable: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "active",
    },
  ]);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                <Button variant="outline">Manage</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementTable;
