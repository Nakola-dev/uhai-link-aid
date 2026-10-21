import { test } from "@playwright/test";
import { mockSupabase, MockOptions } from "./support/supabase-mock";

/**
 * Screenshot capture for manual design review (light + dark). Not an assertion
 * suite — run with: npx playwright test e2e/visual.spec.ts --grep "<page>"
 */
const PAGES: Array<{ name: string; path: string; mock?: MockOptions }> = [
  { name: "home", path: "/" },
  { name: "auth", path: "/auth" },
  { name: "auth-signup", path: "/auth?tab=signup" },
  { name: "learn", path: "/learn" },
  { name: "services", path: "/services" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "privacy", path: "/privacy-policy" },
  { name: "demo", path: "/demo/responder" },
  { name: "offline", path: "/offline" },
  { name: "not-found", path: "/nope" },
  { name: "dashboard", path: "/dashboard", mock: { signedIn: true } },
  { name: "profile", path: "/dashboard/profile", mock: { signedIn: true } },
  { name: "qr", path: "/dashboard/qr", mock: { signedIn: true } },
  { name: "sos", path: "/dashboard/emergency", mock: { signedIn: true } },
  { name: "assistant", path: "/dashboard/assistant", mock: { signedIn: true } },
  { name: "user-learn", path: "/dashboard/learn", mock: { signedIn: true } },
  { name: "settings", path: "/dashboard/settings", mock: { signedIn: true } },
  { name: "buy-qr", path: "/dashboard/buy-qr", mock: { signedIn: true } },
  { name: "admin", path: "/admin", mock: { signedIn: true, isAdmin: true } },
  { name: "admin-emergencies", path: "/admin/emergencies", mock: { signedIn: true, isAdmin: true } },
];

for (const scheme of ["light", "dark"] as const) {
  test.describe(`visual ${scheme}`, () => {
    test.use({ colorScheme: scheme });
    for (const { name, path, mock } of PAGES) {
      test(`${name} (${scheme})`, async ({ page }, info) => {
        await mockSupabase(page, mock);
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        // Scroll through the page so scroll-revealed sections are in their final state.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(500);
        await page.screenshot({ path: `e2e-artifacts/visual/${name}-${scheme}-${info.project.name}.png`, fullPage: true });
      });
    }
  });
}
