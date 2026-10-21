# UI/UX Transformation — Progress Log

> Plan: [UI_UX_TRANSFORMATION_PLAN.md](UI_UX_TRANSFORMATION_PLAN.md) · Approved 2026-10-21 with the plan's recommended defaults for all ten open decisions.
> Committed on the `ui-ux-transformation` branch (not merged into `main`); nothing has been deployed. Database and Edge Function changes are written for review and must be deployed by the owner.
> Final report: [UI_UX_TRANSFORMATION_REPORT.md](UI_UX_TRANSFORMATION_REPORT.md).

## Status overview

| Phase | Status |
|---|---|
| 0 — P0 frontend fixes | **Done** (verified with unit + rendered tests) |
| 0b — Backend fixes (written, not deployed) | **Done — awaiting your review/deploy** |
| A — Design tokens & foundations | **Done** |
| B — Header, footer, landing, public pages | **Done** |
| C — Auth & onboarding | **Done** |
| D — Dashboard shell, dashboard, profile, settings, layout routes | **Done** |
| E — QR ID, responder page, responder demo | **Done** |
| F — SOS | **Done** |
| G — AI assistant | **Done** |
| H — Learning centre (public + signed-in) | **Done** |
| I — Admin | **Done** (see below) |
| J — Responsive & a11y sweep | **Done** (axe on 18 routes × 2 themes × 2 viewports; 8-width overflow sweep) |
| K — Motion, images, performance | **Done** — PNG/OG brand assets generated; bundle, precache and LCP targets only partly met (report §G) |
| L — Tests & docs | **Done** — final report written |

## Phases A–I (summary)

- **A — Foundations:** new contrast-validated token set (light + dark), shadcn-correct `secondary`/`accent` (accent was emergency red → red hovers everywhere), `teal`/`warning` tokens, elevation, motion and z-index tokens; self-hosted Plus Jakarta Sans + Inter (Google Fonts removed from HTML and CSP); `tailwindcss-animate` and `@tailwindcss/typography` actually loaded; global reduced-motion rules; scroll-reveal utility that never hides content without JS; theme-color no longer emergency red. Forced vendor chunks removed; Radix toast + global TooltipProvider removed from the app shell (single toast system: sonner, with a compatibility adapter for `useToast`). Protected routes became nested layout routes (guard runs once per area; consent check for pre-consent accounts, fail-open if unavailable).
- **B — Public:** new header (active indicator, Radix sheet mobile menu, "Emergency? Call 999"), footer (no fake socials, tap-to-call lines, no "trusted by thousands"), product-led landing (coded hero composition with fictional data and a QR that opens the demo, six-step story, responder spotlight, features, privacy facts, FAQ, CTA). Services, About rebuilt with only verifiable claims ("Planned" section; invented stats and conflicting prices removed). Legal pages get a real `h1`; 404 and offline pages rebuilt (offline page now really reloads on reconnect).
- **D — Signed-in:** dashboard with real readiness checklist (blood type, contacts, active QR, phone), prominent SOS/Medical ID actions, tap-to-call directory; settings rebuilt (accessible password fields, honest "request deletion" wording).
- **E —** `/demo/responder` renders the real responder component with a fictional person.
- **H — Signed-in learning:** fake 25%-per-click progress replaced with honest self-reported "Mark as complete" (upsert now uses `onConflict: user_id,tutorial_id` — previously repeat saves failed while the UI claimed success); real downloads; webinar links.
- **I — Admin:** analytics redesigned per the `dataviz` skill (single-series bar with table view, status tiles instead of a pie, duplicate summary removed, honest chart title — profiles have no created_at); Content tab no longer shows non-existent view/attendee/download counts; Organisations: working add/edit dialog, confirmed delete, audit logging; QR tab: tokens masked, copy removed, confirmed + audit-logged deactivation (supports incident playbook A), conflicting prices removed; Emergency logs + Emergency operations: **the profile embed `profiles!…user_id_fkey` / `profiles:user_id` has no FK to profiles and fails at runtime** — replaced with a second query; incident updates audit-logged; "Resolved today" now actually today; dialog closes after save. **All 6 admin type errors fixed — `npm run typecheck` now reports 0 errors.**

---

## Phase 0 — P0 safety & correctness (done)

| Plan item | Change | Files |
|---|---|---|
| P0-03/04/05/14 | Cryptographically random 128-bit QR tokens; atomic in-place regenerate (no unique-constraint failure, never leaves a user without a code); confirmation dialog; high-res PNG download that reports success only after the file exists; clipboard failure handling; print shows only the ID card. Duplicate QR logic removed from the profile page. | `lib/qr-token.ts`, `hooks/use-qr-token.ts`, `pages/user/UserQRPage.tsx`, `pages/user/UserProfilePage.tsx`, `index.css` (print rules) |
| P0-06/09/10 | SOS state machine reports only backend-confirmed outcomes (recorded / sending / sent N of M / partial / failed / no contacts), location status (found / locating / denied / unavailable / added later), direct-call strip (999/112/1199) always visible, explicit offline state, "text contacts again" retry, honest "what SOS does" copy (it does **not** call emergency services). Broken className fixed. | `hooks/use-sos-alert.ts`, `pages/user/UserEmergency.tsx` |
| P0-08 | SOS + My Medical ID + admin links in the dashboard sidebar; mobile bottom bar with a central SOS button on every signed-in screen; Radix sheet for the mobile menu (focus trap, Escape); fake search box and permanent "unread" bell removed; skip link. | `components/DashboardLayout.tsx`, `components/BrandLogo.tsx` |
| P0-11 | Service worker caches only public content tables and public Storage objects; all other Supabase traffic is NetworkOnly; patterns no longer hard-code a project ref. Old sensitive caches purged at startup and on every sign-out (with React Query cache clear). | `vite.config.ts`, `lib/sensitive-cache.ts`, `components/RouteMeta.tsx`, `main.tsx` |
| P0-12/13 + new | Profile save: empty optional fields → `NULL` (empty DOB used to break every save); every contact write checked and partial failures reported; **comma-separated medical fields could not hold more than one item** (comma was stripped on each keystroke) — fixed. | `lib/medical-lists.ts`, `hooks/use-emergency-contacts.ts`, `pages/user/UserProfilePage.tsx` |
| P0-15 | Password reset completes: dedicated "choose a new password" view, expired-link state, app-wide `PASSWORD_RECOVERY` handling. | `pages/public/Auth.tsx`, `components/RouteMeta.tsx` |
| P0-16 | Consent: stored pending before sign-up and recorded once a session exists; Google **sign-up** requires both consents; onboarding adds a consent step whenever no consent is on record (covers Google sign-in of new accounts); insert errors are checked. | `lib/consent.ts`, `pages/public/Auth.tsx`, `pages/public/Onboarding.tsx` |
| P0-17/18 | Responder page: minimal chrome with "Call 999", `h1`, clinical priority order, "not recorded" wording, self-reported blood-type note, provenance/date notice, tap-to-call contacts, primary hospital (was returned but hidden), specific error states with emergency numbers and retry. | `components/responder/*`, `pages/public/PublicProfileView.tsx` |
| P0-19 | `robots.txt` rewritten as a single group disallowing `/profile/`, `/dashboard`, `/admin`, `/onboarding` (named-bot groups previously overrode `*`); `noindex` meta on those routes; unique per-route `<title>`. | `public/robots.txt`, `components/RouteMeta.tsx` |
| P0-21 | Contact form no longer fakes "Message sent!" — it opens the user's email app and says so; placeholder phone number removed; emergency numbers are tap-to-call. | `pages/public/Contact.tsx` |
| P0-22 | Admin Payments: mock transactions and invented "+12% growth" replaced with an honest "not connected" state. | `components/admin/AdminPaymentsTab.tsx` |
| P0-23 | AI assistant never sends the user's name; medical context only with an explicit, default-off "Use my medical profile" switch. Rebuilt chat: structured safe rendering, retry, offline state, suggestions, call/SOS always visible. | `pages/user/UserAIAssistant.tsx`, `lib/answer-blocks.ts`, `components/assistant/AnswerContent.tsx` |
| Learn (fake/broken) | **All four hard-coded YouTube IDs return 404** (checked via YouTube oEmbed). Learn now reads the real `tutorials`, `articles`, `webinars`, `downloadable_materials` tables; click-to-load privacy-enhanced video; article reader; webinar registration links; real downloads; honest empty states. CSP allows only `youtube-nocookie.com` frames and `i.ytimg.com` thumbnails. | `pages/public/Learn.tsx`, `components/learn/VideoEmbed.tsx`, `index.html` |
| Web Vitals | `onFID` (removed in web-vitals v5) threw and stopped LCP/FCP/TTFB/INP registering — removed. | `lib/web-vitals.ts` |
| Types | Added `check_and_log_qr_scan` to generated Supabase types (fixes 2 errors). | `integrations/supabase/types.ts` |
| Dead code | Deleted orphaned `pages/public/AIAssistant.tsx` (unrouted; compile error). | — |

New shared building blocks: `FormField`, `PasswordInput`, `common/EmptyState`, `common/SectionHeading`, `lib/emergency-numbers.ts`, `lib/auth-errors.ts`, `warning` colour token.

## Phase 0b — Backend (written, **not deployed**)

| File | What it fixes |
|---|---|
| `supabase/migrations/20261021000001_qr_scan_contacts_and_ip_rate_limit.sql` | Responders see `emergency_contacts`; rate limiting keyed on the real client IP from gateway headers (salted SHA-256, raw IP never stored); **limits changed** to 10/min per IP *per QR code* + 60/min per IP (old 5/min per IP could block a hospital network scanning several patients — please confirm); internal user id no longer returned; pinned `search_path`. Signature unchanged. |
| `supabase/functions/send-emergency-sms/index.ts` | Recipients loaded server-side (endpoint can no longer text arbitrary numbers); incident ownership checked; sandbox endpoint only when username is `sandbox`; optional `AFRICAS_TALKING_SENDER_ID`; Kenyan numbers normalised to E.164; per-recipient status logged; Twilio fallback only for numbers not accepted (no double texts); non-2xx when nothing sent; GSM-7 text with a maps link (no emoji). |

**Deploy notes:** run the migration; optionally `ALTER DATABASE postgres SET app.settings.scan_ip_salt = '<secret>'`; redeploy `send-emergency-sms`; set `AFRICAS_TALKING_USERNAME` to the production username (anything other than `sandbox` selects the live endpoint). The Edge Function could not be type-checked locally (Deno is not installed).

## Checks (end of Phase 0)

| Check | Baseline | Now |
|---|---|---|
| `npm run typecheck` (real app config) | 11 errors | **6** — all pre-existing in admin tabs (Phase I) |
| `npm run lint` | 1 error, 13 warnings | **0 errors**, 11 warnings (pre-existing `ui/` fast-refresh + hook-deps) |
| `npm test` (vitest) | — | **12/12 passed** |
| Playwright (responder, SOS, QR; desktop 1366 + mobile 360; Supabase mocked) | — | **30/30 passed** |
| `npm audit` | 39 (27 high) | 39 (27 high) — new packages added none; all pre-existing |

Screenshots reviewed: responder success/error (mobile + desktop), SOS sent/failed, QR page. Follow-ups found and fixed during review: SOS status card moved above the active-alert card so the outcome is visible without scrolling; contact rows wrap on narrow screens.

## Dependencies installed (approved)

`@fontsource-variable/plus-jakarta-sans@5.3.0`, `@fontsource-variable/inter@5.3.0` (runtime, CSS/woff2 only); `@playwright/test@1.63.0`, `@axe-core/playwright@4.13.0`, `vitest@5.0.3` (dev). Pinned to releases ≥ 2 weeks old. Playwright uses the installed Chrome (`channel: "chrome"`) — no browser download.

## Outstanding / notes

- Live-backend verification impossible: the Supabase project in `.env` does not resolve.
- Supabase **Redirect URLs** must allow `<origin>/auth` (password reset) — the app also recovers if Supabase falls back to the site URL.
- First-aid wording on the Learn page was lightly edited for lay rescuers (hands-only CPR rate) — **needs clinical review** before launch, as does all first-aid copy.
- Users who completed onboarding before consent capture existed and have no consent record are not yet prompted (planned with the layout-route refactor in Phase D).
- AI proxy still accepts a client-supplied system prompt (pre-existing; server-side prompt recommended).

## Final pass (J–L)

Found and fixed while running the final checks:

- Public header overflowed by 4 px at 768 px → header now switches to the menu below 1024 px (`Header.tsx`).
- Responder page CLS 0.125 (footer jumped when the profile loaded) → full-height loading state; CLS 0 (`PublicProfileView.tsx`).
- Landing hero text faded in from `opacity: 0`, delaying LCP → hero text static; LCP 3.91 s → 3.20 s (`Index.tsx`).
- Production builds beaconed Web Vitals to a non-existent `/api/vitals`, including the responder URL's access token and the user agent → opt-in `VITE_VITALS_ENDPOINT`, token redacted, user agent dropped, unit-tested (`lib/web-vitals.ts`).
- 13 tiny chunks merged (`experimentalMinChunkSize`); admin chunks and `og-image.png` removed from the precache (1,603 → 1,112 KiB).
- `scripts/measure-routes.mjs` now measures only signed-out routes (protected routes redirected to `/auth` and silently measured the sign-in page).

## Final checks (on the final code)

| Check | Baseline | Final |
|---|---|---|
| `npm run typecheck` | 11 errors | **0** |
| `npm run lint` | 1 error, 13 warnings | **0 errors**, 7 warnings |
| `npm test` | — | **14/14 passed** |
| `npx playwright test --grep-invert visual` | — | **146 passed, 0 failed**, 12 skipped by design |
| `npm run build` | passes, precache 1,475.55 KiB | passes, precache **1,111.98 KiB** |

## Next concrete task

Owner actions in report §L (deploy the migration and SMS function, restore a reachable Supabase and run the live checks). Engineering next: close the performance gap (report §G, §M.6).
