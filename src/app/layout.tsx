// filepath: d:\Coding\repositories\admissioninsider-lead-genaration\src\app\layout.tsx
// src/app/layout.tsx
"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Session } from "inspector/promises";
import { SessionProvider } from "next-auth/react";
import Providers from "./providers";
import Redirect from "@/components/Redirect"; // Import the Redirect component

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <Providers>
              <AuthProvider>
                <Redirect to="/dashboard" /> {/* Use the Redirect component */}
                {children}
              </AuthProvider>
            </Providers>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}