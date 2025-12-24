"use client";
import { useEffect, useState, Suspense } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { supabase, LostFound, Profile } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";

function LostFoundDetailContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") || "";
  const router = useRouter();
  const [item, setItem] = useState<LostFound | null>(null);
  const [uploader, setUploader] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimData, setClaimData] = useState({ pesan: "", bukti_url: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("lost_found")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        setItem(data);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user_id)
          .maybeSingle();

        if (profileData) {
          setUploader(profileData);
        }
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !item) return;

    setSubmitting(true);

    const { error } = await supabase.from("klaim_barang").insert({
      lost_found_id: item.id,
      user_id: user.id,
      pesan: claimData.pesan,
      bukti_url: claimData.bukti_url || null,
      status: "pending",
    });

    if (!error) {
      setShowClaimForm(false);
      alert("Klaim berhasil diajukan! Admin akan segera memverifikasi.");
    }

    setSubmitting(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "tersedia":
        return {
          color: "bg-emerald-500",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-200",
          icon: CheckCircle2,
          label: "Tersedia",
        };
      case "verifikasi":
        return {
          color: "bg-amber-500",
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          icon: Clock,
          label: "Dalam Verifikasi",
        };
      case "returned":
        return {
          color: "bg-blue-500",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          icon: AlertCircle,
          label: "Sudah Dikembalikan",
        };
      default:
        return {
          color: "bg-gray-500",
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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Barang Tidak Ditemukan
            </h3>
            <p className="text-gray-600 mb-6">
              Data barang hilang/ditemukan yang Anda cari tidak tersedia
            </p>
            <button
              onClick={() => router.push("/(lost-found)/lost-found-list")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali ke Daftar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(item.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push("/lost-found-list")}
          className="group inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 px-4 py-2 rounded-xl hover:bg-white/60 transition-all"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Kembali</span>
        </button>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {item.foto_url && (
            <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200">
              <Image
                src={item.foto_url}
                alt={item.nama_barang}
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          )}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {item.nama_barang}
              </h1>
              <span
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} shadow-sm whitespace-nowrap`}
              >
                <StatusIcon size={18} />
                {statusInfo.label}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="group bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-200 rounded-lg group-hover:scale-110 transition-transform">
                    <Tag className="text-purple-700" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-purple-600 mb-1 uppercase tracking-wide">
                      Jenis Barang
                    </p>
                    <p className="font-semibold text-gray-900 truncate">
                      {item.nama_barang}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-5 border border-rose-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-200 rounded-lg group-hover:scale-110 transition-transform">
                    <MapPin className="text-rose-700" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-rose-600 mb-1 uppercase tracking-wide">
                      Lokasi Ditemukan
                    </p>
                    <p className="font-semibold text-gray-900 truncate">
                      {item.lokasi_ditemukan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-sky-50 to-sky-100/50 rounded-xl p-5 border border-sky-200 hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-sky-200 rounded-lg group-hover:scale-110 transition-transform">
                    <Calendar className="text-sky-700" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-sky-600 mb-1 uppercase tracking-wide">
                      Tanggal Ditemukan
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8 mb-8 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                Deskripsi Barang
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                {item.deskripsi}
              </p>
            </div>
            {uploader && (
              <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-200 rounded-lg">
                    <UserIcon className="text-blue-700" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wide">
                      Penemu Barang
                    </p>
                    <p className="font-semibold text-gray-900">
                      {uploader.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Claim Form */}
            {item.status === "tersedia" && !showClaimForm && (
              <button
                onClick={() => setShowClaimForm(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Ajukan Klaim Barang
              </button>
            )}

            {showClaimForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Form Klaim Barang
                </h3>
                <form onSubmit={handleClaim} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kenapa Anda yakin ini barang Anda?
                    </label>
                    <textarea
                      value={claimData.pesan}
                      onChange={(e) =>
                        setClaimData({ ...claimData, pesan: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Jelaskan ciri-ciri khusus barang atau bukti kepemilikan..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Bukti (Opsional)
                    </label>
                    <input
                      type="url"
                      value={claimData.bukti_url}
                      onChange={(e) =>
                        setClaimData({
                          ...claimData,
                          bukti_url: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowClaimForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                      {submitting ? "Mengirim..." : "Kirim Klaim"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LostFoundDetail() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center text-gray-600">Memuat...</div>}
    >
      <LostFoundDetailContent />
    </Suspense>
  );
}
