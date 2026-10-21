import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Lock, Moon, Save, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { describeAuthError } from '@/lib/auth-errors';
import { blankToNull } from '@/lib/medical-lists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/FormField';
import PasswordInput from '@/components/PasswordInput';
import DashboardLayout from '@/components/DashboardLayout';

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/[A-Z]/, 'Add at least one uppercase letter')
      .regex(/[0-9]/, 'Add at least one number')
      .regex(/[^A-Za-z0-9]/, 'Add at least one symbol, such as ! or #'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

const UserSettings = () => {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', city: '', county: '' });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [requestingDeletion, setRequestingDeletion] = useState(false);

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
    if (!user?.id) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name.trim(),
        phone: blankToNull(formData.phone),
        city: blankToNull(formData.city),
        county: blankToNull(formData.county),
      })
      .eq('id', user.id);
    setSavingProfile(false);
    if (error) {
      toast.error(`Your details weren't saved: ${error.message}`);
      return;
    }
    toast.success('Your details have been saved');
    refreshProfile();
  };

  const handleUpdatePassword = async (values: PasswordValues) => {
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) throw error;
      toast.success('Your password has been changed');
      passwordForm.reset();
    } catch (error) {
      toast.error(describeAuthError(error, "Your password wasn't changed."));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!user?.id || deleteConfirmText !== 'DELETE') return;
    setRequestingDeletion(true);
    const { error } = await supabase.from('account_deletion_requests').insert({
      user_id: user.id,
      reason: deletionReason.trim() || null,
      status: 'pending',
      requested_at: new Date().toISOString(),
    });
    setRequestingDeletion(false);
    if (error) {
      toast.error(`Your request wasn't submitted: ${error.message}`);
      return;
    }
    toast.success('Deletion request received. It will be completed within 30 days, as data protection law requires.');
    setDeleteOpen(false);
    setDeleteConfirmText('');
    setDeletionReason('');
  };

  const pwErrors = passwordForm.formState.errors;

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Account details, password and appearance. Medical details are in{' '}
            <Link to="/dashboard/profile" className="font-medium text-primary underline-offset-4 hover:underline">your medical profile</Link>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" autoComplete="name" required value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" type="tel" autoComplete="tel" value={formData.phone} placeholder="+254 7XX XXX XXX"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City or town</Label>
                  <Input id="city" autoComplete="address-level2" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input id="county" value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })} />
                </div>
              </div>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2 h-4 w-4" aria-hidden="true" />}
                Save details
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4" noValidate>
              <FormField label="New password" error={pwErrors.newPassword?.message}
                hint="At least 8 characters, with an uppercase letter, a number and a symbol.">
                <PasswordInput autoComplete="new-password" {...passwordForm.register('newPassword')} />
              </FormField>
              <FormField label="Confirm new password" error={pwErrors.confirmPassword?.message}>
                <PasswordInput autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
              </FormField>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Lock className="mr-2 h-4 w-4" aria-hidden="true" />}
                Change password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span>
                  <span className="block font-medium">Dark theme</span>
                  <span className="block text-sm text-muted-foreground">Easier on the eyes at night</span>
                </span>
              </span>
              <Switch checked={resolvedTheme === 'dark'} onCheckedChange={(on) => setTheme(on ? 'dark' : 'light')} />
            </label>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Delete account</CardTitle>
            <CardDescription>
              Ask us to delete your account, medical profile, contacts and QR code. This can't be undone once completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Request account deletion
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request account deletion</DialogTitle>
            <DialogDescription>
              We'll delete your account, medical profile, emergency contacts and QR code within 30 days. Your QR code
              stops working once deletion is complete.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deletion-reason">Reason (optional)</Label>
              <Input id="deletion-reason" value={deletionReason} onChange={(e) => setDeletionReason(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type <strong>DELETE</strong> to confirm</Label>
              <Input id="delete-confirm" autoComplete="off" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRequestDeletion} disabled={requestingDeletion || deleteConfirmText !== 'DELETE'}>
              {requestingDeletion && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Submit deletion request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserSettings;
