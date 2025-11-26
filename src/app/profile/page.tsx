"use client";
import { User as UserIcon, Mail, CreditCard, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Memuat...</div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "dosen":
        return "bg-blue-100 text-blue-800";
      case "mahasiswa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
        <p className="text-gray-600">Informasi akun Anda</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="text-blue-600" size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {profile.name}
            </h2>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(
                profile.role
              )}`}
            >
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Mail className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{profile.id}</p>
            </div>
          </div>

          {profile.nim_nip && (
            <div className="flex items-start gap-4">
              <CreditCard className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {profile.role === "mahasiswa" ? "NIM" : "NIP"}
                </p>
                <p className="font-medium text-gray-900">{profile.nim_nip}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4">
            <Award className="text-gray-400 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="font-medium text-gray-900">Aktif</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Akun dibuat pada{" "}
            {new Date(profile.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
