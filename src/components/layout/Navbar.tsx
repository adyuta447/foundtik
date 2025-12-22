"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Power, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const router = useRouter();

  const pathForRole = (path: string) => {
    if (profile?.role === "admin") {
      if (path === "/keluhan-list") return "/admin/keluhan";
      if (path === "/lost-found-list") return "/admin/lost-found";
      return `/admin${path}`;
    }
    return path;
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Image
              src={"/foundtik.png"}
              width={150}
              height={80}
              alt="FoundTIK Logo"
            />
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href={pathForRole("/")}
              className={`px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-50`}
            >
              Dashboard
            </Link>

            <Link
              href={pathForRole("/keluhan-list")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive("/keluhan")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Keluhan
            </Link>

            <Link
              href={pathForRole("/lost-found-list")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive("/lost-found")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Lost &amp; Found
            </Link>

            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Logout"
              >
                <Power className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <Link
              href={pathForRole("/")}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full block px-4 py-2 rounded-lg font-medium transition text-gray-600 hover:bg-gray-50`}
            >
              Dashboard
            </Link>

            <Link
              href={pathForRole("/keluhan-list")}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full block px-4 py-2 rounded-lg font-medium transition ${
                isActive("/keluhan")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Keluhan
            </Link>

            <Link
              href={pathForRole("/lost-found-list")}
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full block px-4 py-2 rounded-lg font-medium transition ${
                isActive("/lost-found")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Lost &amp; Found
            </Link>

            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center space-x-2"
              >
                <Power className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
