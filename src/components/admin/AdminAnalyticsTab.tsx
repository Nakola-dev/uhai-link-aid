import { useEffect, useState, useCallback } from 'react';
import AdminTabSkeleton from '@/components/admin/AdminTabSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/lib/admin-logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Activity, QrCode, Download, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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

interface RegistrationData {
  month: string;
  users: number;
}

interface EmergencyByStatus {
  status: string;
  count: number;
}

const chartConfig: ChartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(var(--primary))',
  },
  emergencies: {
    label: 'Emergencies',
    color: 'hsl(var(--destructive))',
  },
  active: {
    label: 'Active',
    color: 'hsl(220 70% 50%)',
  },
  escalated: {
    label: 'Escalated',
    color: 'hsl(40 90% 50%)',
  },
  resolved: {
    label: 'Resolved',
    color: 'hsl(142 70% 45%)',
  },
};

const COLORS = ['hsl(220, 70%, 50%)', 'hsl(40, 90%, 50%)', 'hsl(142, 70%, 45%)', 'hsl(0, 70%, 50%)'];

export const AdminAnalyticsTab = ({ onUpdate }: AdminAnalyticsTabProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalEmergencies: 0,
    activeEmergencies: 0,
    totalQRTokens: 0,
    activeQRTokens: 0,
  });
  const [registrationData, setRegistrationData] = useState<RegistrationData[]>([]);
  const [emergencyByStatus, setEmergencyByStatus] = useState<EmergencyByStatus[]>([]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Parallel queries for dashboard stats
      const [
        usersRes,
        orgsRes,
        emergenciesRes,
        activeEmergenciesRes,
        qrTotalRes,
        qrActiveRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('emergency_organizations').select('*', { count: 'exact', head: true }),
        supabase.from('emergency_incidents').select('*', { count: 'exact', head: true }),
        supabase.from('emergency_incidents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('qr_access_tokens').select('*', { count: 'exact', head: true }),
        supabase.from('qr_access_tokens').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalOrganizations: orgsRes.count ?? 0,
        totalEmergencies: emergenciesRes.count ?? 0,
        activeEmergencies: activeEmergenciesRes.count ?? 0,
        totalQRTokens: qrTotalRes.count ?? 0,
        activeQRTokens: qrActiveRes.count ?? 0,
      });

      // User registration trend — last 6 months
      // We group profiles by their updated_at month (created_at not available on profiles)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('updated_at')
        .gte('updated_at', sixMonthsAgo.toISOString())
        .order('updated_at', { ascending: true });

      // Aggregate by month
      const monthMap = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthMap.set(key, 0);
      }

      (profiles || []).forEach(p => {
        if (p.updated_at) {
          const d = new Date(p.updated_at);
          const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          if (monthMap.has(key)) {
            monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
          }
        }
      });

      setRegistrationData(
        Array.from(monthMap.entries()).map(([month, users]) => ({ month, users }))
      );

      // Emergency breakdown by status
      const { data: emergencies } = await supabase
        .from('emergency_incidents')
        .select('status');

      const statusMap = new Map<string, number>();
      (emergencies || []).forEach(e => {
        const s = e.status || 'unknown';
        statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
      });

      setEmergencyByStatus(
        Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }))
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = () => {
    const exportData = [
      { metric: 'Total Users', value: stats.totalUsers },
      { metric: 'Total Organizations', value: stats.totalOrganizations },
      { metric: 'Total Emergencies', value: stats.totalEmergencies },
      { metric: 'Active Emergencies', value: stats.activeEmergencies },
      { metric: 'Total QR Tokens', value: stats.totalQRTokens },
      { metric: 'Active QR Tokens', value: stats.activeQRTokens },
      ...registrationData.map(r => ({ metric: `Registrations ${r.month}`, value: r.users })),
      ...emergencyByStatus.map(e => ({ metric: `Emergency ${e.status}`, value: e.count })),
    ];
    exportToCSV(exportData, 'platform_analytics');
    toast.success('Analytics exported');
  };

  if (loading) {
    return <AdminTabSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeEmergencies}</p>
                <p className="text-sm text-muted-foreground">Active Emergencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <QrCode className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeQRTokens}</p>
                <p className="text-sm text-muted-foreground">Active QR Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  User Activity Trend
                </CardTitle>
                <CardDescription>Monthly profile updates (last 6 months)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {registrationData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Emergency Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Emergency Status Breakdown
            </CardTitle>
            <CardDescription>Distribution of emergency incidents by status</CardDescription>
          </CardHeader>
          <CardContent>
            {emergencyByStatus.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <Pie
                    data={emergencyByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {emergencyByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No emergency data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Platform Summary</CardTitle>
              <CardDescription>Overall system metrics</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchAnalytics}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground mt-1">Registered Users</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-blue-500">{stats.totalOrganizations}</p>
              <p className="text-sm text-muted-foreground mt-1">Partner Organizations</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-destructive">{stats.totalEmergencies}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Emergencies</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-orange-500">{stats.activeEmergencies}</p>
              <p className="text-sm text-muted-foreground mt-1">Active Emergencies</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-green-500">{stats.totalQRTokens}</p>
              <p className="text-sm text-muted-foreground mt-1">QR Tokens Issued</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-green-600">{stats.activeQRTokens}</p>
              <p className="text-sm text-muted-foreground mt-1">Active QR Tokens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
