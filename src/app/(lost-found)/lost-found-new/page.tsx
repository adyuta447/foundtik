"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";

export default function LostFoundNew() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama_barang: "",
    lokasi_ditemukan: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    let fotoUrl = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("lostfound")
        .upload(fileName, file);

      if (uploadError) {
        setError("Gagal mengupload foto");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("lostfound")
        .getPublicUrl(fileName);
      fotoUrl = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("lost_found").insert({
      user_id: user.id,
      nama_barang: formData.nama_barang,
      lokasi_ditemukan: formData.lokasi_ditemukan,
      deskripsi: formData.deskripsi,
      foto_url: fotoUrl,
      status: "tersedia",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/lost-found-list");
  };

  return (
    <div className="p-8">
      <button
        onClick={() => router.push("/lost-found-list")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Kembali
      </button>

      <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Upload Barang Ditemukan
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Dompet Hitam, Charger iPhone, dll"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Gedung A, Lantai 2, Dekat Kantin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Foto
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {preview ? (
                <div className="space-y-4">
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
                    className="text-red-600 text-sm hover:text-red-700"
                  >
                    Hapus Foto
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <span className="text-gray-600">
                    Klik untuk upload foto barang
                  </span>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Jelaskan detail barang yang ditemukan..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Menyimpan..." : "Upload Barang"}
          </button>
        </form>
      </div>
    </div>
  );
}
