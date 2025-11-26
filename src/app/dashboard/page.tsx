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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {profile?.name || "User"}!
        </p>
      </div>

      {profile && showWelcome && (
        <Card className="mb-6 bg-blue-50 border-blue-100 flex flex-col md:flex-row items-center justify-between p-4 gap-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="flex items-center justify-between bg-white border border-gray-200 
        rounded-2xl px-6 py-5 shadow-sm transition hover:shadow-md cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-gray-600">
                  {card.title}
                </span>
                <span className="text-[32px] font-bold text-gray-900 leading-none mt-2">
                  {card.value}
                </span>
              </div>

              <div
                className={`flex items-center justify-center w-14 h-14 rounded-xl ${card.color}`}
              >
                <Icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Status Keluhan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusData.map((status) => (
              <div
                key={status.label}
                className={`${status.bg} rounded-lg p-4 flex justify-between items-center`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${status.textColor}`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {status.label}
                  </span>
                </div>
                <span className={`text-lg font-bold ${status.textColor}`}>
                  {status.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
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
