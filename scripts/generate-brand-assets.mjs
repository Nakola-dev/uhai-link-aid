// Generates the favicon, PWA icons (PNG) and the Open Graph image from the brand mark.
// Renders with the locally installed Chrome via Playwright (no image libraries needed).
// Usage: node scripts/generate-brand-assets.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const PRIMARY = "#1D5FD6";
const INK = "#0F172A";
// Lucide "heart" (24×24), the same mark used by <BrandLogo />.
const HEART = "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";

/** Brand mark: white heart on a blue rounded square. `inset` shrinks the heart for maskable safe zones. */
const markSvg = ({ size = 512, radius = 112, inset = 0.2 } = {}) => {
  const heart = size * (1 - inset * 2);
  const scale = heart / 24;
  const offset = (size - heart) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${PRIMARY}"/>
  <path transform="translate(${offset} ${offset + size * 0.02}) scale(${scale})" d="${HEART}" fill="#FFFFFF"/>
</svg>`;
};

const publicDir = join(process.cwd(), "public");
const iconsDir = join(publicDir, "icons");
mkdirSync(iconsDir, { recursive: true });

writeFileSync(join(publicDir, "favicon.svg"), markSvg({ size: 512, radius: 112, inset: 0.2 }));

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function renderPng(html, width, height, file) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><body style="margin:0">${html}</body></html>`);
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width, height } });
  console.log("wrote", file);
}

for (const size of [192, 512]) {
  await renderPng(markSvg({ size, radius: size * 0.22, inset: 0.2 }), size, size, join(iconsDir, `icon-${size}x${size}.png`));
}
// Maskable: full-bleed background, heart inside the 80% safe zone.
await renderPng(markSvg({ size: 512, radius: 0, inset: 0.28 }), 512, 512, join(iconsDir, "icon-maskable-512x512.png"));
// iOS ignores SVG touch icons and applies its own rounding.
await renderPng(markSvg({ size: 180, radius: 0, inset: 0.22 }), 180, 180, join(iconsDir, "apple-touch-icon.png"));

// Open Graph / social preview (1200×630).
const og = `
<div style="width:1200px;height:630px;box-sizing:border-box;padding:72px 80px;background:#F7F9FC;font-family:'Segoe UI',system-ui,sans-serif;display:flex;flex-direction:column;justify-content:space-between;color:${INK}">
  <div style="display:flex;align-items:center;gap:20px">
    ${markSvg({ size: 72, radius: 18, inset: 0.2 })}
    <span style="font-size:44px;font-weight:800;letter-spacing:-1px">Uhai<span style="color:${PRIMARY}">Link</span></span>
  </div>
  <div>
    <div style="font-size:72px;font-weight:800;line-height:1.05;letter-spacing:-2px;max-width:960px">Your medical identity, ready when seconds matter.</div>
    <div style="margin-top:28px;font-size:30px;color:#566174;max-width:900px">A QR medical ID first responders can scan, and an SOS that alerts the people you choose.</div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;font-size:24px;color:#566174">
    <span>uhailink.com</span>
    <span style="font-weight:700;color:#C8241F">In an emergency, call 999 or 112</span>
  </div>
</div>`;
await renderPng(og, 1200, 630, join(publicDir, "og-image.png"));

await browser.close();
