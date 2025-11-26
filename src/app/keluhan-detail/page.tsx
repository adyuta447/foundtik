"use client";
import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Calendar, MapPin, Tag } from "lucide-react";
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
        return { color: "bg-yellow-100 text-yellow-800", label: "Menunggu" };
      case "diproses":
        return { color: "bg-blue-100 text-blue-800", label: "Sedang Diproses" };
      case "selesai":
        return { color: "bg-green-100 text-green-800", label: "Selesai" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: status };
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Memuat...</div>
      </div>
    );
  }

  if (!keluhan) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Keluhan tidak ditemukan</div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(keluhan.status);

  return (
    <div className="p-8">
      <button
        onClick={() => router.push("/keluhan-list")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Kembali
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {keluhan.foto_url && (
          <div className="w-full h-96 bg-gray-100 relative">
            <Image
              src={keluhan.foto_url}
              alt={keluhan.judul}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {keluhan.judul}
            </h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <Tag className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Kategori</p>
                <p className="font-medium text-gray-900">{keluhan.kategori}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Lokasi</p>
                <p className="font-medium text-gray-900">{keluhan.lokasi}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Tanggal</p>
                <p className="font-medium text-gray-900">
                  {new Date(keluhan.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Deskripsi
            </h2>
            <p className="text-gray-700 leading-relaxed">{keluhan.deskripsi}</p>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Status Progress
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-700">
                    {keluhan.status === "menunggu" && "Menunggu Proses"}
                    {keluhan.status === "diproses" && "Sedang Ditangani"}
                    {keluhan.status === "selesai" && "Telah Diselesaikan"}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
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
      fallback={<div className="p-8 text-center text-gray-600">Memuat...</div>}
    >
      <KeluhanDetailContent />
    </Suspense>
  );
}
