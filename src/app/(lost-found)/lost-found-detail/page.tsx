"use client";
import { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Calendar, MapPin, User as UserIcon } from "lucide-react";
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
        return { color: "bg-green-100 text-green-800", label: "Tersedia" };
      case "verifikasi":
        return {
          color: "bg-yellow-100 text-yellow-800",
          label: "Dalam Verifikasi",
        };
      case "returned":
        return {
          color: "bg-gray-100 text-gray-800",
          label: "Sudah Dikembalikan",
        };
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

  if (!item) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Barang tidak ditemukan</div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(item.status);

  return (
    <div className="p-8">
      <button
        onClick={() => router.push("/lost-found-list")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Kembali
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {item.foto_url && (
          <div className="relative w-full h-96 bg-gray-100">
            <Image
              src={item.foto_url}
              alt={item.nama_barang}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {item.nama_barang}
            </h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Lokasi Ditemukan</p>
                <p className="font-medium text-gray-900">
                  {item.lokasi_ditemukan}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">Tanggal Ditemukan</p>
                <p className="font-medium text-gray-900">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {uploader && (
              <div className="flex items-start gap-3">
                <UserIcon className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Penemu</p>
                  <p className="font-medium text-gray-900">{uploader.name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Deskripsi
            </h2>
            <p className="text-gray-700 leading-relaxed">{item.deskripsi}</p>
          </div>

          {item.status === "tersedia" && !showClaimForm && (
            <button
              onClick={() => setShowClaimForm(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ajukan Klaim Barang
            </button>
          )}

          {showClaimForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
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
                      setClaimData({ ...claimData, bukti_url: e.target.value })
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
