import { useEffect } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMERGENCY_NUMBERS, telHref } from "@/lib/emergency-numbers";

/**
 * Offline fallback. Phone calls don't need mobile data, so the emergency lines
 * are always offered first. The page reloads itself when the connection returns.
 */
const OfflinePage = () => {
  useEffect(() => {
    const reload = () => window.location.reload();
    window.addEventListener("online", reload);
    return () => window.removeEventListener("online", reload);
  }, []);

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-6 shadow-elevation-2 sm:p-8">
        <div className="space-y-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight">You're offline</h1>
          <p className="text-muted-foreground">
            UhaiLink needs a connection to load medical information and send SOS alerts.
          </p>
        </div>

        <section aria-labelledby="offline-calls" className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
          <h2 id="offline-calls" className="mb-3 font-sans text-base font-semibold">In an emergency, call — no data needed</h2>
          <div className="grid grid-cols-3 gap-2">
            {EMERGENCY_NUMBERS.map((line) => (
              <a
                key={line.number}
                href={telHref(line.number)}
                className="flex min-h-14 flex-col items-center justify-center rounded-lg border bg-card text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-xl font-bold tabular-nums text-destructive">{line.number}</span>
                <span className="text-xs text-muted-foreground">{line.label}</span>
              </a>
            ))}
          </div>
        </section>

        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Pages you opened recently may still be available.</li>
          <li>A printed or saved copy of your QR code still works — the person scanning it needs a connection.</li>
        </ul>

        <Button onClick={() => window.location.reload()} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
        <p className="text-center text-xs text-muted-foreground" role="status">
          This page reloads automatically when your connection returns.
        </p>
      </div>
    </main>
  );
};

export default OfflinePage;
