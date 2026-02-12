import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/shared/Layout';

const CONSENT_VERSION = '1.0.0';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentMedicalData, setConsentMedicalData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentTerms || !consentMedicalData) {
      toast.error('You must agree to the Terms of Service, Privacy Policy, and medical data processing consent to create an account.');
      return;
    }

    // Client-side password strength validation
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error('Password must contain at least one number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error('Password must contain at least one special character.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Record consent grants
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
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
