# UHAILINK OPERATIONAL RUNBOOK

> **Platform**: UhaiLink — Emergency Medical QR Code Platform  
> **Version**: 1.0  
> **Date**: 2026-02-12  
> **Audience**: Engineering team, DevOps, On-call engineers  
> **Classification**: INTERNAL

---

## 1. SYSTEM OVERVIEW

### Architecture

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  React SPA  │────▶│  Supabase Platform   │────▶│  External APIs  │
│  (Vite PWA) │     │                      │     │                 │
│             │     │  ┌────────────────┐   │     │  Africa's Talk  │
│  - React 18 │     │  │  PostgreSQL    │   │     │  OpenRouter AI  │
│  - TypeScript│    │  │  (RLS enabled) │   │     └─────────────────┘
│  - Tailwind │     │  └────────────────┘   │
│  - Radix UI │     │  ┌────────────────┐   │
│  - PWA/SW   │     │  │  Auth Service  │   │
└─────────────┘     │  └────────────────┘   │
                    │  ┌────────────────┐   │
                    │  │  Edge Functions │   │
                    │  └────────────────┘   │
                    │  ┌────────────────┐   │
                    │  │  Storage       │   │
                    │  └────────────────┘   │
                    └──────────────────────┘
```

### Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Production App | `https://uhailink.com` | Live platform |
| Supabase Dashboard | `https://supabase.com/dashboard/project/jlgzlwyuaopnjhdnnjyr` | Backend management |
| Supabase API | `https://jlgzlwyuaopnjhdnnjyr.supabase.co` | API endpoint |
| Git Repository | (your repository URL) | Source code |

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 18.3.1 / 5.8.3 |
| Build Tool | Vite | 7.3.1 |
| UI Components | Radix UI + Tailwind CSS | Latest / 3.x |
| Backend | Supabase (PostgreSQL 15) | Latest |
| Auth | Supabase Auth | JWT-based |
| Edge Functions | Deno (Supabase Functions) | Latest |
| PWA | vite-plugin-pwa (Workbox) | 1.2.0 |

---

## 2. DEPLOYMENT PROCEDURES

### 2.1 Frontend Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run type check
npx tsc --noEmit

# 4. Run linter
npm run lint

# 5. Build for production
npm run build

# 6. Verify build output
ls dist/
# Should contain: index.html, assets/, sw.js, manifest.webmanifest, icons/

# 7. Deploy to hosting provider
# (varies by provider: Vercel, Netlify, Cloudflare Pages, etc.)
```

### 2.2 Database Migration Deployment

```bash
# 1. Review migration file
cat supabase/migrations/<migration_file>.sql

# 2. Apply via Supabase CLI
supabase db push

# OR apply via Supabase Dashboard:
# Dashboard → SQL Editor → Paste migration → Run

# 3. Verify migration
supabase db dump --schema public | grep <table_or_column_name>
```

**Migration Order** (critical — must be sequential):
1. `20260212000001_phase1_security_legal_fixes.sql`
2. `20260212000002_phase2_schema_data_integrity.sql`
3. `20251119_phase3_qr_rate_limit_function.sql`
4. `20251119_phase5_user_suspension.sql`

### 2.3 Edge Function Deployment

```bash
# Deploy the emergency SMS function
supabase functions deploy send-emergency-sms

# Set required secrets
supabase secrets set OPENROUTER_API_KEY=<key>
supabase secrets set AFRICAS_TALKING_API_KEY=<key>
supabase secrets set AFRICAS_TALKING_USERNAME=<username>

# Verify deployment
supabase functions list

# Check logs
supabase functions logs send-emergency-sms --tail
```

### 2.4 Environment Variables

| Variable | Where Set | Required |
|----------|-----------|----------|
| `VITE_SUPABASE_URL` | `.env` (frontend) | Yes |
| `VITE_SUPABASE_ANON_KEY` | `.env` (frontend) | Yes |
| `OPENROUTER_API_KEY` | Supabase secrets | Yes |
| `AFRICAS_TALKING_API_KEY` | Supabase secrets | Yes |
| `AFRICAS_TALKING_USERNAME` | Supabase secrets | Yes |

**Important**: Never set `VITE_OPENROUTER_API_KEY` — this key must only exist as a Supabase secret.

---

## 3. MONITORING & HEALTH CHECKS

### 3.1 Key Metrics to Monitor

| Metric | Normal Range | Alert Threshold | Where to Check |
|--------|-------------|-----------------|----------------|
| Auth success rate | >99% | <95% | Supabase Dashboard → Auth |
| API response time | <200ms | >500ms | Supabase Dashboard → API |
| Database connections | <50 | >80 | Supabase Dashboard → Database |
| Edge Function cold starts | <200ms | >1000ms | Function logs |
| Error rate (frontend) | <0.1% | >1% | Error monitoring service |
| Service worker registration | >90% | <70% | Analytics |
| Core Web Vitals (LCP) | <2.5s | >4s | Web Vitals reporting |
| Core Web Vitals (CLS) | <0.1 | >0.25 | Web Vitals reporting |

### 3.2 Health Check Endpoints

```bash
# Supabase API health
curl https://jlgzlwyuaopnjhdnnjyr.supabase.co/rest/v1/ \
  -H "apikey: <anon_key>"

# Edge Function health (returns 4xx without payload but confirms function is deployed)
curl -X POST https://jlgzlwyuaopnjhdnnjyr.supabase.co/functions/v1/send-emergency-sms \
  -H "Authorization: Bearer <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{}'

# Check PWA manifest
curl https://uhailink.com/manifest.webmanifest

# Check service worker
curl https://uhailink.com/sw.js | head -5
```

### 3.3 Log Locations

| Log Type | Location | Retention |
|----------|----------|-----------|
| Frontend errors | ErrorBoundary component → console | Browser session |
| Auth events | Supabase Dashboard → Auth → Logs | 7 days |
| Database queries | Supabase Dashboard → Database → Logs | 7 days |
| Edge Function logs | Supabase Dashboard → Functions → Logs | 7 days |
| Admin actions | `admin_logs` table | Indefinite |
| QR scan audit trail | `qr_scans` table | Indefinite |
| Web Vitals | Console (dev) / analytics endpoint (prod) | Varies |

---

## 4. COMMON OPERATIONS

### 4.1 User Management

**Suspend a user** (via Admin Dashboard):
1. Navigate to `/admin` → Users tab
2. Search for user by name/email
3. Click "Suspend" → Confirm
4. User's `profiles.is_suspended` set to `true`
5. Action logged in `admin_logs`

**Unsuspend a user**:
1. Same flow, click "Reactivate"

**Suspend via SQL** (emergency):
```sql
UPDATE profiles SET is_suspended = true WHERE id = '<user_uuid>';
INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details)
VALUES ('<your_admin_uuid>', 'suspend_user', 'user', '<user_uuid>', 
        '{"reason": "Emergency manual suspension"}');
```

### 4.2 Admin Role Management

**Grant admin role** (via SQL only — no UI for security):
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<user_uuid>', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

**Revoke admin role**:
```sql
DELETE FROM user_roles WHERE user_id = '<user_uuid>' AND role = 'admin';
```

### 4.3 QR Token Management

**Revoke a QR token**:
```sql
UPDATE qr_access_tokens 
SET is_active = false 
WHERE id = '<token_uuid>';
```

**Find all tokens for a user**:
```sql
SELECT id, access_token, is_active, created_at 
FROM qr_access_tokens 
WHERE user_id = '<user_uuid>';
```

### 4.4 Emergency Incident Management

**View active incidents**:
```sql
SELECT ei.*, p.full_name, p.blood_type 
FROM emergency_incidents ei
JOIN profiles p ON ei.user_id = p.id
WHERE ei.status IN ('active', 'pending')
ORDER BY ei.created_at DESC;
```

**Resolve an incident**:
```sql
UPDATE emergency_incidents 
SET status = 'resolved', resolved_at = NOW()
WHERE id = '<incident_uuid>';
```

### 4.5 Database Maintenance

**Check table sizes**:
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

**Check active connections**:
```sql
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
```

**Vacuum tables** (usually automatic in Supabase):
```sql
VACUUM ANALYZE profiles;
VACUUM ANALYZE emergency_incidents;
VACUUM ANALYZE qr_scans;
```

---

## 5. TROUBLESHOOTING

### 5.1 Common Issues

#### Frontend: Blank white page after deploy
**Cause**: JavaScript bundle failed to load or CSP blocking resources.
**Fix**:
1. Check browser console for errors
2. Verify `dist/assets/` files are served correctly
3. Check CSP meta tag isn't blocking required origins
4. Clear service worker cache: DevTools → Application → Service Workers → Unregister

#### Auth: Users can't log in
**Cause**: Supabase Auth service issue or JWT expiration.
**Fix**:
1. Check Supabase Dashboard → Auth → Health
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. Check if user account is suspended (`profiles.is_suspended`)
4. Try clearing localStorage and re-authenticating

#### Edge Function: SMS not sending
**Cause**: Africa's Talking API failure or secret misconfiguration.
**Fix**:
1. Check function logs: `supabase functions logs send-emergency-sms`
2. Verify secrets are set: `supabase secrets list`
3. Test Africa's Talking API directly
4. Check CORS headers are present in function response

#### PWA: Service worker not updating
**Cause**: Old SW cached and not auto-updating.
**Fix**:
1. Force update: Chrome → DevTools → Application → Service Workers → Update
2. Check `skipWaiting()` is called in new SW version
3. Clear all caches: Application → Cache Storage → Delete all

#### QR Scan: Rate limited incorrectly
**Cause**: `check_and_log_qr_scan` function rate limiting.
**Fix**:
```sql
-- Check recent scans from an IP
SELECT * FROM qr_scans 
WHERE scanner_ip_hash = '<ip_hash>' 
AND scanned_at > NOW() - INTERVAL '1 minute'
ORDER BY scanned_at DESC;

-- Clear rate limit (emergency — use sparingly)
DELETE FROM qr_scans 
WHERE scanner_ip_hash = '<ip_hash>' 
AND scanned_at > NOW() - INTERVAL '1 minute';
```

### 5.2 Performance Debugging

**Check slow queries** (Supabase Dashboard → Database → Query Performance):
1. Look for queries taking >100ms
2. Check for missing indexes
3. Review RLS policies for excessive complexity

**Frontend performance**:
1. Open Chrome DevTools → Performance
2. Run Lighthouse audit (Performance, Accessibility, Best Practices)
3. Check Core Web Vitals in console (dev mode logging enabled)
4. Use `window.__getPerformanceSummary?.()` for quick overview

---

## 6. BACKUP & RECOVERY

### 6.1 Supabase Backups
- **Automatic**: Supabase provides daily backups (Pro plan and above)
- **Point-in-time recovery**: Available on Pro plan (up to 7 days)
- **Manual backup**: `supabase db dump > backup_$(date +%Y%m%d).sql`

### 6.2 Recovery Procedures

**Database recovery**:
1. Identify recovery point (timestamp before incident)
2. Use Supabase Dashboard → Database → Backups → Restore
3. Verify data integrity after restore
4. Re-apply any migrations that were applied after the backup point

**Frontend recovery** (rollback deployment):
```bash
# Find the last known good commit
git log --oneline -10

# Revert to it
git revert HEAD  # or git reset --hard <commit_hash>

# Rebuild and deploy
npm run build
# Deploy via your hosting provider
```

---

## 7. CONTACTS & ESCALATION

| Role | Contact | Availability |
|------|---------|-------------|
| Engineering Lead | [email/phone] | 24/7 for P1 |
| Backend Engineer | [email/phone] | Business hours |
| Frontend Engineer | [email/phone] | Business hours |
| Data Protection Officer | [email/phone] | Business hours |
| Supabase Support | support@supabase.io | 24/7 (Pro plan) |
| Africa's Talking Support | [support portal] | Business hours (EAT) |

### Escalation Path
```
On-call Engineer → Engineering Lead → CTO → CEO (P1 only)
```

---

## 8. APPENDIX

### A. Useful Supabase CLI Commands

```bash
supabase status              # Check local Supabase status
supabase db push             # Apply migrations to remote
supabase db pull             # Pull remote schema changes
supabase functions list      # List deployed functions
supabase functions logs <fn> # View function logs
supabase secrets list        # List configured secrets
supabase inspect db          # Database inspection tools
```

### B. Build & Development Commands

```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build (unminified)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npx tsc --noEmit     # TypeScript type check (no emit)
```

### C. Service Worker Debug

```javascript
// In browser console:

// Check SW registration
navigator.serviceWorker.getRegistrations().then(r => console.log(r));

// Force SW update
navigator.serviceWorker.getRegistrations().then(regs => 
  regs.forEach(r => r.update())
);

// Unregister all SWs (nuclear option)
navigator.serviceWorker.getRegistrations().then(regs => 
  regs.forEach(r => r.unregister())
);

// Clear all caches
caches.keys().then(keys => keys.forEach(k => caches.delete(k)));

// Check performance summary
window.__getPerformanceSummary?.();
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-12  
**Next Review**: 2026-05-12
