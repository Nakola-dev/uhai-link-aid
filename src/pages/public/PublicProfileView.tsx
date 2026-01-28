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
import Layout from '@/components/shared/Layout';

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
                  <CardTitle className="text-2xl">{profile.full_name || 'Unknown'}</CardTitle>
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
                    <p className="font-medium">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <Droplet className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="font-medium">{profile.blood_type || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <Card className={profile.allergies?.length > 0 ? 'border-accent' : ''}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  <CardTitle>Allergies</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profile.allergies && profile.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy: string, index: number) => (
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
                {profile.medications && profile.medications.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.medications.map((medication: string, index: number) => (
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
                {profile.chronic_conditions && profile.chronic_conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.chronic_conditions.map((condition: string, index: number) => (
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
                {profile.emergency_contact_name ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium text-lg">{profile.emergency_contact_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-lg">{profile.emergency_contact_phone}</p>
                    </div>
                    {profile.emergency_contact_relationship && (
                      <div>
                        <p className="text-sm text-muted-foreground">Relationship</p>
                        <p className="font-medium">{profile.emergency_contact_relationship}</p>
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
            Last updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PublicProfileView;
