// Lab measurement of LCP and CLS for key routes on a production preview, emulating a
// mid-range phone (4× CPU slowdown) on a slow 4G connection.
// Usage: npm run build && npx vite preview --port 4173   (in another terminal)
//        node scripts/measure-vitals.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const ROUTES = ["/", "/profile/sample-token", "/learn", "/auth"];
const RUNS = 3;

const browser = await chromium.launch({ channel: "chrome" });
const rows = [];

for (const route of ROUTES) {
  const lcps = [];
  const clss = [];
  for (let run = 0; run < RUNS; run++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    // Never contact a real backend: answer the responder lookup with fictional data, everything else empty.
    await page.route(/supabase\.co/, (r) =>
      r.request().url().includes("check_and_log_qr_scan")
        ? r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, profile: { full_name: "Amani Wanjiru", blood_type: "O+", allergies: ["Penicillin"], medications: [], chronic_conditions: [], primary_hospital: null, phone: null, updated_at: null, emergency_contacts: [] } }) })
        : r.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await page.addInitScript(() => {
      window.__vitals = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.__vitals.lcp = entries[entries.length - 1].startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const vitals = await page.evaluate(() => window.__vitals);
    lcps.push(vitals.lcp);
    clss.push(vitals.cls);
    await context.close();
  }
  const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  rows.push({ route, "LCP (ms, median)": Math.round(median(lcps)), "CLS (median)": median(clss).toFixed(3) });
}

await browser.close();
console.log(`Lab conditions: 390×844 @2x, 4× CPU slowdown, ~1.6 Mbps / 150 ms RTT, ${RUNS} runs per route`);
console.table(rows);
