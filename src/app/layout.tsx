import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/lib/utils";
import React from "react";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "True feedback",
  description: "Real feedback from real people",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout(
  {children}: RootLayoutProps
) {
  return (
    <html lang="en">
      <AuthProvider>
      <body className={(inter.className)}>
        {children}
        <Toaster />
      </body>
      </AuthProvider>
    </html>
  );
}
