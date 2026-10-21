import { expect, test, type Page } from "@playwright/test";
import { mockSupabase, USER_ID } from "./support/supabase-mock";

const ADMIN_TABLES = {
  emergency_organizations: [
    { id: "o1", name: "St John Ambulance Kenya", type: "Ambulance", phone: "+254700000010", email: null, created_at: "2026-09-01T08:00:00Z", updated_at: "2026-09-01T08:00:00Z" },
  ],
  qr_access_tokens: [
    { id: "t1", user_id: USER_ID, access_token: "Zk3pQ8v1mW2xR7tY0aB4cD", is_active: true, created_at: "2026-09-01T08:00:00Z", updated_at: "2026-09-15T08:00:00Z" },
  ],
  emergency_incidents: [
    { id: "i1", user_id: USER_ID, status: "active", triggered_at: new Date().toISOString(), resolved_at: null, location_lat: -1.2921, location_lng: 36.8219, location_address: null, responder_notes: null, incident_type: null, severity: null, description: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
};

/** Records write requests so tests can assert on what was sent to Supabase. */
function recordWrites(page: Page) {
  const writes: Array<{ method: string; table: string; body: unknown }> = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!url.pathname.startsWith("/rest/v1/") || url.pathname.includes("/rpc/")) return;
    if (["POST", "PATCH", "DELETE"].includes(request.method())) {
      writes.push({ method: request.method(), table: url.pathname.replace("/rest/v1/", ""), body: request.postDataJSON?.() ?? null });
    }
  });
  return writes;
}

test.describe("admin", () => {
  test("organisations: add and delete are confirmed and audit-logged", async ({ page }) => {
    await mockSupabase(page, { signedIn: true, isAdmin: true, tables: ADMIN_TABLES });
    const writes = recordWrites(page);
    await page.goto("/admin");
    await page.getByRole("tab", { name: /Organizations/ }).click();

    await page.getByRole("button", { name: "Add organisation" }).click();
    await page.getByLabel("Name *").fill("Kenya Red Cross");
    await page.getByLabel("Phone").fill("1199");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Organisation added")).toBeVisible();
    expect(writes.some((w) => w.method === "POST" && w.table === "emergency_organizations")).toBe(true);
    expect(writes.some((w) => w.method === "POST" && w.table === "admin_logs" && (w.body as { action_type: string }).action_type === "create")).toBe(true);

    await page.getByRole("button", { name: "Delete St John Ambulance Kenya" }).last().click();
    await expect(page.getByRole("alertdialog")).toContainText("disappear from every member's emergency services directory");
    await page.getByRole("button", { name: "Delete organisation" }).click();
    await expect(page.getByText("Organisation deleted")).toBeVisible();
    expect(writes.some((w) => w.method === "DELETE" && w.table.startsWith("emergency_organizations"))).toBe(true);
    expect(writes.some((w) => w.table === "admin_logs" && (w.body as { action_type: string }).action_type === "delete")).toBe(true);
  });

  test("QR codes are masked and deactivation is confirmed and logged", async ({ page }) => {
    await mockSupabase(page, { signedIn: true, isAdmin: true, tables: ADMIN_TABLES });
    const writes = recordWrites(page);
    await page.goto("/admin");
    await page.getByRole("tab", { name: /QR Products/ }).click();

    await expect(page.getByText("Zk3p••••••")).toBeVisible();
    await expect(page.getByText("Zk3pQ8v1mW2xR7tY0aB4cD")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /copy/i })).toHaveCount(0);

    await page.getByRole("button", { name: "Deactivate" }).click();
    await page.getByRole("button", { name: "Deactivate code" }).click();
    await expect(page.getByText(/QR code deactivated/)).toBeVisible();
    expect(writes.some((w) => w.method === "PATCH" && w.table.startsWith("qr_access_tokens") && (w.body as { is_active: boolean }).is_active === false)).toBe(true);
    expect(writes.some((w) => w.table === "admin_logs")).toBe(true);
  });

  test("emergency operations: incidents load with member details and updates are logged", async ({ page }, info) => {
    await mockSupabase(page, { signedIn: true, isAdmin: true, tables: ADMIN_TABLES });
    const writes = recordWrites(page);
    await page.goto("/admin/emergencies");

    await expect(page.getByRole("heading", { level: 1, name: "Emergency operations" })).toBeVisible();
    await expect(page.getByText("1 active alert needs attention.")).toBeVisible();
    await expect(page.getByRole("main").getByText("Amani Wanjiru")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open location in maps" })).toHaveAttribute("href", /maps\.google\.com\/\?q=-1\.2921,36\.8219/);
    await page.screenshot({ path: `e2e-artifacts/admin-emergencies-${info.project.name}.png`, fullPage: true });

    await page.getByRole("button", { name: "Update" }).click();
    await page.getByLabel("Notes").fill("Called member; family on the way.");
    await page.getByRole("button", { name: "Save update" }).click();
    await expect(page.getByText("Incident updated")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(writes.some((w) => w.method === "PATCH" && w.table.startsWith("emergency_incidents"))).toBe(true);
    expect(writes.some((w) => w.table === "admin_logs" && (w.body as { entity_type: string }).entity_type === "emergency_incident")).toBe(true);
  });

  test("payments tab shows no fabricated transactions", async ({ page }) => {
    await mockSupabase(page, { signedIn: true, isAdmin: true, tables: ADMIN_TABLES });
    await page.goto("/admin");
    await page.getByRole("tab", { name: /Payments/ }).click();
    await expect(page.getByText("Payments are not connected yet")).toBeVisible();
    await expect(page.getByText(/TXN-/)).toHaveCount(0);
  });
});
