"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  ImageIcon,
  Search,
  Package,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";
import { supabase, LostFound } from "../../../lib/supabase";
import Modal from "@/components/ui/Modal";
import LostFoundForm from "../../../components/forms/LostFoundForm";

export default function LostFoundList() {
  const router = useRouter();
  const [items, setItems] = useState<LostFound[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("semua");

  const loadData = async () => {
    const { data, error } = await supabase
      .from("lost_found")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("lost_found")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && isMounted) {
        setItems(data);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const filtered = items.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi_ditemukan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === "semua" || item.status === filter;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: items.length,
    tersedia: items.filter((i) => i.status === "tersedia").length,
    verifikasi: items.filter((i) => i.status === "verifikasi").length,
    returned: items.filter((i) => i.status === "returned").length,
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "tersedia":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          dotColor: "bg-emerald-500",
          icon: Package,
          label: "Tersedia",
        };
      case "verifikasi":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          dotColor: "bg-amber-500",
          icon: Clock,
          label: "Verifikasi",
        };
      case "returned":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          dotColor: "bg-gray-500",
          icon: CheckCircle2,
          label: "Dikembalikan",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          dotColor: "bg-gray-500",
          icon: Package,
          label: status,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Lost & Found
                </h1>
                <p className="text-gray-600">
                  Temukan barang hilang atau laporkan barang yang ditemukan di
                  Politeknik Negeri Jakarta
                </p>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <Plus
                  size={20}
                  className="group-hover:rotate-90 transition-transform"
                />
                <span>Upload Barang</span>
              </button>
            </div>

            {items.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                      <Package className="text-purple-700 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Barang</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-emerald-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                      <Package className="text-emerald-700 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600">Tersedia</p>
                      <p className="text-xl font-bold text-emerald-700">
                        {stats.tersedia}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-amber-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                      <Clock className="text-amber-700 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">Verifikasi</p>
                      <p className="text-xl font-bold text-amber-700">
                        {stats.verifikasi}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="text-gray-700 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Dikembalikan</p>
                      <p className="text-xl font-bold text-gray-700">
                        {stats.returned}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari barang berdasarkan nama, lokasi, atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {items.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-2 inline-flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter("semua")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === "semua"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setFilter("tersedia")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === "tersedia"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Tersedia
                  </button>
                  <button
                    onClick={() => setFilter("verifikasi")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === "verifikasi"
                        ? "bg-amber-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Verifikasi
                  </button>
                  <button
                    onClick={() => setFilter("returned")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === "returned"
                        ? "bg-gray-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Dikembalikan
                  </button>
                </div>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="text-purple-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery || filter !== "semua"
                  ? "Barang Tidak Ditemukan"
                  : "Belum Ada Barang"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? "Coba gunakan kata kunci lain untuk menemukan barang"
                  : filter !== "semua"
                  ? `Tidak ada barang dengan status "${filter}"`
                  : "Mulai upload barang yang Anda temukan untuk membantu orang lain"}
              </p>
              {!searchQuery && filter === "semua" && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus size={20} />
                  Upload Barang Pertama
                </button>
              )}
              {(searchQuery || filter !== "semua") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("semua");
                  }}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                >
                  Lihat Semua Barang
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      router.push(`/lost-found-detail?id=${item.id}`)
                    }
                    className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    {item.foto_url ? (
                      <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <Image
                          src={item.foto_url}
                          alt={item.nama_barang}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusInfo.color} shadow-lg backdrop-blur-sm`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}
                            ></span>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={56} />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusInfo.color} shadow-lg`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}
                            ></span>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {item.nama_barang}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin
                            className="text-rose-500 flex-shrink-0"
                            size={16}
                          />
                          <span className="truncate">
                            {item.lokasi_ditemukan}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar
                            className="text-sky-500 flex-shrink-0"
                            size={16}
                          />
                          <span>
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
                      </div>

                      <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm group-hover:shadow-md">
                        <Eye size={16} />
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          loadData();
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Upload Barang Ditemukan
        </h2>
        <LostFoundForm
          onClose={() => {
            setCreateOpen(false);
            loadData();
          }}
        />
      </Modal>
    </>
  );
}
