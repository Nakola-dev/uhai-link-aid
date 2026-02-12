import { useEffect, useState, useCallback } from 'react';
import AdminTabSkeleton from '@/components/admin/AdminTabSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/lib/admin-logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, MapPin, Clock, Activity, AlertTriangle, Search, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyLog {
  id: string;
  user_id: string;
  incident_type: string | null;
  severity: number | null;
  status: string | null;
  description: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  responder_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

interface AdminEmergencyLogsTabProps {
  onUpdate: () => void;
}

const getSeverityLabel = (severity: number | null): string => {
  if (severity === null) return 'unknown';
  if (severity >= 9) return 'critical';
  if (severity >= 7) return 'high';
  if (severity >= 4) return 'medium';
  return 'low';
};

const getSeverityColor = (severity: number | null): string => {
  if (severity === null) return 'text-muted-foreground';
  if (severity >= 9) return 'text-red-600';
  if (severity >= 7) return 'text-orange-600';
  return 'text-yellow-600';
};

export const AdminEmergencyLogsTab = ({ onUpdate }: AdminEmergencyLogsTabProps) => {
  const [logs, setLogs] = useState<EmergencyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EmergencyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ active: 0, total: 0, resolved: 0 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('emergency_incidents')
        .select(`
          id, user_id, incident_type, severity, status, description,
          location_lat, location_lng, location_address, responder_notes,
          created_at, updated_at,
          profiles!emergency_incidents_user_id_fkey(full_name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const incidents = (data || []) as EmergencyLog[];
      setLogs(incidents);
      setFilteredLogs(incidents);

      const active = incidents.filter(l => l.status === 'active' || l.status === 'escalated').length;
      const resolved = incidents.filter(l => l.status === 'resolved').length;
      setStats({ active, total: incidents.length, resolved });
    } catch (error) {
      console.error('Error fetching emergency logs:', error);
      toast.error('Failed to load emergency logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    let filtered = logs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        l =>
          l.description?.toLowerCase().includes(q) ||
          l.incident_type?.toLowerCase().includes(q) ||
          l.location_address?.toLowerCase().includes(q) ||
          l.profiles?.full_name?.toLowerCase().includes(q)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, statusFilter]);

  const handleExport = () => {
    exportToCSV(
      logs.map(log => ({
        id: log.id,
        type: log.incident_type ?? '',
        severity: log.severity ?? '',
        status: log.status ?? '',
        description: log.description ?? '',
        address: log.location_address ?? '',
        user: log.profiles?.full_name ?? '',
        created_at: log.created_at,
      })),
      'emergency_logs'
    );
    toast.success('Emergency logs exported');
  };

  if (loading) {
    return <AdminTabSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Emergencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <MapPin className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Logs
              </CardTitle>
              <CardDescription>Monitor and manage emergency incidents</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, type, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No emergency logs found</p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className={`h-5 w-5 mt-1 ${getSeverityColor(log.severity)}`}
                      />
                      <div>
                        <h4 className="font-semibold">
                          {log.incident_type || 'Unknown'} — {log.profiles?.full_name || 'Unknown User'}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.description || 'No description'}
                        </p>
                        {log.responder_notes && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Responder: {log.responder_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        log.status === 'resolved'
                          ? 'default'
                          : log.status === 'escalated'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {log.status || 'unknown'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    {log.location_address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {log.location_address}
                      </div>
                    )}
                    <Badge variant="outline">{getSeverityLabel(log.severity)}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
