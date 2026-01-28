import { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, ArrowLeft, Loader2, QrCode, Search, Edit, Trash2, Plus, Building, BookOpen, Activity } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  blood_type: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  video_url: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ users: 0, orgs: 0, tutorials: 0, qrIssued: 0 });
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role using the has_role function
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      if (error) throw error;

      if (!data) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard/user');
        return;
      }

      setIsAdmin(true);
      await fetchAllData();
    } catch (error: any) {
      toast.error('Failed to verify admin access');
      navigate('/dashboard/user');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch users with their emails from auth
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, blood_type');

      if (profilesError) throw profilesError;

      // Enrich with email from auth metadata
      const usersWithEmails = await Promise.all(
        (profilesData || []).map(async (profile: Record<string, unknown>) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(String(profile.id));
          return {
            ...profile,
            email: user?.email || 'N/A',
          } as UserProfile & { email: string };
        })
      );

      setUsers(usersWithEmails as UserProfile[]);
      setFilteredUsers(usersWithEmails as UserProfile[]);

      // Fetch tutorials
      const { data: tutorialsData } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false });
      setTutorials(tutorialsData || []);

      // Fetch organizations
      const { data: orgsData } = await supabase
        .from('emergency_organizations')
        .select('*')
        .order('name', { ascending: true });
      setOrganizations(orgsData || []);

      // Fetch QR tokens count
      const { count: qrCount } = await supabase
        .from('qr_access_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        users: usersWithEmails.length,
        orgs: orgsData?.length || 0,
        tutorials: tutorialsData?.length || 0,
        qrIssued: qrCount || 0,
      });
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error('Error:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast.success('User deleted successfully');
      await fetchAllData();
    } catch (error: any) {
      toast.error('Failed to delete user');
    }
  };

  const saveTutorial = async (tutorial: Partial<Tutorial>) => {
    try {
      if (tutorial.id) {
        const { error } = await supabase
          .from('tutorials')
          .update({ title: tutorial.title, description: tutorial.description, video_url: tutorial.video_url })
          .eq('id', tutorial.id);
        if (error) throw error;
        toast.success('Tutorial updated');
      } else {
        const { error } = await supabase
          .from('tutorials')
          .insert({ title: tutorial.title, description: tutorial.description, video_url: tutorial.video_url });
        if (error) throw error;
        toast.success('Tutorial created');
      }
      setEditingTutorial(null);
      await fetchAllData();
    } catch (error: any) {
      toast.error('Failed to save tutorial');
    }
  };

  const deleteTutorial = async (id: string) => {
    if (!confirm('Delete this tutorial?')) return;
    try {
      const { error } = await supabase.from('tutorials').delete().eq('id', id);
      if (error) throw error;
      toast.success('Tutorial deleted');
      await fetchAllData();
    } catch (error: any) {
      toast.error('Failed to delete tutorial');
    }
  };

  const saveOrganization = async (org: Partial<Organization>) => {
    try {
      if (org.id) {
        const { error } = await supabase
          .from('emergency_organizations')
          .update({ name: org.name, type: org.type, phone: org.phone, email: org.email })
          .eq('id', org.id);
        if (error) throw error;
        toast.success('Organization updated');
      } else {
        const { error } = await supabase
          .from('emergency_organizations')
          .insert({ name: org.name, type: org.type, phone: org.phone, email: org.email });
        if (error) throw error;
        toast.success('Organization created');
      }
      setEditingOrg(null);
      await fetchAllData();
    } catch (error: any) {
      toast.error('Failed to save organization');
    }
  };

  const deleteOrganization = async (id: string) => {
    if (!confirm('Delete this organization?')) return;
    try {
      const { error } = await supabase.from('emergency_organizations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Organization deleted');
      await fetchAllData();
    } catch (error: any) {
      toast.error('Failed to delete organization');
    }
  };

  const getQRToken = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('qr_access_tokens')
        .select('access_token')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const url = `${window.location.origin}/profile/${data.access_token}`;
        navigator.clipboard.writeText(url);
        toast.success('QR link copied to clipboard!');
      } else {
        toast.error('User has no active QR code');
      }
    } catch (error: any) {
      toast.error('Failed to get QR token');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/user')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
                <p className="text-muted-foreground">Manage users, tutorials, and emergency organizations</p>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orgs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tutorials</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tutorials}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">QR Codes Issued</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.qrIssued}</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Management */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View, search, and manage user accounts</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>
                          {user.blood_type && <Badge variant="outline">{user.blood_type}</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => getQRToken(user.id)}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/user/profile`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tutorials Management */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tutorials Management</CardTitle>
                  <CardDescription>Create, edit, and delete tutorials</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTutorial({ id: '', title: '', description: '', video_url: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tutorial
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTutorial?.id ? 'Edit Tutorial' : 'Create Tutorial'}</DialogTitle>
                      <DialogDescription>Add or update tutorial information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editingTutorial?.title || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTutorial({ ...editingTutorial!, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={editingTutorial?.description || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTutorial({ ...editingTutorial!, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Video URL</Label>
                        <Input
                          value={editingTutorial?.video_url || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTutorial({ ...editingTutorial!, video_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => saveTutorial(editingTutorial!)}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tutorials.map((tutorial) => (
                  <div key={tutorial.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{tutorial.title}</p>
                      <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                    </div>
                    <div className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingTutorial(tutorial)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTutorial(tutorial.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Organizations Management */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Emergency Organizations</CardTitle>
                  <CardDescription>Manage emergency service providers</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingOrg({ id: '', name: '', type: '', phone: '', email: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Organization
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingOrg?.id ? 'Edit Organization' : 'Create Organization'}</DialogTitle>
                      <DialogDescription>Add or update organization details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editingOrg?.name || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingOrg({ ...editingOrg!, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Input
                          value={editingOrg?.type || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingOrg({ ...editingOrg!, type: e.target.value })}
                          placeholder="e.g., Hospital, Ambulance, Fire Department"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={editingOrg?.phone || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingOrg({ ...editingOrg!, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={editingOrg?.email || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingOrg({ ...editingOrg!, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => saveOrganization(editingOrg!)}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">{org.type} • {org.phone}</p>
                    </div>
                    <div className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingOrg(org)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteOrganization(org.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;