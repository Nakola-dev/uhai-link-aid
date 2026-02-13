# UhaiLink — Complete Supabase Database Setup Guide

> Step-by-step instructions to create a clean Supabase project and set up the entire UhaiLink database from scratch.

---

## Table of Contents

1. [Create a New Supabase Project](#1-create-a-new-supabase-project)
2. [Get Your Project Credentials](#2-get-your-project-credentials)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Update Project Configuration](#4-update-project-configuration)
5. [Run the Database Schema](#5-run-the-database-schema)
   - [Step 5A — Base Schema (Migration 1)](#step-5a--base-schema-migration-1)
   - [Step 5B — Security & Legal (Migration 2)](#step-5b--security--legal-migration-2)
   - [Step 5C — Data Integrity & Compliance (Migration 3)](#step-5c--data-integrity--compliance-migration-3)
   - [Step 5D — QR Rate Limiting Function (Migration 4)](#step-5d--qr-rate-limiting-function-migration-4)
   - [Step 5E — User Suspension (Migration 5)](#step-5e--user-suspension-migration-5)
6. [Verify Tables Were Created](#6-verify-tables-were-created)
7. [Verify RLS Policies](#7-verify-rls-policies)
8. [Verify Functions & Triggers](#8-verify-functions--triggers)
9. [Configure Authentication](#9-configure-authentication)
10. [Deploy Edge Functions](#10-deploy-edge-functions)
11. [Set Edge Function Secrets](#11-set-edge-function-secrets)
12. [Create the First Admin User](#12-create-the-first-admin-user)
13. [Seed Data (Optional)](#13-seed-data-optional)
14. [Final Verification Checklist](#14-final-verification-checklist)

---

## 1. Create a New Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the fields:
   - **Organization**: Select your organization (or create one)
   - **Project Name**: `uhailink` (or any name you prefer)
   - **Database Password**: Set a strong password — **save this password**, you'll need it for direct database access
   - **Region**: Choose the closest region to Kenya for lowest latency. Recommended: **East Africa** or **Europe (Frankfurt)** if East Africa is not available
   - **Pricing Plan**: Free tier works for development; Pro recommended for production
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to finish provisioning

---

## 2. Get Your Project Credentials

Once the project is ready, go to **Settings → API** in the Supabase dashboard. You need these values:

| Credential | Where to Find | What It's For |
|---|---|---|
| **Project URL** | Settings → API → Project URL | Frontend Supabase client |
| **Anon (public) Key** | Settings → API → Project API keys → `anon` `public` | Frontend Supabase client |
| **Service Role Key** | Settings → API → Project API keys → `service_role` `secret` | Edge Functions (server-side only, NEVER expose to frontend) |
| **Project Ref (ID)** | Settings → General → Reference ID | CLI commands, Edge Function deployment |

> ⚠️ **NEVER** commit the `service_role` key to your repository or expose it in frontend code. It bypasses all RLS.

---

## 3. Configure Environment Variables

Create a `.env` file in the project root (if one doesn't exist):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
```

Replace `YOUR_PROJECT_REF` and the anon key with the values from Step 2.

> The `.env` file should already be listed in `.gitignore`. Verify this before committing.

---

## 4. Update Project Configuration

Update the Supabase project reference in `supabase/config.toml`:

```toml
project_id = "YOUR_PROJECT_REF"
```

Replace `YOUR_PROJECT_REF` with your actual project Reference ID from Step 2 (e.g., `jlgzlwyuaopnjhdnnjyr`).

---

## 5. Run the Database Schema

You will run **5 SQL migrations in order**. Each migration builds on the previous one.

### How to Run SQL in Supabase

1. Go to your Supabase Dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** (the `+` button)
4. Paste the SQL for each migration
5. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
6. Verify it says **"Success. No rows returned"** (this is expected for DDL statements)

> **IMPORTANT**: Run each migration completely before moving to the next one. Do NOT skip any migration or run them out of order.

---

### Step 5A — Base Schema (Migration 1)

**File**: `supabase/migrations/20251118090203_20251118_complete_schema_setup.sql`

This is the largest migration. It creates:

#### Enums (Custom Types)

| Enum | Values | Used By |
|---|---|---|
| `app_role` | `admin`, `user` | `user_roles` table |
| `chat_role` | `user`, `assistant` | Legacy (now unused after Phase 1) |
| `admin_action_type` | `create`, `update`, `delete`, `view`, `export` | `admin_logs` table |

#### Tables Created (18 tables)

| # | Table | Purpose | RLS |
|---|---|---|---|
| 1 | `profiles` | User health info (blood type, allergies, medications, etc.) — linked to `auth.users` via PK | ✅ |
| 2 | `user_roles` | Role assignments (`admin` or `user`) — one per user | ✅ |
| 3 | `emergency_contacts` | User's emergency contacts (name, phone, relationship, priority) | ✅ |
| 4 | `qr_access_tokens` | QR code access tokens — one unique token per user | ✅ |
| 5 | `emergency_organizations` | Directory of emergency services (hospitals, ambulances) | ✅ |
| 6 | `organization_services` | Services offered by each organization | ✅ |
| 7 | `tutorials` | Learning center video tutorials | ✅ |
| 8 | `user_learning_progress` | Tracks user progress on tutorials | ✅ |
| 9 | `articles` | Health education articles | ✅ |
| 10 | `webinars` | Health webinar listings | ✅ |
| 11 | `downloadable_materials` | Downloadable health resources | ✅ |
| 12 | `chat_history` | AI assistant conversation history (JSONB messages) | ✅ |
| 13 | `admin_logs` | Admin action audit trail | ✅ |
| 14 | `analytics` | Platform usage metrics | ✅ |
| 15 | `emergency_incidents` | SOS emergency incidents (location, severity, status) | ✅ |
| 16 | `notifications` | SMS/email notification tracking | ✅ |
| 17 | `qr_scans` | QR code scan audit log | ✅ |

#### Functions Created

| Function | Purpose |
|---|---|
| `handle_updated_at()` | Trigger function — auto-sets `updated_at` on row updates |
| `has_role(user_id, role)` | Check if a user has a specific role |
| `handle_new_user()` | Trigger — auto-creates profile + user role on signup |

#### Triggers Created (15 triggers)

One `BEFORE UPDATE` trigger on each table with an `updated_at` column, plus the `on_auth_user_created` trigger on `auth.users`.

#### Indexes Created (22 indexes)

Performance indexes on all foreign keys, frequently queried columns, and timestamp columns.

#### Seed Data Inserted

- 5 emergency organizations (Kenya Red Cross, Aga Khan Hospital, St. John Ambulance, Nairobi Hospital, Gertrudes Hospital)
- 4 tutorials (Profile, QR Code, Responders, Emergency Contacts)

> **⚠️ NOTE**: This migration file contains a duplicate `CREATE TABLE chat_history` block at the bottom (Phase 2 structure). The `IF NOT EXISTS` will silently skip the duplicate. This is intentional — Migration 2 (Phase 1) will fix the schema to the canonical structure. Just run the file as-is.

---

### Step 5B — Security & Legal (Migration 2)

**File**: `supabase/migrations/20260212000001_phase1_security_legal_fixes.sql`

This migration addresses security and legal compliance:

#### New Table

| Table | Purpose | RLS |
|---|---|---|
| `user_consents` | Consent capture & proof for GDPR/Kenya DPA compliance | ✅ |

#### Schema Fixes

- **Fixes `handle_new_user()`**: Removes the hardcoded admin email. All new users now get the `user` role. Admin must be assigned manually.
- **Fixes `chat_history`**: Drops Phase 1 columns (`message_text`, `role`, `conversation_id`, `model_used`) and adds Phase 2 canonical columns (`session_start`, `messages` JSONB).
- **Adds missing RLS policy**: `Users can update their own chat history`

#### New Indexes

| Index | Column(s) |
|---|---|
| `idx_profiles_onboarding` | `profiles.onboarding_completed` |
| `idx_articles_category` | `articles.category` |
| `idx_articles_featured` | `articles.is_featured` |
| `idx_emergency_orgs_type` | `emergency_organizations.type` |

---

### Step 5C — Data Integrity & Compliance (Migration 3)

**File**: `supabase/migrations/20260212000002_phase2_schema_data_integrity.sql`

#### Schema Fix

- Converts `emergency_incidents.severity` from `TEXT` to `INTEGER` (maps `critical`→10, `high`→8, `medium`→5, `low`→2, `unknown`→1)
- Drops redundant `idx_profiles_user_id` index (PK already has implicit index)

#### New Tables (4 compliance tables)

| # | Table | Purpose | RLS |
|---|---|---|---|
| 1 | `data_access_logs` | Tracks WHO accessed WHAT medical data and WHEN | ✅ |
| 2 | `legal_document_versions` | Versioned legal documents (privacy policy, T&C) for consent tracking | ✅ |
| 3 | `account_deletion_requests` | Right-to-erasure requests (Kenya DPA Article 40 / GDPR Article 17) | ✅ |
| 4 | `security_events` | Auth anomalies, failed logins, suspicious activity monitoring | ✅ |

---

### Step 5D — QR Rate Limiting Function (Migration 4)

**File**: `supabase/migrations/20251119_phase3_qr_rate_limit_function.sql`

Creates a single PostgreSQL function:

| Function | Purpose |
|---|---|
| `check_and_log_qr_scan(token, ip, user_agent)` | Server-side QR scan validation + rate limiting (5 scans/minute per IP) + profile data retrieval — all in one atomic operation |

This function:
1. Validates the QR access token
2. Checks if the token is active
3. Rate-limits by IP address (max 5 scans per minute)
4. Logs the scan attempt (even if denied)
5. Returns the user's medical profile data if access is granted

Grants `EXECUTE` to both `anon` and `authenticated` roles (QR scanning is public).

---

### Step 5E — User Suspension (Migration 5)

**File**: `supabase/migrations/20251119_phase5_user_suspension.sql`

| Change | Detail |
|---|---|
| New column | `profiles.is_suspended` (`BOOLEAN DEFAULT false`) |
| New index | `idx_profiles_is_suspended` (partial index, only `WHERE is_suspended = true`) |
| New RLS policy | `suspended_users_cannot_create_incidents` on `emergency_incidents` — blocks suspended users from triggering SOS |

---

## 6. Verify Tables Were Created

After running all 5 migrations, go to **Table Editor** in the Supabase Dashboard. You should see **21 tables**:

```
✅ account_deletion_requests
✅ admin_logs
✅ analytics
✅ articles
✅ chat_history
✅ data_access_logs
✅ downloadable_materials
✅ emergency_contacts
✅ emergency_incidents
✅ emergency_organizations
✅ legal_document_versions
✅ notifications
✅ organization_services
✅ profiles
✅ qr_access_tokens
✅ qr_scans
✅ security_events
✅ tutorials
✅ user_consents
✅ user_learning_progress
✅ user_roles
✅ webinars
```

You can also verify with this SQL query in the SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## 7. Verify RLS Policies

Every table must have RLS enabled. Run this query to check:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**All tables should show `rowsecurity = true`.**

To see all policies:

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

---

## 8. Verify Functions & Triggers

### Functions

Run this to verify all 4 functions exist:

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

Expected functions:
```
✅ check_and_log_qr_scan
✅ handle_new_user
✅ handle_updated_at
✅ has_role
```

### Triggers

Verify the auth trigger exists (this is the most critical one):

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
   OR event_object_schema = 'auth'
ORDER BY event_object_table;
```

You should see `on_auth_user_created` on `auth.users` and `update_*_updated_at` triggers on all relevant tables.

---

## 9. Configure Authentication

### Email/Password Auth (Required)

1. Go to **Authentication → Providers** in the dashboard
2. **Email** should be enabled by default
3. Configure these settings under **Authentication → Settings**:
   - ✅ Enable email confirmations (recommended for production)
   - Set **Site URL**: `https://your-domain.com` (or `http://localhost:5173` for local dev)
   - Set **Redirect URLs**: Add your domain(s), e.g.:
     - `https://your-domain.com/**`
     - `http://localhost:5173/**` (for local development)

### Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set Application Type: **Web application**
6. Add Authorized redirect URIs:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**
8. In Supabase Dashboard → **Authentication → Providers → Google**:
   - Enable Google
   - Paste Client ID and Client Secret
   - Save

---

## 10. Deploy Edge Functions

UhaiLink has **2 Edge Functions** that need to be deployed:

### Prerequisites

Install the Supabase CLI:

```bash
npm install -g supabase
```

Login and link your project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy Both Functions

```bash
supabase functions deploy send-emergency-sms --project-ref YOUR_PROJECT_REF
supabase functions deploy ai-chat-proxy --project-ref YOUR_PROJECT_REF
```

### What Each Function Does

| Function | Endpoint | Purpose |
|---|---|---|
| `send-emergency-sms` | `POST /functions/v1/send-emergency-sms` | Sends emergency SMS to contacts via Africa's Talking (primary) or Twilio (fallback) |
| `ai-chat-proxy` | `POST /functions/v1/ai-chat-proxy` | Proxies AI chat requests to OpenRouter API (keeps API key server-side) |

---

## 11. Set Edge Function Secrets

Edge Functions need environment variables (secrets) to work. Set them via the CLI or the Dashboard.

### Via CLI

```bash
# Required for ai-chat-proxy
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key --project-ref YOUR_PROJECT_REF

# Required for send-emergency-sms (Africa's Talking — primary SMS provider)
supabase secrets set AFRICAS_TALKING_API_KEY=your-at-api-key --project-ref YOUR_PROJECT_REF
supabase secrets set AFRICAS_TALKING_USERNAME=your-at-username --project-ref YOUR_PROJECT_REF

# Optional: Twilio (fallback SMS provider)
supabase secrets set TWILIO_ACCOUNT_SID=your-twilio-sid --project-ref YOUR_PROJECT_REF
supabase secrets set TWILIO_AUTH_TOKEN=your-twilio-token --project-ref YOUR_PROJECT_REF
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890 --project-ref YOUR_PROJECT_REF
```

### Via Dashboard

1. Go to **Edge Functions** in the sidebar
2. Click on a function
3. Go to **Secrets** tab
4. Add each key-value pair

### Secrets Summary

| Secret | Required By | Required? |
|---|---|---|
| `OPENROUTER_API_KEY` | `ai-chat-proxy` | ✅ Yes — AI assistant won't work without it |
| `AFRICAS_TALKING_API_KEY` | `send-emergency-sms` | ✅ Yes — primary SMS provider for Kenya |
| `AFRICAS_TALKING_USERNAME` | `send-emergency-sms` | ✅ Yes — use `sandbox` for testing |
| `TWILIO_ACCOUNT_SID` | `send-emergency-sms` | ⬜ Optional — fallback SMS provider |
| `TWILIO_AUTH_TOKEN` | `send-emergency-sms` | ⬜ Optional — fallback SMS provider |
| `TWILIO_PHONE_NUMBER` | `send-emergency-sms` | ⬜ Optional — fallback SMS provider |

> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available to all Edge Functions — you do NOT need to set them manually.

---

## 12. Create the First Admin User

Since admin emails are no longer hardcoded, you must manually promote a user to admin after they sign up.

### Step 1: Sign Up Normally

Go to your app and register an account with the email you want as admin.

### Step 2: Promote to Admin

In the Supabase **SQL Editor**, run:

```sql
-- Replace 'admin@yourdomain.com' with the email you registered with
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@yourdomain.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 3: Verify

```sql
SELECT u.email, r.role 
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE r.role = 'admin';
```

This should return your admin email with the `admin` role.

> **Note**: The `handle_new_user()` trigger already gives every new user the `user` role. The SQL above adds the `admin` role alongside it. Users can have both roles.

---

## 13. Seed Data (Optional)

Migration 1 already inserts seed data for emergency organizations and tutorials. If you want to add more content for testing:

### Sample Articles

```sql
INSERT INTO public.articles (title, summary, content, category, read_time, is_featured) VALUES
  ('First Aid Basics', 'Essential first aid skills everyone should know', 'Full article content here...', 'First Aid', 5, true),
  ('Understanding Blood Types', 'Why knowing your blood type matters in emergencies', 'Full article content here...', 'Health Education', 4, false),
  ('CPR Guide for Beginners', 'Step-by-step CPR instructions for adults and children', 'Full article content here...', 'Emergency Response', 7, true);
```

### Sample Webinars

```sql
INSERT INTO public.webinars (title, description, speaker, date_time, category, is_paid, price) VALUES
  ('Emergency Preparedness in Kenya', 'How to prepare your household for medical emergencies', 'Dr. Jane Muthoni', NOW() + INTERVAL '30 days', 'Preparedness', false, 0),
  ('Advanced First Aid Techniques', 'Professional-grade first aid for community responders', 'Dr. James Ochieng', NOW() + INTERVAL '45 days', 'First Aid', true, 500);
```

### Sample Downloadable Materials

```sql
INSERT INTO public.downloadable_materials (title, description, file_url, file_type, category, is_premium) VALUES
  ('Emergency Numbers Kenya PDF', 'Complete list of emergency numbers across Kenya', 'https://example.com/emergency-numbers.pdf', 'PDF', 'Reference', false),
  ('First Aid Checklist', 'Printable first aid kit checklist', 'https://example.com/checklist.pdf', 'PDF', 'First Aid', false);
```

---

## 14. Final Verification Checklist

Run through this checklist to confirm everything is working:

### Database

- [ ] All 21 tables visible in Table Editor
- [ ] All tables have RLS enabled (`rowsecurity = true`)
- [ ] 4 functions exist (`handle_new_user`, `handle_updated_at`, `has_role`, `check_and_log_qr_scan`)
- [ ] `on_auth_user_created` trigger exists on `auth.users`
- [ ] 3 enum types exist (`app_role`, `chat_role`, `admin_action_type`)
- [ ] Seed data present in `emergency_organizations` (5 rows) and `tutorials` (4 rows)
- [ ] `severity` column in `emergency_incidents` is `INTEGER` (not TEXT)
- [ ] `profiles.is_suspended` column exists with default `false`

### Authentication

- [ ] Email/Password auth enabled
- [ ] Site URL configured
- [ ] Redirect URLs configured
- [ ] Google OAuth configured (if desired)
- [ ] Test: Sign up a new user → verify `profiles` and `user_roles` rows auto-created

### Edge Functions

- [ ] `send-emergency-sms` deployed
- [ ] `ai-chat-proxy` deployed
- [ ] `OPENROUTER_API_KEY` secret set
- [ ] `AFRICAS_TALKING_API_KEY` secret set
- [ ] `AFRICAS_TALKING_USERNAME` secret set

### Frontend Connection

- [ ] `.env` file has correct `VITE_SUPABASE_URL`
- [ ] `.env` file has correct `VITE_SUPABASE_ANON_KEY`
- [ ] `supabase/config.toml` has correct `project_id`
- [ ] App connects and loads without console errors

### Admin Access

- [ ] At least one admin user promoted via SQL
- [ ] Admin can access `/admin` dashboard
- [ ] Admin can see all users in the Users tab

### Quick Smoke Test

1. **Sign up** a test user → Verify profile auto-created
2. **Log in** → Verify dashboard loads
3. **Update profile** → Fill in blood type, allergies, etc.
4. **Generate QR code** → Verify token created in `qr_access_tokens`
5. **Scan QR** (open in incognito) → Verify medical profile displays
6. **Add emergency contacts** → Verify saved to `emergency_contacts`
7. **Open AI Assistant** → Send a message → Verify response (requires `OPENROUTER_API_KEY`)
8. **Log in as admin** → Verify admin dashboard shows users, logs, and analytics

---

## Complete Database Schema Diagram

```
auth.users (Supabase managed)
  │
  ├──→ profiles (1:1, PK = auth.users.id)
  │     └── is_suspended, onboarding_completed, blood_type, allergies, medications...
  │
  ├──→ user_roles (1:many, user can have 'admin' + 'user')
  │
  ├──→ user_consents (1:many, consent records per type/version)
  │
  ├──→ emergency_contacts (1:many, prioritized contacts)
  │
  ├──→ qr_access_tokens (1:1, unique token per user)
  │     └──→ qr_scans (1:many, scan audit log with rate limit data)
  │
  ├──→ emergency_incidents (1:many, SOS events)
  │     └──→ notifications (1:many, SMS/email sent per incident)
  │
  ├──→ chat_history (1:many, JSONB conversation sessions)
  │
  ├──→ user_learning_progress (many:many with tutorials)
  │
  ├──→ data_access_logs (who accessed whose data)
  │
  ├──→ account_deletion_requests (right-to-erasure)
  │
  └──→ security_events (auth anomalies, monitoring)

emergency_organizations (standalone directory)
  └──→ organization_services (1:many)

articles, webinars, downloadable_materials (public content)
tutorials (public content, linked via user_learning_progress)
legal_document_versions (versioned legal docs)
admin_logs (admin audit trail)
analytics (platform metrics)
```

---

## Troubleshooting

### "permission denied for table profiles"
RLS is enabled but the user doesn't match any policy. Check that the `has_role` function was created and the user has a role in `user_roles`.

### "function handle_updated_at() does not exist"
You ran a later migration before the base migration. Drop all tables and re-run from Migration 1.

### New users don't get a profile row
The `on_auth_user_created` trigger is missing. Run this to check:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```
If empty, re-run the `handle_new_user()` function creation and trigger from Migration 1.

### "type app_role already exists"  
You're re-running Migration 1. This is safe — `CREATE TYPE IF NOT EXISTS` isn't supported in PostgreSQL. Either drop the type first (`DROP TYPE IF EXISTS public.app_role CASCADE;`) or skip the enum creation lines.

### Edge Functions return 500
Check that all secrets are set. In the dashboard, go to **Edge Functions → [function name] → Logs** to see the error.

---

*Last updated: February 2026*
