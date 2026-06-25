/**
 * Merges Vercel-injected env (via `vercel env run`) into .env for keys that are empty locally.
 * Run: npx vercel env run --environment production -- node scripts/pull-vercel-env-local.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");

const SECRET_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "ADMIN_PIN",
];

const PUBLIC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "AI_PROVIDER",
];

const ALL_KEYS = [...SECRET_KEYS, ...PUBLIC_KEYS];

function parseEnv(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  return map;
}

function formatEnv(existingText, map) {
  const lines = existingText.split(/\r?\n/);
  const seen = new Set();
  const out = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      out.push(line);
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      out.push(line);
      continue;
    }
    const key = trimmed.slice(0, eq);
    seen.add(key);
    const current = map.get(key) ?? "";
    const fromVercel = process.env[key];
    const value =
      current === "" && fromVercel ? fromVercel : current || fromVercel || "";
    if (value) map.set(key, value);
    out.push(`${key}=${map.get(key) ?? ""}`);
  }

  for (const key of ALL_KEYS) {
    if (seen.has(key)) continue;
    const value = process.env[key];
    if (value) {
      out.push(`${key}=${value}`);
      map.set(key, value);
    }
  }

  return out.join("\n").replace(/\n*$/, "\n");
}

const existing = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
const map = parseEnv(existing);
const merged = formatEnv(existing, map);
fs.writeFileSync(ENV_PATH, merged);

const filled = ALL_KEYS.filter((k) => {
  const v = process.env[k];
  return v && v.length > 0;
});
console.log(`Updated .env — filled ${filled.length}/${ALL_KEYS.length} keys from Vercel production.`);
