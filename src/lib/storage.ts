import { supabase } from "./supabase";

const BUCKET_NAME = "photos";

export async function ensureBucketExists() {
  try {
    const { error: createError } = await supabase.storage.createBucket(
      BUCKET_NAME,
      {
        public: true,
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
        fileSizeLimit: 5242880,
      }
    );
    if (
      createError &&
      !createError.message.includes("already exists") &&
      !createError.message.includes("duplicate") &&
      createError.message !== "Bucket already exists"
    ) {
      console.error("Error with bucket:", createError);
    }

    return true;
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    return true;
  }
}

export async function uploadFile(
  file: File,
  folder: "keluhan" | "lostfound",
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Ukuran file terlalu besar (max 5MB)",
      };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)) {
      return {
        success: false,
        error: "Format file tidak didukung (jpg, png, gif, webp)",
      };
    }
    await ensureBucketExists();

    const fileName = `${folder}/${userId}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, { upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      if (
        uploadError.message?.includes("Bucket not found") ||
        uploadError.message?.includes("bucket does not exist")
      ) {
        return {
          success: false,
          error: `Storage belum dikonfigurasi. Silakan buat bucket "${BUCKET_NAME}" di Supabase Storage dan atur ke public.`,
        };
      }

      return {
        success: false,
        error: `Upload gagal: ${uploadError.message}`,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Tidak dapat mengakses URL file",
      };
    }

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      error: `Terjadi kesalahan: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
