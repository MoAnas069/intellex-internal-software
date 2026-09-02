import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Intellex Management System",
  description: "Internal management system for Intellex — Manage students, projects, payments and performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ix-bg text-ix-text">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
