import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Save, Lock, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const UserSettings = () => {
  const [loading, setLoading] = useState(false);
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    county: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        county: profile.county || '',
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      await refreshProfile();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast({
      title: "Theme Updated",
      description: `Switched to ${!darkMode ? 'dark' : 'light'} mode`,
    });
  };

  const handleRequestDeletion = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user.id,
          reason: deletionReason || null,
          status: 'pending',
          requested_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Deletion Request Submitted",
        description: "Your account deletion request has been submitted. We will process it within 30 days as required by data protection regulations.",
      });

      setShowDeleteDialog(false);
      setDeleteConfirmText('');
      setDeletionReason('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit deletion request';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details and location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 712 345 678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Nairobi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    placeholder="Nairobi County"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the app looks for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions — proceed with caution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Your Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, profile, medical data, emergency contacts, 
              and QR codes. Your data will be removed within 30 days as required by data protection 
              regulations. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deletion-reason">Reason for leaving (optional)</Label>
              <Input
                id="deletion-reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Help us improve — why are you leaving?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRequestDeletion}
              disabled={loading || deleteConfirmText !== 'DELETE'}
            >
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserSettings;
