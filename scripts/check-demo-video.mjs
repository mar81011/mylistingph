import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const video = join(process.cwd(), "demo-output", "listingph-facebook-demo.mp4");

if (!existsSync(video)) {
  console.error("No demo video found. Run: npm run demo:video");
  process.exit(1);
}

const probe = spawnSync(ffmpegPath, ["-hide_banner", "-i", video], {
  encoding: "utf8",
});
const stderr = probe.stderr || "";

const durationMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
const streamMatch = stderr.match(/Video:.*\s(\d{3,4})x(\d{3,4})/);
const hasAudio = /Audio:/.test(stderr);

let durationSec = null;
if (durationMatch) {
  const [, h, m, s] = durationMatch;
  durationSec = Number(h) * 3600 + Number(m) * 60 + Number(s);
}

const sizeMb = (statSync(video).size / (1024 * 1024)).toFixed(2);

console.log("Demo video check");
console.log("----------------");
console.log(`File:   ${video}`);
console.log(`Size:   ${sizeMb} MB`);
console.log(`Length: ${durationSec ? `${durationSec.toFixed(1)}s` : "unknown"}`);
if (streamMatch) {
  console.log(`Resolution: ${streamMatch[1]}x${streamMatch[2]}`);
}
console.log(`Audio:  ${hasAudio ? "yes" : "no (silent)"}`);
if (!hasAudio) {
  console.warn("Tip: run node scripts/ensure-demo-music.mjs then npm run demo:convert");
}

if (durationSec && durationSec < 30) {
  console.warn("Warning: video is shorter than 30s — demo may have ended early.");
}

if (durationSec && durationSec > 120) {
  console.warn("Warning: video is over 2 minutes — consider trimming for Facebook.");
}

console.log("OK");
