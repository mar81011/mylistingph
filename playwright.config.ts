import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const baseURL =
  process.env.DEMO_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

const videoWidth = Number(process.env.DEMO_VIDEO_WIDTH ?? "1920");
const videoHeight = Number(process.env.DEMO_VIDEO_HEIGHT ?? "1080");

export default defineConfig({
  testDir: "./e2e",
  timeout: 480_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "off",
    video: {
      mode: "on",
      size: { width: videoWidth, height: videoHeight },
    },
    viewport: { width: videoWidth, height: videoHeight },
    deviceScaleFactor: 1,
    locale: "en-PH",
    colorScheme: "light",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    launchOptions: {
      args: [
        "--disable-popup-blocking",
        "--font-render-hinting=medium",
        "--disable-lcd-text",
      ],
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        channel: "chrome",
        viewport: { width: videoWidth, height: videoHeight },
        deviceScaleFactor: 1,
      },
    },
  ],
  outputDir: "demo-output/test-results",
});
