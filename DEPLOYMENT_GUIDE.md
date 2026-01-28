# Phase 1 & 2 Deployment Guide

**Target**: Production Deployment
**Last Updated**: January 2026
**Status**: Ready for Production ✅

---

## 🚀 Quick Start

### 1. Environment Setup

Create or update `.env.local` in project root:

```env
# Supabase (existing)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenRouter AI (NEW - Phase 2)
VITE_OPENROUTER_API_KEY=your-openrouter-api-key
```

### 2. Get API Keys

**Supabase**:
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy `URL` and `anon` key

**OpenRouter** (NEW):
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up for account
3. Create API key in dashboard
4. Add credits ($5+ recommended)
5. Copy API key

### 3. Apply Database Migration

```bash
# Deploy schema changes to Supabase
npx supabase db push

# This will:
# - Create emergency_incidents table
# - Create notifications table
# - Create qr_scans table
# - Create chat_history table
# - Add fields to profiles table
# - Create RLS policies
# - Create indexes
# - Create triggers
```

### 4. Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# This creates dist/ folder ready for deployment

# Optional: preview build locally
npm run preview
```

### 5. Deploy to Hosting

**Vercel** (Recommended):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Follow prompts to:
# - Connect GitHub repo
# - Set environment variables
# - Deploy
```

**Alternative Hosting**:
- Deploy `dist/` folder to any static host
- Configure HTTPS redirect
- Set environment variables in hosting dashboard

### 6. Test Deployment

After deploying:

```bash
# Test production URL
curl https://your-domain.com

# Expected: HTML with UhaiLink app loaded
```

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` shows no critical issues
- [ ] No TypeScript errors: `npx tsc --noEmit`

### Database
- [ ] Applied migration: `npx supabase db push`
- [ ] Verified tables exist in Supabase
- [ ] Verified RLS policies applied
- [ ] Verified indexes created

### Environment Variables
- [ ] VITE_SUPABASE_URL set ✓
- [ ] VITE_SUPABASE_ANON_KEY set ✓
- [ ] VITE_OPENROUTER_API_KEY set ✓

### Features
- [ ] Emergency SOS page loads
- [ ] Onboarding wizard works
- [ ] Admin dashboard accessible (admin account)
- [ ] AI chat responds to queries
- [ ] QR code scannable

### Security
- [ ] HTTPS enabled
- [ ] No API keys in source code
- [ ] RLS policies enforced
- [ ] Auth working properly

---

## 📋 Feature Verification

### Phase 1: Emergency Response

**Emergency SOS Page** (`/dashboard/emergency`):
```
1. Login as user
2. Navigate to /dashboard/emergency
3. Click SOS button
4. Confirm in modal
5. Check: incident created in Supabase
6. Check: SMS notification sent (if configured)
7. Check: incident status displayed
```

**Onboarding** (`/onboarding`):
```
1. New user login
2. Redirected to /onboarding automatically
3. Complete 6 steps:
   - Email
   - Basic info
   - Medical info
   - Emergency contacts
   - QR info
   - Complete
4. Check: profile saved in Supabase
5. Check: onboarding_completed = true
6. Can now access /dashboard
```

**Protected Routes**:
```
1. Logout or use incognito window
2. Try accessing /dashboard/emergency
3. Should redirect to /auth
4. Login
5. Complete onboarding
6. Should redirect to /dashboard
```

### Phase 2: Platform Features

**AI Chat** (`/dashboard/assistant`):
```
1. Login as user
2. Navigate to /dashboard/assistant
3. Type: "What do I do if someone is choking?"
4. Check: AI responds with steps
5. Check: Response includes blood type, allergies, etc.
6. Check: Messages saved to chat_history table
7. Check: Conversation history persists on reload
```

**Admin Dashboard** (`/admin/emergencies`):
```
1. Login as admin (user with role='admin')
2. Navigate to /admin/emergencies
3. Non-admin: Should redirect to /dashboard
4. Admin: Should show emergency dashboard
5. Check: Statistics cards display
6. Check: Incident list visible
7. Try: Filter by status
8. Try: Search by name
9. Try: Click incident → Update status
10. Check: Changes saved to database
```

**QR Rate Limiting**:
```
1. Scan QR code
2. First access: Should load profile (access_granted=true)
3. Rapid scans 5+ times within 60 seconds
4. 6th scan: Should show rate limit error
5. Check: qr_scans table shows access_denied entries
6. Wait 60 seconds, try again: Should work
```

---

## 🔧 Environment Variables Detailed

### Required Variables

```env
# Supabase Connection
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# Get from: Supabase Dashboard → Settings → API → URL
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
# Get from: Supabase Dashboard → Settings → API → anon public

# OpenRouter AI (Phase 2 - NEW)
VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY
# Get from: OpenRouter Dashboard → API Keys → Generate
```

### Optional Variables

```env
# App Configuration
VITE_APP_URL=http://localhost:8080
# Used for: OpenRouter headers (for stats tracking)

VITE_APP_NAME=UhaiLink
# Used for: OpenRouter headers
```

---

## 📞 Support & Troubleshooting

### Build Errors

**Error**: `Cannot find module '@/...'`
- **Cause**: Path alias not resolved
- **Solution**: Ensure `tsconfig.json` has paths configured

**Error**: `TypeScript error in supabase types`
- **Cause**: Supabase schema out of sync
- **Solution**: Run `npx supabase db pull` or manually update types

### Runtime Errors

**Error**: `Supabase table not found`
- **Cause**: Migration not applied
- **Solution**: Run `npx supabase db push`

**Error**: `OpenRouter API error`
- **Cause**: API key invalid or no credits
- **Solution**: Verify key and add credits at openrouter.ai

**Error**: `Rate limit exceeded` on QR scans
- **Cause**: More than 5 scans/minute from same IP
- **Solution**: Wait 60 seconds before scanning again

---

## 🔐 Post-Deployment Security

### 1. Update Security Headers
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### 2. Enable CORS
Configure Supabase CORS to allow your domain:
```
supabase.co → Settings → Security → CORS Allowed Origins
Add: https://your-domain.com
```

### 3. Monitor API Usage
- OpenRouter: Check usage at openrouter.ai/dashboard
- Supabase: Check logs at supabase.com/project/[id]/logs
- Check for unusual activity

### 4. Backup Strategy
- Enable Supabase automatic backups
- Daily backups recommended for production

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

**Emergency SOS**:
- Total emergencies triggered
- SMS delivery rate
- Response time

**Onboarding**:
- Completion rate
- Drop-off points
- Time to complete

**AI Chat**:
- Message volume
- Token usage (OpenRouter)
- Error rate

**Admin Dashboard**:
- Incident resolution time
- Average responder notes length
- Admin user activity

### Logging

Check logs in:
- Supabase: Project → Logs → Database
- OpenRouter: Dashboard → Analytics
- Hosting platform: Error logs

---

## 🚨 Incident Response

### If Emergency SMS Not Sending

1. Check Edge Function logs: Supabase → Functions
2. Verify Africa's Talking credentials
3. Check notification table for errors
4. Check SMS provider status page
5. Review error_message field in notifications table

### If QR Access Blocked

1. Check IP being rate-limited
2. Verify rate limit is 5 scans/minute
3. Check qr_scans table for access_granted = false
4. Review denial_reason field

### If AI Chat Not Responding

1. Check OpenRouter API key is valid
2. Verify account has credits
3. Check API usage limits
4. Review error logs in browser console
5. Check OpenRouter status page

---

## 🔄 Rollback Procedure

If deployment has critical issues:

```bash
# 1. Revert to previous version
git revert <commit-hash>

# 2. Rebuild
npm run build

# 3. Redeploy
vercel --prod  # or your hosting provider's command

# 4. If database was changed
#    - Contact Supabase support to restore from backup
#    - Or manually fix schema
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [React Router Guide](https://reactrouter.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✨ Production Launch Checklist

Final verification before going live:

- [ ] All 9 Phase 1 & 2 features working
- [ ] Database migration applied
- [ ] API keys configured
- [ ] HTTPS enabled
- [ ] Security headers set
- [ ] CORS configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Error logging working
- [ ] Team trained on admin dashboard
- [ ] Support process established
- [ ] Documentation accessible

---

## 🎯 Success Criteria

Deployment successful when:

✅ Emergency SOS sends notifications
✅ Onboarding enforces completion
✅ Admin can manage emergencies
✅ AI chat responds with context
✅ QR rate limiting works
✅ All data persists correctly
✅ No TypeScript errors
✅ Performance acceptable (<3s load time)
✅ All tests passing
✅ Zero critical security issues

---

**Deployment Guide Complete ✅**

Questions? See:
- [PHASE_2_COMPLETION.md](PHASE_2_COMPLETION.md) - Feature details
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Architecture
- [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) - Verification

Ready to deploy? Let's go! 🚀
