import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";

/**
 * A small banner that appears at the top of the page when the user goes offline.
 * Shows a green reconnection message briefly when they come back online.
 */
export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300",
        isOnline ? "bg-green-600" : "bg-destructive"
      )}
      role="alert"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>You're back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>
            You're offline — some features may be unavailable
          </span>
        </>
      )}
    </div>
  );
}
