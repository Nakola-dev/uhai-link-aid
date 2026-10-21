import { expect, test } from "@playwright/test";
import { mockSupabase, SAMPLE_CONTACTS, SAMPLE_PROFILE } from "./support/supabase-mock";

const scanProfile = (overrides: Record<string, unknown> = {}) => ({
  success: true,
  profile: {
    full_name: SAMPLE_PROFILE.full_name,
    phone: SAMPLE_PROFILE.phone,
    gender: SAMPLE_PROFILE.gender,
    blood_type: SAMPLE_PROFILE.blood_type,
    allergies: SAMPLE_PROFILE.allergies,
    medications: SAMPLE_PROFILE.medications,
    chronic_conditions: SAMPLE_PROFILE.chronic_conditions,
    primary_hospital: SAMPLE_PROFILE.primary_hospital,
    updated_at: SAMPLE_PROFILE.updated_at,
    emergency_contacts: SAMPLE_CONTACTS.map(({ name, phone, relationship }) => ({ name, phone, relationship })),
    ...overrides,
  },
});

test.describe("first-responder page", () => {
  test("shows critical information in priority order with tap-to-call contacts", async ({ page }, info) => {
    await mockSupabase(page, { scan: scanProfile() });
    await page.goto("/profile/Zk3pQ8v1mW2xR7tY0aB4cD");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Amani Wanjiru");
    await expect(page).toHaveTitle(/Emergency medical information/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
    expect(headings.slice(0, 5)).toEqual(["Allergies", "Blood type", "Current medications", "Medical conditions", "Emergency contacts"]);

    await expect(page.getByRole("link", { name: /Call Wanjiru Kamau/ })).toHaveAttribute("href", "tel:+254700000002");
    await expect(page.getByText("Self-reported — confirm before transfusion")).toBeVisible();
    await expect(page.getByRole("link", { name: /Call 999/ }).first()).toHaveAttribute("href", "tel:999");
    await page.screenshot({ path: `e2e-artifacts/responder-success-${info.project.name}.png`, fullPage: true });
  });

  test("never presents missing information as 'none'", async ({ page }) => {
    await mockSupabase(page, {
      scan: scanProfile({ allergies: [], medications: null, chronic_conditions: [], blood_type: null, emergency_contacts: [], primary_hospital: null }),
    });
    await page.goto("/profile/abc");
    await expect(page.getByText("No allergies recorded.")).toBeVisible();
    await expect(page.getByText("Blood type not recorded.")).toBeVisible();
    await expect(page.getByText("No emergency contact recorded.")).toBeVisible();
    await expect(page.getByText(/known allergies/i)).toHaveCount(0);
  });

  test("still shows contacts from older deployments of the scan function", async ({ page }) => {
    await mockSupabase(page, {
      scan: scanProfile({ emergency_contacts: undefined, emergency_contact_name: "Legacy Contact", emergency_contact_phone: "+254700000009" }),
    });
    await page.goto("/profile/abc");
    await expect(page.getByText("Legacy Contact")).toBeVisible();
  });

  for (const [name, scan, heading, retry] of [
    ["invalid", { success: false, error: "Invalid or expired QR code" }, "This QR code is not recognised", false],
    ["deactivated", { success: false, error: "This QR code has been deactivated" }, "This QR code has been replaced", false],
    ["rate-limited", { success: false, error: "Rate limit exceeded. Too many scans" }, "Too many scans from this network", true],
    ["server-error", { httpStatus: 500 }, "Medical information is temporarily unavailable", true],
  ] as const) {
    test(`error state: ${name}`, async ({ page }, info) => {
      await mockSupabase(page, { scan });
      await page.goto("/profile/abc");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.getByRole("link", { name: "999 Emergency" })).toHaveAttribute("href", "tel:999");
      await expect(page.getByRole("button", { name: "Try again" })).toHaveCount(retry ? 1 : 0);
      if (name === "invalid") await page.screenshot({ path: `e2e-artifacts/responder-error-${info.project.name}.png`, fullPage: true });
    });
  }
});
