# UhaiLink — UI/UX Transformation Plan

> **Status:** Phase One (discovery) complete — **awaiting owner approval before any implementation**
> **Date:** 2026-10-21 · **Branch at audit:** `main` @ `b83aea7` (clean)
> **Scope of this document:** findings, baseline, priorities, dependency proposals, risks, and the phased plan.
> No application code, configuration, or dependencies were changed during Phase One.

---

## 0. Executive summary

UhaiLink has a sound foundation (React 18 + Vite 7 + Tailwind + shadcn/Radix, lazy-loaded routes, Supabase RLS, consent records, a server-side AI proxy, PWA). The interface itself, however, is a generic shadcn template with inconsistent tokens, and — more importantly — the audit found **several defects in the emergency-critical paths that a visual redesign must not paper over**:

1. **Responders never see emergency contacts.** The QR scan function returns `profiles.emergency_contact_*`, but nothing in the app writes those columns; contacts live in `emergency_contacts`. Every scanned profile shows "No emergency contact provided".
2. **QR scan rate limiting is global.** The client always sends `_ip_address: 'unknown'`; the SQL counts scans per `ip_address`, so **5 scans/minute across the entire platform** blocks every responder.
3. **QR "Regenerate" is broken** on both pages (unique-constraint conflict), and the profile page variant can leave a user with **no active QR at all**. Tokens are predictable (`userId-prefix + timestamp`; the profile page embeds the full user UUID).
4. **SOS reports success that it cannot verify.** "Emergency triggered!" and "Your emergency contacts have been notified" appear even when SMS failed or no contacts exist; the SMS function returns `success: true` even when every message fails, and it targets the **Africa's Talking sandbox** endpoint.
5. **The SOS page is not in the dashboard navigation.** `/dashboard/emergency` is reachable only via a button inside the AI assistant. "My QR" is likewise missing from the dashboard sidebar.
6. **Authenticated medical data is cached by the service worker** (`NetworkFirst` on all `/rest/v1/*`), persisting after sign-out.
7. **Several interactions are fake:** Contact form "Message sent!" (nothing is sent), Learn "downloaded successfully!" (nothing downloads), admin Payments tab (hard-coded mock transactions), dashboard search box and notification bell (inert, permanent unread dot).
8. **Accessibility/contrast failures in the core palette:** every primary button (white on primary = **3.63:1**), white on emergency red (**3.78:1**), and dark-mode red text (**1.50:1**) fail WCAG AA. No `prefers-reduced-motion` support anywhere.
9. **Recharts (408 KB) is preloaded on every page**, including the first-responder page; `tailwindcss-animate` is silently not loaded; Web Vitals only records CLS.

The plan therefore starts with a short **Phase 0 (P0 correctness & safety)** before the design-system work, and separates **frontend fixes I can make** from **backend changes that need your explicit approval** (Section 13).

---

## 1. Baseline (measured 2026-10-21)

| Check | Command | Result |
|---|---|---|
| Type check (documented) | `npx tsc --noEmit` | exit 0 — **but checks nothing**: root `tsconfig.json` has `"files": []` and only references sub-projects |
| Type check (actual app) | `npx tsc --noEmit -p tsconfig.app.json` | **exit 2 — 11 errors** (pre-existing) |
| Lint | `npm run lint` | **exit 1 — 1 error, 13 warnings** (pre-existing) |
| Build | `npm run build` | **exit 0** — built in 24.4 s; PWA precache 109 entries / **1,475.55 KiB** |
| Dev server | `npm run dev` | runs at `http://localhost:8080` |
| Backend reachability | DNS/HTTPS to Supabase host in `.env` | **unresolvable** (project host redacted); the ref hard-coded in `vite.config.ts`, `index.html`, and docs (`jlgzlwyuaopnjhdnnjyr`) is also unresolvable. General internet access works. |

**Notable pre-existing type errors** (`tsconfig.app.json`, `strict: false`):
- `src/pages/public/AIAssistant.tsx:54` — `navigate` is undefined (this page is **orphaned**: no route uses it).
- `src/lib/web-vitals.ts:104` — `onFID` does not exist in web-vitals v5 → throws at runtime, so LCP/FCP/TTFB/INP are never registered (only CLS).
- `src/pages/public/PublicProfileView.tsx:40,48` — generated Supabase types lack `check_and_log_qr_scan` (types are stale).
- `AdminContentTab.tsx` (4), `AdminEmergencyLogsTab.tsx`, `AdminAuditLogsTab.tsx` — local interfaces drift from the DB types.

**Lint error:** `src/pages/user/UserEmergency.tsx:130` (`no-explicit-any`). Warnings: 6× `react-refresh/only-export-components` in `ui/`, 7× `react-hooks/exhaustive-deps`.

**Initial page weight (landing *and* first-responder page):**

| Chunk | Raw | Gzip | Why it loads |
|---|---|---|---|
| `index` (entry) | 263 KB | 73.5 KB | app shell + supabase-js |
| `chart-vendor` (recharts) | 408 KB | **110.5 KB** | `manualChunks` forces it into the entry's modulepreload graph |
| `ui-vendor` (Radix) | 254 KB | 82.8 KB | same |
| `react-vendor` | 20 KB | 7.6 KB | — |
| **Total initial JS** | **~945 KB** | **~274 KB** | + 81.5 KB CSS + Google Fonts (Poppins ×5 weights) |

> The documentation (`AUDIT_FINDINGS_STATUS.md`) states "TypeScript errors: 0" and "all tabs use real Supabase data". Both are inaccurate; this plan does not rely on those claims.

**Visual verification performed:** headless Chrome via the DevTools Protocol (device emulation, full-page captures, DOM probes) of all public routes at 360 / 390 / 768 / 1366 px, light and dark. Authenticated pages (dashboard, QR, SOS, AI, admin) **could not be rendered** because the backend is unreachable and no test account exists; they were assessed from source only. Probe results:
- No horizontal overflow on any public route at 360 px (good).
- **No `<h1>`** on `/auth`, `/privacy-policy`, `/offline`, and the responder page `/profile/:token`.
- **Every route has the same `<title>`** (WCAG 2.4.2).
- 12–14 interactive targets < 24 px per page (needs review against WCAG 2.5.8; many are inline links, which are exempt).

---

## 2. Skills, tools, and integrations inventory

| Item | Status | Use in this project |
|---|---|---|
| Project instructions (`AGENTS.md`, `CLAUDE.md`, `.claude/`) | **None exist** | — |
| `dataviz` skill | Available | **Will load before touching admin charts (Phase I)** — palette, accessible chart patterns for Recharts |
| `security-review` skill | Available | Run after Phase 0 and after any change to auth, QR, SOS, AI proxy, SW caching |
| `code-review` / `simplify` skills | Available | Optional per-phase review of diffs |
| `run` skill | Available | Used to launch the app |
| `artifact-*` skills | Available | Not applicable (claude.ai artifacts, not this codebase) |
| Frontend-design / accessibility / animation-specific skills | **Not installed** | Will apply standards directly (WCAG 2.2, Radix patterns) |
| MCP: VS Code diagnostics | Available | Type/lint diagnostics while editing |
| Browser automation | **No Playwright/MCP browser installed.** I wrote a dependency-free CDP script (scratchpad, not in repo) | Proposal: add Playwright as a devDependency (Section 8) |
| Image generation | **Not available** | No AI-generated imagery will be claimed or produced |

---

## 3. Current visual design assessment

**Strengths:** coherent blue/teal brand; heart logomark; dark mode exists; shadcn primitives give reasonable base components; landing hero has a clear tagline; legal pages exist; onboarding wizard structure is good.

**Weaknesses:**
- **Template feel.** Centred text hero with no product depiction; "Sample QR Code" is a grey placeholder icon; decorative `animate-pulse` dots and gradient text everywhere; same card grid repeated across pages; two near-identical CTA bands at the bottom of every public page (page CTA + footer "Become a Lifesaver").
- **No product storytelling.** Nothing shows what a responder actually sees — the product's core value.
- **Emergency red is decorative.** `accent` = emergency red is used for sidebar *hover* states, stat colours, and badges, diluting its meaning.
- **Inconsistent brand surfaces.** "UhaiLink" (header) vs "Uhai Link" + "U" square (dashboard); protected-route loader uses an off-brand blue→purple gradient; onboarding uses hard-coded `blue-50/indigo-50`.
- **Typography.** Poppins (Google Fonts, 5 weights, third-party request) for everything, including dense medical data where its geometric forms reduce scanability; `font-poppins` utility is defined but body inherits browser sans fallback in places.
- **Dark mode is partial.** ~150 hard-coded palette classes (`bg-red-50`, `text-green-600`, `bg-yellow-50`, `bg-gray-200`…) across 18 files have no dark variants; dark `--border` equals `--card` (1.00:1, borders invisible).

---

## 4. Existing design system

| Layer | Current state | Gap |
|---|---|---|
| Colour tokens | HSL vars in `src/index.css`: background, foreground, card, popover, primary(+hover), secondary, accent, muted, success, destructive, border, input, ring | No warning/info/emergency status tokens; no surface elevation scale; contrast failures (table below); dark destructive is a *background* colour used as text |
| Gradients / shadows | `--gradient-hero`, `--gradient-card`, `--shadow-card`, `--shadow-lg` | Override Tailwind's `shadow-lg` globally; no elevation scale |
| Radius | `--radius: 0.75rem` + sm/md/lg | OK |
| Typography | Poppins via Google Fonts | No type scale; no tabular numerals for stats |
| Motion | Custom keyframes (`fade-in`, `slide-in-*`, infinite `heartbeat`) | **`tailwindcss-animate` not loaded** (`plugins: [import(...)]` passes a Promise) → Radix dialog/menu/sheet enter/exit animations don't run; no reduced-motion handling; no duration/easing tokens |
| Z-index | Ad hoc (`z-40`, `z-50`, `z-[100]`, `z-[200]`) | Offline banner (`z-[100]`, fixed top) overlaps sticky header |
| Components | 49 shadcn primitives; `sidebar.tsx` present but unused (its `--sidebar-*` tokens are undefined) | No shared PageHeader, EmptyState, ErrorState, StatusBadge, StatCard, DataTable |
| Toasts | **Two systems mounted** (shadcn `Toaster` in 7 files, `sonner` in 14) | Inconsistent look & placement |
| Data fetching | TanStack Query provider mounted, **0 uses** | Every page re-fetches in `useEffect`; no caching between routes |

**Contrast of current tokens (WCAG 2.x):**

| Pair | Ratio | Result |
|---|---|---|
| White on `--primary` (all primary buttons) | 3.63 | **Fail** (normal text) |
| White on `--secondary` teal | 2.21 | **Fail** |
| White on `--accent`/`--destructive` (SOS, delete) | 3.78 | **Fail** |
| White on `--success` | 2.30 | **Fail** |
| `--primary` text on background | 3.47 | **Fail** |
| `--success` text on card ("Complete") | 2.30 | **Fail** |
| Dark: `--destructive` text on card (offline 999/112 links) | **1.50** | **Fail** |
| Dark: `--border` vs `--card` (input outlines) | **1.00** | **Fail** (non-text 3:1) |

---

## 5. Findings by priority

Legend — **Scope:** FE = frontend change I can make after approval · BE = database/Edge Function change (needs separate approval, you deploy) · CONTENT = needs your factual confirmation.

### P0 — Emergency usability, accessibility, security, reliability

| # | Finding | Evidence | Scope | Proposed fix |
|---|---|---|---|---|
| P0-01 | Responder page never shows emergency contacts | `check_and_log_qr_scan` returns `profiles.emergency_contact_*`; app only writes `emergency_contacts` table | **BE** | Update RPC to return prioritised rows from `emergency_contacts` (name, phone, relationship) |
| P0-02 | Global QR rate limit (all scans share IP `'unknown'`) | `PublicProfileView.tsx:42`, migration lines 43–47 | **BE** | Derive client IP inside the function from `current_setting('request.headers', true)` (`x-forwarded-for`), hash it (the DPIA says scanner IP is hashed; currently stored raw) |
| P0-03 | QR Regenerate fails (`upsert` without `onConflict` vs `UNIQUE(user_id)`) | `UserQRPage.tsx:58-66` | FE | Single atomic `update` of the user's row (RLS UPDATE policy exists) with confirmation dialog explaining printed tags stop working |
| P0-04 | Profile-page Regenerate deactivates old token then insert fails → user left with **no active QR** | `UserProfilePage.tsx:117-132` | FE | Remove duplicate QR logic from profile page; link to the QR page |
| P0-05 | Predictable QR tokens; profile page embeds full user UUID | `UserQRPage.tsx:56`, `UserProfilePage.tsx:104` | FE | `crypto.getRandomValues` 128-bit URL-safe token. Existing printed tokens remain valid |
| P0-06 | SOS false-success messaging | `UserEmergency.tsx:147, 285` | FE | Explicit state machine: *recorded* → *sending* → *sent to N of M* / *failed* / *no contacts*; read Edge Function `details` and the user's own `notifications` rows (RLS allows SELECT) |
| P0-07 | SMS Edge Function returns `success: true` when all SMS fail; uses **sandbox** endpoint; trusts client-supplied contact list | `send-emergency-sms/index.ts:50, 233-270, 172` | **BE** | Non-2xx or `success:false` when nothing sent; env-driven endpoint; load contacts server-side by `userId` |
| P0-08 | SOS not discoverable: absent from dashboard sidebar, dashboard home, and header | `DashboardLayout.tsx:49-56`; grep of links | FE | Persistent SOS entry in sidebar + mobile bottom bar + dashboard hero action |
| P0-09 | SOS page has no offline/fallback path | `UserEmergency.tsx` | FE | Always-visible `tel:999` / `tel:112` / `tel:1199` actions; offline state that says SMS alerts cannot be sent |
| P0-10 | Broken className in SOS confirm dialog (`"spacString((profile as any)?.blood_type)3 rounded-md"`) | `UserEmergency.tsx:336` | FE | Fix |
| P0-11 | Service worker caches all authenticated REST responses (`NetworkFirst`, 1 h) incl. medical data; persists after sign-out; patterns hard-code a project ref that differs from `.env` | `vite.config.ts` runtimeCaching | FE (config) | Cache only public read-only tables; everything else NetworkOnly; derive host from `VITE_SUPABASE_URL`; purge `supabase-*` caches on sign-out and on SW activate |
| P0-12 | Profile save fails whenever DOB is empty (`''` sent to a `DATE` column; onboarding never collects DOB) | `UserProfilePage.tsx:172` | FE | Send `null` for empty optional fields |
| P0-13 | Profile save reports success even if contact writes fail | `UserProfilePage.tsx:196-228` | FE | Check every write; report partial failure precisely |
| P0-14 | "Download QR" on profile page downloads the first `<svg>` in the document (likely a sidebar icon) | `UserProfilePage.tsx:135` | FE | Removed with P0-04; QR page download fixed to high-res PNG, toast only after success |
| P0-15 | Password reset is incomplete: link lands on `/auth`, which redirects signed-in users to `/dashboard`; no "set new password" view | `Auth.tsx:56-60, 133-135` | FE | Handle `PASSWORD_RECOVERY` event → dedicated update-password form |
| P0-16 | Google sign-up bypasses consent checkboxes; consent insert errors are ignored | `Auth.tsx:88-95, 375-388` | FE (+ CONTENT) | Gate "Sign up with Google" on consent; check insert results; capture consent in onboarding for any user without a consent record |
| P0-17 | Responder page: medically misleading empty states ("No known allergies" when the field is merely empty) | `PublicProfileView.tsx:162, 186, 209` | FE | "No allergies recorded" + note that absence of information is not absence of allergy; label blood type "self-reported" |
| P0-18 | Responder error page is a dead end (no guidance, no emergency numbers, no retry) | screenshot `m-profile-invalid` | FE | Specific messages (invalid, deactivated, rate-limited, offline) + tap-to-call 999/112 + retry |
| P0-19 | Medical pages are crawlable: `robots.txt` allows all; no `noindex` on `/profile/*` | `public/robots.txt` | FE | Disallow `/profile/`, `/dashboard`, `/admin`, `/onboarding`; inject `noindex` meta on those routes |
| P0-20 | Contrast failures in emergency-critical UI (SOS button, destructive text, dark-mode 999/112 links at 1.50:1) | Section 4 table | FE | New validated token set (Section 6) |
| P0-21 | Contact form shows "Message sent!" but sends nothing | `Contact.tsx:26-29` | FE (+ decision) | Replace with honest `mailto:` action until a backend exists (or BE table, if approved) |
| P0-22 | Admin Payments tab shows hard-coded mock transactions as real | `AdminPaymentsTab.tsx:12-46` | FE | Honest "Payments are not connected yet" empty state |
| P0-23 | AI assistant sends name + full medical profile to OpenRouter; DPIA §3.2 says "AI chat messages are **not** linked to medical profiles" | `UserAIAssistant.tsx:136-171` | **Decision** | Recommended: never send name; make medical context an explicit, default-off toggle with explanation. Your call (Section 13) |

### P1 — Major layout, navigation, readability, usability

- **Navigation:** dashboard sidebar lacks SOS, My QR, Admin; `/admin/emergencies` unlinked; mobile sidebar is off-screen but still keyboard-focusable (no focus trap/Escape); header hamburger lacks `aria-expanded`/`aria-controls`; no skip link in dashboard layout; fake search input and permanent unread bell.
- **Route transitions:** every protected route mounts its own `ProtectedRoute`, re-querying session + profile and flashing a full-screen purple loader on each sidebar click. Proposal: nested layout routes (`<Outlet/>`) so the guard and shell persist; auth/profile cached via TanStack Query.
- **Dashboard misinformation:** "Profile Status: Complete" if `full_name` exists; "Organizations"/"Tutorials" counts are capped by `.limit(5)`/`.limit(3)`.
- **Landing stats show 0/0/0** to every visitor: anonymous users cannot read `profiles`/`qr_access_tokens`/`emergency_incidents` under RLS. Remove the section (or add a secure aggregate RPC — BE).
- **Unverifiable claims (CONTENT):** "Trusted by thousands worldwide", "Join thousands of users", About "60% faster emergency response" and "10,000+ lives potentially impacted", Services features not implemented (voice guidance, symptom triage, auto-locating hospitals, live tracking, telemedicine, offline first-aid modules), conflicting prices (wristband KES 2,500 on Services vs KSh 800 on Buy QR), BuyQR "your QR code never changes" (contradicts Regenerate), "You control what information is shared" (no per-field control exists), SOS "Admins are alerted" (no alerting mechanism exists), offline page "will automatically reconnect" (not implemented).
- **Inert CTAs:** Services "Request Quote", "Contact Sales", "Schedule Campus Demo", "Download Partnership Brochure", "Contact Bulk Sales Team"; footer social links `href="#"`; footer "Join Now" is a `<button>` wrapping a `<Link>` (nested interactive).
- **Learn:** YouTube embeds blocked by CSP `frame-src 'none'` (tiles render blank); download buttons simulate success.
- **Web Vitals:** only CLS recorded (P1 because monitoring must not be removed).
- **Per-route `<title>`** and correct heading hierarchy (`h1` per page; CardTitle renders `h3`).
- **AI assistant:** fixed `h-[600px]` card (poor on mobile); AI markdown shown as raw text; error shown as an assistant message; "Trigger Emergency SOS" only navigates but shows a fake "Triggering…" spinner; `DashboardLayout` rendered without user → header shows "User".
- **Forms:** no `autocomplete` attributes; errors not linked via `aria-describedby`/`aria-invalid`; contact fields in profile lack labels bound to inputs; icon-only trash buttons lack accessible names; comma-separated medical inputs (error-prone).
- **Admin:** org delete has no confirmation and no audit log; incident updates not audit-logged (only `AdminUsersTab` calls `logAdminAction`); QR Products tab shows full access tokens with a copy button (equivalent to medical-record access) — mask them.
- **Two toast systems** → consolidate on `sonner`.
- **Performance:** remove `manualChunks` vendor grouping that forces recharts/Radix into every page; exclude admin/chart chunks from SW precache.
- **Types:** stale `types.ts`; `npx tsc --noEmit` checks nothing → add a real `typecheck` script.

### P2 — Visual polish, motion, imagery, enhanced interactions
Design tokens & type scale; landing hero product composition; storytelling sections; FAQ; responder demo route with synthetic data; QR ID card presentation; skeletons per page; chart styling; restrained motion system; dark-mode completion; PNG app icons + Open Graph image (referenced `og-image.png` does not exist).

### P3 — Optional / experimental
Command palette navigation (`cmdk` already installed); CSS scroll-driven reveal effects as progressive enhancement; optional photography slots (user-supplied, licensed); Swahili localisation; Motion library only if a specific interaction proves it necessary.

---

## 6. Recommended visual direction

**"Calm clinical confidence."** Light-first, quiet off-white surfaces, deep medical blue as the action colour, teal for "ready/healthy" states, and **emergency red reserved exclusively** for SOS, critical allergies, and destructive confirmation. Depth comes from layered surfaces and fine borders, not glows. Motion is brief and functional. African, human-centred identity is expressed through *content and context* (Kenyan emergency numbers, counties, Swahili "Uhai" = life, real local workflows), not stereotyped imagery or ornament.

**Proposed core tokens (contrast-validated with a script during this audit):**

| Token | Light | Dark | Check |
|---|---|---|---|
| background | `#F7F9FC` | `#0B1220` | fg on bg 15.9:1 (dark) |
| surface/card | `#FFFFFF` | `#121B2D` | — |
| primary (action) | `#1D5FD6` | `#6EA2FF` (button text `#0B1220`) | 5.74 / 7.38 |
| emergency | `#C8241F` | button `#D42D26`, text `#FF7A72` | 5.63 / 5.00 / 6.78 |
| teal (ready) | `#0E7469` | `#3CC8B4` | 5.64 / 8.29 |
| success | `#15803D` | (tuned in Phase A) | 5.02 |
| warning text / bg | `#8A5300` on `#FFF7E6` | (tuned) | 5.94 |
| muted text | `#566174` | `#9AA6BA` | 5.93 / 7.00 |
| input border | `#7D889A` | `#64748B` | 3.58 / 3.62 (non-text) |
| focus ring | `#1D5FD6` | `#6EA2FF` | 5.74 / 7.38 |

Also: semantic status tokens (`emergency`, `warning`, `success`, `info`, each with `-foreground` and `-subtle`), elevation scale (0–4), motion tokens (`--duration-fast 120ms`, `--duration-base 200ms`, `--duration-slow 320ms`, `--ease-standard`, `--ease-emphasized`), z-index layers (`base, sticky, banner, overlay, modal, toast, skip-link`), container widths, and a fluid type scale. All existing token *names* are kept so shadcn components continue to work; values change.

**Typography (recommendation):** self-host **Plus Jakarta Sans** (headings, 600–800) + **Inter** (UI, body, medical data, tabular numerals). Both SIL OFL 1.1. Variable woff2, Latin subset, `font-display: swap`, metric-matched fallbacks to limit CLS, precached by the SW so they work offline. Alternative if you are attached to Poppins: Poppins headings + Inter body.

---

## 7. Page-by-page plan (what changes, what is preserved)

| Area | Key changes | Preserved |
|---|---|---|
| **Global shell** | New header (sticky, translucent, active-route indicator), Radix `Sheet` mobile menu (focus trap, Escape, `aria-expanded`), footer with `tel:` emergency numbers and real links only, offline banner placed below header (non-overlapping, `role="status"`), per-route titles, on-brand loaders, error boundary restyle, single toast system | All routes and aliases; theme toggle; skip link |
| **Landing** | Product-led hero (headline + concise value prop + two real CTAs: **Create my medical ID** → `/auth`, **See how it works** → in-page section) with a layered composition: phone frame showing a *synthetic* responder view + medical ID card (clearly labelled "Example — fictional data"); factual trust strip; 6-step story (profile → QR → carry → responder view → contacts/SOS → learn); feature sections only for implemented features; privacy & security; honest offline section; FAQ (accordion); final CTA | Tagline "Empowering You to Act When Every Second Counts" (kept as brand line); all existing routes |
| **Responder demo** (new, optional) | `/demo/responder` renders the real responder component with synthetic data, bannered as a demo; powers "See what responders see" | No DB access |
| **Auth** | Split layout on desktop (form + calm product panel), compact on mobile; password visibility toggles; `autocomplete`; inline accessible errors; humanised Supabase errors; set-new-password view; consent explanation; consent gating for Google | Supabase flows, password policy, consent versioning, OAuth config |
| **Onboarding** | Tokenised styling; real step labels; DOB optional; chip input for allergies/meds/conditions; "verification email" step shown only for email sign-ups; consent step for users lacking consent records | 6-step flow and data written |
| **Dashboard** | Readiness checklist from real data (blood type, ≥1 contact, active QR, phone) — no fabricated percentages; prominent SOS and QR actions; emergency directory with `tel:` links; empty/loading/error states | Existing queries (moved to React Query where touched) |
| **Medical profile** | Sectioned editor (identity, medical, contacts), chip inputs, per-section save feedback, priority ordering for contacts, labelled fields | Schema fields only; RLS model |
| **QR medical ID** | Digital ID card presentation; QR ≥ 256 px with quiet zone, level H, pure black-on-white regardless of theme; high-res PNG download; print stylesheet (card only); copy-link with failure handling; status (active since / last regenerated); confirm-before-regenerate; owner vs responder visibility explained | Token model; public URL format `/profile/:token` |
| **Responder page** | Minimal chrome (logo + "Call 999"), `h1`, order: critical alerts → allergies → blood type (self-reported) → medications → conditions → emergency contacts (tap-to-call) → primary hospital (already returned, currently hidden) → last-updated; no animations; print-friendly; specific error states | RPC, scan logging, rate limiting |
| **SOS** | Large accessible SOS control (no pulsing); one confirm step (existing safeguard) with live location status; verified state machine; per-contact SMS outcome from `notifications`; direct-call fallbacks; offline state; `aria-live` announcements; status by text + icon, never colour alone | Existing workflow and safeguards; no automatic triggering |
| **AI assistant** | Full-height chat on mobile; safe structured rendering of AI output (headings/lists/bold → React elements, no raw HTML); visual sections for Immediate Actions / While Waiting / When to Call; suggested prompts; retry; connection-aware input; `aria-live`; persistent "Call 999" and "Open SOS" (no AI interaction needed); honest "Generating response…" indicator | Edge Function proxy, server-side key, DB chat history (no new browser storage) |
| **Learning** | Course/topic cards, filters, click-to-load video facade (`youtube-nocookie`), real downloads or honest "coming soon", progress from `user_learning_progress` only | Existing content tables |
| **Admin** | Shared admin page header, consistent DataTable pattern (search, filters, pagination, empty/loading/error), status badges with icon+text, AlertDialog confirmations for destructive actions, audit logging for org delete + incident updates, masked tokens, honest Payments state, accessible charts (dataviz skill) | `requireAdmin` + `has_role()` RPC; RLS; existing audit log |
| **Buy QR / Services / About** | Restructured; only confirmed prices/features; unbuilt features labelled "Planned"; inert CTAs become real `mailto:`/contact links or are removed | Routes |

---

## 8. Dependencies

**Proposed additions (each needs your approval):**

| Package | Type | Purpose | Why not existing tools |
|---|---|---|---|
| `@fontsource-variable/plus-jakarta-sans` | runtime (CSS/woff2 only) | Self-hosted heading font | Removes Google Fonts third-party request (privacy under DPA, offline availability, CSP simplification) |
| `@fontsource-variable/inter` | runtime (CSS/woff2 only) | Self-hosted UI/data font with tabular numerals | Same |
| `@playwright/test` | dev | Rendered verification: routes × viewports × themes × reduced-motion; network-mocked authenticated states (no production access needed) | No test infrastructure exists |
| `@axe-core/playwright` | dev | Automated WCAG checks in the same runs | — |
| `vitest` *(optional)* | dev | Unit tests for pure helpers (token generator, SOS status mapping, AI output formatter, readiness rules) | — |

**Evaluated and not recommended:**

| Candidate | Decision | Reason |
|---|---|---|
| GSAP (+ScrollTrigger) | **Do not install** | No complex timelines needed; adds ~25–45 KB gz; scroll-pinning conflicts with "do not hijack scrolling" |
| Lenis | **Do not install** | Smooth-scroll hijacking harms keyboard/AT users and low-end Android |
| Motion (`motion`) | **Defer (P3)** | CSS transitions + fixed `tailwindcss-animate` + `IntersectionObserver` cover every planned effect; revisit only if a specific interaction requires it |
| New carousel | **Do not install** | `embla-carousel-react` already present |
| `react-markdown` | **Do not install (initially)** | A small safe formatter (headings, lists, bold → React elements) fits the structured AI responses; revisit if outputs prove too varied |
| New icon set | **Do not install** | Lucide is sufficient and consistent |

**Configuration fixes (no new packages):** load `tailwindcss-animate` correctly; replace forced `manualChunks` vendor groups; exclude admin/chart chunks from precache; fix `onFID` → INP; add `"typecheck": "tsc --noEmit -p tsconfig.app.json"` script.

---

## 9. Image and icon strategy

- **Existing assets:** only SVG icons, favicon, and `placeholder.svg`. No photographs. The `og-image.png` referenced in `index.html` **does not exist**.
- **Primary visual language: product UI rendered in code** — phone frame, medical ID card, responder preview, status chips — built from real components with synthetic data. This explains the product, is theme-aware, crisp at any DPI, near-zero bytes, and carries no licensing risk.
- **Photography (optional, P3):** only if you supply licensed images (with model releases appropriate for health contexts, reflecting Kenyan/African communities without stereotypes). I will build the `<picture>` slots with AVIF/WebP, explicit dimensions, `loading="lazy"` below the fold, and `fetchpriority="high"` for any LCP image. I will not download or generate images and present them as licensed.
- **App icons:** generate PNG 192/512 + maskable + `apple-touch-icon` (iOS ignores SVG) from the existing SVG via the existing `scripts/generate-icons.cjs` approach; create a 1200×630 Open Graph image from the brand mark.
- **Icons:** Lucide only; consistent stroke and sizes (16/20/24); every icon-only control gets an accessible name and ≥ 44 px touch target on mobile; icons never replace text labels for medical or emergency meaning.

---

## 10. Animation strategy

**Principles:** purpose-only motion; transform/opacity only; 120–320 ms; no infinite decorative loops; **zero motion on the responder page and around the SOS control** (state changes use instant colour/text change plus a single non-looping emphasis at most); everything disabled or reduced under `prefers-reduced-motion`; content fully visible without JS animation (reveal classes are additive, never start content at `opacity:0` without a no-JS/no-IO fallback).

| Effect | Where | Mechanism |
|---|---|---|
| Section reveal + stagger | Landing, Services, About | `IntersectionObserver` hook + CSS classes |
| Hero layered entrance, subtle depth | Landing hero only | CSS transitions; pointer-based tilt disabled on touch and reduced motion |
| Dialog/menu/sheet/toast enter-exit | Global | `tailwindcss-animate` (once loaded) + sonner |
| Button hover/press feedback | Global | CSS (`active:scale-[0.98]`, colour) |
| Nav active indicator | Header, sidebar | CSS transition on indicator element |
| Number transitions | Admin stat cards only (real data) | `requestAnimationFrame` counter; skipped under reduced motion |
| Skeletons | All data pages | Existing `Skeleton`, shape-matched |
| Chart transitions | Admin | Recharts built-in, disabled under reduced motion |
| Scroll-driven parallax | Landing hero art (P3) | CSS `animation-timeline` progressive enhancement only |

Remove: infinite `heartbeat`, decorative `animate-pulse` particles, hover `rotate`/`scale` on non-interactive cards (they imply clickability).

---

## 11. Accessibility plan (target WCAG 2.2 AA)

- Token contrast fixes (Section 6); non-text contrast for inputs, focus rings, chart elements.
- One `h1` per page; logical heading order; unique per-route titles; landmarks (`header`, `nav` with labels, `main`, `footer`) in both layouts; skip link in dashboard layout.
- Keyboard: Radix-based mobile nav and sidebar drawer (focus trap, Escape, focus return); off-canvas sidebar `inert` when closed; visible `focus-visible` rings everywhere.
- Forms: bound labels, `aria-invalid`, `aria-describedby` for errors and hints, `autocomplete`, required indicators announced, error summary on submit.
- Status messages: `role="status"`/`aria-live` for SOS states, save results, AI responses, offline/online; emergency status always text + icon, never colour alone.
- Touch targets ≥ 24 px (WCAG 2.5.8), ≥ 44 px for primary mobile actions and SOS.
- Charts: accessible names, summaries, and a data-table alternative.
- Reduced motion honoured globally.
- Verification: axe (Playwright), keyboard walkthroughs, screen-reader spot checks (NVDA on Windows) for SOS, responder page, auth, and AI chat.

---

## 12. Mobile & responsive plan

- Test matrix: 320, 360, 390, 430 (phones), 768 (tablet), 1024, 1366, 1920 (desktop/wide).
- Dashboard on mobile: bottom navigation (Home · My QR · **SOS** · Learn · More) with safe-area insets; sidebar remains for ≥ 1024 px.
- Admin tables become stacked cards below 768 px; filters collapse into a sheet.
- AI chat uses dynamic viewport height (`100dvh`) and keeps the composer above the on-screen keyboard.
- QR card scales to the viewport while keeping ≥ 256 px code size and quiet zone.
- Low-end Android focus: fewer blur filters (backdrop-blur only on the sticky header), no large background images, reduced JS on public routes.

---

## 13. Security-sensitive components — handled conservatively

These are changed only where listed, reviewed with the `security-review` skill afterwards, and never "simplified" by removing safeguards:

`ProtectedRoute.tsx`, `use-auth.ts`, `Auth.tsx` (sign-up, consent, OAuth, reset), `Onboarding.tsx` (contacts), `PublicProfileView.tsx` + `check_and_log_qr_scan`, `UserQRPage.tsx` (token generation), `UserEmergency.tsx` + `send-emergency-sms`, `UserAIAssistant.tsx` + `ai-chat-proxy`, admin tabs (suspension, audit logging), `vite.config.ts` (Workbox), `index.html` (CSP), `integrations/supabase/client.ts`, all migrations.

Rules: no secrets in source; no logging of passwords/tokens/medical form contents; no new browser storage of medical or chat data; QR tokens never placed in analytics, titles, or metadata; frontend role checks remain UX only (server-side RLS/RPC is the control).

**CSP changes I will propose (need approval):** allow `frame-src https://www.youtube-nocookie.com` and `img-src https://i.ytimg.com` for click-to-load videos; remove Google Fonts origins once fonts are self-hosted; evaluate removing `'unsafe-eval'` (not needed by Vite production builds — will verify).

### Decisions needed from you before implementation

1. **Backend access for verification.** The Supabase project in `.env` does not resolve (nor does the one in docs). Is the project paused/deleted, or is there a staging project? Without one, I will verify authenticated screens with Playwright **network mocking** (no production contact) and clearly mark live-backend checks as outstanding.
2. **Backend changes (P0-01, P0-02, P0-07, optional public stats RPC, optional contact-messages table).** Approve me writing migration/Edge Function changes in the repo (you review and deploy), or keep them out of scope and I will document them only.
3. **AI medical context (P0-23).** Stop sending name; make medical context opt-in (recommended) — or keep current behaviour and update the DPIA.
4. **Content truth.** Confirm real prices, products, and which Services/About features and statistics are factual. Default if unconfirmed: remove invented statistics, mark unbuilt features "Planned", hide conflicting prices, convert inert CTAs to `mailto:support@uhailink.com`.
5. **Contact form.** `mailto:` fallback (default) vs a new Supabase table + admin view (BE).
6. **Social links.** Provide real handles or the icons will be removed.
7. **Fonts.** Plus Jakarta Sans + Inter (recommended) or keep Poppins for headings.
8. **Dependencies.** Approve the additions in Section 8.
9. **Dead code.** Delete orphaned `src/pages/public/AIAssistant.tsx` (unrouted, has a compile error).
10. **Routing refactor.** Approve nested layout routes for protected areas (removes the full-screen loader flash between dashboard pages; all URLs and aliases unchanged).

---

## 14. Performance considerations & budgets

| Metric | Baseline | Budget |
|---|---|---|
| Initial JS on `/` (gzip) | ~274 KB | **≤ 150 KB** (stretch ≤ 120) |
| Initial JS on `/profile/:token` (gzip) | ~274 KB | **≤ 120 KB**, no recharts, no admin code |
| Recharts on non-admin routes | preloaded everywhere | **0 bytes** |
| SW precache | 1,475 KiB | **≤ 900 KiB** (admin/chart chunks runtime-cached instead) |
| Web fonts | Google Fonts, 5 Poppins weights | ≤ 2 self-hosted variable woff2 (Latin) |
| CLS | not measured (CLS only metric reported) | < 0.1 on all public routes |
| LCP (mid-range mobile, 4G throttled) | not measured | < 2.5 s on `/` and `/profile/:token` |

Measured with: build output sizes, CDP/Playwright traces with CPU 4× and network throttling, and fixed Web Vitals reporting. No claims without numbers.

---

## 15. Testing strategy

1. **Static:** `npx tsc --noEmit -p tsconfig.app.json`, `npm run lint`, `npm run build` after every phase. Pre-existing errors are tracked separately; new code must add none.
2. **Rendered (Playwright, if approved):** every public route × 8 viewports × light/dark × reduced-motion; overflow, heading, title, target-size, and axe assertions; screenshots archived per phase.
3. **Authenticated states without production:** Playwright intercepts Supabase requests to render dashboard, QR, SOS, AI, and admin in loading / empty / success / error / offline / unauthorised states with fixtures (synthetic data only).
4. **QR scannability:** decode the rendered QR (screenshot) at on-screen and print sizes; verify quiet zone and contrast in both themes.
5. **Unit (optional vitest):** token generator entropy/format, SOS status mapping, AI formatter (including hostile input — no HTML injection), readiness rules.
6. **Manual:** keyboard-only and NVDA passes on SOS, responder page, auth, AI chat; real-device check on an Android phone if available.
7. **Security review** skill run after Phase 0 and after phases touching sensitive components.

---

## 16. Implementation phases

| Phase | Content | Priority mix |
|---|---|---|
| **0** | P0 frontend fixes: QR token generation + regenerate, remove duplicate QR logic from profile, SOS honest states + fallbacks + nav entry, profile save correctness, password-reset view, consent gating, responder empty/error states, SW caching rules + cache purge, robots/noindex, contact form/payments/fake downloads made honest, className bug, Web Vitals fix | P0 |
| **0b** | *(only if approved)* Backend: RPC returns `emergency_contacts`; IP-based rate limiting with hashing; SMS function honest status + env endpoint + server-side contacts | P0 (BE) |
| **A** | Tokens, fonts, Tailwind config fixes, reduced motion, status tokens, shared primitives (PageHeader, EmptyState, ErrorState, StatusBadge, StatCard, Section), `usePageTitle`, toast consolidation, chunking/precache fixes | P0/P1 |
| **B** | Public header/footer/mobile nav; landing page | P1/P2 |
| **C** | Auth + onboarding | P0/P1 |
| **D** | Dashboard shell (sidebar, bottom nav, layout routes) + dashboard + medical profile | P0/P1 |
| **E** | QR medical ID + responder page (+ optional demo route) | P0/P1 |
| **F** | SOS experience | P0/P1 |
| **G** | AI assistant | P1 |
| **H** | Learning center (public + user) | P1 |
| **I** | Admin (dataviz skill loaded first) | P1 |
| **J** | Responsive + accessibility sweep | P1 |
| **K** | Motion polish, images/icons/OG, performance tuning | P2 |
| **L** | Tests, regression pass, `UI_UX_TRANSFORMATION_PROGRESS.md` (kept throughout), `UI_UX_TRANSFORMATION_REPORT.md`, README/doc corrections | — |

Each phase: state intent → list files → implement → typecheck/lint/build → rendered review (screenshots looked at, not just generated) → fix regressions → log in the progress file. Work is committed per phase only if you ask me to commit.

---

## 17. Acceptance criteria

1. Responder page shows contacts from `emergency_contacts` (after 0b), tap-to-call works, and empty fields read "not recorded", never "none".
2. Regenerate replaces the token atomically; old token returns "deactivated"; user always has exactly one active token.
3. New tokens contain ≥ 128 bits of randomness and no user identifier.
4. SOS never displays "sent"/"notified" unless the backend reported at least one accepted SMS; failure and no-contact states offer direct-call actions; offline state is explicit.
5. SOS is reachable in one tap from every authenticated screen on mobile and desktop.
6. No authenticated `/rest/v1` response is stored in Cache Storage (verified in DevTools/Playwright); caches purge on sign-out.
7. All text/UI token pairs meet WCAG AA (4.5:1 text, 3:1 non-text) in light and dark — verified by script and axe.
8. Every route has a unique title and exactly one `h1`; no axe "serious/critical" violations on audited routes.
9. No horizontal overflow at 320–1920 px on all audited routes.
10. `prefers-reduced-motion: reduce` removes all non-essential motion.
11. Initial JS budgets in Section 14 met; recharts absent from non-admin routes.
12. No fake success messages, mock data, inert primary CTAs, or unverifiable statistics remain.
13. QR decodes reliably from on-screen and printed output in both themes.
14. Auth, consent (including OAuth), password reset, admin authorisation, audit logging, AI proxy, and PWA install continue to work (live checks pending backend availability are listed explicitly).
15. Typecheck (real config), lint, and build: no new errors; pre-existing ones fixed or documented.
16. Documentation reflects the actual implementation.

---

## 18. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Backend unreachable | Cannot live-verify authenticated flows | Network-mocked Playwright states; explicit "pending live verification" list |
| Stale Supabase types | Type errors / wrong assumptions | Regenerate types once a reachable project is confirmed; local narrow types meanwhile |
| SW cache change on already-installed clients | Old caches linger | Versioned cache names + cleanup on activate + purge on sign-out |
| CSP changes | Could block resources or widen attack surface | Minimal origin additions; verified in build preview |
| Routing refactor | Could break deep links/aliases | Keep every path; add route tests |
| Scope size | Multiple sessions | Progress log with next concrete task; phases independently shippable |
| `strict: false` TypeScript | Weak guarantees | New/changed files written strict-clean; no global flip without approval |

---

## 19. Files reviewed during Phase One

Docs: `README.md`, `docs/UHAILINK_SYSTEM_AUDIT.md` (§5–7), `docs/PENDING_DEPLOYMENT_TASKS.md`, `docs/AUDIT_FINDINGS_STATUS.md`, `docs/DPIA.md` (§2–4), `docs/INCIDENT_RESPONSE_PLAN.md` (playbooks), `docs/RUNBOOK.md` (§1, §5, App. C).
Config: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`, `public/robots.txt`, `.gitignore`, `.env` (variable names only).
Source: `App.tsx`, `main.tsx`, `index.css`, `Header`, `Footer`, `Layout`, `DashboardLayout`, `ProtectedRoute`, `OfflineBanner`, `ErrorBoundary`, `use-auth`, `web-vitals`, all `pages/public/*` (full or targeted), all `pages/user/*`, `pages/admin/*` and `components/admin/*` (targeted).
Backend: `supabase/migrations/*` (schema, RLS for profiles/QR/notifications, QR RPC), `supabase/functions/send-emergency-sms`, `supabase/functions/ai-chat-proxy`.
