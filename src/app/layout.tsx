// filepath: d:\Coding\repositories\admissioninsider-lead-genaration\src\app\layout.tsx
// src/app/layout.tsx
"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { SessionProvider, useSession } from "next-auth/react";
import Providers from "./providers";
import Redirect from "@/components/Redirect"; // Import the Redirect component
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"></div>
    </div>
  );

  return <>{children}</>;
}

export default function RootLayout({
  children,
  pageProps,
}: {
  children: React.ReactNode;
  pageProps?: any;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Peer Connect - Admission Insider</title>
        <meta name="description" content="Your admission insider platform" />
      </head>
      <body className={inter.className}>
        <SessionProvider session={pageProps?.session}>
          <Providers>
            <AuthProvider>
              <ProtectedRoute>{children}</ProtectedRoute>
            </AuthProvider>
          </Providers>
          <Toaster richColors />
        </SessionProvider>
      </body>
    </html>
  );
}