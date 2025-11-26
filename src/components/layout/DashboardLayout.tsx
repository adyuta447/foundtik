import { ReactNode } from "react";
import Navbar from "./Navbar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-8xl mx-auto p-4">{children}</main>
    </div>
  );
}
