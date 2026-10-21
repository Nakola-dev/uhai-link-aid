import { useEffect, useState } from 'react';
import { Ban, Clock, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import AdminTabSkeleton from '@/components/admin/AdminTabSkeleton';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { logAdminAction } from '@/lib/admin-logger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

type QRToken = Tables<'qr_access_tokens'>;

interface AdminQRProductsTabProps {
  onUpdate: () => void;
}

/** Tokens are bearer credentials to a person's medical record: never shown or copied in full. */
const maskToken = (token: string) => `${token.slice(0, 4)}••••••`;
const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—');

export const AdminQRProductsTab = ({ onUpdate }: AdminQRProductsTabProps) => {
  const [tokens, setTokens] = useState<QRToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [toDeactivate, setToDeactivate] = useState<QRToken | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('qr_access_tokens')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);
    setLoadFailed(!!error);
    setTokens(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deactivate = async () => {
    if (!toDeactivate) return;
    const { error } = await supabase.from('qr_access_tokens').update({ is_active: false }).eq('id', toDeactivate.id);
    if (error) {
      toast.error(`The code wasn't deactivated: ${error.message}`);
      return;
    }
    await logAdminAction({
      actionType: 'update',
      entityType: 'qr_access_token',
      entityId: toDeactivate.id,
      description: `Deactivated QR code ${maskToken(toDeactivate.access_token)}`,
      changes: { is_active: false, user_id: toDeactivate.user_id },
    });
    toast.success('QR code deactivated. The owner can issue a new one from their Medical ID page.');
    setToDeactivate(null);
    fetchData();
    onUpdate();
  };

  if (loading) return <AdminTabSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" aria-hidden="true" />
            Physical QR products
          </CardTitle>
          <CardDescription>
            Cards, wristbands and keychain tags are not on sale yet. There is no product catalogue or payment integration.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" aria-hidden="true" />
            QR codes
          </CardTitle>
          <CardDescription>
            The 50 most recently changed codes. Codes are masked; deactivate one if it has been lost or misused.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadFailed ? (
            <EmptyState icon={QrCode} title="QR codes couldn't be loaded" action={<Button variant="outline" onClick={fetchData}>Try again</Button>} />
          ) : tokens.length === 0 ? (
            <EmptyState icon={QrCode} title="No QR codes issued yet" />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Last changed</TableHead>
                    <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">{maskToken(token.access_token)}</code></TableCell>
                      <TableCell>
                        <Badge variant={token.is_active ? 'default' : 'secondary'}>{token.is_active ? 'Active' : 'Deactivated'}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(token.created_at)}</TableCell>
                      <TableCell>{formatDate(token.updated_at)}</TableCell>
                      <TableCell className="text-right">
                        {token.is_active && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setToDeactivate(token)}>
                            <Ban className="mr-1.5 h-4 w-4" aria-hidden="true" />
                            Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!toDeactivate} onOpenChange={(open) => !open && setToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this QR code?</AlertDialogTitle>
            <AlertDialogDescription>
              Anyone scanning it — including a responder in an emergency — will no longer see the owner's medical
              information until they issue a new code. Use this only when a code is lost or misused. The action is audit-logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deactivate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deactivate code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
