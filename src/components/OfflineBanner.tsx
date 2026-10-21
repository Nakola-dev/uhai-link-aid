import { Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";

/**
 * Connection status pill. Sits above the mobile bottom navigation and never covers
 * headers or the SOS control. Announced politely to screen readers.
 */
export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const visible = !isOnline || wasOffline;

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-banner flex justify-center px-4 lg:bottom-6">
      {visible && (
        <div
          className={cn(
            "pointer-events-auto flex max-w-md items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-elevation-3",
            isOnline ? "bg-success text-success-foreground" : "bg-foreground text-background"
          )}
        >
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>You're back online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>You're offline. Calls to 999 or 112 still work.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
