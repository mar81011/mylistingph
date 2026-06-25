import { expect, type Locator, type Page } from "@playwright/test";

export const SCENE = {
  intro: 3500,
  hero: 1800,
  proof: 2200,
  outro: 4000,
  beat: 1100,
  field: 750,
  photo: 1400,
} as const;

export async function pause(page: Page, ms: number = SCENE.beat) {
  await page.waitForTimeout(ms);
}

/** Keep browser at 100% scale and top of page — fills the 1920×1080 recording frame. */
export async function preparePageForRecording(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
}

export async function resetPageZoom(page: Page) {
  await preparePageForRecording(page);
}

export async function smoothScroll(page: Page, deltaY: number, steps = 10) {
  const step = deltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollBy(0, y), step);
    await page.waitForTimeout(100);
  }
}

export async function typeSlowly(locator: Locator, text: string, delay = 85) {
  await locator.scrollIntoViewIfNeeded();
  await locator.click();
  await locator.fill("");
  await locator.pressSequentially(text, { delay });
}

/** Pause, fill one field visibly, pause again — for demo recordings. */
export async function fillField(
  page: Page,
  locator: Locator,
  value: string,
  delay = 85
) {
  await pause(page, SCENE.field);
  await typeSlowly(locator, value, delay);
  await pause(page, SCENE.field);
}

export async function selectField(
  page: Page,
  locator: Locator,
  options: { label?: string; value?: string }
) {
  await locator.scrollIntoViewIfNeeded();
  await pause(page, SCENE.field);
  if (options.label) await locator.selectOption({ label: options.label });
  else if (options.value) await locator.selectOption(options.value);
  await pause(page, SCENE.field);
}

export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
}

const FULLSCREEN_SLIDE = (opts: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta?: string;
  url?: string;
  bgImage: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      color: #fff;
      background: #0f172a;
    }
    .slide {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        linear-gradient(135deg, rgba(4, 120, 87, 0.88) 0%, rgba(15, 23, 42, 0.82) 55%),
        url("${opts.bgImage}") center / cover no-repeat;
    }
    .inner {
      text-align: center;
      max-width: 1200px;
      padding: 48px 64px;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 32px;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .mark {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      background: rgba(255,255,255,0.95);
      color: #047857;
      display: grid;
      place-items: center;
      font-size: 32px;
      font-weight: 800;
    }
    .eyebrow {
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      opacity: 0.9;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 72px;
      line-height: 1.05;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 24px;
      text-shadow: 0 4px 24px rgba(0,0,0,0.35);
    }
    p {
      font-size: 32px;
      line-height: 1.4;
      opacity: 0.92;
      max-width: 900px;
      margin: 0 auto 12px;
    }
    .cta {
      display: inline-block;
      margin-top: 36px;
      padding: 22px 44px;
      border-radius: 16px;
      background: #fff;
      color: #047857;
      font-size: 28px;
      font-weight: 800;
      box-shadow: 0 16px 40px rgba(0,0,0,0.25);
    }
    .url {
      margin-top: 24px;
      font-size: 26px;
      font-weight: 600;
      opacity: 0.95;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="inner">
      <div class="logo"><span class="mark">L</span> ListingPH</div>
      <div class="eyebrow">${opts.eyebrow}</div>
      <h1>${opts.title}</h1>
      <p>${opts.subtitle}</p>
      ${opts.cta ? `<div class="cta">${opts.cta}</div>` : ""}
      ${opts.url ? `<div class="url">${opts.url}</div>` : ""}
    </div>
  </div>
</body>
</html>`;

const INTRO_BG =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop";
const OUTRO_BG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop";

export async function showIntro(page: Page) {
  await preparePageForRecording(page);
  await page.setContent(
    FULLSCREEN_SLIDE({
      eyebrow: "Philippines real estate",
      title: "Your listings. Live in minutes.",
      subtitle:
        "Watch a broker publish a property — buyers see it on the site instantly.",
      bgImage: INTRO_BG,
    }),
    { waitUntil: "domcontentloaded" }
  );
  await pause(page, SCENE.intro);
}

export async function showOutro(page: Page, siteUrl: string) {
  await preparePageForRecording(page);
  await page.setContent(
    FULLSCREEN_SLIDE({
      eyebrow: "Get started today",
      title: "Ready for your own listing site?",
      subtitle: "Professional pages, easy admin, built for Facebook sharing.",
      cta: "Message us for a demo",
      url: siteUrl.replace(/^https?:\/\//, ""),
      bgImage: OUTRO_BG,
    }),
    { waitUntil: "domcontentloaded" }
  );
  await pause(page, SCENE.outro);
}

export async function loginAdmin(page: Page, pin: string) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    sessionStorage.setItem("listingph-admin-session", "true");
  });
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await preparePageForRecording(page);

  const manage = page.getByRole("heading", { name: /manage listings/i });
  const login = page.getByRole("heading", { name: "Admin login" });

  await Promise.race([
    manage.waitFor({ state: "visible", timeout: 25_000 }),
    login.waitFor({ state: "visible", timeout: 25_000 }),
  ]);

  if (await manage.isVisible()) return;

  await page.locator("#pin").fill(pin);
  await page.getByRole("button", { name: /enter admin panel/i }).click();

  const failed = page.getByText("Incorrect PIN. Try again.");
  await Promise.race([
    manage.waitFor({ state: "visible", timeout: 20_000 }),
    failed.waitFor({ state: "visible", timeout: 20_000 }),
  ]);
  if (await failed.isVisible()) {
    throw new Error("Admin PIN rejected — check ADMIN_PIN in .env");
  }
}

export async function waitForListingOnHomepage(
  page: Page,
  title: string,
  slug: string,
  attempts = 6
) {
  for (let i = 0; i < attempts; i++) {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await preparePageForRecording(page);
    await page.getByRole("heading", { name: "Available listings" }).scrollIntoViewIfNeeded();

    const bySlug = page.locator(`a[href*="/listings/${slug}"]`).first();
    const byTitle = page.getByRole("link").filter({ hasText: title }).first();

    if (await bySlug.count()) return bySlug;
    if (await byTitle.count()) return byTitle;

    await page.waitForTimeout(2500);
  }
  return null;
}

export async function uploadPhotosOneByOne(
  page: Page,
  fileInput: Locator,
  photoPaths: string[]
) {
  await page.getByRole("heading", { name: "Photos" }).scrollIntoViewIfNeeded();
  for (let i = 0; i < photoPaths.length; i++) {
    await pause(page, SCENE.photo);
    await fileInput.setInputFiles(photoPaths[i]);
    await expect(page.locator(`img[alt="Photo ${i + 1}"]`)).toBeVisible({
      timeout: 12_000,
    });
    if (i === 0) {
      await expect(page.getByText("Cover", { exact: true })).toBeVisible();
    }
    await pause(page, SCENE.photo);
  }
}

export async function addDemoClient(
  page: Page,
  name: string,
  phone: string
) {
  await page.getByRole("button", { name: /^clients & links$/i }).click();
  await expect(page.getByRole("heading", { name: /^clients$/i })).toBeVisible();
  await pause(page, SCENE.beat);

  await page.getByRole("button", { name: /^add client$/i }).click();
  await expect(page.getByRole("heading", { name: /new client/i })).toBeVisible();
  await pause(page, SCENE.field);

  await fillField(page, page.locator("#new-name"), name, 70);
  await fillField(page, page.locator("#new-phone"), phone, 90);
  await fillField(
    page,
    page.locator("#new-messenger"),
    "https://m.me/listingph.demo",
    50
  );
  await fillField(
    page,
    page.locator("#new-facebook"),
    "https://facebook.com/listingph",
    50
  );

  await page.getByRole("button", { name: /^save client$/i }).scrollIntoViewIfNeeded();
  await pause(page, SCENE.beat);
  await page.getByRole("button", { name: /^save client$/i }).click();

  await expect(page.getByText(name)).toBeVisible({ timeout: 20_000 });
  await pause(page, SCENE.proof);
}
