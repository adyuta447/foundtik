"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Image as ImageIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import Image from "next/image";
import { supabase, Keluhan } from "../../../lib/supabase";

type KeluhanWithProfile = Keluhan & {
  profiles: { name: string } | null;
};

export default function AdminKeluhan() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [keluhan, setKeluhan] = useState<KeluhanWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "semua" | "menunggu" | "diproses" | "selesai"
  >("semua");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const reloadData = async () => {
      if (profile?.role !== "admin") return;
      setLoading(true);

      let query = supabase
        .from("keluhan")
        .select("*, profiles(name)")
        .order("created_at", { ascending: false });

      if (filter !== "semua") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (!error && data) {
        setKeluhan(data as KeluhanWithProfile[]);
      }
      setLoading(false);
    };
    reloadData();
  }, [filter, profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
    if (!authLoading && user && profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [user, profile, authLoading, router]);

  const updateStatus = async (
    id: string,
    newStatus: "menunggu" | "diproses" | "selesai"
  ) => {
    setUpdatingId(id);

    const { error } = await supabase
      .from("keluhan")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      const reloadData = async () => {
        if (profile?.role !== "admin") return;
        let query = supabase
          .from("keluhan")
          .select("*, profiles(name)")
          .order("created_at", { ascending: false });

        if (filter !== "semua") {
          query = query.eq("status", filter);
        }

        const { data, error } = await query;
        if (!error && data) {
          setKeluhan(data as KeluhanWithProfile[]);
        }
      };
      reloadData();
    }

    setUpdatingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "menunggu":
        return {
          color: "bg-amber-100 text-amber-800",
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          icon: Clock,
          label: "Menunggu",
        };
      case "diproses":
        return {
          color: "bg-blue-100 text-blue-800",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          icon: AlertCircle,
          label: "Sedang Diproses",
        };
      case "selesai":
        return {
          color: "bg-emerald-100 text-emerald-800",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-200",
          icon: CheckCircle2,
          label: "Selesai",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          icon: AlertCircle,
          label: status,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="text-center text-gray-600 mt-4">
            Memuat data keluhan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Kelola Keluhan
            </h1>
            <p className="text-gray-600 text-lg">
              Pantau dan update status keluhan dari mahasiswa
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="mb-8 flex flex-wrap gap-3">
            {["semua", "menunggu", "diproses", "selesai"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as typeof filter)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  filter === status
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Filter size={18} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          {keluhan.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                Tidak ada keluhan dengan filter ini
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Foto
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Judul
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Pelapor
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Lokasi
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {keluhan.map((item) => {
                      const statusInfo = getStatusColor(item.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            {item.foto_url ? (
                              <Image
                                src={item.foto_url}
                                alt={item.judul}
                                width={64}
                                height={64}
                                unoptimized
                                className="w-16 h-16 object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                                <ImageIcon
                                  className="text-gray-400"
                                  size={24}
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">
                              {item.judul}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.kategori}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {item.profiles?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {item.lokasi}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${statusInfo.color}`}
                            >
                              <StatusIcon size={16} />
                              {statusInfo.label}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                updateStatus(
                                  item.id,
                                  e.target.value as
                                    | "menunggu"
                                    | "diproses"
                                    | "selesai"
                                )
                              }
                              disabled={updatingId === item.id}
                              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="menunggu">Menunggu</option>
                              <option value="diproses">Diproses</option>
                              <option value="selesai">Selesai</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
