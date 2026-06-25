import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Add it to .env (local) or Vercel env vars (production).",
    );
  }
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Copy the service_role key from Supabase → Settings → API.",
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
