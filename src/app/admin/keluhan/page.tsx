"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { supabase, Keluhan } from "../../../lib/supabase";

type KeluhanWithProfile = Keluhan & {
  profiles: { name: string } | null;
};

export default function AdminKeluhan() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [keluhan, setKeluhan] = useState<KeluhanWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "semua" | "menunggu" | "diproses" | "selesai"
  >("semua");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const reloadData = async () => {
      if (profile?.role !== "admin") return;
      setLoading(true);

      let query = supabase
        .from("keluhan")
        .select("*, profiles(name)")
        .order("created_at", { ascending: false });

      if (filter !== "semua") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (!error && data) {
        setKeluhan(data as KeluhanWithProfile[]);
      }
      setLoading(false);
    };
    reloadData();
  }, [filter, profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
    if (!authLoading && user && profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [user, profile, authLoading, router]);

  const updateStatus = async (
    id: string,
    newStatus: "menunggu" | "diproses" | "selesai"
  ) => {
    setUpdatingId(id);

    const { error } = await supabase
      .from("keluhan")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      const reloadData = async () => {
        if (profile?.role !== "admin") return;
        let query = supabase
          .from("keluhan")
          .select("*, profiles(name)")
          .order("created_at", { ascending: false });

        if (filter !== "semua") {
          query = query.eq("status", filter);
        }

        const { data, error } = await query;
        if (!error && data) {
          setKeluhan(data as KeluhanWithProfile[]);
        }
      };
      reloadData();
    }

    setUpdatingId(null);
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Keluhan
          </h1>
          <p className="text-gray-600">
            Pantau dan update status keluhan dari mahasiswa
          </p>
        </div>

        <div className="mb-6 flex gap-3">
          {["semua", "menunggu", "diproses", "selesai"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {keluhan.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500">Tidak ada keluhan dengan filter ini</p>
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
                    Pelapor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Lokasi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keluhan.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.judul}</p>
                      <p className="text-sm text-gray-600">{item.kategori}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.profiles?.name || "Unknown"}
                    </td>
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
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateStatus(
                              item.id,
                              e.target.value as
                                | "menunggu"
                                | "diproses"
                                | "selesai"
                            )
                          }
                          disabled={updatingId === item.id}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="menunggu">Menunggu</option>
                          <option value="diproses">Diproses</option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
