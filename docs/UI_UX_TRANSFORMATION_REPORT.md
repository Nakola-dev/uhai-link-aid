# UhaiLink — UI/UX Transformation Report

> **Date:** 2026-10-21 · **Plan:** [UI_UX_TRANSFORMATION_PLAN.md](UI_UX_TRANSFORMATION_PLAN.md) · **Log:** [UI_UX_TRANSFORMATION_PROGRESS.md](UI_UX_TRANSFORMATION_PROGRESS.md)
> **Status:** committed on the `ui-ux-transformation` branch (not merged into `main`); **nothing has been deployed**. Database and Edge Function changes are written for the owner to review and deploy.
> **Verification limit:** the Supabase project in `.env` does not resolve, so every rendered check used a fully mocked Supabase with fictional data. Live-backend checks are listed in §L.

---

## A. Executive summary

UhaiLink now has a coherent, accessible design system and a product-led public site, but the most important outcome is that the **emergency paths now do what they say**:

- **First responders** get a calm, single-screen view in clinical priority order, with tap-to-call contacts, "not recorded" instead of misleading "none", and actionable error states. Once the migration is deployed they will also see emergency contacts (previously always missing) and scans will stop sharing one global rate limit.
- **SOS** is one tap away on every signed-in screen, reports only backend-confirmed outcomes (sent N of M, failed, no contacts), always offers direct calls to 999/112/1199, and says plainly that it does not call emergency services.
- **QR medical IDs** use 128-bit random tokens; "new code" now works and can no longer leave someone without a code.
- **Private data** is no longer cached by the service worker; caches are purged on sign-out.
- **Fake interactions removed:** contact form, downloads, learning progress, payments data, invented statistics and unbuilt features presented as available.
- **Performance:** initial JavaScript on public pages down from ~274 KB to 99–202 KB gzip (105 KB on the responder page, 135 KB on the landing page), with no chart or admin code; no layout shift on any measured route. The JavaScript budgets are met; the landing LCP (2.66 s vs 2.5 s) and precache (1,115 vs 900 KiB) targets were **not** met — see §G for the numbers and what it would take.

Checks: real type-check went from **11 errors to 0**, lint from **1 error to 0**, and a new automated suite (unit, rendered, WCAG 2.2 axe, responsive, reduced-motion) runs without a backend. Results are in §J.

---

## B. Design system

**Direction — "calm clinical confidence":** quiet off-white surfaces, deep medical blue for action, teal for "ready", and emergency red reserved for SOS, critical allergies and destructive confirmation. Depth comes from fine borders and soft elevation, not glows. Identity is carried by real local context (Kiswahili "Uhai", Kenyan emergency lines), not ornament.

| Token group | Implementation (`src/index.css`, `tailwind.config.ts`) |
|---|---|
| Colour roles | `primary` (action blue), `destructive` (emergency red), `teal` (ready), `success`, `warning`; shadcn-correct `secondary` (quiet surface) and `accent` (subtle hover — previously emergency red, which turned every ghost-button/menu hover red) |
| Contrast | Every text/fill pair ≥ 4.5:1 and every control outline/focus ring ≥ 3:1 in **both** themes (computed with a script; e.g. primary button 3.63 → 5.74, dark-mode red text 1.50 → 5.50) |
| Dark mode | Lighter fills with dark text so one token serves fills and text; borders/inputs now visible (dark `--border` previously equalled the card colour) |
| Typography | Self-hosted **Plus Jakarta Sans** (h1/h2, display) + **Inter** (UI, body, data; tabular numerals where numbers align). SIL OFL 1.1. Latin subsets precached for offline use; Google Fonts removed |
| Elevation | `shadow-elevation-1/2/3` |
| Motion | `--duration-fast/base/slow` (120/200/320 ms), `--ease-standard/emphasized`; global `prefers-reduced-motion` override |
| Layers | `z-header`, `z-banner`, `z-overlay`, `z-toast`, `z-skip` |
| Layout | Container padding 1 / 1.5 / 2 rem, max width 1280 px; `scroll-padding` keeps focus clear of sticky bars |

**Shared building blocks:** `BrandLogo`, `ThemeToggle`, `FormField` (label/hint/error wiring), `PasswordInput`, `common/EmptyState`, `common/SectionHeading`, `responder/ResponderLayout` + `ResponderProfile`, `learn/VideoEmbed`, `assistant/AnswerContent`, `landing/HeroVisual`, `RouteMeta` (titles, robots, session clean-up). Hooks: `use-qr-token`, `use-sos-alert`, `use-emergency-contacts`, `use-reveal`, `use-session`. One toast system (sonner).

---

## C. Pages improved

| Area | What changed |
|---|---|
| Global shell | New header (active indicator, Radix sheet mobile menu, "Emergency? Call 999"), footer (tap-to-call emergency lines, no dead social links, no "trusted by thousands"), connection pill that never covers controls, unique per-route titles, `noindex` on private routes, skip links in both layouts |
| Landing | Product-led hero with a coded phone + medical-ID composition (fictional person; the card's QR opens the demo), factual trust strip, six-step story, responder spotlight, features, privacy & security facts, FAQ, single CTA. Removed: always-zero stats, unverifiable claims, decorative pulsing |
| Responder demo (new) | `/demo/responder` — the real responder component with fictional data |
| Services / About | Rebuilt around what exists; unbuilt features labelled "Planned"; invented statistics and three conflicting price lists removed; inert CTAs replaced by real email links |
| Learn (public) | Reads real `tutorials/articles/webinars/downloadable_materials`; click-to-load privacy-enhanced video; article reader; registration links; real downloads; honest empty states. (All four hard-coded YouTube IDs were 404.) |
| Contact | Opens the user's email app with the message and says so (previously faked "Message sent!") |
| Auth | Split layout, show/hide password, `autocomplete`, accessible inline errors, plain-language error messages, complete password-reset flow, consent required before Google sign-up |
| Onboarding | Consent step whenever none is on record (incl. Google and pre-consent accounts); email step only when relevant; contacts saved without delete-then-insert risk |
| Dashboard | Readiness checklist from real data, prominent SOS and Medical ID, tap-to-call directory |
| Medical profile | Fixed: saving failed whenever date of birth was empty; comma-separated fields couldn't hold more than one item; contact failures reported as success. Labelled fields, sticky save bar that sits above the mobile nav |
| Medical ID (QR) | ID-card presentation, scannable dark-on-white QR in every theme, high-res PNG, print-only-the-card, confirmed atomic "new code" |
| Responder page | Minimal chrome + Call 999, clinical priority order, provenance notice, self-reported blood type, tap-to-call, primary hospital, specific error states |
| SOS | Verified-state machine, location status, direct-call strip, offline state, "text contacts again", honest "what SOS does", status by icon + text |
| AI assistant | Name never sent; medical context opt-in (default off); structured safe rendering with urgent/warning/info sections; retry; offline state; suggestions; Call 999 and SOS always visible |
| Learn (signed-in) | Honest self-reported completion (fake 25%-per-click progress removed; upsert conflict fixed) |
| Buy QR tag / Settings | Honest "coming soon" with what works today; accessible password change; "request deletion" wording matches behaviour |
| Admin | Analytics per `dataviz` method (single-series bar + table view, status tiles, honest labels); Content without non-existent counts; Organisations add/edit/delete with confirmation + audit log; QR codes masked with audited deactivation; Payments honest; Emergency logs/operations fixed (broken profile join), audit-logged updates, correct "resolved today" |
| 404 / Offline | Rebuilt; offline page really reloads on reconnect and leads with call buttons |

---

## D. Animations and interactions

No animation library was added. CSS + `tailwindcss-animate` (now actually loaded — it was silently missing, so dialogs/menus had no transitions) + one `IntersectionObserver` hook cover everything.

| Effect | Where |
|---|---|
| Entrance fade-up | Landing hero composition only (hero text is static so it paints immediately — it is the LCP element) |
| Scroll reveal (opacity/transform, staggered) | Landing, Services, About — content is hidden only after JS runs, and always shown for print and reduced motion |
| Dialog/sheet/menu enter-exit, toasts | Global (Radix + `tailwindcss-animate`, sonner) |
| Nav active indicator, hover/press feedback | Header, sidebar, cards, SOS button press |
| Chart hover tooltip; refetch dims instead of flashing a skeleton | Admin analytics |

**Deliberately static:** the responder page and the SOS control. Removed: infinite heartbeat, pulsing particles, hover tilts on non-interactive cards.

---

## E. Images and assets

| Asset | Location | Source / licence |
|---|---|---|
| Brand mark (white heart on brand blue), favicon | `public/favicon.svg` | Generated by `scripts/generate-brand-assets.mjs`; heart path from Lucide (ISC licence) |
| PWA icons 192/512, maskable 512, Apple touch icon 180 | `public/icons/*.png` | Same script (rendered with the local Chrome) |
| Open Graph image 1200×630 | `public/og-image.png` | Same script; the file referenced in `index.html` previously did not exist |
| Product imagery | Coded components (`HeroVisual`, responder demo) | No photographs, generated images or stock assets were added; all depicted data is fictional |

Old red-cross placeholder icons and their generator were removed (the in-app brand mark was already the blue heart).

---

## F. Dependencies

| Package | Change | Reason |
|---|---|---|
| `@fontsource-variable/plus-jakarta-sans` 5.3.0, `@fontsource-variable/inter` 5.3.0 | Added (runtime, CSS/woff2 only) | Self-hosted fonts: no third-party requests, offline availability |
| `@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0 | Added (dev) | Rendered, accessibility and responsive tests using the installed Chrome |
| `vitest` 5.0.3 | Added (dev) | Unit tests for pure helpers |
| `tailwindcss-animate`, `@tailwindcss/typography` | Retained — now actually loaded | Were installed but never registered |
| GSAP, Lenis, Motion, `react-markdown`, carousels, icon sets | **Not added** | CSS/IO covered every effect; a 70-line safe parser renders AI answers |

All versions pinned and ≥ 2 weeks old. `npm audit`: 39 advisories before and after (27 high) — none introduced; all pre-existing, mostly build/lint tooling (`vite`, `rollup`, `typescript-eslint`, `postcss`, `tailwindcss`, `react-router-dom`). Upgrading them is a separate task (`npm audit fix --force` would make breaking major changes).

---

## G. Performance

**Method.** Production build served by `vite preview` (HTTP/1.1, no CDN), Supabase mocked. Bundle sizes: `scripts/measure-routes.mjs` (JS/CSS actually requested by each route, gzip sizes from the build). Vitals: `scripts/measure-vitals.mjs` — Chrome at 390×844 @2x, 4× CPU slowdown, ~1.6 Mbps / 150 ms RTT, median of 3 runs. These are lab numbers on one machine, not field data.

| Metric | Baseline | Plan target | Final | Met |
|---|---|---|---|---|
| Initial JS on `/` (gzip) | ~274 KB | ≤ 150 KB | **135.4 KB** (10 files) | Yes |
| Initial JS on `/profile/:token` (gzip) | ~274 KB | ≤ 120 KB | **104.6 KB** (5 files) | Yes |
| recharts / admin code on non-admin routes | yes (110.5 KB gz preloaded everywhere) | none | **none** on every measured route | Yes |
| SW precache | 1,475.55 KiB (109 entries) | ≤ 900 KiB | **1,111.98 KiB** (96 entries, now incl. 74 KiB self-hosted fonts) | No |
| CLS | not measured | < 0.1 | **0.000** on `/`, `/profile/:token`, `/learn`, `/auth` | Yes |
| LCP `/` | not measured | < 2.5 s | **2.66 s** (was 3.20 s) | No (borderline) |
| LCP `/profile/:token` | not measured | < 2.5 s | **2.28 s** | Yes |
| LCP `/learn`, `/auth` | not measured | — | 2.80 s, 2.86 s | — |

Other signed-out routes: `/auth` 202.2 KB, `/learn` 182.9 KB, `/services` 120.5 KB, `/demo/responder` 99.2 KB JS; CSS 18.9 KB gzip on every route. Signed-in page chunks on top of the shared shell: dashboard layout 4.3 KB, SOS 5.3 KB, medical profile 3.5 KB, QR 3.7 KB, assistant 5.1 KB; admin 118.8 KB (includes recharts; admin only, not precached).

**Fixed during final measurement:** the responder page's footer jumped when the profile loaded (CLS 0.125 → 0; the loading state now fills the screen); the landing hero text faded in from `opacity: 0`, delaying LCP (3.91 s → 3.20 s; hero text is now static, the decorative composition still animates); 13 tiny side-effect-free chunks are merged (`experimentalMinChunkSize`), cutting requests on `/` from 30 to 26 and on the responder page from 16 to 14; admin chunks and the social preview image are no longer precached.

**Second pass (structural).** `supabase-js` (~45 KB gzip) is no longer in the entry bundle: the responder lookup is one plain `fetch` to the same RPC with the anonymous key, and the header, route-meta listener and protected-route guard load it only when a stored session, the sign-in page or an auth redirect is present (`lib/supabase-lazy.ts`). Entry chunk 79.9 → 35.3 KB gzip. Lucide icons are one shared chunk instead of ~20 single-icon requests behind every page, and the decorative hero illustration (with the QR library) loads after the headline in a same-size placeholder. Latin fonts are preloaded (no measurable gain; kept as standard practice). Trying to bundle the landing page into the entry gave LCP 2.60 s but pushed the responder page to 125 KB, so it was reverted: the emergency path takes priority.

**What remains.** Landing LCP is 2.66 s against 2.5 s (lab, 4x CPU slowdown, ~1.6 Mbps): the headline still waits for client-side rendering. True prerendering of the landing page (build-time HTML) would close it; it was not attempted because it adds a build step and hydration risk for a 0.16 s gap. The 900 KiB precache target is also missed (1,115 KiB, mostly fonts, `react-vendor`, and signed-in page chunks needed offline).

---

## H. Accessibility

- Contrast-validated tokens (both themes); visible focus everywhere; skip links; landmarks; one `h1` and a unique `<title>` per route; heading order fixed on legal, auth, offline and responder pages.
- Forms: bound labels, `aria-invalid`/`aria-describedby`, `autocomplete`, show/hide password, error text never colour-only.
- Status: `role="status"`/`aria-live` for SOS progress, assistant replies (`role="log"`), connection state; emergency status always icon + text.
- Keyboard: Radix sheets/dialogs (focus trap, Escape, focus return) for both mobile menus; mobile drawer no longer focusable while hidden.
- Touch targets: SOS 176 px, call buttons ≥ 56 px tall, bottom navigation 64 px.
- Reduced motion honoured globally; charts have a table view.
- **Automated:** axe (WCAG 2.0/2.1/2.2 A+AA) on 18 routes × light/dark × desktop/mobile — see §J. One documented exception: `target-size` "partially obscured" results caused solely by elements explicitly marked `data-sticky-overlay` (mobile bottom nav, sticky save bar) at the scan's scroll position; focus is kept clear of them with `scroll-padding` (WCAG 2.4.11).
- **Not done:** manual screen-reader passes (NVDA/TalkBack) and testing with users.

---

## I. Security and reliability

- **Sensitive components** changed only where planned and reviewed: auth/consent, QR tokens, responder RPC, SOS + SMS function, AI prompt, admin actions, service worker, CSP.
- **Service worker:** only public content tables and public Storage objects are cached; all other Supabase traffic is network-only; legacy caches purged at startup and sign-out; no hard-coded project ref.
- **QR tokens:** 128-bit random, no user identifiers; atomic rotation; admins see masked tokens only and deactivation is audit-logged.
- **Consent:** recorded before health data is stored for every sign-up path; insert failures surfaced.
- **AI:** name never sent; medical context opt-in. (The proxy still accepts a client-supplied system prompt — pre-existing; recommend moving the prompt server-side.)
- **Admin:** route guard is UX only (RLS remains the control); organisation, QR and incident changes now audit-logged.
- **Indexing:** `/profile/`, `/dashboard`, `/admin`, `/onboarding` disallowed in `robots.txt` (previously overridden by per-bot groups) and `noindex` at runtime.
- **CSP:** Google Fonts origins removed; only `youtube-nocookie.com` frames and `i.ytimg.com` thumbnails added.
- **Backend (written, not deployed):** responder contacts, real-IP pseudonymised rate limiting, pinned `search_path`; SMS function loads recipients server-side, verifies incident ownership, uses the production endpoint unless the username is `sandbox`, normalises Kenyan numbers, logs per-recipient status, never double-texts, and fails honestly.
- **Offline:** never claims an alert or SMS was sent while offline; calls to 999/112/1199 are always offered.
- **Performance telemetry:** production builds sent a Web Vitals beacon on every page to a placeholder `/api/vitals` endpoint that does not exist, including the full path (on the responder page, `/profile/<emergency access token>`) and the user agent. Reporting is now opt-in via `VITE_VITALS_ENDPOINT` (nothing is sent when it is unset), the token is replaced by `:token`, and the user agent is no longer sent.

---

## J. Testing

**Final results (run on the final code, 2026-10-21):**

| Check | Command | Result |
|---|---|---|
| Type-check (real app config) | `npm run typecheck` | **0 errors** (baseline 11) |
| Lint | `npm run lint` | **0 errors**, 7 warnings (baseline 1 error) |
| Unit | `npm test` | **14 / 14 passed** (4 files: QR tokens, medical lists, AI answer parsing, Web Vitals path redaction) |
| Rendered e2e + accessibility | `npx playwright test --grep-invert visual` | **146 passed, 0 failed, 12 skipped** — the skips are by design (the responsive sweep runs once, on the desktop project) |
| Production build | `npm run build` | **passes**; precache 96 entries / 1,111.98 KiB |

**What the e2e suite covers** (Chrome; desktop 1366×900 and mobile 360×780 projects; Supabase fully mocked with fictional data via `e2e/support/supabase-mock.ts`):

- **Responder page:** clinical order, contacts with tap-to-call, every error state (invalid, deactivated, rate-limited, not found, offline, unavailable), no access token sent in an `_ip_address` argument.
- **SOS:** confirmation step, "sent N of M", partial and failed SMS never shown as success, no-contacts state, direct-call options when an alert fails.
- **QR:** ID card rendering, confirmed regeneration, download/copy.
- **Public and admin flows:** navigation, Learn content and empty states, contact `mailto` hand-off, admin tabs render real (mocked) data.
- **Accessibility:** axe WCAG 2.0/2.1/2.2 A+AA on 18 routes × light and dark × both projects; fails on serious or critical issues (one documented `target-size` exception, see §H).
- **Responsive:** 12 routes × 8 widths (320–1920 px) with no horizontal overflow; reduced motion disables animation and leaves no content hidden.
- **Visual:** `e2e/visual.spec.ts` captures screenshots for manual review; it is not a pixel-comparison test and is excluded from the pass/fail run.

**Issues the tests found and that were fixed:** public header overflowed by 4 px at 768 px (header now switches to the menu below 1024 px); the medical profile's sticky save bar sat behind the mobile bottom navigation; low-contrast text on the sign-in brand panel; the responder page layout shift (§G).

**Not covered:** a live Supabase backend (unreachable — see §L), real SMS delivery, Safari and Firefox, real low-end devices, screen readers, and pixel-level visual regression.

---

## K. Files changed (summary)

- **New:** `src/components/{BrandLogo,ThemeToggle,FormField,PasswordInput,RouteMeta}.tsx`, `src/components/{common,responder,learn,assistant,landing}/*`, `src/hooks/{use-qr-token,use-sos-alert,use-emergency-contacts,use-reveal,use-session}.ts`, `src/lib/{qr-token,emergency-numbers,sensitive-cache,medical-lists,consent,auth-errors,answer-blocks,youtube,responder,demo-profile}.ts` (+ unit tests), `src/pages/public/ResponderDemo.tsx`, `e2e/*`, `playwright.config.ts`, `vitest.config.ts`, `scripts/{measure-routes,measure-vitals,generate-brand-assets}.mjs`, `supabase/migrations/20261021000001_qr_scan_contacts_and_ip_rate_limit.sql`, brand assets, docs.
- **Rewritten:** every page under `src/pages/**`, `Header`, `Footer`, `Layout`, `DashboardLayout`, `ProtectedRoute`, `OfflineBanner`, admin tabs, `index.css`, `tailwind.config.ts`, `supabase/functions/send-emergency-sms/index.ts`.
- **Modified:** `App.tsx` (nested protected layout routes, single toaster), `main.tsx`, `vite.config.ts`, `index.html`, `public/robots.txt`, `src/hooks/use-toast.ts` (sonner adapter), `src/lib/web-vitals.ts`, `src/integrations/supabase/types.ts` (RPC signature), `ui/checkbox.tsx`, `package.json`, README, audit status note.
- **Removed:** `src/pages/public/AIAssistant.tsx` (orphaned), `ui/toast.tsx`, `ui/toaster.tsx`, placeholder SVG icons, `scripts/generate-icons.cjs`.

---

## L. Outstanding work (needs the owner)

1. **Deploy backend changes:** run migration `20261021000001_*`; optionally set `app.settings.scan_ip_salt`; redeploy `send-emergency-sms`; set the production `AFRICAS_TALKING_USERNAME` (and optional `AFRICAS_TALKING_SENDER_ID`). Confirm the new scan limits (10/min per network per code, 60/min per network).
2. **Restore a reachable Supabase project**, then verify live: sign-up/consent (email + Google), password reset, QR scan incl. contacts and rate limiting, SOS SMS delivery to a real phone, AI proxy, admin actions and audit log, PWA install/update. Regenerate `types.ts` from the live schema.
3. **Supabase Auth redirect URLs** must allow `<origin>/auth` (password reset).
4. **Clinical review** of all first-aid copy (Learn basics, AI system prompt).
5. **Legal review:** Privacy Policy §AI should state that medical context is opt-in; About-page story was rewritten from the original and should be checked.
6. Real social-media handles, product prices and photography (if wanted) — none were invented.
7. Manual screen-reader and real-device (low-end Android) testing.
8. If you want Web Vitals in production, set `VITE_VITALS_ENDPOINT` to a real collector (none is configured, so none is sent).

## M. Recommended next steps

1. Deploy §L.1 and run the live checks in §L.2 — this unlocks responder contacts and real rate limiting.
2. Move the AI system prompt server-side and add per-user rate limiting to the AI and SMS functions.
3. Upgrade the vulnerable toolchain packages in a dedicated PR.
4. Add an in-app editor for learning content (admin Content tab is read-only today).
5. Consider a Supabase Realtime subscription for Emergency operations (today it needs a manual refresh, and says so).
6. Close the last performance gap in §G: prerender the landing page at build time and serve over HTTP/2 from a CDN.
