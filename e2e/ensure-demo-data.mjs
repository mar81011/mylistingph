import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes("your-project")) {
  console.warn(
    "Skipping demo data prepare — add real Supabase credentials to .env, or record against production with DEMO_BASE_URL."
  );
  process.exit(0);
}

const supabase = createClient(url, key);

async function main() {
  const { data: existing, error: readError } = await supabase
    .from("Client")
    .select("id, name")
    .limit(1);

  if (readError) {
    console.error("Could not read Client table:", readError.message);
    process.exit(1);
  }

  if (existing?.length) {
    console.log(`Demo data OK — client: ${existing[0].name}`);
    return;
  }

  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from("Client").insert({
    id: crypto.randomUUID(),
    name: "Maria Fe Senanin",
    phone: "09287674554",
    messengerUrl: "",
    facebookUrl: "",
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  });

  if (insertError) {
    console.error("Could not seed demo client:", insertError.message);
    process.exit(1);
  }

  console.log("Seeded default demo client.");
}

main();
