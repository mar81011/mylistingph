import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import { DEMO_MUSIC_PATH } from "./ensure-demo-music.mjs";

const resultsDir = join(process.cwd(), "demo-output", "test-results");
const outDir = join(process.cwd(), "demo-output");
const outFile = join(outDir, "listingph-facebook-demo.mp4");
const trimStart = Number(process.env.DEMO_TRIM_START ?? "2");
const crf = process.env.DEMO_CRF ?? "17";
const musicVolume = Number(process.env.DEMO_MUSIC_VOLUME ?? "0.2");
const musicFile = process.env.DEMO_MUSIC ?? DEMO_MUSIC_PATH;
const useMusic = process.env.DEMO_NO_MUSIC !== "1" && existsSync(musicFile);

function findLatestWebm(dir) {
  if (!existsSync(dir)) return null;

  let latest = null;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findLatestWebm(full);
      if (nested) {
        const mtime = statSync(nested).mtimeMs;
        if (!latest || mtime > latest.mtime) latest = { path: nested, mtime };
      }
      continue;
    }
    if (entry.name.endsWith(".webm")) {
      const mtime = statSync(full).mtimeMs;
      if (!latest || mtime > latest.mtime) latest = { path: full, mtime };
    }
  }

  return latest?.path ?? null;
}

function probeDuration(file) {
  const probe = spawnSync(
    ffmpegPath,
    ["-hide_banner", "-i", file],
    { encoding: "utf8" }
  );
  const match = (probe.stderr || "").match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (!match) return null;
  const [, h, m, s] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

const input = findLatestWebm(resultsDir);
if (!input) {
  console.error("No Playwright .webm recording found under demo-output/test-results");
  console.error("Run: npm run demo:record");
  process.exit(1);
}

if (!ffmpegPath) {
  console.error("ffmpeg-static binary not found");
  process.exit(1);
}

if (!useMusic) {
  console.warn(
    "No demo music found — output will be silent. Run: node scripts/ensure-demo-music.mjs"
  );
}

mkdirSync(outDir, { recursive: true });

const rawDuration = probeDuration(input);
const trimmedDuration =
  rawDuration && trimStart > 0
    ? Math.max(1, rawDuration - trimStart)
    : rawDuration;

console.log(`Source: ${input}`);
if (rawDuration) console.log(`Raw duration: ${rawDuration.toFixed(1)}s`);
if (trimStart > 0) console.log(`Trimming first ${trimStart}s (blank startup)`);
if (useMusic) {
  console.log(`Music: ${musicFile} (volume ${musicVolume})`);
}

const fadeIn = 2;
const fadeOut = 3;
const fadeOutStart = trimmedDuration
  ? Math.max(0, trimmedDuration - fadeOut)
  : 0;

const ffmpegArgs = ["-y"];

if (trimStart > 0) {
  ffmpegArgs.push("-ss", String(trimStart));
}

ffmpegArgs.push("-i", input);

if (useMusic) {
  ffmpegArgs.push("-stream_loop", "-1", "-i", musicFile);

  const audioFilter = trimmedDuration
    ? `[1:a]volume=${musicVolume},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart.toFixed(2)}:d=${fadeOut},atrim=0:${trimmedDuration.toFixed(2)}[music]`
    : `[1:a]volume=${musicVolume},afade=t=in:st=0:d=${fadeIn}[music]`;

  ffmpegArgs.push(
    "-filter_complex",
    audioFilter,
    "-map",
    "0:v:0",
    "-map",
    "[music]",
    "-shortest"
  );
}

ffmpegArgs.push(
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  crf,
  "-pix_fmt",
  "yuv420p",
  "-vf",
  "scale=1920:1080:flags=lanczos",
  "-movflags",
  "+faststart"
);

if (useMusic) {
  ffmpegArgs.push("-c:a", "aac", "-b:a", "192k", "-ar", "48000");
} else {
  ffmpegArgs.push("-an");
}

ffmpegArgs.push(outFile);

const result = spawnSync(ffmpegPath, ffmpegArgs, { stdio: "inherit" });

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const finalDuration = probeDuration(outFile);
const sizeMb = (statSync(outFile).size / (1024 * 1024)).toFixed(2);
console.log(`Output: ${outFile}`);
console.log(`Final duration: ${finalDuration?.toFixed(1) ?? "?"}s | Size: ${sizeMb} MB`);
if (useMusic) {
  console.log("Audio: background music mixed in (set DEMO_NO_MUSIC=1 to disable)");
}
console.log("Done — upload listingph-facebook-demo.mp4 to Facebook.");
