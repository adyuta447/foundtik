import React from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

export const metadata = { title: "Keluhan - SmartCampus" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
