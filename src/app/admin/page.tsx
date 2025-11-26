"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Admin Index Page
 * Redirects to /admin/keluhan as default admin view
 */
export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin/keluhan as the default admin dashboard
    router.replace("/admin/keluhan");
  }, [router]);

  return null;
}
