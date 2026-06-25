import { createWriteStream, existsSync, statSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const outDir = join(process.cwd(), "e2e", "fixtures");
const outFile = join(outDir, "demo-music.mp3");

/** Royalty-free instrumental (SoundHelix — free for commercial use). */
const MUSIC_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3";

export const DEMO_MUSIC_PATH = outFile;

async function download(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  if (!res.body) {
    throw new Error(`Empty response: ${url}`);
  }
  mkdirSync(outDir, { recursive: true });
  await pipeline(res.body, createWriteStream(dest));
}

async function main() {
  if (existsSync(outFile) && statSync(outFile).size > 50_000) {
    console.log(`Demo music ready: ${outFile}`);
    return;
  }

  console.log("Downloading royalty-free demo music…");
  try {
    await download(MUSIC_URL, outFile);
    console.log(`Saved: ${outFile}`);
  } catch (err) {
    console.error(
      "Could not download demo music. Place your own track at:",
      outFile
    );
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
