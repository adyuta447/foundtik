"use client";
import { useEffect, useState, Suspense } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { supabase, Keluhan } from "../../lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";

function KeluhanDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") || "";
  const router = useRouter();
  const [keluhan, setKeluhan] = useState<Keluhan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("keluhan")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        setKeluhan(data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "menunggu":
        return {
          color: "bg-amber-500",
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          icon: Clock,
          label: "Menunggu",
        };
      case "diproses":
        return {
          color: "bg-blue-500",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          icon: AlertCircle,
          label: "Sedang Diproses",
        };
      case "selesai":
        return {
          color: "bg-emerald-500",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-200",
          icon: CheckCircle2,
          label: "Selesai",
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
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
            <p className="text-center text-gray-600 mt-4">
              Memuat detail keluhan...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!keluhan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Keluhan Tidak Ditemukan
            </h3>
            <p className="text-gray-600 mb-6">
              Data keluhan yang Anda cari tidak tersedia
            </p>
            <button
              onClick={() => router.push("/keluhan-list")}
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

  const statusInfo = getStatusInfo(keluhan.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push("/keluhan-list")}
          className="group inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 px-4 py-2 rounded-xl hover:bg-white/60 transition-all"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Kembali</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Image Section */}
          {keluhan.foto_url && (
            <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200">
              <Image
                src={keluhan.foto_url}
                alt={keluhan.judul}
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          )}

          {/* Content Section */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Title & Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {keluhan.judul}
              </h1>
              <span
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} shadow-sm whitespace-nowrap`}
              >
                <StatusIcon size={18} />
                {statusInfo.label}
              </span>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="group bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-200 rounded-lg group-hover:scale-110 transition-transform">
                    <Tag className="text-purple-700" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-purple-600 mb-1 uppercase tracking-wide">
                      Kategori
                    </p>
                    <p className="font-semibold text-gray-900 truncate">
                      {keluhan.kategori}
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
                      Lokasi
                    </p>
                    <p className="font-semibold text-gray-900 truncate">
                      {keluhan.lokasi}
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
                      Tanggal Lapor
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(keluhan.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8 mb-8 border border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                Deskripsi Keluhan
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                {keluhan.deskripsi}
              </p>
            </div>

            {/* Progress Status Card */}
            <div
              className={`${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-xl p-6 sm:p-8 shadow-sm`}
            >
              <div className="flex items-start gap-3 mb-6">
                <div className={`p-2.5 ${statusInfo.color} rounded-xl`}>
                  <StatusIcon className="text-white" size={24} />
                </div>
                <div>
                  <h3
                    className={`font-bold text-lg ${statusInfo.textColor} mb-1`}
                  >
                    Status Progress
                  </h3>
                  <p className="text-sm text-gray-600">
                    {keluhan.status === "menunggu" &&
                      "Keluhan Anda sedang menunggu untuk diproses oleh tim kami"}
                    {keluhan.status === "diproses" &&
                      "Tim kami sedang menangani keluhan Anda dengan serius"}
                    {keluhan.status === "selesai" &&
                      "Keluhan Anda telah berhasil diselesaikan"}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className={statusInfo.textColor}>
                    {keluhan.status === "menunggu" && "Tahap 1 dari 3"}
                    {keluhan.status === "diproses" && "Tahap 2 dari 3"}
                    {keluhan.status === "selesai" && "Tahap 3 dari 3"}
                  </span>
                  <span className={statusInfo.textColor}>
                    {keluhan.status === "menunggu" && "33%"}
                    {keluhan.status === "diproses" && "66%"}
                    {keluhan.status === "selesai" && "100%"}
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`${statusInfo.color} h-3 rounded-full transition-all duration-500 ease-out shadow-sm`}
                    style={{
                      width:
                        keluhan.status === "menunggu"
                          ? "33%"
                          : keluhan.status === "diproses"
                          ? "66%"
                          : "100%",
                    }}
                  />
                </div>
              </div>

              {/* Status Steps */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
                <div
                  className={`text-center p-3 rounded-lg ${
                    keluhan.status === "menunggu"
                      ? statusInfo.color + " text-white"
                      : "bg-white text-gray-400"
                  } transition-all`}
                >
                  <Clock size={20} className="mx-auto mb-1" />
                  <p className="text-xs font-medium">Menunggu</p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${
                    keluhan.status === "diproses"
                      ? statusInfo.color + " text-white"
                      : keluhan.status === "selesai"
                      ? "bg-white text-gray-600"
                      : "bg-white text-gray-400"
                  } transition-all`}
                >
                  <AlertCircle size={20} className="mx-auto mb-1" />
                  <p className="text-xs font-medium">Diproses</p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${
                    keluhan.status === "selesai"
                      ? statusInfo.color + " text-white"
                      : "bg-white text-gray-400"
                  } transition-all`}
                >
                  <CheckCircle2 size={20} className="mx-auto mb-1" />
                  <p className="text-xs font-medium">Selesai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KeluhanDetail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
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
            <p className="text-center text-gray-600 mt-4">Memuat...</p>
          </div>
        </div>
      }
    >
      <KeluhanDetailContent />
    </Suspense>
  );
}
