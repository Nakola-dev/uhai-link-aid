import { expect, test } from "@playwright/test";
import { mockSupabase, MockOptions, SAMPLE_CONTACTS, SAMPLE_PROFILE } from "./support/supabase-mock";

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1366, 1920];

const scan = {
  success: true,
  profile: { ...SAMPLE_PROFILE, emergency_contacts: SAMPLE_CONTACTS.map(({ name, phone, relationship }) => ({ name, phone, relationship })) },
};

const ROUTES: Array<{ path: string; mock?: MockOptions }> = [
  { path: "/" },
  { path: "/auth?tab=signup" },
  { path: "/learn" },
  { path: "/services" },
  { path: "/profile/abc", mock: { scan } },
  { path: "/dashboard", mock: { signedIn: true } },
  { path: "/dashboard/profile", mock: { signedIn: true } },
  { path: "/dashboard/qr", mock: { signedIn: true } },
  { path: "/dashboard/emergency", mock: { signedIn: true } },
  { path: "/dashboard/assistant", mock: { signedIn: true } },
  { path: "/admin", mock: { signedIn: true, isAdmin: true } },
  { path: "/admin/emergencies", mock: { signedIn: true, isAdmin: true } },
];

test.describe("responsive layout", () => {
  for (const { path, mock } of ROUTES) {
    test(`no horizontal overflow: ${path}`, async ({ page }, info) => {
      test.skip(info.project.name !== "desktop", "viewport sweep runs once");
      await mockSupabase(page, mock);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const failures: string[] = [];
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(150);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 0) failures.push(`${width}px overflows by ${overflow}px`);
      }
      expect(failures).toEqual([]);
    });
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("animations are effectively disabled and nothing stays hidden", async ({ page }) => {
    await mockSupabase(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const result = await page.evaluate(() => {
      const animated = document.querySelector(".animate-fade-in") as HTMLElement | null;
      const hiddenReveals = Array.from(document.querySelectorAll(".reveal")).filter(
        (el) => getComputedStyle(el).opacity !== "1"
      ).length;
      return {
        duration: animated ? parseFloat(getComputedStyle(animated).animationDuration) : 0,
        hiddenReveals,
      };
    });
    expect(result.duration).toBeLessThan(0.01);
    expect(result.hiddenReveals).toBe(0);
  });
});
