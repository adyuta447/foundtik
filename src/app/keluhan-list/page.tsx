"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Image as ImageIcon } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "menunggu":
        return "bg-yellow-100 text-yellow-800";
      case "diproses":
        return "bg-blue-100 text-blue-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Memuat...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Keluhan Saya
            </h1>
            <p className="text-gray-600">
              Daftar laporan keluhan fasilitas kampus
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Buat Keluhan
          </button>
        </div>

        {keluhan.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">Belum ada keluhan yang dibuat</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Buat keluhan pertama
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Foto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Judul
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Lokasi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keluhan.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`/keluhan-detail?id=${item.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      {item.foto_url ? (
                        <Image
                          src={item.foto_url}
                          alt={item.judul}
                          width={64}
                          height={64}
                          unoptimized
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="text-gray-400" size={24} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.judul}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.kategori}</td>
                    <td className="px-6 py-4 text-gray-600">{item.lokasi}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Buat Keluhan Baru</h2>
        <KeluhanForm onClose={() => setCreateOpen(false)} />
      </Modal>
    </>
  );
}
