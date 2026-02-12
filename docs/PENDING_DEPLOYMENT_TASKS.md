# PENDING DEPLOYMENT TASKS

> **Created**: 2026-02-12  
> **Status**: Pending — complete these before or during production deployment

---

## 1. Database Migrations (Run in Order)

Run these migrations against your Supabase project **in order**. You can apply them via the Supabase Dashboard SQL Editor or the Supabase CLI.

### Migration 1: Phase 1 — Security & Legal Fixes
- **File**: `supabase/migrations/20260212000001_phase1_security_legal_fixes.sql`
- **What it does**:
  - Creates `user_consents` table for consent capture
  - Removes hardcoded admin email from `handle_new_user()` trigger
  - Updates password policy constraints

### Migration 2: Phase 2 — Schema & Data Integrity
- **File**: `supabase/migrations/20260212000002_phase2_schema_data_integrity.sql`
- **What it does**:
  - Fixes `severity` column type (TEXT → INTEGER) on `emergency_incidents`
  - Drops redundant `idx_profiles_user_id` index
  - Creates 4 compliance tables: `data_access_logs`, `legal_document_versions`, `account_deletion_requests`, `security_events`
  - Adds `admin_action_type` enum

### Migration 3: Phase 3 — QR Rate Limiting Function
- **File**: `supabase/migrations/20251119_phase3_qr_rate_limit_function.sql`
- **What it does**:
  - Creates `check_and_log_qr_scan(_access_token, _ip_address, _user_agent)` database function
  - Handles token validation, rate limiting (5/min per IP), scan logging, and profile fetch atomically
  - Grants execution to `anon` and `authenticated` roles

---

## 2. Supabase Edge Function Secrets

### Set OpenRouter API Key
The AI Assistant now calls OpenRouter via a Supabase Edge Function instead of client-side.

```bash
supabase secrets set OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Remove Client-Side Key
After setting the secret above, remove `VITE_OPENROUTER_API_KEY` from your `.env` file (it is no longer used and should not be exposed client-side).

---

## 3. Git Push

The local `main` branch is ahead of `origin/main` by multiple commits (Phases 0–3). Push when ready:

```bash
git push origin main
```

---

## 4. npm Install

`lovable-tagger` was removed from `devDependencies` in Phase 3. Run `npm install` to update `package-lock.json`:

```bash
npm install
```

---

## 5. Configure Google OAuth (Phase 4)

The app now has "Continue with Google" buttons on the Auth page. To enable them:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → Credentials → Create OAuth 2.0 Client ID
2. Set the **Authorized redirect URI** to: `https://jlgzlwyuaopnjhdnnjyr.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client Secret**
4. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Paste Client ID and Client Secret
   - Save

The frontend code calls `supabase.auth.signInWithOAuth({ provider: 'google' })` and will work automatically once the provider is configured.

---

## 6. Post-Deployment Verification Checklist

- [ ] All 3 migrations applied successfully
- [ ] `check_and_log_qr_scan` function exists in Supabase
- [ ] `user_consents` table exists and has RLS enabled
- [ ] `OPENROUTER_API_KEY` secret is set in Edge Functions
- [ ] `VITE_OPENROUTER_API_KEY` is removed from `.env`
- [ ] AI Assistant works end-to-end (calls Edge Function, not client-side)
- [ ] Google OAuth sign-in works (provider configured in Supabase)
- [ ] Dark mode toggle works in Header and UserSettings
- [ ] QR scan rate limiting works (test 6+ scans in 1 minute)
- [ ] Forgot password flow sends reset email
- [ ] Account deletion request submits and saves to database
- [ ] Admin dashboard loads only for admin users
- [ ] Consent checkboxes appear on registration page
- [ ] Privacy Policy and Terms of Service pages are accessible
