"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  AlertCircle,
  Package,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname() || "/";
  const isAdmin = profile?.role === "admin";

  const navItems = isAdmin
    ? [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/admin/keluhan", label: "Kelola Keluhan", icon: Settings },
        {
          href: "/admin/lostfound",
          label: "Kelola Lost & Found",
          icon: Package,
        },
        { href: "/profile", label: "Profil", icon: User },
      ]
    : [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/keluhan-list", label: "Keluhan", icon: AlertCircle },
        { href: "/lost-found-list", label: "Lost & Found", icon: Package },
        { href: "/profile", label: "Profil", icon: User },
      ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">SmartCampus</h1>
        <p className="text-sm text-slate-400 mt-1">{profile?.name}</p>
        <span className="inline-block mt-2 px-2 py-1 bg-slate-700 text-xs rounded-full">
          {profile?.role}
        </span>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
