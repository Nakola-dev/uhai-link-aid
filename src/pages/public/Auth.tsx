import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const CONSENT_VERSION = '1.0.0';

// --- Zod schemas ---

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type SignInValues = z.infer<typeof signInSchema>;

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
});
type SignUpValues = z.infer<typeof signUpSchema>;

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type ResetValues = z.infer<typeof resetSchema>;

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentMedicalData, setConsentMedicalData] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();

  // Form instances
  const signInForm = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });
  const signUpForm = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleSignUp = async (values: SignUpValues) => {
    if (!consentTerms || !consentMedicalData) {
      toast.error('You must agree to the Terms of Service, Privacy Policy, and medical data processing consent to create an account.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        const consents = [
          { consent_type: 'terms_of_service', consent_version: CONSENT_VERSION },
          { consent_type: 'privacy_policy', consent_version: CONSENT_VERSION },
          { consent_type: 'medical_data_processing', consent_version: CONSENT_VERSION },
        ];

        for (const consent of consents) {
          await supabase.from('user_consents').insert({
            user_id: data.user.id,
            ...consent,
            granted: true,
            granted_at: new Date().toISOString(),
          });
        }

        toast.success('Account created successfully! Welcome to UhaiLink.');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (values: SignInValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: ResetValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success('Password reset link sent! Check your email inbox.');
      setShowResetPassword(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send reset link';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
      toast.error(message);
    }
  };

  /** Helper to render inline field errors */
  const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="text-xs text-destructive mt-1">{message}</p> : null;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            </div>
            <CardTitle className="text-2xl">Welcome to UhaiLink</CardTitle>
            <CardDescription>
              Your emergency medical information platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                {showResetPassword ? (
                  <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                    <div className="text-center space-y-1 mb-2">
                      <h3 className="font-semibold">Reset your password</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your email and we'll send you a reset link
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        {...resetForm.register('email')}
                      />
                      <FieldError message={resetForm.formState.errors.email?.message} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Reset Link
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowResetPassword(false)}
                    >
                      Back to Sign In
                    </Button>
                  </form>
                ) : (
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      {...signInForm.register('email')}
                    />
                    <FieldError message={signInForm.formState.errors.email?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      {...signInForm.register('password')}
                    />
                    <FieldError message={signInForm.formState.errors.password?.message} />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => setShowResetPassword(true)}
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </Button>
                </form>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      {...signUpForm.register('fullName')}
                    />
                    <FieldError message={signUpForm.formState.errors.fullName?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      {...signUpForm.register('email')}
                    />
                    <FieldError message={signUpForm.formState.errors.email?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      {...signUpForm.register('password')}
                    />
                    <FieldError message={signUpForm.formState.errors.password?.message} />
                    <p className="text-xs text-muted-foreground">
                      Minimum 8 characters with uppercase, number, and special character
                    </p>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="consent-terms"
                        checked={consentTerms}
                        onCheckedChange={(checked) => setConsentTerms(checked === true)}
                      />
                      <label htmlFor="consent-terms" className="text-sm leading-snug cursor-pointer">
                        I agree to the{' '}
                        <Link to="/terms-of-service" className="text-primary hover:underline font-medium" target="_blank">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy-policy" className="text-primary hover:underline font-medium" target="_blank">
                          Privacy Policy
                        </Link>
                        . <span className="text-destructive">*</span>
                      </label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="consent-medical"
                        checked={consentMedicalData}
                        onCheckedChange={(checked) => setConsentMedicalData(checked === true)}
                      />
                      <label htmlFor="consent-medical" className="text-sm leading-snug cursor-pointer">
                        I consent to the processing of my{' '}
                        <strong>medical and health data</strong> for emergency response purposes, 
                        including sharing with emergency responders and contacts as described in the{' '}
                        <Link to="/privacy-policy" className="text-primary hover:underline font-medium" target="_blank">
                          Privacy Policy
                        </Link>
                        . <span className="text-destructive">*</span>
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !consentTerms || !consentMedicalData}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Read our{' '}
                <Link to="/medical-disclaimer" className="text-primary hover:underline">
                  Medical &amp; Emergency Disclaimer
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
