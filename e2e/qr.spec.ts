import { expect, test } from "@playwright/test";
import { mockSupabase } from "./support/supabase-mock";

test.describe("QR medical ID", () => {
  test("shows the code and replaces it only after confirmation", async ({ page }, info) => {
    await mockSupabase(page, { signedIn: true });
    const patches: unknown[] = [];
    page.on("request", (request) => {
      if (request.method() === "PATCH" && request.url().includes("/qr_access_tokens")) patches.push(request.postDataJSON());
    });

    await page.goto("/dashboard/qr");
    await expect(page.getByRole("heading", { level: 1, name: "My Medical ID" })).toBeVisible();
    await expect(page.getByText(/\/profile\/Zk3pQ8v1mW2xR7tY0aB4cD$/)).toBeVisible();
    await page.screenshot({ path: `e2e-artifacts/qr-${info.project.name}.png`, fullPage: true });

    await page.getByRole("button", { name: "New code" }).click();
    await expect(page.getByRole("alertdialog")).toContainText("Your current code will stop working immediately");
    await page.getByRole("button", { name: "Keep current code" }).click();
    expect(patches).toHaveLength(0);

    await page.getByRole("button", { name: "New code" }).click();
    await page.getByRole("button", { name: "Issue new code" }).click();
    await expect(page.getByText("New QR code issued. Your old code no longer works.")).toBeVisible();
    expect(patches).toHaveLength(1);
    const patch = patches[0] as { access_token: string; is_active: boolean };
    expect(patch.is_active).toBe(true);
    expect(patch.access_token).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });
});
