import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, MapPin, Phone, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyIncident {
  id: string;
  status: string;
  triggered_at: string;
  location_lat: number | null;
  location_lng: number | null;
  emergency_contacts_notified: number;
}

const UserEmergency = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<EmergencyIncident[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setUser(profileData);
        setProfile(profileData);
      }

      // Check if admin
      const { data: adminData } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });
      if (adminData) setIsAdmin(adminData);

      // Fetch active incident
      const { data: activeData } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('triggered_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeData) {
        setActiveIncident({
          ...activeData,
          emergency_contacts_notified: 0
        } as EmergencyIncident);
      }

      // Fetch recent incidents
      const { data: recentData } = await supabase
        .from('emergency_incidents')
        .select('*')
        .eq('user_id', session.user.id)
        .order('triggered_at', { ascending: false })
        .limit(5);

      if (recentData) {
        setRecentIncidents(recentData.map((incident) => ({
          ...incident,
          emergency_contacts_notified: 0
        })) as EmergencyIncident[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationError('Could not access your location. Continuing without it.');
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError('Geolocation not supported on this device');
    }
  };

  const triggerEmergency = async () => {
    setTriggering(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Request location if not already obtained
      if (!location) {
        requestLocation();
      }

      // Get medical context from profile
      const medicalContext = {
        blood_type: (profile as any)?.blood_type || 'Unknown',
        allergies: (profile as any)?.allergies || [],
        medications: (profile as any)?.medications || [],
        chronic_conditions: (profile as any)?.chronic_conditions || [],
        primary_hospital: (profile as any)?.primary_hospital || 'Not specified'
      };

      // Insert emergency incident
      const { data: incidentData, error: incidentError } = await supabase
        .from('emergency_incidents')
        .insert({
          user_id: session.user.id,
          status: 'active',
          location_lat: location?.lat,
          location_lng: location?.lng,
          medical_context: medicalContext as any,
          triggered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (incidentError) throw incidentError;

      setActiveIncident({
        ...incidentData,
        emergency_contacts_notified: 0
      } as EmergencyIncident);
      setShowConfirmModal(false);

      // Notify emergency contacts (via Edge Function)
      await notifyEmergencyContacts(session.user.id, incidentData.id);

      toast.success('Emergency triggered! Notifying your emergency contacts...');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error triggering emergency:', error);
      toast.error(`Failed to trigger emergency: ${message}`);
    } finally {
      setTriggering(false);
    }
  };

  const notifyEmergencyContacts = async (userId: string, incidentId: string) => {
    try {
      // Fetch emergency contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: true });

      if (contactsError) throw contactsError;

      if (!contacts || contacts.length === 0) {
        toast.warning('No emergency contacts configured. Please add them in your profile.');
        return;
      }

      // Call Edge Function to send SMS notifications
      const { error: notifyError } = await supabase.functions.invoke('send-emergency-sms', {
        body: {
          userId,
          incidentId,
          contacts
        }
      });

      if (notifyError) {
        console.warn('SMS notification error:', notifyError);
        toast.warning('Emergency triggered but SMS notifications failed. Contacts can still see active emergency.');
      }
    } catch (error) {
      console.error('Error notifying contacts:', error);
    }
  };

  const resolveEmergency = async () => {
    if (!activeIncident) return;

    try {
      const { error } = await supabase
        .from('emergency_incidents')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', activeIncident.id);

      if (error) throw error;

      setActiveIncident(null);
      toast.success('Emergency marked as resolved');
      await fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to resolve emergency: ${message}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user} isAdmin={isAdmin}>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} isAdmin={isAdmin}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Emergency SOS</h1>
          <p className="text-muted-foreground">
            Trigger an emergency to alert your emergency contacts and responders
          </p>
        </div>

        {/* Active Emergency Alert */}
        {activeIncident && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Active Emergency in Progress</strong>
              <p className="mt-2">
                Triggered at {new Date(activeIncident.triggered_at).toLocaleString()}
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-3"
                onClick={resolveEmergency}
              >
                Mark as Resolved
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* SOS Button */}
        <Card className="border-2 border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Emergency SOS Button</CardTitle>
            <CardDescription>
              Tap the button below to trigger an emergency and alert your emergency contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Button
              size="lg"
              className="h-32 w-32 rounded-full text-2xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg"
              onClick={() => {
                requestLocation();
                setShowConfirmModal(true);
              }}
              disabled={!!activeIncident || triggering}
            >
              {triggering ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : activeIncident ? (
                'ACTIVE'
              ) : (
                'SOS'
              )}
            </Button>

            {activeIncident ? (
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-red-700">Emergency Active</p>
                <p className="text-xs text-muted-foreground">
                  Your emergency contacts have been notified
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground max-w-xs">
                Press and hold or tap the button to trigger an emergency. You will be asked to confirm.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-700">Confirm Emergency</DialogTitle>
              <DialogDescription>
                Are you sure you want to trigger an emergency? Your emergency contacts will be notified immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Location Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Location</span>
                </div>
                {location ? (
                  <p className="text-sm text-green-600">
                    ✓ Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                ) : locationError ? (
                  <p className="text-sm text-amber-600">{locationError}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Requesting location...</p>
                )}
              </div>

              {/* Emergency Contacts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Emergency Contacts</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your emergency contacts will receive SMS notifications
                </p>
              </div>

              {/* Medical Context */}
              <div className="spacString((profile as any)?.blood_type)3 rounded-md">
                <span className="text-sm font-semibold">Your Medical Info</span>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>Blood Type: {profile?.blood_type || 'Not provided'}</p>
                  <p>Allergies: {(profile?.allergies as string[])?.join(', ') || 'None listed'}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={triggering}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={triggerEmergency}
                disabled={triggering}
              >
                {triggering ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Triggering...
                  </>
                ) : (
                  'Confirm Emergency'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recent Incidents */}
        {recentIncidents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Emergencies
              </CardTitle>
              <CardDescription>Your emergency history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-start justify-between p-3 border rounded-md"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        {incident.status === 'active' ? (
                          <span className="text-red-600">🔴 Active</span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Resolved
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(incident.triggered_at).toLocaleString()}
                      </p>
                      {incident.location_lat && incident.location_lng && (
                        <p className="text-xs text-muted-foreground">
                          📍 {incident.location_lat.toFixed(4)}, {incident.location_lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What Happens When You Press SOS?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>✓ Your location is captured (if available)</p>
              <p>✓ Your medical profile is attached</p>
              <p>✓ Emergency contacts are notified via SMS</p>
              <p>✓ Admins are alerted to your emergency</p>
              <p>✓ You can mark it resolved when help arrives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">Manage your emergency contacts in your profile</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/profile')}>
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserEmergency;
