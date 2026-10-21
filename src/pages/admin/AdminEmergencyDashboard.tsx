import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Loader2, MapPin, Phone, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { logAdminAction } from '@/lib/admin-logger';
import { telHref } from '@/lib/emergency-numbers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import EmptyState from '@/components/common/EmptyState';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from '@/components/DashboardSkeleton';

type Status = 'active' | 'escalated' | 'resolved';

interface Incident {
  id: string;
  user_id: string;
  status: string;
  triggered_at: string | null;
  resolved_at: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  responder_notes: string | null;
  person: { full_name: string | null; phone: string | null; blood_type: string | null; allergies: string[] | null } | null;
}

const STATUS_META: Record<Status, { label: string; icon: typeof ShieldAlert; className: string }> = {
  active: { label: 'Active', icon: ShieldAlert, className: 'bg-destructive/10 text-destructive border-destructive/30' },
  escalated: { label: 'Escalated', icon: AlertTriangle, className: 'bg-warning/10 text-warning border-warning/30' },
  resolved: { label: 'Resolved', icon: CheckCircle2, className: 'bg-success/10 text-success border-success/30' },
};

const statusMeta = (status: string) => STATUS_META[status as Status] ?? { label: status, icon: AlertTriangle, className: 'bg-muted text-muted-foreground' };
const formatDateTime = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown');
const isToday = (iso: string | null) => !!iso && new Date(iso).toDateString() === new Date().toDateString();

const StatusBadge = ({ status }: { status: string }) => {
  const meta = statusMeta(status);
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn('gap-1', meta.className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

const AdminEmergencyDashboard = () => {
  const { profile, isAdmin } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('active');
  const [selected, setSelected] = useState<Incident | null>(null);
  const [form, setForm] = useState<{ status: Status; notes: string }>({ status: 'active', notes: '' });
  const [updating, setUpdating] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('emergency_incidents')
        .select('id, user_id, status, triggered_at, resolved_at, location_lat, location_lng, location_address, responder_notes')
        .order('triggered_at', { ascending: false })
        .limit(100);
      if (error) throw error;

      // user_id references auth.users, so profiles are loaded separately (admins can read all profiles).
      const userIds = [...new Set((data ?? []).map((i) => i.user_id))];
      const { data: people } = userIds.length
        ? await supabase.from('profiles').select('id, full_name, phone, blood_type, allergies').in('id', userIds)
        : { data: [] };
      const byId = new Map((people ?? []).map((p) => [p.id, p]));
      setIncidents((data ?? []).map((i) => ({ ...i, person: byId.get(i.user_id) ?? null })));
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return incidents.filter((i) =>
      (statusFilter === 'all' || i.status === statusFilter) &&
      (!query ||
        i.id.toLowerCase().includes(query) ||
        i.person?.full_name?.toLowerCase().includes(query) ||
        i.person?.phone?.includes(query) ||
        i.location_address?.toLowerCase().includes(query))
    );
  }, [incidents, searchQuery, statusFilter]);

  const openIncident = (incident: Incident) => {
    setSelected(incident);
    setForm({ status: (incident.status as Status) ?? 'active', notes: incident.responder_notes ?? '' });
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    const changes = {
      status: form.status,
      responder_notes: form.notes.trim() || null,
      resolved_at: form.status === 'resolved' ? selected.resolved_at ?? new Date().toISOString() : null,
    };
    const { error } = await supabase.from('emergency_incidents').update(changes).eq('id', selected.id);
    setUpdating(false);
    if (error) {
      toast.error(`Incident wasn't updated: ${error.message}`);
      return;
    }
    await logAdminAction({
      actionType: 'update',
      entityType: 'emergency_incident',
      entityId: selected.id,
      description: `Incident marked ${form.status}${selected.status !== form.status ? ` (was ${selected.status})` : ''}`,
      changes: { status: form.status, previous_status: selected.status, notes_changed: (selected.responder_notes ?? '') !== form.notes.trim() },
    });
    toast.success('Incident updated');
    setSelected(null);
    fetchIncidents();
  };

  if (loading) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton cards={3} rows={5} />
      </DashboardLayout>
    );
  }

  const activeCount = incidents.filter((i) => i.status === 'active').length;
  const escalatedCount = incidents.filter((i) => i.status === 'escalated').length;
  const resolvedToday = incidents.filter((i) => i.status === 'resolved' && isToday(i.resolved_at)).length;

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Emergency operations</h1>
            <p className="text-muted-foreground">SOS alerts from members. This page doesn't update by itself — refresh to see new alerts.</p>
          </div>
          <Button onClick={fetchIncidents} disabled={refreshing} variant="outline">
            <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} aria-hidden="true" />
            Refresh
          </Button>
        </div>

        {activeCount > 0 && (
          <div role="alert" className="flex items-center gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/10 p-4">
            <ShieldAlert className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <p className="font-medium">
              {activeCount} active {activeCount === 1 ? 'alert needs' : 'alerts need'} attention.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Active', value: activeCount, icon: ShieldAlert, tone: 'text-destructive' },
            { label: 'Escalated', value: escalatedCount, icon: AlertTriangle, tone: 'text-warning' },
            { label: 'Resolved today', value: resolvedToday, icon: CheckCircle2, tone: 'text-success' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className={cn('h-4 w-4', tone)} aria-hidden="true" />
                  {label}
                </p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="incident-search" className="sr-only">Search incidents</label>
          <Input
            id="incident-search"
            placeholder="Search by name, phone, ID or address…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-sm"
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="sm:w-48" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadFailed ? (
          <EmptyState icon={AlertTriangle} title="Incidents couldn't be loaded" action={<Button variant="outline" onClick={fetchIncidents}>Try again</Button>} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={CheckCircle2} title={incidents.length === 0 ? 'No SOS alerts yet' : 'No alerts match these filters'} />
        ) : (
          <ul className="space-y-3">
            {filtered.map((incident) => (
              <li key={incident.id}>
                <Card className={cn(incident.status === 'active' && 'border-2 border-destructive/50')}>
                  <CardContent className="grid gap-4 p-5 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{incident.person?.full_name || 'Unknown member'}</p>
                      {incident.person?.phone && (
                        <a href={telHref(incident.person.phone)} className="mt-0.5 flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          {incident.person.phone}
                        </a>
                      )}
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDateTime(incident.triggered_at)}
                      </p>
                    </div>
                    <div className="text-sm">
                      {incident.location_lat != null && incident.location_lng != null ? (
                        <a
                          href={`https://maps.google.com/?q=${incident.location_lat},${incident.location_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                        >
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          Open location in maps
                        </a>
                      ) : (
                        <p className="text-muted-foreground">Location not shared</p>
                      )}
                    </div>
                    <div className="text-sm">
                      <p>Blood type: <span className="font-medium">{incident.person?.blood_type || 'not recorded'}</span></p>
                      <p className="text-muted-foreground">
                        {incident.person?.allergies?.length ? `${incident.person.allergies.length} allerg${incident.person.allergies.length === 1 ? 'y' : 'ies'} recorded` : 'No allergies recorded'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                      <StatusBadge status={incident.status} />
                      <Button size="sm" variant="outline" onClick={() => openIncident(incident)}>Update</Button>
                    </div>
                    {incident.responder_notes && (
                      <p className="rounded-md bg-muted p-3 text-sm md:col-span-4">
                        <span className="font-medium">Notes: </span>{incident.responder_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update alert</DialogTitle>
            <DialogDescription>
              {selected?.person?.full_name || 'Unknown member'} · {formatDateTime(selected?.triggered_at ?? null)}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incident-status">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as Status })}>
                  <SelectTrigger id="incident-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident-notes">Notes</Label>
                <Textarea id="incident-notes" rows={4} value={form.notes} placeholder="What was done, who was contacted…"
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Medical summary</p>
                <p className="text-muted-foreground">Blood type: {selected.person?.blood_type || 'not recorded'}</p>
                <p className="text-muted-foreground">
                  Allergies: {selected.person?.allergies?.length ? selected.person.allergies.join(', ') : 'none recorded'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Save update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminEmergencyDashboard;
