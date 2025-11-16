import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Building2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  organization_type: string;
  email: string;
  phone: string;
  subscription_plan: string;
  subscription_status: string;
  max_users: number;
  current_users: number;
  created_at: string;
}

interface AdminOrganizationsTabProps {
  onUpdate: () => void;
}

export const AdminOrganizationsTab = ({ onUpdate }: AdminOrganizationsTabProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orgId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          subscription_status: status,
          subscription_start_date: status === 'active' ? new Date().toISOString() : null
        })
        .eq('id', orgId);

      if (error) throw error;
      
      toast.success(`Organization ${status === 'active' ? 'approved' : 'rejected'}`);
      fetchOrganizations();
      onUpdate();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Management</CardTitle>
        <CardDescription>Approve and manage corporate and university partnerships</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No organizations registered
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{org.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.organization_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {org.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {org.phone || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{org.subscription_plan}</Badge>
                    </TableCell>
                    <TableCell>
                      {org.current_users} / {org.max_users}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          org.subscription_status === 'active'
                            ? 'default'
                            : org.subscription_status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {org.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {org.subscription_status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(org.id, 'active')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(org.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1 text-red-600" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};