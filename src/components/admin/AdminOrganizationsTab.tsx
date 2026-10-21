import { FormEvent, useEffect, useState } from 'react';
import { Building2, Loader2, Mail, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminTabSkeleton from '@/components/admin/AdminTabSkeleton';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { logAdminAction } from '@/lib/admin-logger';
import { blankToNull } from '@/lib/medical-lists';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EmptyState from '@/components/common/EmptyState';

type Organization = Tables<'emergency_organizations'>;

interface AdminOrganizationsTabProps {
  onUpdate: () => void;
}

const emptyForm = { name: '', type: '', phone: '', email: '' };

export const AdminOrganizationsTab = ({ onUpdate }: AdminOrganizationsTabProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editing, setEditing] = useState<Organization | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Organization | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('emergency_organizations').select('*').order('name');
    setLoadFailed(!!error);
    setOrganizations(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const openEditor = (org: Organization | 'new') => {
    setEditing(org);
    setForm(org === 'new' ? emptyForm : { name: org.name, type: org.type ?? '', phone: org.phone ?? '', email: org.email ?? '' });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const fields = { name: form.name.trim(), type: blankToNull(form.type), phone: blankToNull(form.phone), email: blankToNull(form.email) };
    const isNew = editing === 'new';
    const { data, error } = isNew
      ? await supabase.from('emergency_organizations').insert(fields).select('id').single()
      : await supabase.from('emergency_organizations').update(fields).eq('id', editing.id).select('id').single();
    setSaving(false);
    if (error) {
      toast.error(`Organisation wasn't saved: ${error.message}`);
      return;
    }
    await logAdminAction({
      actionType: isNew ? 'create' : 'update',
      entityType: 'emergency_organization',
      entityId: data.id,
      description: `${isNew ? 'Added' : 'Updated'} organisation "${fields.name}"`,
      changes: fields,
    });
    toast.success(isNew ? 'Organisation added' : 'Organisation updated');
    setEditing(null);
    fetchOrganizations();
    onUpdate();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from('emergency_organizations').delete().eq('id', toDelete.id);
    if (error) {
      toast.error(`Organisation wasn't deleted: ${error.message}`);
      return;
    }
    await logAdminAction({
      actionType: 'delete',
      entityType: 'emergency_organization',
      entityId: toDelete.id,
      description: `Deleted organisation "${toDelete.name}"`,
      changes: { name: toDelete.name, type: toDelete.type, phone: toDelete.phone, email: toDelete.email },
    });
    toast.success('Organisation deleted');
    setToDelete(null);
    fetchOrganizations();
    onUpdate();
  };

  if (loading) return <AdminTabSkeleton rows={5} />;

  const actions = (org: Organization) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => openEditor(org)} aria-label={`Edit ${org.name}`}>
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setToDelete(org)} aria-label={`Delete ${org.name}`}>
        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" aria-hidden="true" />
            Emergency organisations
          </CardTitle>
          <CardDescription>Shown to members in the dashboard's emergency services directory.</CardDescription>
        </div>
        <Button onClick={() => openEditor('new')}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add organisation
        </Button>
      </CardHeader>
      <CardContent>
        {loadFailed ? (
          <EmptyState icon={Building2} title="Organisations couldn't be loaded" action={<Button variant="outline" onClick={fetchOrganizations}>Try again</Button>} />
        ) : organizations.length === 0 ? (
          <EmptyState icon={Building2} title="No organisations yet" description="Add ambulance services, hospitals and rescue organisations members can call." />
        ) : (
          <>
            {/* Cards on small screens, table from md up */}
            <ul className="space-y-3 md:hidden">
              {organizations.map((org) => (
                <li key={org.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{org.name}</p>
                      <Badge variant="outline" className="mt-1">{org.type || 'General'}</Badge>
                    </div>
                    {actions(org)}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {org.phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" aria-hidden="true" />{org.phone}</p>}
                    {org.email && <p className="flex items-center gap-1.5 break-all"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{org.email}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell><Badge variant="outline">{org.type || 'General'}</Badge></TableCell>
                      <TableCell className="tabular-nums">{org.phone ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{org.email ?? '—'}</TableCell>
                      <TableCell>{actions(org)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editing === 'new' ? 'Add organisation' : 'Edit organisation'}</DialogTitle>
              <DialogDescription>Members see the name, type and phone number and can call it from their dashboard.</DialogDescription>
            </DialogHeader>
            <div className="my-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Name *</Label>
                <Input id="org-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-type">Type</Label>
                <Input id="org-type" placeholder="Ambulance, hospital, rescue…" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input id="org-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Email</Label>
                  <Input id="org-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It will disappear from every member's emergency services directory. This is recorded in the audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete organisation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
