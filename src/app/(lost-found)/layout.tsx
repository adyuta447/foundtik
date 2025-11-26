import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function LostFoundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
