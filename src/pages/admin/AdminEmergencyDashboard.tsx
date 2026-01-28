import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, MapPin, Phone, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmergencyIncident {
  id: string;
  user_id: string;
  incident_type?: string;
  severity: number;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  medical_context?: Record<string, unknown>;
  description?: string;
  status: 'active' | 'resolved' | 'escalated';
  triggered_at: string;
  resolved_at?: string;
  responder_notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    phone?: string;
    blood_type?: string;
    allergies?: string[];
  };
}

interface UpdateFormData {
  status: 'active' | 'resolved' | 'escalated';
  responder_notes: string;
}

const AdminEmergencyDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<EmergencyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved' | 'escalated'>('active');
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [updateForm, setUpdateForm] = useState<UpdateFormData>({ status: 'active', responder_notes: '' });
  const [updating, setUpdating] = useState(false);

  // Check admin access and load incidents
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate('/auth');
          return;
        }

        // Check admin status - role is an enum field
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role !== 'admin') {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have admin permissions',
          });
          navigate('/dashboard');
          return;
        }

        setIsAdmin(true);

        // Load incidents with profile data
        await fetchIncidents();
      } catch (error) {
        console.error('Error checking admin access:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to verify admin access',
        });
        navigate('/dashboard');
      }
    };

    loadData();
  }, [navigate, toast]);

  // Fetch incidents from Supabase
  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select(`
          *,
          profiles:user_id (
            full_name,
            phone,
            blood_type,
            allergies
          )
        `)
        .order('triggered_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setIncidents(data as EmergencyIncident[]);
    } catch (error) {
      console.error('Error loading incidents:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load emergency incidents',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter incidents based on search and status
  useEffect(() => {
    let filtered = incidents;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.id.toLowerCase().includes(query) ||
          i.profiles?.full_name?.toLowerCase().includes(query) ||
          i.profiles?.phone?.includes(query) ||
          i.location_address?.toLowerCase().includes(query)
      );
    }

    setFilteredIncidents(filtered);
  }, [incidents, searchQuery, statusFilter]);

  // Refresh incidents
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIncidents();
  };

  // Update incident
  const handleUpdateIncident = async () => {
    if (!selectedIncident) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('emergency_incidents')
        .update({
          status: updateForm.status,
          responder_notes: updateForm.responder_notes,
          resolved_at:
            updateForm.status === 'resolved'
              ? new Date().toISOString()
              : selectedIncident.resolved_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedIncident.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Incident updated successfully',
      });

      setSelectedIncident(null);
      setUpdateForm({ status: 'active', responder_notes: '' });
      await fetchIncidents();
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update incident',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Open incident details
  const handleOpenIncident = (incident: EmergencyIncident) => {
    setSelectedIncident(incident);
    setUpdateForm({
      status: incident.status,
      responder_notes: incident.responder_notes || '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'escalated':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-red-100 text-red-800';
    if (severity >= 5) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const activeCount = incidents.filter((i) => i.status === 'active').length;
  const escalatedCount = incidents.filter((i) => i.status === 'escalated').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Emergency Management Dashboard</h1>
          <p className="text-muted-foreground">Monitor and respond to emergency incidents in real-time</p>
        </div>

        {/* Alert for active emergencies */}
        {activeCount > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{activeCount} active emergency incident(s)</strong> require immediate attention
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-600">Active Emergencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently being handled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-600">Escalated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{escalatedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Require escalation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-green-600">Resolved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{resolvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, phone, ID, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>

              <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="escalated">Escalated Only</SelectItem>
                  <SelectItem value="resolved">Resolved Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <div className="space-y-3">
          {filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  {incidents.length === 0 ? 'No emergency incidents yet' : 'No incidents match your filters'}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredIncidents.map((incident) => (
              <Card key={incident.id} className={incident.status === 'active' ? 'border-red-300 border-2' : ''}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* User Info */}
                    <div>
                      <p className="text-xs text-muted-foreground">User</p>
                      <p className="font-semibold">{incident.profiles?.full_name || 'Unknown'}</p>
                      {incident.profiles?.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {incident.profiles.phone}
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      {incident.location_lat && incident.location_lng ? (
                        <>
                          <p className="font-semibold flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {incident.location_lat.toFixed(4)}, {incident.location_lng.toFixed(4)}
                          </p>
                          {incident.location_address && (
                            <p className="text-sm text-muted-foreground mt-1">{incident.location_address}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not provided</p>
                      )}
                    </div>

                    {/* Medical Info */}
                    <div>
                      <p className="text-xs text-muted-foreground">Medical</p>
                      <p className="font-semibold">
                        {incident.profiles?.blood_type || 'Unknown blood type'}
                      </p>
                      {incident.profiles?.allergies && incident.profiles.allergies.length > 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          ⚠️ {incident.profiles.allergies.length} allergies
                        </Badge>
                      )}
                    </div>

                    {/* Status & Time */}
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3" />
                        {new Date(incident.triggered_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Responder Notes */}
                  {incident.responder_notes && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Responder Notes</p>
                      <p className="text-sm">{incident.responder_notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => handleOpenIncident(incident)} variant="outline" className="w-full">
                        View Details & Update
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Emergency Incident</DialogTitle>
                        <DialogDescription>
                          Update the status and notes for this incident
                        </DialogDescription>
                      </DialogHeader>

                      {selectedIncident?.id === incident.id && (
                        <div className="space-y-4">
                          {/* Status */}
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={updateForm.status} onValueChange={(value: string) => setUpdateForm({ ...updateForm, status: value as UpdateFormData['status'] })}>
                              <SelectTrigger id="status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="escalated">Escalated</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Responder Notes */}
                          <div>
                            <Label htmlFor="notes">Responder Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add notes about the response or resolution..."
                              value={updateForm.responder_notes}
                              onChange={(e) =>
                                setUpdateForm({ ...updateForm, responder_notes: e.target.value })
                              }
                              rows={4}
                            />
                          </div>

                          {/* User Details */}
                          <div className="border-t pt-4">
                            <p className="text-sm font-semibold mb-2">User Medical Profile</p>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              <p>
                                <strong>Blood Type:</strong> {incident.profiles?.blood_type || 'Unknown'}
                              </p>
                              <p>
                                <strong>Allergies:</strong>{' '}
                                {incident.profiles?.allergies && incident.profiles.allergies.length > 0
                                  ? incident.profiles.allergies.join(', ')
                                  : 'None listed'}
                              </p>
                            </div>
                          </div>

                          {/* Save Button */}
                          <Button
                            onClick={handleUpdateIncident}
                            disabled={updating}
                            className="w-full"
                          >
                            {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEmergencyDashboard;
