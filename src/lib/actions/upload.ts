"use server";

import { createServiceClient } from "@/lib/supabase/admin";

const BUCKET = "listing-photos";
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadListingPhoto(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      error:
        "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env",
    };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided." };
  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "Image must be under 5MB." };
  }

  const supabase = createServiceClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}
