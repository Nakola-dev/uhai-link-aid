import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Heart, Loader2, MailCheck, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { hasRequiredConsents, recordConsents, syncPendingConsent } from '@/lib/consent';
import { blankToNull, formatMedicalList, parseMedicalList } from '@/lib/medical-lists';
import { EmergencyContact, saveEmergencyContacts } from '@/hooks/use-emergency-contacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';

type StepId = 'consent' | 'email' | 'basics' | 'medical' | 'contacts' | 'qr' | 'complete';

const STEP_COPY: Record<StepId, { label: string; title: string; description: string }> = {
  consent: { label: 'Consent', title: 'Your consent', description: 'We need your permission before storing health information.' },
  email: { label: 'Email', title: 'Confirm your email', description: 'We sent a confirmation link to your inbox.' },
  basics: { label: 'About you', title: 'About you', description: 'Helps responders identify you.' },
  medical: { label: 'Medical', title: 'Medical information', description: 'The most important details for responders.' },
  contacts: { label: 'Contacts', title: 'Emergency contacts', description: 'People to call and text in an emergency.' },
  qr: { label: 'QR ID', title: 'Your QR medical ID', description: 'How responders reach your information.' },
  complete: { label: 'Done', title: "You're all set", description: 'Your profile is ready.' },
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const blankContact = (): EmergencyContact => ({ name: '', phone: '', relationship: '', priority: null });

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [needsConsent, setNeedsConsent] = useState(false);
  const [needsEmailStep, setNeedsEmailStep] = useState(false);
  const [consentOnly, setConsentOnly] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentMedical, setConsentMedical] = useState(false);
  const [basics, setBasics] = useState({ full_name: '', phone: '', city: '', county: '' });
  const [medical, setMedical] = useState({ blood_type: '', allergies: '', medications: '', chronic_conditions: '', primary_hospital: '' });
  const [contacts, setContacts] = useState<EmergencyContact[]>([blankContact()]);

  const steps = useMemo<StepId[]>(
    () => consentOnly
      ? ['consent']
      : [
        ...(needsConsent ? (['consent'] as StepId[]) : []),
        ...(needsEmailStep ? (['email'] as StepId[]) : []),
        'basics', 'medical', 'contacts', 'qr', 'complete',
      ],
    [consentOnly, needsConsent, needsEmailStep]
  );
  const currentStep = steps[stepIndex];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        const uid = session.user.id;
        if (cancelled) return;
        setUserId(uid);
        setEmail(session.user.email || '');
        setNeedsEmailStep(session.user.app_metadata?.provider === 'email' && !session.user.email_confirmed_at);

        const [{ data: profile }, { data: savedContacts }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', uid).single(),
          supabase.from('emergency_contacts').select('id, name, phone, relationship, priority').eq('user_id', uid).order('priority'),
        ]);

        // Record consent given at sign-up (pending locally), then ask only if none is on record.
        try {
          await syncPendingConsent(uid);
        } catch {
          // Fall through: the consent step below will collect it again.
        }
        let consented = false;
        try {
          consented = await hasRequiredConsents(uid);
        } catch {
          // Can't verify (e.g. table unavailable): don't block already-onboarded users.
          consented = !!profile?.onboarding_completed;
        }
        if (cancelled) return;

        if (profile?.onboarding_completed) {
          if (consented) {
            navigate('/dashboard');
            return;
          }
          // Account predates consent capture: ask for consent only.
          setConsentOnly(true);
        }
        setNeedsConsent(!consented);

        if (profile) {
          setBasics({
            full_name: profile.full_name || '',
            phone: profile.phone || '',
            city: profile.city || '',
            county: profile.county || '',
          });
          setMedical({
            blood_type: profile.blood_type || '',
            allergies: formatMedicalList(profile.allergies),
            medications: formatMedicalList(profile.medications),
            chronic_conditions: formatMedicalList(profile.chronic_conditions),
            primary_hospital: profile.primary_hospital || '',
          });
        }
        if (savedContacts && savedContacts.length > 0) setContacts(savedContacts);
      } catch {
        toast.error('We could not load your profile. Check your connection and refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const saveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: basics.full_name.trim() || null,
        phone: blankToNull(basics.phone),
        city: blankToNull(basics.city),
        county: blankToNull(basics.county),
        blood_type: blankToNull(medical.blood_type),
        allergies: parseMedicalList(medical.allergies),
        medications: parseMedicalList(medical.medications),
        chronic_conditions: parseMedicalList(medical.chronic_conditions),
        primary_hospital: blankToNull(medical.primary_hospital),
      })
      .eq('id', userId);
    if (error) throw error;
  };

  const saveAndNext = async () => {
    if (currentStep === 'consent' && !(consentTerms && consentMedical)) {
      toast.error('Please tick both boxes to continue.');
      return;
    }
    if (currentStep === 'basics' && (!basics.full_name.trim() || !basics.phone.trim())) {
      toast.error('Your name and phone number are required.');
      return;
    }
    if (currentStep === 'medical' && !medical.blood_type) {
      toast.error('Choose your blood type, or "Unknown" if you are not sure.');
      return;
    }
    const filledContacts = contacts.filter((c) => c.name.trim() && c.phone.trim());
    if (currentStep === 'contacts' && filledContacts.length === 0) {
      toast.error('Add at least one emergency contact with a name and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      if (currentStep === 'consent') {
        await recordConsents(userId);
        if (consentOnly) {
          toast.success('Thank you — your consent has been recorded.');
          navigate('/dashboard');
          return;
        }
      }
      if (currentStep === 'basics' || currentStep === 'medical') await saveProfile();
      if (currentStep === 'contacts') await saveEmergencyContacts(userId, filledContacts);

      if (currentStep === 'complete') {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString() })
          .eq('id', userId);
        if (error) throw error;
        toast.success('Welcome to UhaiLink');
        navigate('/dashboard');
        return;
      }
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      toast.error(`That step wasn't saved: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const updateContact = (index: number, field: 'name' | 'phone' | 'relationship', value: string) =>
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="flex items-center justify-center py-32" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading your profile…</span>
        </div>
      </Layout>
    );
  }

  const copy = STEP_COPY[currentStep];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <Layout showFooter={false}>
      <div className="py-10 sm:py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
              <Heart className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Set up your medical ID</h1>
            <p className="text-muted-foreground">It takes about three minutes. You can change everything later.</p>
          </div>

          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Step {stepIndex + 1} of {steps.length}: {copy.label}</span>
              <span className="text-muted-foreground tabular-nums">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} aria-label="Setup progress" />
            <ol className="hidden sm:flex justify-between" aria-label="Setup steps">
              {steps.map((step, idx) => (
                <li key={step} className="flex flex-col items-center gap-1" aria-current={idx === stepIndex ? 'step' : undefined}>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    idx < stepIndex ? 'bg-primary text-primary-foreground'
                      : idx === stepIndex ? 'border-2 border-primary text-primary'
                        : 'bg-muted text-muted-foreground'}`}>
                    {idx < stepIndex ? <CheckCircle2 className="h-4 w-4" aria-label="Done" /> : idx + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">{STEP_COPY[step].label}</span>
                </li>
              ))}
            </ol>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{copy.title}</CardTitle>
              <CardDescription>{copy.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {currentStep === 'consent' && (
                <fieldset className="space-y-4">
                  <legend className="sr-only">Consent</legend>
                  <div className="flex items-start gap-3">
                    <Checkbox id="ob-consent-terms" checked={consentTerms} className="mt-0.5"
                      onCheckedChange={(v) => setConsentTerms(v === true)} />
                    <label htmlFor="ob-consent-terms" className="text-sm leading-snug">
                      I agree to the{' '}
                      <Link to="/terms-of-service" target="_blank" className="font-medium text-primary hover:underline">Terms of Service</Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" target="_blank" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="ob-consent-medical" checked={consentMedical} className="mt-0.5"
                      onCheckedChange={(v) => setConsentMedical(v === true)} />
                    <label htmlFor="ob-consent-medical" className="text-sm leading-snug">
                      I consent to UhaiLink processing my <strong>health information</strong> so it can be shown to
                      people who scan my QR code and sent to my emergency contacts when I trigger an SOS.
                    </label>
                  </div>
                </fieldset>
              )}

              {currentStep === 'email' && (
                <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
                  <MailCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm">
                    Open the link we sent to <strong>{email}</strong> to confirm your address. You can continue
                    setting up now and confirm later.
                  </p>
                </div>
              )}

              {currentStep === 'basics' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="full_name">Full name *</Label>
                    <Input id="full_name" autoComplete="name" required value={basics.full_name}
                      onChange={(e) => setBasics({ ...basics, full_name: e.target.value })} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone number *</Label>
                    <Input id="phone" type="tel" autoComplete="tel" required value={basics.phone} placeholder="+254 7XX XXX XXX"
                      onChange={(e) => setBasics({ ...basics, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City or town</Label>
                    <Input id="city" autoComplete="address-level2" value={basics.city} placeholder="Nairobi"
                      onChange={(e) => setBasics({ ...basics, city: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Input id="county" value={basics.county} placeholder="Nairobi County"
                      onChange={(e) => setBasics({ ...basics, county: e.target.value })} />
                  </div>
                </div>
              )}

              {currentStep === 'medical' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="blood_type">Blood type *</Label>
                    <Select value={medical.blood_type} onValueChange={(value) => setMedical({ ...medical, blood_type: value })}>
                      <SelectTrigger id="blood_type"><SelectValue placeholder="Select blood type" /></SelectTrigger>
                      <SelectContent>
                        {BLOOD_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">Separate multiple items with commas. Leave blank if none.</p>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input id="allergies" value={medical.allergies} placeholder="e.g. Penicillin, Peanuts"
                      onChange={(e) => setMedical({ ...medical, allergies: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medications">Current medications</Label>
                    <Input id="medications" value={medical.medications} placeholder="e.g. Metformin 500mg"
                      onChange={(e) => setMedical({ ...medical, medications: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conditions">Chronic conditions</Label>
                    <Input id="conditions" value={medical.chronic_conditions} placeholder="e.g. Diabetes, Asthma"
                      onChange={(e) => setMedical({ ...medical, chronic_conditions: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Primary hospital or clinic</Label>
                    <Input id="hospital" value={medical.primary_hospital} placeholder="e.g. Kenyatta National Hospital"
                      onChange={(e) => setMedical({ ...medical, primary_hospital: e.target.value })} />
                  </div>
                </div>
              )}

              {currentStep === 'contacts' && (
                <div className="space-y-4">
                  {contacts.map((contact, idx) => (
                    <fieldset key={contact.id ?? `new-${idx}`} className="rounded-lg border p-4 space-y-3">
                      <legend className="sr-only">Emergency contact {idx + 1}</legend>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{idx === 0 ? 'First to be contacted' : `Contact ${idx + 1}`}</p>
                        {contacts.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" aria-label={`Remove contact ${idx + 1}`}
                            onClick={() => setContacts((prev) => prev.filter((_, i) => i !== idx))}>
                            <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`name-${idx}`}>Name *</Label>
                          <Input id={`name-${idx}`} value={contact.name} onChange={(e) => updateContact(idx, 'name', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`phone-${idx}`}>Phone *</Label>
                          <Input id={`phone-${idx}`} type="tel" value={contact.phone} placeholder="+254 7XX XXX XXX"
                            onChange={(e) => updateContact(idx, 'phone', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`relationship-${idx}`}>Relationship</Label>
                          <Input id={`relationship-${idx}`} value={contact.relationship ?? ''} placeholder="Mother, spouse…"
                            onChange={(e) => updateContact(idx, 'relationship', e.target.value)} />
                        </div>
                      </div>
                    </fieldset>
                  ))}
                  <Button type="button" variant="outline" className="w-full" onClick={() => setContacts((prev) => [...prev, blankContact()])}>
                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                    Add another contact
                  </Button>
                </div>
              )}

              {currentStep === 'qr' && (
                <div className="space-y-4 text-sm">
                  <p>
                    Your QR medical ID will be ready on your dashboard. Anyone who scans it — a paramedic, a nurse, a
                    passer-by — sees your emergency information, so carry it where it can be found.
                  </p>
                  <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
                    <AlertCircle className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                    <p>If your code is ever lost or shared by mistake, issue a new one from the Medical ID page. The old one stops working immediately.</p>
                  </div>
                </div>
              )}

              {currentStep === 'complete' && (
                <div className="text-center space-y-3 py-4">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto" aria-hidden="true" />
                  <p className="text-muted-foreground">
                    Next: open your Medical ID to print or save your QR code. The SOS button is always one tap away.
                  </p>
                </div>
              )}
            </CardContent>

            <div className="flex justify-between gap-2 border-t bg-muted/40 px-6 py-4 rounded-b-xl">
              <Button variant="outline" onClick={() => setStepIndex((i) => Math.max(i - 1, 0))} disabled={stepIndex === 0 || submitting}>
                Back
              </Button>
              <Button onClick={saveAndNext} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
                {submitting ? 'Saving…' : currentStep === 'complete' ? 'Go to my dashboard' : 'Save and continue'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Onboarding;
