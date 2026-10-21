import { readFileSync } from "node:fs";
import type { Page, Route } from "@playwright/test";

/**
 * In-browser Supabase stand-in for rendered tests. Answers REST, RPC, auth and
 * Edge Function calls from synthetic fixtures. No real project is contacted.
 */

function projectRef(): string {
  try {
    const env = readFileSync(".env", "utf8");
    const url = env.match(/^VITE_SUPABASE_URL\s*=\s*"?([^"\n]+)"?/m)?.[1];
    if (url) return new URL(url).hostname.split(".")[0];
  } catch {
    // fall through
  }
  return "test";
}

export const USER_ID = "00000000-0000-4000-8000-000000000001";
export const USER_EMAIL = "amani.test@example.com";

// Fictional person used everywhere in tests and demos.
export const SAMPLE_PROFILE = {
  id: USER_ID,
  full_name: "Amani Wanjiru",
  phone: "+254700000001",
  blood_type: "O+",
  allergies: ["Penicillin", "Peanuts"],
  medications: ["Salbutamol inhaler"],
  chronic_conditions: ["Asthma"],
  emergency_contact_name: null,
  emergency_contact_phone: null,
  emergency_contact_relationship: null,
  gender: "female",
  date_of_birth: null,
  city: "Nairobi",
  county: "Nairobi County",
  profile_photo_url: null,
  primary_hospital: "Kenyatta National Hospital",
  role: "user",
  is_suspended: false,
  onboarding_completed: true,
  onboarding_completed_at: "2026-09-01T08:00:00Z",
  updated_at: "2026-10-01T08:00:00Z",
};

export const SAMPLE_CONTACTS = [
  { id: "c1", user_id: USER_ID, name: "Wanjiru Kamau", phone: "+254700000002", relationship: "Mother", priority: 1 },
  { id: "c2", user_id: USER_ID, name: "Otieno Ochieng", phone: "+254700000003", relationship: "Brother", priority: 2 },
];

export interface MockOptions {
  signedIn?: boolean;
  isAdmin?: boolean;
  profile?: Record<string, unknown>;
  tables?: Record<string, Record<string, unknown>[]>;
  /** Result object for rpc/check_and_log_qr_scan, or an HTTP status to fail with. */
  scan?: unknown | { httpStatus: number };
  sms?: { status: number; body: unknown };
  ai?: { status: number; body: unknown };
  /** Fail every REST call (simulates an outage). */
  restDown?: boolean;
}

const json = (route: Route, status: number, body: unknown, headers: Record<string, string> = {}) =>
  route.fulfill({
    status,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*", "access-control-expose-headers": "content-range", ...headers },
    body: body === undefined ? "" : JSON.stringify(body),
  });

export async function mockSupabase(page: Page, options: MockOptions = {}) {
  const ref = projectRef();
  const signedIn = options.signedIn ?? false;
  const user = {
    id: USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: USER_EMAIL,
    email_confirmed_at: "2026-09-01T08:00:00Z",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { full_name: SAMPLE_PROFILE.full_name },
    created_at: "2026-09-01T08:00:00Z",
  };

  if (signedIn) {
    const session = {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      token_type: "bearer",
      expires_in: 3600 * 24 * 365,
      expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
      user,
    };
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [`sb-${ref}-auth-token`, JSON.stringify(session)] as const
    );
  }

  const tables: Record<string, Record<string, unknown>[]> = {
    profiles: [{ ...SAMPLE_PROFILE, ...(options.profile ?? {}) }],
    emergency_contacts: SAMPLE_CONTACTS,
    qr_access_tokens: [{ id: "t1", user_id: USER_ID, access_token: "Zk3pQ8v1mW2xR7tY0aB4cD", is_active: true, created_at: "2026-09-01T08:00:00Z", updated_at: "2026-09-15T08:00:00Z" }],
    emergency_incidents: [],
    chat_history: [],
    user_consents: [
      { consent_type: "terms_of_service" }, { consent_type: "privacy_policy" }, { consent_type: "medical_data_processing" },
    ],
    emergency_organizations: [],
    tutorials: [],
    articles: [],
    webinars: [],
    downloadable_materials: [],
    user_learning_progress: [],
    admin_logs: [],
    notifications: [],
    ...(options.tables ?? {}),
  };

  await page.route(/https:\/\/[a-z0-9-]+\.supabase\.co\/.*/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (method === "OPTIONS") return json(route, 200, undefined, { "access-control-allow-headers": "*", "access-control-allow-methods": "*" });

    if (path.startsWith("/auth/v1/user")) return signedIn ? json(route, 200, user) : json(route, 401, { message: "not signed in" });
    if (path.startsWith("/auth/v1/logout")) return route.fulfill({ status: 204 });
    if (path.startsWith("/auth/v1/")) return json(route, 400, { message: "Not available in tests" });

    if (path.startsWith("/functions/v1/send-emergency-sms")) {
      const sms = options.sms ?? { status: 200, body: { success: true, details: { success: 2, failed: 0 } } };
      return json(route, sms.status, sms.body);
    }
    if (path.startsWith("/functions/v1/ai-chat-proxy")) {
      const ai = options.ai ?? { status: 200, body: { content: "### Immediate actions\n1. Stay calm.\n2. Call **999** if they cannot breathe." } };
      return json(route, ai.status, ai.body);
    }

    if (options.restDown && path.startsWith("/rest/v1/")) return json(route, 503, { message: "Service unavailable" });

    if (path === "/rest/v1/rpc/has_role") return json(route, 200, !!options.isAdmin);
    if (path === "/rest/v1/rpc/check_and_log_qr_scan") {
      const scan = options.scan as { httpStatus?: number } | undefined;
      if (scan && typeof scan === "object" && "httpStatus" in scan && scan.httpStatus) return json(route, scan.httpStatus, { message: "error" });
      return json(route, 200, options.scan ?? { success: false, error: "Invalid or expired QR code" });
    }

    const table = path.replace("/rest/v1/", "");
    const rows = tables[table];
    if (!rows) return json(route, 404, { message: `Unknown table ${table}` });

    const wantsObject = (request.headers()["accept"] ?? "").includes("vnd.pgrst.object");
    const prefer = request.headers()["prefer"] ?? "";

    if (method === "HEAD" || prefer.includes("count=exact")) {
      return json(route, 200, method === "HEAD" ? undefined : rows, { "content-range": `0-${Math.max(rows.length - 1, 0)}/${rows.length}` });
    }
    if (method === "GET") {
      if (wantsObject) return rows.length ? json(route, 200, rows[0]) : json(route, 406, { code: "PGRST116", message: "No rows" });
      return json(route, 200, rows);
    }
    if (method === "POST" || method === "PATCH") {
      const body = request.postDataJSON();
      const record = Array.isArray(body) ? body[0] : body;
      const merged = { id: `mock-${Date.now()}`, created_at: new Date().toISOString(), ...(method === "PATCH" ? rows[0] : {}), ...record };
      if (table === "emergency_incidents" && method === "POST") tables.emergency_incidents = [merged, ...rows];
      if (table === "emergency_incidents" && method === "PATCH") tables.emergency_incidents = rows.map((r) => ({ ...r, ...record }));
      return json(route, method === "POST" ? 201 : 200, wantsObject ? merged : [merged]);
    }
    if (method === "DELETE") return route.fulfill({ status: 204 });
    return json(route, 405, { message: "unsupported" });
  });
}
