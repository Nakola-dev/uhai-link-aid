import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, BookOpen, Building, QrCode, AlertTriangle, CreditCard, FileText, BarChart3 } from 'lucide-react';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminContentTab } from '@/components/admin/AdminContentTab';
import { AdminOrganizationsTab } from '@/components/admin/AdminOrganizationsTab';
import { AdminQRProductsTab } from '@/components/admin/AdminQRProductsTab';
import { AdminEmergencyLogsTab } from '@/components/admin/AdminEmergencyLogsTab';
import { AdminPaymentsTab } from '@/components/admin/AdminPaymentsTab';
import { AdminAuditLogsTab } from '@/components/admin/AdminAuditLogsTab';
import { AdminAnalyticsTab } from '@/components/admin/AdminAnalyticsTab';

const AdminDashboard = () => {
  const { user, profile, isAdmin, loading } = useAuth({ requireAuth: true });
  const [activeTab, setActiveTab] = useState('analytics');
  const navigate = useNavigate();

  // Shared refresh callback that child tabs can call
  const handleUpdate = useCallback(() => {
    // Individual tabs manage their own data; this is a no-op hook for future use
  }, []);

  if (loading) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton cards={4} rows={6} />
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">
              Manage platform users, content, and monitor system activity
            </p>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="organizations" className="gap-1.5">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Organizations</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-1.5">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">QR Products</span>
            </TabsTrigger>
            <TabsTrigger value="emergencies" className="gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Emergencies</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Log</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AdminAnalyticsTab onUpdate={handleUpdate} />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsersTab onUpdate={handleUpdate} />
          </TabsContent>
          <TabsContent value="content">
            <AdminContentTab onUpdate={handleUpdate} />
          </TabsContent>
          <TabsContent value="organizations">
            <AdminOrganizationsTab onUpdate={handleUpdate} />
          </TabsContent>
          <TabsContent value="qr">
            <AdminQRProductsTab onUpdate={handleUpdate} />
          </TabsContent>
          <TabsContent value="emergencies">
            <AdminEmergencyLogsTab onUpdate={handleUpdate} />
          </TabsContent>
          <TabsContent value="payments">
            <AdminPaymentsTab onUpdate={handleUpdate} />
          </TabsContent>
          <TabsContent value="audit">
            <AdminAuditLogsTab onUpdate={handleUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;