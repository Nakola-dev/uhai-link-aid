import { expect, test } from "@playwright/test";
import { mockSupabase } from "./support/supabase-mock";

const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/services",
  "/learn",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/medical-disclaimer",
  "/offline",
];

test.describe("public pages", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has one h1, a specific title and no horizontal overflow`, async ({ page }, info) => {
      await mockSupabase(page);
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      if (route !== "/") await expect(page).toHaveTitle(/ · UhaiLink$/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `e2e-artifacts/public${route === "/" ? "-home" : route.replace(/\//g, "-")}-${info.project.name}.png`, fullPage: true });
    });
  }

  test("titles are unique per route", async ({ page }) => {
    await mockSupabase(page);
    const titles = new Set<string>();
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      titles.add(await page.title());
    }
    expect(titles.size).toBe(PUBLIC_ROUTES.length);
  });
});
