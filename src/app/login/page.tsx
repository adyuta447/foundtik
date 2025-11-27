"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check if environment variables are loaded
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        setError(
          "Konfigurasi Supabase tidak lengkap. Periksa variabel environment."
        );
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setLoading(false);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Gagal menghubungi server. Periksa koneksi internet dan URL Supabase.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col justify-center items-center gap-2 mb-8">
          <Image
            src="/foundtik.png"
            width={200}
            height={100}
            alt="FoundTIK Logo"
          />
          <p className="text-gray-600 text-center">
            Masuk ke akun Anda untuk mencari/menemukan barang hilang atau
            keluhan fasilitas
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="nama@email.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* <div className="mt-6 text-center">
          <p className="text-gray-600">
            Belum punya akun?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Daftar
            </button>
          </p>
        </div> */}
      </div>
    </div>
  );
}
