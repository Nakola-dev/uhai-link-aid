# INCIDENT RESPONSE PLAN

> **Platform**: UhaiLink — Emergency Medical QR Code Platform  
> **Version**: 1.0  
> **Date**: 2026-02-12  
> **Classification**: CONFIDENTIAL  
> **Owner**: Engineering & Security Team

---

## 1. PURPOSE & SCOPE

This Incident Response Plan (IRP) defines the procedures for detecting, responding to, containing, and recovering from security incidents and data breaches affecting the UhaiLink platform.

### Scope
- All UhaiLink production systems (Supabase backend, frontend hosting, Edge Functions)
- All user data (personal, medical, emergency)
- Third-party integrations (Africa's Talking, OpenRouter)
- Internal admin systems

### Regulatory Context
- **Kenya Data Protection Act 2019, Section 43**: Mandates notification to the Office of the Data Protection Commissioner (ODPC) within **72 hours** of becoming aware of a data breach
- **GDPR Article 33-34**: 72-hour notification to supervisory authority; notification to data subjects if high risk

---

## 2. INCIDENT CLASSIFICATION

### Severity Levels

| Level | Name | Description | Response Time | Examples |
|-------|------|-------------|---------------|----------|
| **P1** | Critical | Active data breach, system compromise, complete service outage | **15 minutes** | Database breach, auth bypass, medical data exposed, total platform outage |
| **P2** | High | Significant security event, partial outage affecting core features | **1 hour** | Failed admin login attempts (brute force), Edge Function compromise, emergency SOS failure |
| **P3** | Medium | Contained security event, non-critical service degradation | **4 hours** | Suspicious QR scan patterns, elevated error rates, single user account compromise |
| **P4** | Low | Minor anomaly, potential vulnerability discovered | **24 hours** | Dependency vulnerability alert, failed login spike, unusual traffic pattern |

### Incident Categories

| Category | Definition |
|----------|------------|
| **Data Breach** | Unauthorized access to, disclosure of, or loss of personal/medical data |
| **System Compromise** | Unauthorized access to infrastructure, admin accounts, or backend services |
| **Service Disruption** | Platform outage or degradation affecting user access to emergency features |
| **Abuse/Fraud** | Misuse of platform features (fake emergency activations, spam) |
| **Vulnerability** | Discovery of exploitable security weakness |

---

## 3. INCIDENT RESPONSE TEAM

### Core Team

| Role | Responsibility | Contact |
|------|---------------|---------|
| **Incident Commander (IC)** | Overall incident ownership, decision-making, external communication | CTO / Engineering Lead |
| **Technical Lead** | Root cause analysis, containment, remediation | Senior Engineer |
| **Communications Lead** | User notifications, ODPC reporting, press | Operations / Legal |
| **Data Protection Officer** | Regulatory compliance, DPIA impact assessment | DPO |

### Escalation Matrix

```
P4 (Low)     → Technical Lead → Resolve within 24h
P3 (Medium)  → Technical Lead + IC → Resolve within 4h
P2 (High)    → IC + Technical Lead + Communications → Resolve within 1h
P1 (Critical) → Full team activation → All hands, 15-min response
```

---

## 4. RESPONSE PROCEDURES

### Phase 1: Detection & Identification (0-15 minutes)

**Detection Sources**:
- Supabase Dashboard alerts (auth failures, database errors)
- Application error monitoring (ErrorBoundary reports)
- User reports (support channels)
- Admin audit log anomalies (via AdminAuditLogsTab)
- Third-party security advisories (GitHub Dependabot, npm audit)
- Core Web Vitals degradation

**Actions**:
1. Log the incident with timestamp, source, and initial assessment
2. Classify severity level (P1-P4)
3. Notify appropriate team members per escalation matrix
4. Create incident channel (Slack/Teams/Discord) for P1-P2
5. Begin evidence preservation (do NOT modify logs)

### Phase 2: Containment (15 minutes - 2 hours)

**Immediate Containment (P1-P2)**:
- [ ] Revoke compromised credentials (Supabase service role key, API keys)
- [ ] Disable affected user accounts via admin dashboard (suspend feature)
- [ ] Enable Supabase maintenance mode if full compromise
- [ ] Block suspicious IPs at hosting/CDN level
- [ ] Rotate all secrets: `OPENROUTER_API_KEY`, `AFRICAS_TALKING_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**For Data Breach**:
- [ ] Identify affected data scope (which tables, which users)
- [ ] Query `admin_logs` and `qr_scans` for unauthorized access patterns
- [ ] Determine if medical data was accessed
- [ ] Preserve database snapshots for forensic analysis

**For System Compromise**:
- [ ] Revoke all active sessions: `supabase.auth.admin.deleteUser()` is NOT available; instead rotate JWT secret in Supabase Dashboard
- [ ] Review recent admin actions in `admin_logs`
- [ ] Check for unauthorized RLS policy changes
- [ ] Review Edge Function deployment history

### Phase 3: Eradication (2-24 hours)

- [ ] Identify root cause through log analysis
- [ ] Patch the vulnerability
- [ ] Remove any unauthorized access, malicious code, or backdoors
- [ ] Verify fix in staging/development environment
- [ ] Deploy fix to production
- [ ] Re-enable affected services

### Phase 4: Recovery (24-72 hours)

- [ ] Restore normal operations
- [ ] Monitor closely for recurrence (increased logging)
- [ ] Verify data integrity (compare pre/post incident)
- [ ] Re-enable suspended user accounts after verification
- [ ] Confirm all third-party integrations are functioning

### Phase 5: Post-Incident (72 hours - 2 weeks)

- [ ] Conduct blameless post-mortem
- [ ] Document timeline, root cause, impact, and resolution
- [ ] Update this IRP with lessons learned
- [ ] Implement preventive measures
- [ ] Brief stakeholders

---

## 5. NOTIFICATION PROCEDURES

### 5.1 Regulatory Notification (Mandatory)

**Kenya ODPC** — Within **72 hours** of breach awareness:

| Field | Content |
|-------|---------|
| Data Controller | UhaiLink Limited |
| Nature of breach | [Description of what happened] |
| Categories of data | Personal data, sensitive medical data |
| Approximate records affected | [Number] |
| Contact | Data Protection Officer |
| Consequences | [Assessment of likely impact] |
| Measures taken | [Containment and remediation actions] |

**File at**: [ODPC Breach Notification Portal](https://www.odpc.go.ke)

### 5.2 Data Subject Notification

Required when breach poses **high risk** to individuals (e.g., medical data exposure):

**Template**:
```
Subject: Important Security Notice from UhaiLink

Dear [Name],

We are writing to inform you of a security incident that may have 
affected your account and personal information on UhaiLink.

What happened: [Brief description]
When: [Date/time range]
What data was involved: [Specific data categories]
What we've done: [Actions taken]
What you should do: [Recommended user actions]

- Change your password immediately at [link]
- Review your emergency contacts
- Monitor for unusual activity

If you have questions, contact us at privacy@uhailink.com.

Sincerely,
UhaiLink Security Team
```

### 5.3 Internal Notification

| Audience | When | Method |
|----------|------|--------|
| Engineering team | Immediately (P1-P2) | Incident channel + phone |
| Management | Within 1 hour (P1-P2) | Email + meeting |
| All staff | Within 24 hours (P1) | Company-wide email |
| Board/investors | Within 48 hours (P1) | Formal briefing |

---

## 6. SPECIFIC PLAYBOOKS

### Playbook A: Medical Data Exposure

**Trigger**: Unauthorized access to `profiles` table (medical fields), `emergency_contacts`, or QR public profile views by unauthorized party.

1. Immediately assess scope: How many profiles accessed?
2. Check `qr_scans` table for anomalous scan patterns
3. Check `data_access_logs` for unauthorized queries
4. If via QR token: revoke affected tokens (`qr_access_tokens`)
5. Notify affected users within 24 hours
6. File ODPC notification within 72 hours
7. **Note**: Medical data exposure triggers MANDATORY user notification

### Playbook B: Emergency SOS System Failure

**Trigger**: Emergency SOS feature fails to send notifications.

1. Check Edge Function logs (`send-emergency-sms`)
2. Verify Africa's Talking API status
3. Test SMS delivery manually
4. If SMS provider down: activate backup notification channel (email)
5. Post status update to users
6. **Critical**: This is a life-safety system — escalate to P1 immediately

### Playbook C: Admin Account Compromise

**Trigger**: Unauthorized admin access detected.

1. Immediately suspend the compromised admin account
2. Review all admin actions in `admin_logs` since compromise
3. Reverse any unauthorized changes (user suspensions, data modifications)
4. Rotate admin credentials
5. Review `user_roles` table for unauthorized role changes
6. Enable enhanced monitoring on all admin accounts

### Playbook D: Service Worker / PWA Compromise

**Trigger**: Malicious service worker deployed or cache poisoning detected.

1. Deploy new service worker version to force update
2. Clear all cached responses via `caches.delete()`
3. Revoke old service worker registration
4. Verify manifest integrity
5. Check for unauthorized modifications to build pipeline

---

## 7. TOOLS & ACCESS

### Incident Response Toolkit

| Tool | Purpose | Access |
|------|---------|--------|
| Supabase Dashboard | Database inspection, auth management, logs | Admin credentials |
| Supabase CLI | Migration management, function deployment | Local dev setup |
| Git history | Code change audit | Repository access |
| Edge Function logs | API call inspection | Supabase Dashboard |
| Browser DevTools | Client-side debugging | Any browser |
| Admin Dashboard (`/admin`) | User management, audit logs, analytics | Admin account |

### Key Supabase Commands

```bash
# Check recent auth events
supabase db dump --schema auth

# View edge function logs
supabase functions logs send-emergency-sms

# Force password reset for user
# (via Supabase Dashboard → Authentication → Users → Reset password)

# Rotate service role key
# (via Supabase Dashboard → Settings → API → Regenerate)
```

---

## 8. TESTING & REVIEW

### Tabletop Exercise Schedule

| Exercise | Frequency | Scenario |
|----------|-----------|----------|
| Data breach simulation | Semi-annual | Medical data leaked via compromised QR token |
| System outage drill | Annual | Full platform outage during peak hours |
| Admin compromise drill | Annual | Rogue admin accessing user medical data |
| Communication drill | Semi-annual | Practice ODPC notification workflow |

### Plan Review

| Review Type | Frequency | Owner |
|-------------|-----------|-------|
| Full IRP review | Annual | Incident Commander |
| Contact information update | Quarterly | All team members |
| Playbook validation | After each incident | Technical Lead |
| Tool access verification | Quarterly | Technical Lead |

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-12  
**Next Review**: 2026-08-12  
**Approved By**: _________________ (CTO)
