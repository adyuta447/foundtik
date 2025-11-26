"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Package, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Keluhan {
  id: string;
  title: string;
  status: "menunggu" | "diproses" | "selesai";
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      if (typeof window === "undefined") return true;
      return localStorage.getItem("dashboard_welcome_dismissed") !== "1";
    } catch {
      return true;
    }
  });
  const [stats, setStats] = useState({
    totalKeluhan: 0,
    keluhanMenunggu: 0,
    keluhanDiproses: 0,
    keluhanSelesai: 0,
    totalLostFound: 0,
  });
  const [recentReports, setRecentReports] = useState<Keluhan[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const { count: totalKeluhan } = await supabase
          .from("keluhan")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        const { count: keluhanMenunggu } = await supabase
          .from("keluhan")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "menunggu");

        const { count: keluhanDiproses } = await supabase
          .from("keluhan")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "diproses");

        const { count: keluhanSelesai } = await supabase
          .from("keluhan")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "selesai");

        const { count: totalLostFound } = await supabase
          .from("lost_found")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch recent reports
        const { data: reportsData } = await supabase
          .from("keluhan")
          .select("id, title, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        setStats({
          totalKeluhan: totalKeluhan || 0,
          keluhanMenunggu: keluhanMenunggu || 0,
          keluhanDiproses: keluhanDiproses || 0,
          keluhanSelesai: keluhanSelesai || 0,
          totalLostFound: totalLostFound || 0,
        });
        setRecentReports((reportsData as Keluhan[]) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  const handleDismissWelcome = () => {
    try {
      localStorage.setItem("dashboard_welcome_dismissed", "1");
    } catch {}
    setShowWelcome(false);
  };

  const statCards = [
    {
      title: "Total Keluhan",
      value: stats.totalKeluhan,
      icon: AlertCircle,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Keluhan Menunggu",
      value: stats.keluhanMenunggu,
      icon: Clock,
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Keluhan Selesai",
      value: stats.keluhanSelesai,
      icon: CheckCircle,
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Barang Ditemukan",
      value: stats.totalLostFound,
      icon: Package,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const statusData = [
    {
      label: "Menunggu",
      value: stats.keluhanMenunggu,
      bg: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Diproses",
      value: stats.keluhanDiproses,
      bg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Selesai",
      value: stats.keluhanSelesai,
      bg: "bg-green-50",
      textColor: "text-green-600",
    },
  ];

  return (
    <div className="p-8">
      {/* --- Header --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {profile?.name || "User"}!
        </p>
      </div>

      {/* --- Welcome Banner --- */}
      {profile && showWelcome && (
        <Card className="mb-6 bg-blue-50 border-blue-100 flex items-center justify-between p-4">
          <div>
            <h3 className="text-lg font-semibold">
              {profile.name}, selamat datang!
            </h3>
            <p className="text-sm text-muted-foreground">
              Terima kasih telah mendaftar. Lengkapi profil Anda untuk
              pengalaman terbaik.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/profile")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Lengkapi Profil
            </button>
            <button
              onClick={handleDismissWelcome}
              className="text-gray-600 px-3 py-2 rounded-md hover:bg-gray-100 transition"
            >
              Tutup
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loadingStats
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {card.title}
                    </CardTitle>
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className={`${card.iconColor} w-6 h-6`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* --- Two Column Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Status Keluhan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusData.map((status) => (
              <div
                key={status.label}
                className={`${status.bg} rounded-lg p-4 flex items-center justify-between`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {status.label}
                </span>
                <span className={`text-lg font-bold ${status.textColor}`}>
                  {status.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Aktivitas Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingStats ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded" />
                ))
            ) : recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {report.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        report.status === "selesai"
                          ? "bg-green-100 text-green-700"
                          : report.status === "diproses"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                Belum ada keluhan
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
