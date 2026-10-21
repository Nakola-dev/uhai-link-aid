import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, IdCard, Loader2, MailCheck, Phone, RefreshCw, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { describeAuthError } from '@/lib/auth-errors';
import { clearPendingConsent, recordConsents, storePendingConsent } from '@/lib/consent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormField from '@/components/FormField';
import PasswordInput from '@/components/PasswordInput';
import Layout from '@/components/Layout';

const passwordRule = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Z]/, 'Add at least one uppercase letter')
  .regex(/[0-9]/, 'Add at least one number')
  .regex(/[^A-Za-z0-9]/, 'Add at least one symbol, such as ! or #');

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  password: passwordRule,
});
const resetSchema = z.object({ email: z.string().email('Enter a valid email address') });
const newPasswordSchema = z
  .object({ password: passwordRule, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ['confirm'] });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type ResetValues = z.infer<typeof resetSchema>;
type NewPasswordValues = z.infer<typeof newPasswordSchema>;

type View = 'tabs' | 'reset-request' | 'check-email' | 'update-password' | 'link-expired';

const PASSWORD_HINT = 'At least 8 characters, with an uppercase letter, a number and a symbol.';
const RECOVERY_REDIRECT = '/auth?mode=update-password';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Divider = () => (
  <div className="relative my-1">
    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-card px-2 text-muted-foreground">or</span>
    </div>
  </div>
);

const BrandPanel = () => (
  <div className="hidden lg:flex flex-col justify-between rounded-2xl bg-primary p-10 text-primary-foreground">
    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-widest">UhaiLink</p>
      <p className="font-display text-3xl font-bold leading-tight">
        Empowering you to act when every second counts.
      </p>
    </div>
    <ul className="space-y-5">
      {[
        { icon: IdCard, text: 'A QR medical ID that any phone camera can open — no app needed.' },
        { icon: ShieldCheck, text: 'Responders see your emergency information only, and you can replace your code at any time.' },
        { icon: Phone, text: 'One-tap SOS that texts the people you choose.' },
      ].map(({ icon: Icon, text }) => (
        <li key={text} className="flex gap-3">
          <Icon className="h-5 w-5 shrink-0 mt-0.5 opacity-90" aria-hidden="true" />
          <span className="leading-relaxed">{text}</span>
        </li>
      ))}
    </ul>
    <p className="text-sm font-medium">In an emergency, always call 999 or 112 first.</p>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recoveryRequested = searchParams.get('mode') === 'update-password' || window.location.hash.includes('type=recovery');
  const [view, setView] = useState<View>(recoveryRequested ? 'update-password' : 'tabs');
  const [tab, setTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'signin');
  const [checkEmailFor, setCheckEmailFor] = useState('');
  const [busy, setBusy] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentMedical, setConsentMedical] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const consented = consentTerms && consentMedical;

  const signInForm = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });
  const signUpForm = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });
  const newPasswordForm = useForm<NewPasswordValues>({ resolver: zodResolver(newPasswordSchema) });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setView('update-password');
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (recoveryRequested) {
        // The recovery link signs the user in; without a session the link was invalid or expired.
        if (!session) setView('link-expired');
        return;
      }
      if (session) navigate('/dashboard', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, recoveryRequested]);

  const requireConsent = () => {
    if (consented) return true;
    setConsentError(true);
    return false;
  };

  const handleSignUp = async (values: SignUpValues) => {
    if (!requireConsent()) return;
    setBusy(true);
    storePendingConsent();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName.trim() },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;

      if (data.session && data.user) {
        try {
          await recordConsents(data.user.id);
          clearPendingConsent();
        } catch {
          // Kept locally; onboarding records it before anything else.
        }
        navigate('/onboarding');
      } else {
        // Email confirmation required: consent is recorded on first sign-in.
        setCheckEmailFor(values.email);
        setView('check-email');
      }
    } catch (error) {
      clearPendingConsent();
      toast.error(describeAuthError(error, 'We could not create your account.'));
    } finally {
      setBusy(false);
    }
  };

  const handleSignIn = async (values: SignInValues) => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      toast.error(describeAuthError(error, 'We could not sign you in.'));
    } finally {
      setBusy(false);
    }
  };

  const handleResetRequest = async (values: ResetValues) => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}${RECOVERY_REDIRECT}`,
      });
      if (error) throw error;
      setCheckEmailFor(values.email);
      setView('check-email');
    } catch (error) {
      toast.error(describeAuthError(error, 'We could not send a reset link.'));
    } finally {
      setBusy(false);
    }
  };

  const handleNewPassword = async (values: NewPasswordValues) => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;
      toast.success('Your password has been changed.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(describeAuthError(error, 'We could not change your password.'));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async (isSignUp: boolean) => {
    if (isSignUp) {
      if (!requireConsent()) return;
      storePendingConsent();
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      if (isSignUp) clearPendingConsent();
      toast.error(describeAuthError(error, 'Google sign-in is not available right now.'));
    }
  };

  const heading = {
    tabs: tab === 'signup' ? 'Create your account' : 'Welcome back',
    'reset-request': 'Reset your password',
    'check-email': 'Check your email',
    'update-password': 'Choose a new password',
    'link-expired': 'This link has expired',
  }[view];

  const signUpErrors = signUpForm.formState.errors;
  const signInErrors = signInForm.formState.errors;

  return (
    <Layout showFooter={false}>
      <div className="container max-w-6xl py-8 sm:py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-stretch">
          <BrandPanel />

          <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
            <h1 className="font-display text-2xl font-bold tracking-tight mb-1">{heading}</h1>

            {view === 'tabs' && (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {tab === 'signup'
                    ? 'Set up your medical ID in a few minutes.'
                    : 'Sign in to manage your medical ID and SOS contacts.'}
                </p>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign in</TabsTrigger>
                    <TabsTrigger value="signup">Create account</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4" noValidate>
                      <FormField label="Email" error={signInErrors.email?.message}>
                        <Input type="email" autoComplete="email" inputMode="email" {...signInForm.register('email')} />
                      </FormField>
                      <FormField label="Password" error={signInErrors.password?.message}>
                        <PasswordInput autoComplete="current-password" {...signInForm.register('password')} />
                      </FormField>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setView('reset-request')}
                          className="text-sm font-medium text-primary underline-offset-4 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          Forgot your password?
                        </button>
                      </div>
                      <Button type="submit" className="w-full" disabled={busy}>
                        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                        Sign in
                      </Button>
                      <Divider />
                      <Button type="button" variant="outline" className="w-full" onClick={() => handleGoogle(false)}>
                        <GoogleIcon />
                        Continue with Google
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4" noValidate>
                      <FormField label="Full name" required error={signUpErrors.fullName?.message}>
                        <Input autoComplete="name" {...signUpForm.register('fullName')} />
                      </FormField>
                      <FormField label="Email" required error={signUpErrors.email?.message}>
                        <Input type="email" autoComplete="email" inputMode="email" {...signUpForm.register('email')} />
                      </FormField>
                      <FormField label="Password" required error={signUpErrors.password?.message} hint={PASSWORD_HINT}>
                        <PasswordInput autoComplete="new-password" {...signUpForm.register('password')} />
                      </FormField>

                      <fieldset
                        className={`space-y-3 rounded-lg border p-4 ${consentError && !consented ? 'border-destructive' : ''}`}
                        aria-describedby={consentError && !consented ? 'consent-error' : undefined}
                      >
                        <legend className="px-1 text-sm font-semibold">Your consent</legend>
                        <div className="flex items-start gap-3">
                          <Checkbox id="consent-terms" checked={consentTerms} className="mt-0.5"
                            onCheckedChange={(checked) => setConsentTerms(checked === true)} />
                          <label htmlFor="consent-terms" className="text-sm leading-snug">
                            I agree to the{' '}
                            <Link to="/terms-of-service" target="_blank" className="font-medium text-primary underline-offset-2 hover:underline">Terms of Service</Link>{' '}
                            and{' '}
                            <Link to="/privacy-policy" target="_blank" className="font-medium text-primary underline-offset-2 hover:underline">Privacy Policy</Link>.
                          </label>
                        </div>
                        <div className="flex items-start gap-3">
                          <Checkbox id="consent-medical" checked={consentMedical} className="mt-0.5"
                            onCheckedChange={(checked) => setConsentMedical(checked === true)} />
                          <label htmlFor="consent-medical" className="text-sm leading-snug">
                            I consent to UhaiLink processing my <strong>health information</strong> so it can be shown to
                            people who scan my QR code and sent to my emergency contacts when I trigger an SOS.
                          </label>
                        </div>
                        {consentError && !consented && (
                          <p id="consent-error" className="text-sm font-medium text-destructive" role="alert">
                            Both boxes are needed to create an account.
                          </p>
                        )}
                      </fieldset>

                      <Button type="submit" className="w-full" disabled={busy}>
                        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                        Create account
                      </Button>
                      <Divider />
                      <Button type="button" variant="outline" className="w-full" onClick={() => handleGoogle(true)}>
                        <GoogleIcon />
                        Sign up with Google
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </>
            )}

            {view === 'reset-request' && (
              <form onSubmit={resetForm.handleSubmit(handleResetRequest)} className="space-y-4 mt-2" noValidate>
                <p className="text-sm text-muted-foreground">Enter your account email and we'll send you a link to choose a new password.</p>
                <FormField label="Email" error={resetForm.formState.errors.email?.message}>
                  <Input type="email" autoComplete="email" inputMode="email" {...resetForm.register('email')} />
                </FormField>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                  Send reset link
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setView('tabs')}>
                  Back to sign in
                </Button>
              </form>
            )}

            {view === 'check-email' && (
              <div className="space-y-4 mt-2" role="status">
                <MailCheck className="h-10 w-10 text-primary" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  If an account exists for <strong className="text-foreground">{checkEmailFor}</strong>, we've sent it a
                  link. Open it on this device to continue. It can take a few minutes — check your spam folder too.
                </p>
                <Button variant="outline" className="w-full" onClick={() => { setView('tabs'); setTab('signin'); }}>
                  Back to sign in
                </Button>
              </div>
            )}

            {view === 'update-password' && (
              <form onSubmit={newPasswordForm.handleSubmit(handleNewPassword)} className="space-y-4 mt-2" noValidate>
                <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
                <FormField label="New password" required error={newPasswordForm.formState.errors.password?.message} hint={PASSWORD_HINT}>
                  <PasswordInput autoComplete="new-password" {...newPasswordForm.register('password')} />
                </FormField>
                <FormField label="Confirm new password" required error={newPasswordForm.formState.errors.confirm?.message}>
                  <PasswordInput autoComplete="new-password" {...newPasswordForm.register('confirm')} />
                </FormField>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />}
                  Save new password
                </Button>
              </form>
            )}

            {view === 'link-expired' && (
              <div className="space-y-4 mt-2" role="alert">
                <p className="text-sm text-muted-foreground">
                  Password reset links can only be used once and expire after a while. Request a new one.
                </p>
                <Button className="w-full" onClick={() => setView('reset-request')}>
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Request a new link
                </Button>
              </div>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              UhaiLink is not an emergency service.{' '}
              <Link to="/medical-disclaimer" className="text-primary underline-offset-2 hover:underline">
                Read the medical &amp; emergency disclaimer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
