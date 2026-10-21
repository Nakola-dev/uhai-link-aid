import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Download, Loader2, Printer, RefreshCw, ShieldCheck, Smartphone, Wallet, Watch } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQrToken } from '@/hooks/use-qr-token';
import { qrProfileUrl } from '@/lib/qr-token';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from '@/components/DashboardSkeleton';

const DOWNLOAD_SIZE = 1024;

/** Render the on-screen QR SVG to a high-resolution PNG with a white background. */
function svgToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgUrl = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    );
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = DOWNLOAD_SIZE;
      canvas.height = DOWNLOAD_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unavailable'));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, DOWNLOAD_SIZE, DOWNLOAD_SIZE);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, DOWNLOAD_SIZE, DOWNLOAD_SIZE);
      URL.revokeObjectURL(svgUrl);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))), 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Could not render QR code'));
    };
    img.src = svgUrl;
  });
}

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;

const UserQRPage = () => {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const { data: token, isLoading, isError, refetch, regenerate } = useQrToken(user?.id);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const qrUrl = token ? qrProfileUrl(token.access_token) : '';

  const handleDownload = async () => {
    if (!svgRef.current) return;
    setDownloading(true);
    try {
      const blob = await svgToPngBlob(svgRef.current);
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'uhailink-medical-id-qr.png';
      link.href = href;
      link.click();
      URL.revokeObjectURL(href);
      toast.success('QR code saved as a PNG image');
    } catch {
      toast.error('Could not create the image. Try Print instead.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast.success('Link copied');
    } catch {
      toast.error('Copying is blocked in this browser. Select the link text and copy it manually.');
    }
  };

  const handleRegenerate = () => {
    regenerate.mutate(undefined, {
      onSuccess: () => toast.success('New QR code issued. Your old code no longer works.'),
      onError: () => toast.error('Could not issue a new QR code. Your current code still works — please try again.'),
    });
    setConfirmRegenerate(false);
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton cards={1} rows={2} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2 no-print">
          <h1 className="text-3xl font-bold tracking-tight">My Medical ID</h1>
          <p className="text-muted-foreground">
            Anyone who scans this code can see your emergency medical information. Keep it with you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3 print-area">
            <CardContent className="p-6 sm:p-8">
              {isError || !token ? (
                <div className="text-center py-10 space-y-4" role="alert">
                  <AlertTriangle className="h-10 w-10 text-destructive mx-auto" aria-hidden="true" />
                  <p className="font-medium">We couldn't load your QR code.</p>
                  <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
                  <Button onClick={() => refetch()}>Try again</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      UhaiLink Medical ID
                    </p>
                    <p className="text-xl font-semibold">{profile?.full_name || 'Your name'}</p>
                  </div>

                  {/* QR codes must stay dark-on-white with a quiet zone in every theme to remain scannable. */}
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                    <QRCodeSVG
                      ref={svgRef}
                      value={qrUrl}
                      size={256}
                      level="H"
                      marginSize={4}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      title="Emergency medical profile QR code"
                    />
                  </div>

                  <p className="text-center text-sm font-medium max-w-xs">
                    In an emergency, scan with any phone camera — no app needed.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full no-print">
                    <Button onClick={handleDownload} variant="outline" disabled={downloading}>
                      {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Download
                    </Button>
                    <Button onClick={handleCopyLink} variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy link
                    </Button>
                    <Button onClick={() => window.print()} variant="outline">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      onClick={() => setConfirmRegenerate(true)}
                      variant="outline"
                      disabled={regenerate.isPending}
                    >
                      {regenerate.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      New code
                    </Button>
                  </div>

                  <dl className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm no-print">
                    <div className="rounded-lg bg-muted/60 p-3">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
                        Active
                      </dd>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-3">
                      <dt className="text-muted-foreground">Issued</dt>
                      <dd className="font-medium">{formatDate(token.updated_at ?? token.created_at) ?? '—'}</dd>
                    </div>
                    <div className="sm:col-span-2 rounded-lg bg-muted/60 p-3">
                      <dt className="text-muted-foreground">Link responders open</dt>
                      <dd className="font-mono text-xs break-all">{qrUrl}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6 no-print">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What responders see</CardTitle>
                <CardDescription>
                  Your name, blood type, allergies, medications, conditions, primary hospital and
                  emergency contacts. Keep them current in{' '}
                  <Link to="/dashboard/profile" className="text-primary underline underline-offset-2">
                    your medical profile
                  </Link>
                  .
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ways to carry it</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <Wallet className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                  <p><span className="font-medium">Print it</span> and keep it in your wallet or ID holder.</p>
                </div>
                <div className="flex gap-3">
                  <Smartphone className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                  <p><span className="font-medium">Save the image</span> as your phone's lock-screen wallpaper.</p>
                </div>
                <div className="flex gap-3">
                  <Watch className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                  <p><span className="font-medium">Attach it</span> to a keychain, bag tag or bracelet.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                  If your code is lost or shared
                </CardTitle>
                <CardDescription>
                  Issue a new code. The old one stops working immediately, so reprint anything that carries it.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmRegenerate} onOpenChange={setConfirmRegenerate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Issue a new QR code?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current code will stop working immediately. Any printed cards, stickers or tags
              with the old code will no longer open your medical information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current code</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>Issue new code</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default UserQRPage;
