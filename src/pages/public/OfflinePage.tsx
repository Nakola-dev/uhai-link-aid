import { WifiOff, RefreshCw, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Offline fallback page displayed when the user has no internet connection.
 * This is critical for a medical emergency app - users need clear guidance
 * on what they can still do offline.
 */
const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <WifiOff className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            It looks like you've lost your internet connection. Some features may
            be unavailable until you reconnect.
          </p>

          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">
                Emergency Information
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              If you have a medical emergency, please call{" "}
              <a
                href="tel:999"
                className="font-bold text-destructive underline"
              >
                999
              </a>{" "}
              or{" "}
              <a
                href="tel:112"
                className="font-bold text-destructive underline"
              >
                112
              </a>{" "}
              immediately. Your QR code can still be scanned by others even
              while you are offline.
            </p>
          </div>

          <div className="space-y-2 text-left text-sm">
            <h4 className="font-medium">While offline, you can still:</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>View previously loaded pages</li>
              <li>Show your QR code if it was cached</li>
              <li>Call emergency numbers directly</li>
            </ul>
          </div>

          <Button
            onClick={handleRetry}
            className="w-full gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <p className="text-xs text-muted-foreground">
            This page will automatically reconnect when your internet is
            restored.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflinePage;
