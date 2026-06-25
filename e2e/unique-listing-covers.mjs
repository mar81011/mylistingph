import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes("your-project")) {
  console.warn("Skipping unique covers — add Supabase credentials to .env");
  process.exit(0);
}

/** Distinct cover images — one per listing on the grid. */
const COVER_POOL = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=1200&h=800&fit=crop",
];

const supabase = createClient(url, key);

async function main() {
  const { data: listings, error } = await supabase
    .from("Listing")
    .select("id, title, photos")
    .eq("status", "active")
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Could not read listings:", error.message);
    process.exit(1);
  }

  if (!listings?.length) {
    console.log("No active listings to update.");
    return;
  }

  let updated = 0;
  const now = new Date().toISOString();

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    const photos = Array.isArray(listing.photos) ? [...listing.photos] : [];
    const cover = COVER_POOL[i % COVER_POOL.length];

    if (photos[0] === cover) continue;

    const nextPhotos = [cover, ...photos.slice(1).filter((p) => p !== cover)];

    const { error: updateError } = await supabase
      .from("Listing")
      .update({ photos: nextPhotos, updatedAt: now })
      .eq("id", listing.id);

    if (updateError) {
      console.error(`Failed to update ${listing.title}:`, updateError.message);
      continue;
    }

    updated++;
    console.log(`Cover → ${listing.title}`);
  }

  console.log(`Updated ${updated} listing cover(s).`);
}

main();
