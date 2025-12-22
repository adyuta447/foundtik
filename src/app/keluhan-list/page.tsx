"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  ImageIcon,
  Calendar,
  MapPin,
  Tag,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase, Keluhan } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import KeluhanForm from "../../components/forms/KeluhanForm";

export default function KeluhanList() {
  const router = useRouter();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [keluhan, setKeluhan] = useState<Keluhan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("semua");

  const fetchKeluhan = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("keluhan")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setKeluhan(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      await fetchKeluhan();
    };
    loadData();
  }, [fetchKeluhan]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "menunggu":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Clock,
          label: "Menunggu",
          dotColor: "bg-amber-500",
        };
      case "diproses":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: AlertCircle,
          label: "Diproses",
          dotColor: "bg-blue-500",
        };
      case "selesai":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
          label: "Selesai",
          dotColor: "bg-emerald-500",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
          label: status,
          dotColor: "bg-gray-500",
        };
    }
  };

  const filteredKeluhan = keluhan.filter((item) => {
    if (filter === "semua") return true;
    return item.status === filter;
  });

  const stats = {
    total: keluhan.length,
    menunggu: keluhan.filter((k) => k.status === "menunggu").length,
    diproses: keluhan.filter((k) => k.status === "diproses").length,
    selesai: keluhan.filter((k) => k.status === "selesai").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-center text-gray-600 mt-4">Memuat keluhan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Keluhan Saya
                </h1>
                <p className="text-gray-600">
                  Kelola dan pantau status laporan keluhan fasilitas kampus
                  Politeknik Negeri Jakarta
                </p>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <Plus
                  size={20}
                  className="group-hover:rotate-90 transition-transform"
                />
                <span>Buat Keluhan</span>
              </button>
            </div>
            {keluhan.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Total Keluhan
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                      <Tag className="text-purple-700" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border border-amber-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-600 mb-1">Menunggu</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {stats.menunggu}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                      <Clock className="text-amber-700" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Diproses</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {stats.diproses}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                      <AlertCircle className="text-blue-700" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md border border-emerald-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-600 mb-1">Selesai</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {stats.selesai}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                      <CheckCircle2 className="text-emerald-700" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {keluhan.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-2 inline-flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter("semua")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === "semua"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Semua ({stats.total})
                </button>
                <button
                  onClick={() => setFilter("menunggu")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === "menunggu"
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Menunggu ({stats.menunggu})
                </button>
                <button
                  onClick={() => setFilter("diproses")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === "diproses"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Diproses ({stats.diproses})
                </button>
                <button
                  onClick={() => setFilter("selesai")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === "selesai"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Selesai ({stats.selesai})
                </button>
              </div>
            )}
          </div>
          {keluhan.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="text-blue-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Belum Ada Keluhan
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Anda belum membuat laporan keluhan. Mulai laporkan masalah
                fasilitas kampus yang perlu diperbaiki.
              </p>
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus size={20} />
                Buat Keluhan Pertama
              </button>
            </div>
          ) : (
            <>
              <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Foto
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Judul
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Lokasi
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredKeluhan.map((item) => {
                        const statusInfo = getStatusInfo(item.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all group"
                          >
                            <td className="px-6 py-4">
                              {item.foto_url ? (
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                                  <Image
                                    src={item.foto_url}
                                    alt={item.judul}
                                    width={80}
                                    height={80}
                                    unoptimized
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                                  <ImageIcon
                                    className="text-gray-400"
                                    size={28}
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {item.judul}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Tag className="text-purple-600" size={16} />
                                <span className="text-gray-700 font-medium">
                                  {item.kategori}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="text-rose-600" size={16} />
                                <span className="text-gray-700">
                                  {item.lokasi}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusInfo.color} shadow-sm`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${statusInfo.dotColor} animate-pulse`}
                                ></span>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={16} />
                                <span className="text-sm">
                                  {new Date(item.created_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  router.push(`/keluhan-detail?id=${item.id}`)
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                              >
                                <Eye size={16} />
                                Lihat
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:hidden space-y-4">
                {filteredKeluhan.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        router.push(`/keluhan-detail?id=${item.id}`)
                      }
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                    >
                      {item.foto_url && (
                        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                          <Image
                            src={item.foto_url}
                            alt={item.judul}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-bold text-lg text-gray-900 flex-1 line-clamp-2">
                            {item.judul}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusInfo.color} shadow-sm whitespace-nowrap`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}
                            ></span>
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="text-purple-600" size={16} />
                            <span className="text-gray-700 font-medium">
                              {item.kategori}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="text-rose-600" size={16} />
                            <span className="text-gray-700">{item.lokasi}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="text-sky-600" size={16} />
                            <span className="text-gray-600">
                              {new Date(item.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                          <Eye size={18} />
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {filteredKeluhan.length === 0 && keluhan.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-gray-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Tidak Ada Keluhan
              </h3>
              <p className="text-gray-600 mb-6">
                Tidak ada keluhan dengan status &quot;{filter}&#34;
              </p>
              <button
                onClick={() => setFilter("semua")}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                Lihat Semua Keluhan
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Buat Keluhan Baru
        </h2>
        <KeluhanForm onClose={() => setCreateOpen(false)} />
      </Modal>
    </>
  );
}
