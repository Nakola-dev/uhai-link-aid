import { expect, test } from "@playwright/test";
import { mockSupabase } from "./support/supabase-mock";

test.use({ geolocation: { latitude: -1.2921, longitude: 36.8219, accuracy: 20 }, permissions: ["geolocation"] });

async function sendSos(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /SOS Send alert/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/text your 2 emergency contacts/)).toBeVisible();
  await dialog.getByRole("button", { name: "Send SOS now" }).click();
}

test.describe("Emergency SOS", () => {
  test("is reachable from the dashboard navigation", async ({ page }, info) => {
    await mockSupabase(page, { signedIn: true });
    await page.goto("/dashboard/profile");
    const sosLink = info.project.name === "mobile"
      ? page.getByRole("navigation", { name: "Quick navigation" }).getByRole("link", { name: "Emergency SOS" })
      : page.getByRole("navigation", { name: "Dashboard" }).getByRole("link", { name: "Emergency SOS" });
    await sosLink.click();
    await expect(page).toHaveURL(/\/dashboard\/emergency$/);
    await expect(page.getByRole("heading", { level: 1, name: "Emergency SOS" })).toBeVisible();
  });

  test("reports SMS sent only when the backend confirms it", async ({ page }, info) => {
    await mockSupabase(page, { signedIn: true, sms: { status: 200, body: { success: true, details: { success: 2, failed: 0 } } } });
    await page.goto("/dashboard/emergency");
    await expect(page.getByRole("link", { name: /999/ }).first()).toHaveAttribute("href", "tel:999");
    await sendSos(page);
    await expect(page.getByText("SMS sent to all 2 of your contacts.")).toBeVisible();
    await expect(page.getByText(/Emergency recorded at/)).toBeVisible();
    await expect(page.getByText("SOS alert active")).toBeVisible();
    await page.screenshot({ path: `e2e-artifacts/sos-sent-${info.project.name}.png`, fullPage: true });
  });

  test("partial delivery offers direct calls", async ({ page }) => {
    await mockSupabase(page, { signedIn: true, sms: { status: 200, body: { success: true, details: { success: 1, failed: 1 } } } });
    await page.goto("/dashboard/emergency");
    await sendSos(page);
    await expect(page.getByText("SMS sent to 1 of 2 contacts.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Wanjiru Kamau/ })).toHaveAttribute("href", "tel:+254700000002");
  });

  test("failed SMS is never shown as success", async ({ page }, info) => {
    await mockSupabase(page, { signedIn: true, sms: { status: 502, body: { success: false, details: { success: 0, failed: 2 } } } });
    await page.goto("/dashboard/emergency");
    await sendSos(page);
    await expect(page.getByText("SMS alerts could not be sent.")).toBeVisible();
    await expect(page.getByText(/SMS sent/)).toHaveCount(0);
    await page.screenshot({ path: `e2e-artifacts/sos-failed-${info.project.name}.png`, fullPage: true });
  });

  test("no contacts: says nobody was texted", async ({ page }) => {
    await mockSupabase(page, { signedIn: true, tables: { emergency_contacts: [] } });
    await page.goto("/dashboard/emergency");
    await expect(page.getByText(/nobody will be texted/)).toBeVisible();
    await page.getByRole("button", { name: /SOS Send alert/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Send SOS now" }).click();
    await expect(page.getByText("Nobody was texted — you have no emergency contacts.")).toBeVisible();
  });

  test("a failed alert says so and offers calls", async ({ page }) => {
    await mockSupabase(page, { signedIn: true });
    await page.route(/supabase\.co\/rest\/v1\/emergency_incidents/, (route) =>
      route.request().method() === "POST" ? route.fulfill({ status: 500, body: "{}" }) : route.fallback()
    );
    await page.goto("/dashboard/emergency");
    await sendSos(page);
    await expect(page.getByText("Your alert was not sent. Something went wrong.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("offline state is explicit", async ({ page, context }) => {
    await mockSupabase(page, { signedIn: true });
    await page.goto("/dashboard/emergency");
    await expect(page.getByRole("heading", { level: 1, name: "Emergency SOS" })).toBeVisible();
    await context.setOffline(true);
    await expect(page.getByText(/SOS alerts and SMS need an internet connection/)).toBeVisible();
    await context.setOffline(false);
  });
});
