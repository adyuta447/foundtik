import React from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

export const metadata = { title: "Keluhan - FoundTIK" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
