"use client";
import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LostFoundForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama_barang: "",
    lokasi_ditemukan: "",
    tanggal_ditemukan: new Date().toISOString().split("T")[0],
    deskripsi: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    let fotoUrl = null;

    if (file) {
      const uploadResult = await uploadFile(file, "lostfound", user.id);
      if (!uploadResult.success) {
        setError(uploadResult.error || "Gagal mengupload foto");
        setLoading(false);
        return;
      }
      fotoUrl = uploadResult.url;
    }

    const { error: insertError } = await supabase.from("lost_found").insert({
      user_id: user.id,
      nama_barang: formData.nama_barang,
      lokasi_ditemukan: formData.lokasi_ditemukan,
      tanggal_ditemukan: formData.tanggal_ditemukan,
      deskripsi: formData.deskripsi,
      foto_url: fotoUrl,
      status: "tersedia",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nama Barang
        </label>
        <input
          type="text"
          value={formData.nama_barang}
          onChange={(e) =>
            setFormData({ ...formData, nama_barang: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lokasi Ditemukan
        </label>
        <input
          type="text"
          value={formData.lokasi_ditemukan}
          onChange={(e) =>
            setFormData({ ...formData, lokasi_ditemukan: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tanggal Ditemukan
        </label>
        <input
          type="date"
          value={formData.tanggal_ditemukan}
          onChange={(e) =>
            setFormData({ ...formData, tanggal_ditemukan: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Foto
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          {preview ? (
            <div className="space-y-3">
              <div className="mx-auto rounded-lg overflow-hidden max-h-64">
                <Image
                  src={preview}
                  alt="Preview"
                  width={600}
                  height={400}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="text-red-600 text-sm"
              >
                Hapus Foto
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <div className="text-gray-600">Klik untuk upload foto barang</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.deskripsi}
          onChange={(e) =>
            setFormData({ ...formData, deskripsi: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          rows={4}
          required
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md border"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white"
        >
          {loading ? "Menyimpan..." : "Upload Barang"}
        </button>
      </div>
    </form>
  );
}
