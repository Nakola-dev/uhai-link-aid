# UhaiLink — Emergency Medical QR Code Platform

> **Empowering You to Act When Every Second Counts**

UhaiLink is an AI-powered, offline-ready emergency medical platform that provides instant access to critical health information through QR codes. Built for Kenya, designed for the world.

---

## Features

### Emergency Response
- **One-Tap SOS** — Trigger emergency alerts with geolocation
- **SMS Notifications** — Alert emergency contacts via Africa's Talking / Twilio
- **Emergency Directory** — Verified hospitals, ambulances, and rescue services across Kenya

### Medical QR ID
- **Auto-Generated QR Codes** — Secure, token-based access to your medical profile
- **First Responder Access** — Scan → instant view of blood type, allergies, medications, contacts
- **Rate-Limited Scanning** — Server-side rate limiting (5/min per IP) with full audit trail

### AI Health Assistant
- **AI-Powered First Aid** — Step-by-step emergency guidance via OpenRouter AI
- **Context-Aware** — Uses your medical profile for personalized responses
- **Server-Side API** — API keys secured in Supabase Edge Functions (never exposed client-side)

### Learning Center
- Video tutorials, articles, webinars, and downloadable materials
- Progress tracking for first aid certification paths

### Admin Dashboard
- 8-tab interface: Analytics, Users, Content, Organizations, QR Products, Emergencies, Payments, Audit Logs
- User suspension/reactivation, CSV export, real-time charts (recharts)
- Full admin audit trail with filterable log viewer

### Progressive Web App
- **Installable PWA** — Add to home screen on any device
- **Service Worker** — Workbox-powered offline caching with runtime strategies
- **Offline Banner** — Visual indicator when connection drops/restores
- **Gzip Compression** — Pre-compressed build output
- **Core Web Vitals** — CLS, FID, INP, LCP, FCP, TTFB monitoring

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript 5.8 · Vite 7.3 |
| UI | Tailwind CSS · Radix UI · Lucide Icons · recharts |
| Forms | react-hook-form · zod · @hookform/resolvers |
| State | React Query (TanStack) · React Context |
| Backend | Supabase (PostgreSQL · Auth · Edge Functions · Storage) |
| PWA | vite-plugin-pwa · Workbox · web-vitals |
| AI | OpenRouter (via Edge Function proxy) |
| SMS | Africa's Talking · Twilio (fallback) |

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Supabase project ([supabase.com](https://supabase.com))

### Installation

```bash
git clone <repository-url>
cd uhai-link-aid
npm install
```

### Environment Variables

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note**: The OpenRouter API key is stored as a Supabase Edge Function secret, NOT as a `VITE_` variable. See [Deployment Guide](docs/PENDING_DEPLOYMENT_TASKS.md).

### Development

```bash
npm run dev        # Start dev server at http://localhost:8080
npm run build      # Production build (with PWA, compression, source maps)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npx tsc --noEmit   # TypeScript type check
```

---

## Project Structure

```
src/
├── components/
│   ├── admin/              # Admin dashboard tab components
│   ├── ui/                 # Radix UI primitives (shadcn/ui)
│   ├── DashboardLayout.tsx # Authenticated user layout (sidebar + header)
│   ├── ErrorBoundary.tsx   # Global error boundary
│   ├── Header.tsx          # Public site header (nav + theme toggle)
│   ├── Footer.tsx          # Site footer (links + emergency contacts)
│   ├── Layout.tsx          # Public page layout (header + main + footer)
│   ├── OfflineBanner.tsx   # Online/offline status indicator
│   └── ProtectedRoute.tsx  # Auth guard (requireOnboarding, requireAdmin)
├── hooks/
│   ├── use-auth.ts         # Centralized auth/profile/admin hook
│   ├── use-online-status.ts# Navigator.onLine tracking
│   ├── use-mobile.tsx      # Mobile breakpoint detection
│   └── use-toast.ts        # Toast notification hook
├── lib/
│   ├── admin-logger.ts     # Admin audit logging + CSV export
│   ├── web-vitals.ts       # Core Web Vitals monitoring
│   └── utils.ts            # cn() utility for Tailwind
├── pages/
│   ├── public/             # Landing, auth, legal pages (no auth)
│   ├── user/               # Dashboard pages (auth required)
│   └── admin/              # Admin pages (admin role required)
├── integrations/supabase/  # Supabase client + generated types
├── App.tsx                 # Route definitions (all lazy-loaded)
└── main.tsx                # Entry point (SW registration, web vitals)

supabase/
├── functions/send-emergency-sms/  # Edge Function for SMS alerts
└── migrations/                     # Database schema migrations

docs/
├── UHAILINK_SYSTEM_AUDIT.md       # Comprehensive 40-finding audit
├── PENDING_DEPLOYMENT_TASKS.md    # Pre-deployment checklist
├── DPIA.md                        # Data Protection Impact Assessment
├── INCIDENT_RESPONSE_PLAN.md      # Security incident procedures
└── RUNBOOK.md                     # Operational runbook
```

---

## Database Schema

17 tables with Row-Level Security enabled on all:

| Table | Purpose |
|-------|---------|
| `profiles` | User identity + medical data |
| `user_roles` | Role assignments (admin/user) |
| `user_consents` | Consent records with versioning |
| `emergency_contacts` | User emergency contacts |
| `emergency_incidents` | SOS events with geolocation |
| `emergency_organizations` | Service provider directory |
| `qr_access_tokens` | QR code tokens |
| `qr_scans` | QR scan audit trail |
| `chat_history` | AI chat sessions |
| `tutorials` / `articles` / `webinars` | Learning content |
| `admin_logs` | Admin action audit trail |
| `notifications` | SMS/email delivery log |

---

## Security

- **Row-Level Security** on all tables (users see only their own data)
- **Content Security Policy** meta tag restricting resource origins
- **Server-side rate limiting** for QR scans (database function)
- **Edge Function proxy** for AI API calls (no client-side API keys)
- **Admin role verification** at route level (`requireAdmin` prop)
- **Consent capture** with explicit checkboxes at registration
- **Password policy** enforced (minimum 8 characters)
- **Service worker** with Network-Only strategy for auth endpoints

---

## Compliance

- **Kenya Data Protection Act 2019** — Consent architecture, DPIA completed
- **GDPR alignment** — Right to access, rectification, erasure
- **Legal pages** — Privacy Policy, Terms of Service, Medical Disclaimer
- **Audit trail** — All admin actions logged, QR scans logged
- **Incident response plan** — 72-hour ODPC notification procedure documented

See [docs/DPIA.md](docs/DPIA.md) for the full Data Protection Impact Assessment.

---

## Deployment

See [docs/PENDING_DEPLOYMENT_TASKS.md](docs/PENDING_DEPLOYMENT_TASKS.md) for the complete deployment checklist including:
- Database migrations (4 migration files, run in order)
- Supabase Edge Function secrets
- Google OAuth provider configuration
- Post-deployment verification (27-item checklist)

See [docs/RUNBOOK.md](docs/RUNBOOK.md) for operational procedures.

---

## Audit Status

All 40 findings from the comprehensive system audit have been addressed across 7 phases:

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | System Audit (40 findings documented) | Complete |
| 1 | Critical Security & Legal (consent, API key, admin auth, legal pages) | Complete |
| 2 | Schema & Data Integrity (chat_history, severity type, compliance tables) | Complete |
| 3 | Architecture & Code Quality (lazy loading, error boundary, deduplication) | Complete |
| 4 | UI/UX Enhancement (dark mode, Google OAuth, forgot password, form validation) | Complete |
| 5 | Admin Dashboard Enhancement (analytics, audit logs, user management) | Complete |
| 6 | Offline & Performance (PWA, service worker, compression, CSP, Web Vitals) | Complete |
| 7 | Final Audit & Launch Preparation (WCAG, DPIA, incident response, runbook) | Complete |

---

## License

This project is proprietary software. All rights reserved.

---

## Emergency Contacts (Kenya)

| Service | Number |
|---------|--------|
| Kenya Red Cross | 1199 |
| Ambulance / Police | 999 |
| General Emergency | 112 |

---

**Made with care for saving lives.**
