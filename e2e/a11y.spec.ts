import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mockSupabase, MockOptions, SAMPLE_CONTACTS, SAMPLE_PROFILE } from "./support/supabase-mock";

const scan = {
  success: true,
  profile: { ...SAMPLE_PROFILE, emergency_contacts: SAMPLE_CONTACTS.map(({ name, phone, relationship }) => ({ name, phone, relationship })) },
};

const ROUTES: Array<{ path: string; mock?: MockOptions }> = [
  { path: "/" },
  { path: "/auth" },
  { path: "/auth?tab=signup" },
  { path: "/learn" },
  { path: "/services" },
  { path: "/about" },
  { path: "/contact" },
  { path: "/demo/responder" },
  { path: "/profile/abc", mock: { scan } },
  { path: "/profile/bad", mock: { scan: { success: false, error: "Invalid or expired QR code" } } },
  { path: "/offline" },
  { path: "/dashboard", mock: { signedIn: true } },
  { path: "/dashboard/profile", mock: { signedIn: true } },
  { path: "/dashboard/qr", mock: { signedIn: true } },
  { path: "/dashboard/emergency", mock: { signedIn: true } },
  { path: "/dashboard/assistant", mock: { signedIn: true } },
  { path: "/dashboard/settings", mock: { signedIn: true } },
  { path: "/admin", mock: { signedIn: true, isAdmin: true } },
];

/** WCAG 2.2 A/AA automated checks. Fails on serious or critical violations. */
for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe (${scheme})`, () => {
    test.use({ colorScheme: scheme });
    for (const { path, mock } of ROUTES) {
      test(path, async ({ page }) => {
        await mockSupabase(page, mock);
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        // Reveal scroll-animated content so it is checked in its final state.
        await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible")));
        await page.waitForTimeout(400);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        // Content scrolls underneath fixed/sticky bars (mobile bottom navigation, sticky save bar), so
        // at the current scroll position axe reports it as "partially obscured" for target-size. That is
        // a scroll-position artefact, not a target size problem (focus is kept clear via scroll-padding).
        // Ignore only nodes whose obscuring elements are all explicitly marked data-sticky-overlay.
        const obscuredOnlyByStickyOverlay = (node: (typeof results.violations)[number]["nodes"][number]) =>
          node.any.length > 0 &&
          node.any.every((check) =>
            check.relatedNodes?.length &&
            check.relatedNodes.every((related) => related.html.includes("data-sticky-overlay"))
          );
        const blocking = results.violations
          .map((v) => (v.id === "target-size" ? { ...v, nodes: v.nodes.filter((n) => !obscuredOnlyByStickyOverlay(n)) } : v))
          .filter((v) => v.nodes.length > 0 && (v.impact === "serious" || v.impact === "critical"));
        const summary = blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
        expect(summary, summary.join("\n")).toEqual([]);
      });
    }
  });
}
