"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const KATEGORI_OPTIONS = [
  "AC / Pendingin Ruangan",
  "WC / Toilet",
  "Listrik / Stopkontak",
  "Meja / Kursi",
  "Proyektor",
  "Papan Tulis",
  "Pintu / Jendela",
  "Lainnya",
];

export default function KeluhanNew() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    judul: "",
    kategori: KATEGORI_OPTIONS[0],
    lokasi: "",
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
        .from("keluhan")
        .upload(fileName, file);

      if (uploadError) {
        setError("Gagal mengupload foto");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("keluhan")
        .getPublicUrl(fileName);
      fotoUrl = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("keluhan").insert({
      user_id: user.id,
      judul: formData.judul,
      kategori: formData.kategori,
      lokasi: formData.lokasi,
      deskripsi: formData.deskripsi,
      foto_url: fotoUrl,
      status: "menunggu",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/keluhan-list");
  };

  return (
    <div className="p-8">
      <button
        onClick={() => router.push("/keluhan-list")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Kembali
      </button>

      <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Buat Keluhan Baru
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Keluhan
            </label>
            <input
              type="text"
              value={formData.judul}
              onChange={(e) =>
                setFormData({ ...formData, judul: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: AC Rusak di Ruang Kelas 301"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={formData.kategori}
              onChange={(e) =>
                setFormData({ ...formData, kategori: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {KATEGORI_OPTIONS.map((kategori) => (
                <option key={kategori} value={kategori}>
                  {kategori}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <input
              type="text"
              value={formData.lokasi}
              onChange={(e) =>
                setFormData({ ...formData, lokasi: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Gedung A, Lantai 3, Ruang 301"
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
                  <span className="text-gray-600">Klik untuk upload foto</span>
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
              placeholder="Jelaskan detail keluhan Anda..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Menyimpan..." : "Submit Keluhan"}
          </button>
        </form>
      </div>
    </div>
  );
}
