"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Loader,
} from "lucide-react";
import { supabase, LostFound } from "@/lib/supabase";
import Image from "next/image";
import VerificationModal from "@/components/modals/VerificationModal";

type LostFoundWithProfile = LostFound & {
  profiles: { name: string } | null;
};

export default function AdminLostFound() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [items, setItems] = useState<LostFoundWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<LostFound | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      if (!user || profile?.role !== "admin") {
        console.log("Not admin access blocked:", {
          user: user?.id,
          role: profile?.role,
        });
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: lostFoundData, error: lostFoundError } = await supabase
        .from("lost_found")
        .select("*")
        .order("created_at", { ascending: false });

      if (lostFoundError) {
        console.error("Error loading lost_found:", lostFoundError);
        setLoading(false);
        return;
      }

      if (lostFoundData && lostFoundData.length > 0) {
        const userIds = [...new Set(lostFoundData.map((item) => item.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error loading profiles:", profilesError);
          const itemsWithoutProfiles = lostFoundData.map((item) => ({
            ...item,
            profiles: { name: "Unknown" },
          })) as LostFoundWithProfile[];
          setItems(itemsWithoutProfiles);
        } else {
          const profileMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
          const itemsWithProfiles = lostFoundData.map((item) => ({
            ...item,
            profiles: profileMap.get(item.user_id) || { name: "Unknown" },
          })) as LostFoundWithProfile[];
          setItems(itemsWithProfiles);
        }
      } else {
        setItems([]);
      }

      setLoading(false);
    };
    loadData();
  }, [profile, user, authLoading]);

  const updateStatus = async (
    id: string,
    newStatus: "tersedia" | "verifikasi" | "returned"
  ) => {
    setUpdatingId(id);

    const { error } = await supabase
      .from("lost_found")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      const { data: lostFoundData, error: lostFoundError } = await supabase
        .from("lost_found")
        .select("*")
        .order("created_at", { ascending: false });

      if (!lostFoundError && lostFoundData) {
        const userIds = [...new Set(lostFoundData.map((item) => item.user_id))];

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (profilesError) {
          const itemsWithoutProfiles = lostFoundData.map((item) => ({
            ...item,
            profiles: { name: "Unknown" },
          })) as LostFoundWithProfile[];
          setItems(itemsWithoutProfiles);
        } else {
          const profileMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
          const itemsWithProfiles = lostFoundData.map((item) => ({
            ...item,
            profiles: profileMap.get(item.user_id) || { name: "Unknown" },
          })) as LostFoundWithProfile[];
          setItems(itemsWithProfiles);
        }
      }
    }

    setUpdatingId(null);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
    if (!authLoading && user && profile && profile.role !== "admin") {
      router.push("/");
    }
  }, [user, profile, authLoading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "tersedia":
        return {
          color: "bg-emerald-100 text-emerald-800",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-600",
          borderColor: "border-emerald-200",
          icon: CheckCircle2,
          label: "Tersedia",
        };
      case "verifikasi":
        return {
          color: "bg-amber-100 text-amber-800",
          bgColor: "bg-amber-50",
          textColor: "text-amber-600",
          borderColor: "border-amber-200",
          icon: Clock,
          label: "Verifikasi",
        };
      case "returned":
        return {
          color: "bg-blue-100 text-blue-800",
          bgColor: "bg-blue-50",
          textColor: "text-blue-600",
          borderColor: "border-blue-200",
          icon: AlertCircle,
          label: "Returned",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          bgColor: "bg-gray-50",
          textColor: "text-gray-600",
          borderColor: "border-gray-200",
          icon: AlertCircle,
          label: status,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }
  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Kelola Lost & Found
            </h1>
            <p className="text-gray-600 font-medium">
              Verifikasi dan kelola barang hilang & ditemukan
            </p>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl shadow-xl p-12 text-center border border-gray-100">
              <p className="text-gray-500 font-medium">
                Belum ada barang yang di-upload
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Foto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Nama Barang
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Lokasi
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Uploader
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Verifikasi
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {item.foto_url ? (
                          <div className="w-32 h-32 sm:w-40 sm:h-16 overflow-hidden rounded-lg shadow-md">
                            <Image
                              src={item.foto_url}
                              alt={item.nama_barang}
                              width={128}
                              height={128}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 sm:w-40 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-md">
                            <ImageIcon className="text-gray-400" size={24} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {item.nama_barang}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {item.deskripsi}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.lokasi_ditemukan}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.profiles?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const statusInfo = getStatusColor(item.status);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                            >
                              <StatusIcon size={16} />
                              {statusInfo.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.verifikasi_status ? (
                            <>
                              {item.verifikasi_status === "verified" ? (
                                <>
                                  <CheckCircle
                                    className="text-green-600"
                                    size={18}
                                  />
                                  <span className="text-xs font-medium text-green-600">
                                    Terverifikasi
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="text-red-600" size={18} />
                                  <span className="text-xs font-medium text-red-600">
                                    Ditolak
                                  </span>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setVerificationOpen(true);
                                }}
                                className="ml-auto px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                                title="Edit verifikasi"
                              >
                                Edit
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setVerificationOpen(true);
                              }}
                              className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                            >
                              Verifikasi
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateStatus(
                              item.id,
                              e.target.value as
                                | "tersedia"
                                | "verifikasi"
                                | "returned"
                            )
                          }
                          disabled={updatingId === item.id}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 hover:border-gray-400 transition-colors"
                        >
                          <option value="tersedia">Tersedia</option>
                          <option value="verifikasi">Verifikasi</option>
                          <option value="returned">Returned</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <VerificationModal
        item={selectedItem}
        isOpen={verificationOpen}
        onClose={() => {
          setVerificationOpen(false);
          setSelectedItem(null);
        }}
        onVerified={() => {
          // Reload data
          const loadData = async () => {
            const { data: lostFoundData, error: lostFoundError } =
              await supabase
                .from("lost_found")
                .select("*")
                .order("created_at", { ascending: false });

            if (!lostFoundError && lostFoundData) {
              const userIds = [
                ...new Set(lostFoundData.map((item) => item.user_id)),
              ];

              const { data: profilesData, error: profilesError } =
                await supabase
                  .from("profiles")
                  .select("id, name")
                  .in("id", userIds);

              if (profilesError) {
                const itemsWithoutProfiles = lostFoundData.map((item) => ({
                  ...item,
                  profiles: { name: "Unknown" },
                })) as LostFoundWithProfile[];
                setItems(itemsWithoutProfiles);
              } else {
                const profileMap = new Map(
                  profilesData?.map((p) => [p.id, p]) || []
                );
                const itemsWithProfiles = lostFoundData.map((item) => ({
                  ...item,
                  profiles: profileMap.get(item.user_id) || { name: "Unknown" },
                })) as LostFoundWithProfile[];
                setItems(itemsWithProfiles);
              }
            }
          };
          loadData();
        }}
      />
    </>
  );
}
