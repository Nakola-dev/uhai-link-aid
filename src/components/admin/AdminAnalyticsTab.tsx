import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CheckCircle2, Download, QrCode, RefreshCw, ShieldAlert, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminTabSkeleton from '@/components/admin/AdminTabSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/lib/admin-logger';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface AdminAnalyticsTabProps {
  onUpdate: () => void;
}

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalEmergencies: number;
  activeEmergencies: number;
  totalQRTokens: number;
  activeQRTokens: number;
}

interface MonthCount {
  month: string;
  profiles: number;
}

// Single series → one colour, no legend (the card title names it).
const chartConfig: ChartConfig = {
  profiles: { label: 'Profiles', color: 'hsl(var(--primary))' },
};

// Status meaning is carried by reserved status colours plus an icon and a label — never colour alone.
const STATUS_META: Record<string, { label: string; icon: typeof ShieldAlert; className: string }> = {
  active: { label: 'Active', icon: ShieldAlert, className: 'text-destructive' },
  escalated: { label: 'Escalated', icon: AlertTriangle, className: 'text-warning' },
  resolved: { label: 'Resolved', icon: CheckCircle2, className: 'text-success' },
};

const monthKey = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

export const AdminAnalyticsTab = (_props: AdminAnalyticsTabProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthly, setMonthly] = useState<MonthCount[]>([]);
  const [byStatus, setByStatus] = useState<Array<{ status: string; count: number }>>([]);
  const [showTable, setShowTable] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setRefreshing(true);
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5, 1);

      const [usersRes, orgsRes, emergenciesRes, activeRes, qrTotalRes, qrActiveRes, profilesRes, incidentsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('emergency_organizations').select('*', { count: 'exact', head: true }),
        supabase.from('emergency_incidents').select('*', { count: 'exact', head: true }),
        supabase.from('emergency_incidents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('qr_access_tokens').select('*', { count: 'exact', head: true }),
        supabase.from('qr_access_tokens').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('updated_at').gte('updated_at', sixMonthsAgo.toISOString()),
        supabase.from('emergency_incidents').select('status'),
      ]);
      const failed = [usersRes, orgsRes, emergenciesRes, activeRes, qrTotalRes, qrActiveRes, profilesRes, incidentsRes].find((r) => r.error);
      if (failed?.error) throw failed.error;

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalOrganizations: orgsRes.count ?? 0,
        totalEmergencies: emergenciesRes.count ?? 0,
        activeEmergencies: activeRes.count ?? 0,
        totalQRTokens: qrTotalRes.count ?? 0,
        activeQRTokens: qrActiveRes.count ?? 0,
      });

      // profiles has no created_at column, so this counts profiles by the month they were last updated.
      const months = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i, 1);
        months.set(monthKey(d), 0);
      }
      for (const p of profilesRes.data ?? []) {
        if (!p.updated_at) continue;
        const key = monthKey(new Date(p.updated_at));
        if (months.has(key)) months.set(key, (months.get(key) ?? 0) + 1);
      }
      setMonthly(Array.from(months, ([month, profiles]) => ({ month, profiles })));

      const statuses = new Map<string, number>([['active', 0], ['escalated', 0], ['resolved', 0]]);
      for (const incident of incidentsRes.data ?? []) {
        const status = incident.status || 'unknown';
        statuses.set(status, (statuses.get(status) ?? 0) + 1);
      }
      setByStatus(Array.from(statuses, ([status, count]) => ({ status, count })));
    } catch {
      toast.error('Analytics could not be loaded');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = () => {
    if (!stats) return;
    exportToCSV(
      [
        { metric: 'Registered users', value: stats.totalUsers },
        { metric: 'Organisations', value: stats.totalOrganizations },
        { metric: 'Emergencies (all time)', value: stats.totalEmergencies },
        { metric: 'Emergencies (active)', value: stats.activeEmergencies },
        { metric: 'QR codes (all)', value: stats.totalQRTokens },
        { metric: 'QR codes (active)', value: stats.activeQRTokens },
        ...monthly.map((m) => ({ metric: `Profiles last updated ${m.month}`, value: m.profiles })),
        ...byStatus.map((s) => ({ metric: `Emergencies ${s.status}`, value: s.count })),
      ],
      'platform_analytics'
    );
    toast.success('Analytics exported');
  };

  if (loading) return <AdminTabSkeleton rows={6} />;

  if (!stats) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center space-y-3" role="alert">
        <p className="font-medium">Analytics could not be loaded.</p>
        <Button variant="outline" onClick={fetchAnalytics}>Try again</Button>
      </div>
    );
  }

  const tiles = [
    { label: 'Registered users', value: stats.totalUsers, icon: Users },
    { label: 'Organisations', value: stats.totalOrganizations, icon: Building2 },
    { label: 'Active QR codes', value: stats.activeQRTokens, sub: `${stats.totalQRTokens} issued in total`, icon: QrCode },
    { label: 'Emergencies', value: stats.totalEmergencies, sub: `${stats.activeEmergencies} active now`, icon: ShieldAlert },
  ];

  return (
    <div className={cn('space-y-6 transition-opacity duration-base', refreshing && 'opacity-60')} aria-busy={refreshing}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={refreshing}>
          <RefreshCw className={cn('mr-1.5 h-4 w-4', refreshing && 'animate-spin')} aria-hidden="true" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, sub, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-2 text-3xl font-semibold">{value.toLocaleString()}</p>
              {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-base">Profiles by month of last update</CardTitle>
              <CardDescription>Last 6 months. Profiles have no sign-up date, so this reflects recent activity, not new users.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowTable((v) => !v)} aria-pressed={showTable}>
              {showTable ? 'Show chart' : 'Show table'}
            </Button>
          </CardHeader>
          <CardContent>
            {showTable ? (
              <table className="w-full text-sm">
                <caption className="sr-only">Profiles by month of last update</caption>
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th scope="col" className="py-2 font-medium">Month</th>
                    <th scope="col" className="py-2 text-right font-medium">Profiles</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.month} className="border-b last:border-0">
                      <td className="py-2">{m.month}</td>
                      <td className="py-2 text-right tabular-nums">{m.profiles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <ChartContainer config={chartConfig} className="h-[260px] w-full" aria-label={`Bar chart: ${monthly.map((m) => `${m.month} ${m.profiles}`).join(', ')}`} role="img">
                <BarChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: 'hsl(var(--border))' }} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={40} />
                  <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideIndicator />} />
                  <Bar dataKey="profiles" fill="var(--color-profiles)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Emergencies by status</CardTitle>
            <CardDescription>All recorded SOS alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {byStatus.map(({ status, count }) => {
                const meta = STATUS_META[status] ?? { label: status, icon: AlertTriangle, className: 'text-muted-foreground' };
                const Icon = meta.icon;
                return (
                  <li key={status} className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className={cn('h-4 w-4', meta.className)} aria-hidden="true" />
                      {meta.label}
                    </span>
                    <span className="text-xl font-semibold">{count}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
