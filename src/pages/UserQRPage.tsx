import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, RefreshCw, Copy, Printer, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '@/components/Layout';

const UserQRPage = () => {
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQRToken();
  }, []);

  const fetchQRToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if token exists
      const { data, error } = await supabase
        .from('qr_access_tokens')
        .select('access_token')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setQrToken(data.access_token);
      } else {
        // Generate new token if none exists
        await generateNewToken();
      }
    } catch (error: any) {
      toast.error('Failed to load QR code');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = `${session.user.id.slice(0, 8)}-${Date.now().toString(36)}`;
      
      const { data, error } = await supabase
        .from('qr_access_tokens')
        .upsert({
          user_id: session.user.id,
          access_token: token,
          is_active: true,
        })
        .select('access_token')
        .single();

      if (error) throw error;

      setQrToken(data.access_token);
      return data.access_token;
    } catch (error: any) {
      toast.error('Failed to generate QR code');
      throw error;
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await generateNewToken();
      toast.success('New QR code generated successfully!');
    } catch (error) {
      // Error already handled in generateNewToken
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code') as any;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = 'uhailink-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    toast.success('QR code downloaded!');
  };

  const handleCopyLink = () => {
    if (!qrToken) return;
    const link = `${window.location.origin}/profile/${qrToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const qrUrl = qrToken ? `${window.location.origin}/profile/${qrToken}` : '';

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
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate('/dashboard/user')} className="mb-4 no-print">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* QR Code Display */}
            <Card className="lg:col-span-3 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Your Emergency QR Code</CardTitle>
                <CardDescription>
                  Scan this code to access your medical information
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                {qrToken ? (
                  <>
                    <div className="p-6 bg-white rounded-lg shadow-inner">
                      <QRCodeSVG
                        id="qr-code"
                        value={qrUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <div className="w-full text-center space-y-2">
                      <p className="text-sm font-medium">Access URL:</p>
                      <p className="text-xs text-muted-foreground break-all px-4">
                        {qrUrl}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full no-print">
                      <Button onClick={handleDownload} variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button onClick={handleCopyLink} variant="outline" className="w-full">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button onClick={handlePrint} variant="outline" className="w-full">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button
                        onClick={handleRegenerate}
                        variant="outline"
                        className="w-full"
                        disabled={regenerating}
                      >
                        {regenerating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No QR code available</p>
                    <Button onClick={handleRegenerate} disabled={regenerating}>
                      {regenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Information & Tips */}
            <div className="lg:col-span-2 space-y-6 no-print">
              <Card className="border-accent/20">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <CardTitle className="text-lg">Important Security Info</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <strong>Public Access:</strong> Anyone with this QR code can view your medical information.
                  </p>
                  <p>
                    <strong>Regenerate:</strong> If you believe your QR code has been compromised, regenerate it immediately.
                  </p>
                  <p>
                    <strong>Keep Updated:</strong> Ensure your profile information is always current.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How to Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">1. Print It</p>
                    <p className="text-muted-foreground">
                      Print and carry in your wallet or attach to medical devices.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">2. Wear It</p>
                    <p className="text-muted-foreground">
                      Create a bracelet, keychain, or necklace with the QR code.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">3. Save It</p>
                    <p className="text-muted-foreground">
                      Save to your phone's home screen or lock screen wallpaper.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </Layout>
  );
};

export default UserQRPage;
