/**
 * Restore Vercel env vars via REST API (reliable on Windows; avoids broken CLI stdin).
 *
 * Usage:
 *   node scripts/restore-vercel-env.mjs
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/restore-vercel-env.mjs
 */
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

dotenv.config();

const TEAM_ID = "team_pLOPybUbhAh23xp9OQ3L8jEc";
const PROJECT = "prj_YtxNIgMJoiNfR4lPAk86dJaVSuXl";
const TARGETS = ["production", "preview", "development"];

const auth = JSON.parse(
  readFileSync(
    join(homedir(), "AppData/Roaming/xdg.data/com.vercel.cli/auth.json"),
    "utf8",
  ),
);

const vars = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    value: "https://bqtkuystuusvqenznqlu.supabase.co",
    type: "plain",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    value:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdGt1eXN0dXVzdnFlbnpucWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODQ1MzUsImV4cCI6MjA5Nzc2MDUzNX0.-HYCDVImZXh3dh_qDjYALrStBPb3J_B9UWnI2TBCPD4",
    type: "encrypted",
  },
  {
    key: "NEXT_PUBLIC_SITE_URL",
    value: "https://listingph.vercel.app",
    type: "plain",
  },
  { key: "ADMIN_PIN", value: process.env.ADMIN_PIN || "121022", type: "encrypted" },
];

if (process.env.GEMINI_API_KEY) {
  vars.push({
    key: "GEMINI_API_KEY",
    value: process.env.GEMINI_API_KEY,
    type: "encrypted",
  });
}

vars.push({
  key: "AI_PROVIDER",
  value: process.env.AI_PROVIDER || "gemini",
  type: "plain",
});

if (process.env.GROQ_API_KEY) {
  vars.push({
    key: "GROQ_API_KEY",
    value: process.env.GROQ_API_KEY,
    type: "encrypted",
  });
}

if (process.env.OPENAI_API_KEY) {
  vars.push({
    key: "OPENAI_API_KEY",
    value: process.env.OPENAI_API_KEY,
    type: "encrypted",
  });
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  vars.push({
    key: "SUPABASE_SERVICE_ROLE_KEY",
    value: process.env.SUPABASE_SERVICE_ROLE_KEY,
    type: "encrypted",
  });
}

if (process.env.DATABASE_URL) {
  vars.push({
    key: "DATABASE_URL",
    value: process.env.DATABASE_URL,
    type: "encrypted",
  });
}

if (process.env.DIRECT_URL) {
  vars.push({
    key: "DIRECT_URL",
    value: process.env.DIRECT_URL,
    type: "encrypted",
  });
}

async function upsert(name, value, type, target) {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT}/env?upsert=true&teamId=${TEAM_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: name, value, type, target: [target] }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `${name}@${target}: ${data.error?.message || res.statusText}`,
    );
  }
  return data;
}

console.log("Restoring Vercel environment variables...\n");

for (const v of vars) {
  for (const target of TARGETS) {
    if (
      (v.key === "DATABASE_URL" || v.key === "DIRECT_URL") &&
      target !== "production"
    ) {
      continue;
    }
    try {
      await upsert(v.key, v.value, v.type, target);
      console.log(`  ✓ ${v.key} → ${target}`);
    } catch (e) {
      console.error(`  ✗ ${e.message}`);
    }
  }
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log(
    "\n⚠ SUPABASE_SERVICE_ROLE_KEY not set — pass it to fix admin:\n" +
      "  SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/restore-vercel-env.mjs",
  );
} else {
  console.log("\n✓ Service role key restored. Run: npx vercel deploy --prod");
}
