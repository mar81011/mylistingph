import { test, expect } from "@playwright/test";
import path from "node:path";
import {
  addDemoClient,
  fillField,
  loginAdmin,
  pause,
  preparePageForRecording,
  SCENE,
  selectField,
  showIntro,
  showOutro,
  smoothScroll,
  uploadPhotosOneByOne,
  waitForListingOnHomepage,
} from "./demo-helpers";

const FIXTURES = path.join(process.cwd(), "e2e", "fixtures");
const DEMO_PHOTOS = [1, 2, 3, 4].map((n) =>
  path.join(FIXTURES, `demo-photo-${n}.jpg`)
);

const ADMIN_PIN =
  process.env.DEMO_ADMIN_PIN ?? process.env.ADMIN_PIN ?? "121022";
const SITE_URL =
  process.env.DEMO_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

const DEMO_TAG = Date.now().toString().slice(-4);
const DEMO_CLIENT_NAME = `Ana Reyes — Demo ${DEMO_TAG}`;
const DEMO_CLIENT_PHONE = `0917${DEMO_TAG}00`;
const DEMO_TITLE = `2BR Condo in Cebu City — Demo ${DEMO_TAG}`;
const DEMO_PRICE = "3200000";

const DESCRIPTION =
  "Bright 2-bedroom condo near IT Park. Ideal for young professionals. Ready for viewing today.";

test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const warm = await ctx.newPage();
  await warm.goto("/");
  await warm.waitForLoadState("networkidle").catch(() => {});
  await warm.goto("/admin");
  await warm.waitForLoadState("domcontentloaded");
  await ctx.close();
});

test("ListingPH sales demo", async ({ page }) => {
  test.setTimeout(480_000);

  await showIntro(page);

  // Skip redundant homepage tour — go straight to admin
  await loginAdmin(page, ADMIN_PIN);
  await preparePageForRecording(page);
  await pause(page, SCENE.beat);

  await addDemoClient(page, DEMO_CLIENT_NAME, DEMO_CLIENT_PHONE);

  await page.getByRole("button", { name: /create listing/i }).click();
  await expect(
    page.getByRole("heading", { name: /create new listing/i })
  ).toBeVisible();

  await page
    .locator("#clientId")
    .selectOption({ label: `${DEMO_CLIENT_NAME} — ${DEMO_CLIENT_PHONE}` });
  await expect(page.getByText(/contact on listing/i)).toContainText("Ana Reyes");
  await pause(page, SCENE.beat);

  const fileInput = page.locator('input[type="file"][accept*="image"]');
  await uploadPhotosOneByOne(page, fileInput, DEMO_PHOTOS);
  await expect(page.locator('img[alt="Photo 4"]')).toBeVisible();

  await fillField(page, page.locator("#title"), DEMO_TITLE, 60);
  await selectField(page, page.locator("#listingType"), { label: "For Sale" });
  await selectField(page, page.locator("#propertyType"), { label: "Condo" });
  await fillField(page, page.locator("#pricePhp"), DEMO_PRICE, 100);
  await fillField(page, page.locator("#priceLabel"), "Negotiable", 75);
  await fillField(page, page.locator("#bedrooms"), "2", 130);
  await fillField(page, page.locator("#bathrooms"), "1", 130);
  await selectField(page, page.locator("#city"), { label: "Cebu City" });
  await fillField(page, page.locator("#barangay"), "Lahug", 80);
  await fillField(page, page.locator("#addressNotes"), "Near IT Park", 70);
  await fillField(page, page.locator("#description"), DESCRIPTION, 40);

  await page.getByRole("button", { name: /publish listing/i }).scrollIntoViewIfNeeded();
  await pause(page, SCENE.beat);
  await page.getByRole("button", { name: /publish listing/i }).click();

  const popupPromise = page
    .context()
    .waitForEvent("page", { timeout: 60_000 })
    .catch(() => null);

  await Promise.race([
    page.waitForURL(/\/listings\//, { timeout: 60_000 }),
    page.getByRole("heading", { name: /^all listings$/i }).waitFor({
      state: "visible",
      timeout: 60_000,
    }),
    popupPromise,
  ]);

  const popup = await popupPromise;
  let slug: string | undefined;

  if (popup) {
    await popup.waitForLoadState("domcontentloaded");
    slug = popup.url().split("/listings/")[1]?.split("?")[0];
    await popup.close();
    await page
      .locator(".rounded-xl")
      .filter({ hasText: DEMO_TITLE })
      .getByRole("button", { name: /^view page$/i })
      .click()
      .catch(() => page.goto(`/listings/${slug}`));
  } else if (page.url().includes("/listings/")) {
    slug = page.url().split("/listings/")[1]?.split("?")[0];
  } else {
    await expect(page.getByText(DEMO_TITLE)).toBeVisible({ timeout: 15_000 });
    const href = await page
      .getByRole("link")
      .filter({ hasText: DEMO_TITLE })
      .first()
      .getAttribute("href");
    slug = href?.replace(/^\//, "").split("/listings/")[1]?.split("?")[0];
    await page
      .locator(".rounded-xl")
      .filter({ hasText: DEMO_TITLE })
      .getByRole("button", { name: /^view page$/i })
      .click();
  }

  expect(slug).toBeTruthy();

  await preparePageForRecording(page);
  await expect(page.locator("h1")).toContainText(DEMO_TITLE, { timeout: 15_000 });
  await expect(page.getByText(/₱3,200,000|3,200,000/)).toBeVisible();
  await pause(page, SCENE.proof);
  await smoothScroll(page, 400);
  await pause(page, SCENE.beat);

  const homeCard = await waitForListingOnHomepage(page, DEMO_TITLE, slug!);
  expect(
    homeCard,
    `Published listing "${DEMO_TITLE}" not found on homepage`
  ).toBeTruthy();

  await preparePageForRecording(page);
  await page.getByRole("heading", { name: "Available listings" }).scrollIntoViewIfNeeded();
  await homeCard!.scrollIntoViewIfNeeded();
  await pause(page, SCENE.proof);
  await homeCard!.click();

  await preparePageForRecording(page);
  await expect(page.locator("h1")).toContainText(DEMO_TITLE);
  await expect(page.getByText("Lahug, Cebu City")).toBeVisible();
  await pause(page, SCENE.proof);

  await showOutro(page, SITE_URL);
});
