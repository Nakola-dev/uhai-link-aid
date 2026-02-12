import { useEffect, useState, useCallback } from 'react';
import AdminTabSkeleton from '@/components/admin/AdminTabSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { logAdminAction, exportToCSV } from '@/lib/admin-logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Ban, CheckCircle, Phone, Eye, Download, Users, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  county: string | null;
  blood_type: string | null;
  role: string | null;
  is_suspended: boolean | null;
  updated_at: string | null;
}

interface AdminUsersTabProps {
  onUpdate: () => void;
}

export const AdminUsersTab = ({ onUpdate }: AdminUsersTabProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, city, county, blood_type, role, is_suspended, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setUsers((data || []) as User[]);
      setFilteredUsers((data || []) as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(q) ||
          user.phone?.toLowerCase().includes(q) ||
          user.city?.toLowerCase().includes(q) ||
          user.county?.toLowerCase().includes(q)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    const newStatus = !selectedUser.is_suspended;

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: newStatus })
        .eq('id', selectedUser.id);

      if (error) throw error;

      await logAdminAction({
        actionType: 'update',
        entityType: 'user',
        entityId: selectedUser.id,
        description: newStatus
          ? `Suspended user: ${selectedUser.full_name || selectedUser.id}`
          : `Reactivated user: ${selectedUser.full_name || selectedUser.id}`,
        changes: { is_suspended: newStatus },
      });

      toast.success(newStatus ? 'User suspended' : 'User reactivated');
      setSuspendDialogOpen(false);
      setSelectedUser(null);
      await fetchUsers();
      onUpdate();
    } catch (error) {
      console.error('Error toggling suspension:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(
      users.map(u => ({
        id: u.id,
        name: u.full_name ?? '',
        phone: u.phone ?? '',
        city: u.city ?? '',
        county: u.county ?? '',
        blood_type: u.blood_type ?? '',
        role: u.role ?? '',
        suspended: u.is_suspended ? 'Yes' : 'No',
        updated: u.updated_at ?? '',
      })),
      'users_export'
    );
    toast.success('Users exported');
  };

  const suspendedCount = users.filter(u => u.is_suspended).length;

  if (loading) {
    return <AdminTabSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length - suspendedCount}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suspendedCount}</p>
                <p className="text-sm text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage registered users and their accounts</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.is_suspended ? 'opacity-60' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'N/A'}</div>
                          {user.role === 'admin' && (
                            <Badge variant="secondary" className="text-xs mt-0.5">Admin</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {user.phone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.city && user.county
                          ? `${user.city}, ${user.county}`
                          : user.city || user.county || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {user.is_suspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedUser(user); setViewDialogOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedUser(user); setSuspendDialogOpen(true); }}
                          >
                            {user.is_suspended ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Ban className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the selected user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {selectedUser.city && selectedUser.county
                      ? `${selectedUser.city}, ${selectedUser.county}`
                      : selectedUser.city || selectedUser.county || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Type</p>
                  <p className="font-medium">{selectedUser.blood_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{selectedUser.role || 'user'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {selectedUser.is_suspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-xs break-all">{selectedUser.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend/Reactivate Confirmation Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_suspended ? 'Reactivate User' : 'Suspend User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.is_suspended
                ? `Are you sure you want to reactivate ${selectedUser?.full_name || 'this user'}? They will regain access.`
                : `Are you sure you want to suspend ${selectedUser?.full_name || 'this user'}? They will lose access until reactivated.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.is_suspended ? 'default' : 'destructive'}
              onClick={handleToggleSuspend}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : selectedUser?.is_suspended ? 'Reactivate' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
