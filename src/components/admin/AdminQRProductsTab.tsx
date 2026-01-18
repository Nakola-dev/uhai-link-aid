import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QrCode, Copy, Package } from 'lucide-react';
import { toast } from 'sonner';

interface QRToken {
  id: string;
  user_id: string;
  access_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminQRProductsTabProps {
  onUpdate: () => void;
}

export const AdminQRProductsTab = ({ onUpdate }: AdminQRProductsTabProps) => {
  const [tokens, setTokens] = useState<QRToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('qr_access_tokens')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTokens((data || []) as QRToken[]);
    } catch (error) {
      console.error('Error fetching QR data:', error);
      toast.error('Failed to load QR tokens');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = (accessToken: string) => {
    navigator.clipboard.writeText(accessToken);
    toast.success('Token copied to clipboard');
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
    <div className="space-y-6">
      {/* QR Products Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                QR Products
              </CardTitle>
              <CardDescription>Available QR wristbands, cards, and tags</CardDescription>
            </div>
            <Button>Add Product</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">QR Wristband</h4>
                <p className="text-sm text-muted-foreground">KES 500</p>
                <Badge className="mt-2" variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">QR ID Card</h4>
                <p className="text-sm text-muted-foreground">KES 350</p>
                <Badge className="mt-2" variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="p-4 text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">QR Keychain Tag</h4>
                <p className="text-sm text-muted-foreground">KES 250</p>
                <Badge className="mt-2" variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Active QR Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Active QR Tokens
          </CardTitle>
          <CardDescription>All issued QR access tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No QR tokens found
                    </TableCell>
                  </TableRow>
                ) : (
                  tokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {token.access_token.substring(0, 16)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={token.is_active ? "default" : "secondary"}>
                          {token.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(token.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(token.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToken(token.access_token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
