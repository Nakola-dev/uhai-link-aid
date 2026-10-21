// Measures the JavaScript/CSS each route actually loads in a production preview.
// Usage:  npm run build && npx vite preview --port 4173  (in another terminal)
//         node scripts/measure-routes.mjs [gzip-sizes.txt]
// gzip-sizes.txt: "/assets/file.js <gzip kB>" lines (parsed from the build output);
// without it, uncompressed transfer sizes are reported.
import { readFileSync, existsSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
// Signed-out routes only: without a session, protected routes redirect to /auth and would just
// measure the sign-in page again. Authenticated page chunks are read from the build output instead.
const ROUTES = ["/", "/auth", "/learn", "/services", "/profile/sample-token", "/demo/responder"];

const gzipFile = process.argv[2];
const gzip = new Map();
if (gzipFile && existsSync(gzipFile)) {
  for (const line of readFileSync(gzipFile, "utf8").split("\n")) {
    const [file, kb] = line.trim().split(/\s+/);
    if (file && kb) gzip.set(file, parseFloat(kb));
  }
}

const browser = await chromium.launch({ channel: "chrome" });
const rows = [];
for (const route of ROUTES) {
  const page = await browser.newPage();
  // Keep the measurement offline from any real backend.
  await page.route(/supabase\.co/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: "[]" }));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  const assets = await page.evaluate(() =>
    performance.getEntriesByType("resource")
      .filter((e) => /\/assets\/.*\.(js|css)$/.test(new URL(e.name).pathname))
      .map((e) => ({ path: new URL(e.name).pathname, bytes: e.decodedBodySize }))
  );
  const js = assets.filter((a) => a.path.endsWith(".js"));
  const css = assets.filter((a) => a.path.endsWith(".css"));
  const sum = (list) => list.reduce((t, a) => t + (gzip.get(a.path) ?? a.bytes / 1024), 0);
  rows.push({
    route,
    jsFiles: js.length,
    jsKB: sum(js).toFixed(1),
    cssKB: sum(css).toFixed(1),
    recharts: js.some((a) => /chart|Chart|recharts/i.test(a.path)) ? "yes" : "no",
  });
  await page.close();
}
await browser.close();
console.log(`Sizes are ${gzip.size ? "gzip" : "uncompressed"} kB`);
console.table(rows);
