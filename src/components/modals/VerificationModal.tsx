"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LostFound } from "@/lib/supabase";

interface VerificationModalProps {
  item: LostFound | null;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function VerificationModal({
  item,
  isOpen,
  onClose,
  onVerified,
}: VerificationModalProps) {
  const [verificationStatus, setVerificationStatus] = useState<
    "verified" | "rejected"
  >("verified");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleClose = () => {
    setVerificationStatus("verified");
    setNotes("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("lost_found")
      .update({
        verifikasi_status: verificationStatus,
        verifikasi_catatan: notes,
        verifikasi_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setNotes("");
    onVerified();
    handleClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 shadow bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 overflow-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Verifikasi Barang
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Barang:</strong> {item.nama_barang}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Lokasi Ditemukan:</strong> {item.lokasi_ditemukan}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Tanggal Ditemukan:</strong>{" "}
            {new Date(item.tanggal_ditemukan).toLocaleDateString("id-ID")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Verifikasi
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="verified"
                  checked={verificationStatus === "verified"}
                  onChange={(e) =>
                    setVerificationStatus(e.target.value as "verified")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  ✓ Verifikasi - Barang Asli
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="rejected"
                  checked={verificationStatus === "rejected"}
                  onChange={(e) =>
                    setVerificationStatus(e.target.value as "rejected")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  ✗ Tolak - Barang Tidak Sesuai
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Verifikasi
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Barang sesuai dengan deskripsi | Barang rusak/tidak sesuai"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                verificationStatus === "verified"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Memproses..." : "Simpan Verifikasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
