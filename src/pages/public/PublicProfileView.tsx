import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Phone, 
  User, 
  Droplet, 
  AlertTriangle, 
  Pill, 
  Activity, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
import Layout from '@/components/Layout';

const PublicProfileView = () => {
  const { token } = useParams<{ token: string }>();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      if (!token) {
        setError('Invalid access token');
        return;
      }

      // Fetch QR token
      const { data: tokenData, error: tokenError } = await supabase
        .from('qr_access_tokens')
        .select('user_id, is_active')
        .eq('access_token', token)
        .maybeSingle();

      if (tokenError || !tokenData) {
        setError('Invalid or expired QR code');
        return;
      }

      if (!tokenData.is_active) {
        setError('This QR code has been deactivated');
        return;
      }

      // Rate limiting: Check recent scans from this IP (max 5 scans per minute)
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { data: recentScans } = await supabase
        .from('qr_scans')
        .select('id')
        .eq('ip_address', getClientIP())
        .gte('created_at', oneMinuteAgo)
        .limit(5);

      const accessGranted = !recentScans || recentScans.length < 5;

      // Log QR scan to audit trail
      await supabase.from('qr_scans').insert({
        qr_token_id: (tokenData as any)?.qr_token_id || token,
        ip_address: getClientIP(),
        user_agent: navigator.userAgent,
        access_granted: accessGranted,
        denial_reason: accessGranted ? null : 'Rate limit exceeded (5 scans/minute)',
        created_at: new Date().toISOString(),
      });

      if (!accessGranted) {
        setError('Rate limit exceeded. Too many scans from this location. Please try again in a moment.');
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tokenData.user_id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
    } catch (error: unknown) {
      setError('Failed to load profile information');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get client IP (best effort - won't work in all environments)
  const getClientIP = (): string => {
    try {
      return ((window as any).clientIP as string) || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading medical information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-center">Access Error</CardTitle>
              <CardDescription className="text-center">
                {error || 'Unable to access medical information'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Emergency Banner */}
          <Alert className="mb-6 border-accent bg-accent/10">
            <Heart className="h-5 w-5 text-accent" />
            <AlertDescription className="ml-2">
              <strong>Emergency Medical Information</strong> - This profile is intended for emergency use only
            </AlertDescription>
          </Alert>

          {/* Patient Information */}
          <Card className="mb-6 shadow-lg">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{(profile as any)?.full_name || 'Unknown'}</CardTitle>
                  <CardDescription>Patient Medical Profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{(profile as any)?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <Droplet className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="font-medium">{(profile as any)?.blood_type || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <Card className={((profile as any)?.allergies as any[])?.length > 0 ? 'border-accent' : ''}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  <CardTitle>Allergies</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {(((profile as any)?.allergies) as unknown[])?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(((profile as any)?.allergies) as string[])?.map((allergy: string, index: number) => (
                      <Badge key={index} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No known allergies</p>
                )}
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <CardTitle>Current Medications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {(((profile as any)?.medications) as unknown[])?.length > 0 ? (
                  <ul className="space-y-2">
                    {(((profile as any)?.medications) as string[])?.map((medication: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{medication}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No current medications</p>
                )}
              </CardContent>
            </Card>

            {/* Chronic Conditions */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle>Chronic Conditions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {(((profile as any)?.chronic_conditions) as unknown[])?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(((profile as any)?.chronic_conditions) as string[])?.map((condition: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No chronic conditions reported</p>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <CardTitle>Emergency Contact</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {(profile as any)?.emergency_contact_name ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium text-lg">{String((profile as any)?.emergency_contact_name || '')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-lg">{String((profile as any)?.emergency_contact_phone || '')}</p>
                    </div>
                    {(profile as any)?.emergency_contact_relationship && (
                      <div>
                        <p className="text-sm text-muted-foreground">Relationship</p>
                        <p className="font-medium">{String((profile as any)?.emergency_contact_relationship || '')}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No emergency contact provided</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Last Updated */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Last updated: {(profile as any)?.updated_at ? new Date((profile as any)?.updated_at as string).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PublicProfileView;
