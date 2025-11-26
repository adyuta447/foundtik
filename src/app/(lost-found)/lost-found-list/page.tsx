"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Image as ImageIcon, Search } from "lucide-react";
import { supabase, LostFound } from "../../../lib/supabase";
import Modal from "@/components/ui/Modal";
import LostFoundForm from "../../../components/forms/LostFoundForm";

export default function LostFoundList() {
  const router = useRouter();
  const [items, setItems] = useState<LostFound[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    loadData();
  }, []);

  // Filter items berdasarkan search query
  const filtered = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.nama_barang.toLowerCase().includes(query) ||
      item.lokasi_ditemukan.toLowerCase().includes(query) ||
      item.deskripsi.toLowerCase().includes(query)
    );
  });

  const displayItems = searchQuery.trim() ? filtered : items;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "tersedia":
        return "bg-green-100 text-green-800";
      case "verifikasi":
        return "bg-yellow-100 text-yellow-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
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
              Lost & Found
            </h1>
            <p className="text-gray-600">
              Barang hilang dan ditemukan di kampus
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Upload Barang
          </button>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari barang berdasarkan nama, lokasi, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {displayItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Barang tidak ditemukan"
                : "Belum ada barang yang ditemukan"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setCreateOpen(true)}
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Upload barang pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/lost-found-detail?id=${item.id}`)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {item.foto_url ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={item.foto_url}
                      alt={item.nama_barang}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="text-gray-400" size={48} />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {item.nama_barang}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    Ditemukan di: {item.lokasi_ditemukan}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(item.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          loadData();
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Upload Barang Ditemukan</h2>
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
