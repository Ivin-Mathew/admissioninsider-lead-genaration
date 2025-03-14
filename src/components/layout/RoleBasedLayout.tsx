"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Users,
  FileText,
  PieChart,
  User,
  FilePlus,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  visible: boolean;
}

export default function RoleBasedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, isAdmin, isCounselor, isAgent } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (email: string | undefined): string => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: <PieChart className="h-5 w-5" />,
      href: "/dashboard",
      visible: true,
    },
    {
      title: "Applications",
      icon: <FileText className="h-5 w-5" />,
      href: "/applications",
      visible: isAdmin,
    },
    {
      title: "New Application",
      icon: <FilePlus className="h-5 w-5" />,
      href: "/applications/new",
      visible: isCounselor || isAdmin,
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/users",
      visible: isAdmin,
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      href: "/profile",
      visible: true,
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.visible);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div
        className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
        style={{ display: sidebarOpen ? "block" : "none" }}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none lg:relative lg:flex lg:flex-col lg:justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold">Lead Management</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 ${
                  pathname === item.href ? "bg-gray-100 font-medium" : ""
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium hidden md:block">
              {user.email} ({user.role} )
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
