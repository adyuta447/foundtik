import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  role: "mahasiswa" | "dosen" | "admin";
  nim_nip: string | null;
  created_at: string;
};

export type Keluhan = {
  id: string;
  user_id: string;
  judul: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  foto_url: string | null;
  status: "menunggu" | "diproses" | "selesai";
  created_at: string;
};

export type LostFound = {
  id: string;
  user_id: string;
  nama_barang: string;
  lokasi_ditemukan: string;
  tanggal_ditemukan: string;
  deskripsi: string;
  foto_url: string | null;
  status: "tersedia" | "verifikasi" | "returned";
  verifikasi_status?: "pending" | "verified" | "rejected";
  verifikasi_catatan?: string;
  verifikasi_by?: string;
  verifikasi_at?: string;
  created_at: string;
};

export type KlaimBarang = {
  id: string;
  lost_found_id: string;
  user_id: string;
  pesan: string;
  bukti_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};
