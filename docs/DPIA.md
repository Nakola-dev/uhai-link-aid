# DATA PROTECTION IMPACT ASSESSMENT (DPIA)

> **Platform**: UhaiLink — Emergency Medical QR Code Platform  
> **Version**: 1.0  
> **Date**: 2026-02-12  
> **Data Controller**: UhaiLink Limited  
> **Jurisdiction**: Kenya (Kenya Data Protection Act 2019)  
> **Classification**: CONFIDENTIAL

---

## 1. INTRODUCTION

### 1.1 Purpose
This Data Protection Impact Assessment (DPIA) evaluates the privacy risks associated with UhaiLink's processing of personal and sensitive medical data. It is conducted in compliance with:
- **Kenya Data Protection Act 2019** (DPA), Sections 31-32
- **General Data Protection Regulation** (GDPR), Article 35 (for EU data subjects)
- **Health data processing** best practices

### 1.2 Why a DPIA Is Required
UhaiLink processes **sensitive personal data** (medical information) at scale, including:
- Health records (blood type, allergies, medications, chronic conditions)
- Biometric-adjacent data (emergency medical profiles accessible via QR codes)
- Location data (emergency SOS geolocation)
- Communication data (emergency contact details, SMS notifications)

Processing of health data at scale constitutes **high-risk processing** under both the Kenya DPA and GDPR, triggering a mandatory DPIA.

---

## 2. PROCESSING DESCRIPTION

### 2.1 Data Processing Activities

| Activity | Data Categories | Purpose | Legal Basis |
|----------|----------------|---------|-------------|
| **User Registration** | Name, email, password hash | Account creation | Consent (DPA s.30) |
| **Profile Creation** | Name, phone, city, county, gender, DOB | User identification | Consent |
| **Medical Profile** | Blood type, allergies, medications, chronic conditions, primary hospital | Emergency medical access | Explicit consent (DPA s.35) |
| **Emergency Contacts** | Contact name, phone, relationship | Emergency notification | Explicit consent |
| **QR Code Generation** | Access token linked to medical profile | Emergency data access by third parties | Explicit consent + vital interest |
| **Emergency SOS** | GPS coordinates, incident details, severity | Emergency response | Vital interest (DPA s.30(1)(d)) |
| **SMS Notifications** | Phone numbers, emergency details | Alert emergency contacts | Vital interest |
| **AI Health Chat** | Chat messages, medical queries | Health guidance | Consent |
| **QR Scan Logging** | Scan timestamp, scanner IP (hashed), user agent | Audit trail & abuse prevention | Legitimate interest |
| **Admin Audit Logs** | Admin actions, timestamps | Platform governance | Legitimate interest |

### 2.2 Data Flow Diagram

```
User Device → [HTTPS/TLS 1.3] → Supabase API Gateway
                                      ↓
                                PostgreSQL (RLS enforced)
                                      ↓
                              ┌───────┴───────┐
                              ↓               ↓
                        User Profile    Emergency Data
                              ↓               ↓
                        QR Code Gen    Emergency SOS
                              ↓               ↓
                     Public Scanner    Edge Function (SMS)
                              ↓               ↓
                   Medical Profile   Africa's Talking API
                   (read-only view)  (SMS delivery)
```

### 2.3 Data Storage

| Data Store | Provider | Location | Encryption |
|------------|----------|----------|------------|
| PostgreSQL Database | Supabase | AWS (region configurable) | AES-256 at rest, TLS in transit |
| Authentication | Supabase Auth | Same as DB | bcrypt password hashing |
| File Storage | Supabase Storage | Same as DB | AES-256 at rest |
| Edge Functions | Supabase (Deno Deploy) | Edge locations | In-memory only, no persistence |
| Client Cache | Service Worker (browser) | User device | Browser-managed |

### 2.4 Data Retention

| Data Category | Retention Period | Justification |
|---------------|-----------------|---------------|
| User account & profile | Until account deletion or 3 years of inactivity | Service provision |
| Medical profile | Until account deletion | Emergency access requirement |
| Emergency incidents | 7 years | Medical record-keeping requirements |
| QR scan logs | 1 year | Security audit trail |
| Chat history | 90 days | Service improvement |
| Admin audit logs | 5 years | Governance & compliance |
| SMS notification logs | 1 year | Delivery verification |
| Account deletion requests | 30 days post-completion | Compliance verification |

---

## 3. NECESSITY & PROPORTIONALITY

### 3.1 Necessity Assessment

| Data Collected | Necessary? | Justification |
|----------------|-----------|---------------|
| Full name | **Yes** | Emergency identification |
| Email | **Yes** | Account authentication |
| Phone number | **Yes** | Emergency SMS notifications |
| Date of birth | **Yes** | Medical context (age-related conditions) |
| Gender | **Qualified Yes** | Medical relevance (dosing, conditions) |
| Blood type | **Yes** | Critical emergency medical data |
| Allergies | **Yes** | Prevent adverse medical reactions |
| Medications | **Yes** | Drug interaction prevention |
| Chronic conditions | **Yes** | Emergency treatment context |
| Primary hospital | **Yes** | Preferred treatment facility |
| Emergency contacts | **Yes** | Core platform function |
| GPS location | **Qualified Yes** | Only during active emergency SOS |
| City/County | **Qualified Yes** | Emergency service routing |

### 3.2 Data Minimization Measures
- Profile photo is **optional**
- Medical fields beyond blood type are **optional**
- GPS location is collected **only** during emergency activation, not continuously
- QR public view shows **limited** medical data (no full profile)
- AI chat messages are **not** linked to medical profiles

### 3.3 Proportionality
The data collected is proportionate to the life-critical purpose. Emergency medical access requires comprehensive medical information to be effective. Data that is not directly related to emergency response (e.g., browsing history, marketing preferences) is **not collected**.

---

## 4. RISK ASSESSMENT

### 4.1 Risk Matrix

| Risk ID | Risk Description | Likelihood | Impact | Severity | Mitigation |
|---------|-----------------|------------|--------|----------|------------|
| R-001 | Unauthorized access to medical data | Medium | Critical | **HIGH** | RLS policies, auth tokens, rate limiting |
| R-002 | QR code falls into wrong hands | Medium | High | **HIGH** | Token revocation, scan logging, rate limiting |
| R-003 | Data breach via SQL injection | Low | Critical | **MEDIUM** | Parameterized queries (Supabase), no raw SQL |
| R-004 | XSS attack exposing session tokens | Low | High | **MEDIUM** | React auto-escaping, CSP headers, no `dangerouslySetInnerHTML` in app code |
| R-005 | Admin privilege escalation | Low | Critical | **MEDIUM** | Role-based access via `has_role()` function, route-level admin checks |
| R-006 | SMS notification data exposure | Medium | Medium | **MEDIUM** | Edge Function server-side, service role key protected |
| R-007 | AI chat data misuse | Low | Medium | **LOW** | Edge Function proxy, no client-side API keys |
| R-008 | Cross-border data transfer violation | Medium | High | **HIGH** | Document Supabase hosting region, secure adequacy assessment |
| R-009 | Failure to honor deletion requests | Low | High | **MEDIUM** | Account deletion flow, cascade delete policies |
| R-010 | Emergency SOS failure due to offline | Medium | Critical | **HIGH** | PWA/service worker, offline caching, emergency phone fallback |

### 4.2 Technical Safeguards Implemented

| Safeguard | Status | Details |
|-----------|--------|---------|
| Row-Level Security (RLS) | ✅ Active | All 17 tables have RLS enabled |
| Authentication | ✅ Active | Supabase Auth with JWT tokens |
| Password Policy | ✅ Enhanced | 8+ character minimum enforced |
| Admin Role Verification | ✅ Active | Route-level `requireAdmin` + `has_role()` RPC |
| API Key Protection | ✅ Active | OpenRouter key moved to Edge Function |
| Content Security Policy | ✅ Active | CSP meta tag restricting resource origins |
| HTTPS/TLS | ✅ Active | All Supabase communications encrypted |
| QR Rate Limiting | ✅ Active | Server-side database function (5/min per IP) |
| Audit Logging | ✅ Active | Admin actions logged to `admin_logs` table |
| Input Validation | ✅ Active | Zod schemas + react-hook-form validation |
| Service Worker | ✅ Active | Offline caching with appropriate strategies |
| Consent Capture | ✅ Active | Explicit checkboxes with versioned records |

### 4.3 Organizational Safeguards

| Safeguard | Status | Responsibility |
|-----------|--------|---------------|
| Data controller registration with ODPC | **PENDING** | Legal team |
| Staff data protection training | **PENDING** | HR / Operations |
| Data processing agreements with sub-processors | **PENDING** | Legal team |
| Incident response plan | ✅ Created | Engineering / Security |
| Regular security audits | ✅ Scheduled | Engineering |
| Privacy policy publication | ✅ Active | Legal team |

---

## 5. DATA SUBJECT RIGHTS

### 5.1 Rights Implementation Status

| Right | DPA Section | Status | Implementation |
|-------|------------|--------|----------------|
| Right to be informed | s.29 | ✅ Active | Privacy Policy page, consent notices |
| Right of access | s.26(a) | ✅ Active | User can view full profile in dashboard |
| Right to rectification | s.26(b) | ✅ Active | Profile edit functionality |
| Right to erasure | s.26(c) | ✅ Active | Account deletion request flow |
| Right to restrict processing | s.26(d) | **PARTIAL** | User can revoke QR tokens |
| Right to data portability | s.26(e) | **PENDING** | Data export feature planned |
| Right to object | s.26(f) | **PARTIAL** | User can withdraw from platform |
| Right re: automated decisions | s.26(g) | **N/A** | No automated decision-making |

### 5.2 Data Subject Request Process

1. User submits request via Settings → Account Deletion or via email to `privacy@uhailink.com`
2. Request logged in `account_deletion_requests` table
3. Identity verification via authenticated session
4. Request processed within **30 days** (DPA requirement)
5. Confirmation sent to user's email
6. Data permanently deleted with cascade across all related tables
7. Deletion record retained for compliance audit (anonymized)

---

## 6. CROSS-BORDER DATA TRANSFERS

### 6.1 Transfer Assessment

| Sub-Processor | Data Type | Transfer Destination | Safeguard |
|---------------|-----------|---------------------|-----------|
| Supabase (AWS) | All user data | Configurable region | Standard Contractual Clauses |
| Africa's Talking | Phone numbers, SMS content | Kenya (local) | Data processing agreement |
| OpenRouter | Chat messages only | US servers | Anonymized (no PII in prompts) |
| Google Fonts | IP address (CDN) | Google global | Cached by service worker |

### 6.2 Adequacy Measures
- Supabase project should be hosted in a region with data protection adequacy or with SCCs in place
- SMS provider (Africa's Talking) is Kenya-based, no cross-border transfer
- AI chat messages should be sanitized to remove any PII before sending to OpenRouter

---

## 7. CONSULTATION

### 7.1 Stakeholder Consultation

| Stakeholder | Consulted | Outcome |
|-------------|-----------|---------|
| Data Protection Officer | **PENDING** | Appoint DPO per DPA s.24 |
| Legal Counsel | **PENDING** | Review this DPIA |
| ODPC (if high residual risk) | **PENDING** | Submit if required after mitigation assessment |
| End Users (representative sample) | **PENDING** | Gather feedback on consent flows |

---

## 8. DECISION & SIGN-OFF

### 8.1 Residual Risk Assessment

After implementing all technical and organizational safeguards:

| Risk Area | Initial Risk | Residual Risk | Acceptable? |
|-----------|-------------|---------------|------------|
| Data breach | HIGH | **LOW** | ✅ Yes |
| Unauthorized access | HIGH | **LOW** | ✅ Yes |
| Cross-border compliance | HIGH | **MEDIUM** | ⚠️ Pending SCCs |
| Consent validity | CRITICAL | **LOW** | ✅ Yes |
| Emergency failure | HIGH | **MEDIUM** | ⚠️ Pending offline testing |

### 8.2 Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Data Controller | _________________ | ____/____/2026 | _________ |
| Data Protection Officer | _________________ | ____/____/2026 | _________ |
| Chief Technology Officer | _________________ | ____/____/2026 | _________ |
| Legal Counsel | _________________ | ____/____/2026 | _________ |

### 8.3 Review Schedule

| Review Type | Frequency | Next Review |
|-------------|-----------|-------------|
| Full DPIA review | Annual | 2027-02-12 |
| Technical safeguards audit | Quarterly | 2026-05-12 |
| Consent mechanism review | Semi-annual | 2026-08-12 |
| Incident response drill | Annual | 2026-08-12 |

---

## APPENDIX: LEGAL BASIS MAPPING

| Processing Activity | Kenya DPA Basis | GDPR Basis (if applicable) |
|---------------------|----------------|---------------------------|
| Account creation | Consent (s.30(1)(a)) | Art. 6(1)(a) Consent |
| Medical data storage | Explicit consent (s.35) | Art. 9(2)(a) Explicit consent |
| Emergency SOS activation | Vital interest (s.30(1)(d)) | Art. 6(1)(d) Vital interest + Art. 9(2)(c) |
| QR scan by emergency responder | Vital interest (s.30(1)(d)) | Art. 6(1)(d) + Art. 9(2)(c) |
| SMS emergency notifications | Vital interest (s.30(1)(d)) | Art. 6(1)(d) Vital interest |
| Admin audit logging | Legitimate interest (s.30(1)(f)) | Art. 6(1)(f) Legitimate interest |
| QR scan logging | Legitimate interest (s.30(1)(f)) | Art. 6(1)(f) Legitimate interest |
| AI health guidance | Consent (s.30(1)(a)) | Art. 6(1)(a) Consent |

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-12  
**Next Review**: 2027-02-12
