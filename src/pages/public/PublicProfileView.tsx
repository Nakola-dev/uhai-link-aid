import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResponderLayout from '@/components/responder/ResponderLayout';
import ResponderProfile from '@/components/responder/ResponderProfile';
import type { ResponderProfileData } from '@/lib/responder';
import { EMERGENCY_NUMBERS, telHref } from '@/lib/emergency-numbers';

type ScanFailure = 'invalid' | 'deactivated' | 'rate-limited' | 'not-found' | 'offline' | 'unavailable';

class ScanError extends Error {
  constructor(public readonly kind: ScanFailure) {
    super(kind);
  }
}

interface ScanResult {
  success: boolean;
  error?: string;
  profile?: ResponderProfileData;
}

function classify(message: string | undefined): ScanFailure {
  const text = (message ?? '').toLowerCase();
  if (text.includes('rate limit')) return 'rate-limited';
  if (text.includes('deactivated')) return 'deactivated';
  if (text.includes('profile not found')) return 'not-found';
  if (text.includes('invalid') || text.includes('expired')) return 'invalid';
  return 'unavailable';
}

async function scanProfile(token: string): Promise<ResponderProfileData> {
  // Server-side function validates the token, rate-limits, logs the scan and
  // returns only the emergency subset of the profile. Called with plain fetch (anonymous key,
  // no session) so responders don't download supabase-js just to make one RPC call.
  let result: ScanResult;
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/check_and_log_qr_scan`, {
      method: 'POST',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _access_token: token, _user_agent: navigator.userAgent }),
    });
    if (!response.ok) throw new Error(String(response.status));
    result = (await response.json()) as ScanResult;
  } catch {
    throw new ScanError(navigator.onLine ? 'unavailable' : 'offline');
  }
  if (!result?.success || !result.profile) throw new ScanError(classify(result?.error));
  return result.profile;
}

const FAILURE_COPY: Record<ScanFailure, { title: string; body: string; retry: boolean }> = {
  invalid: {
    title: 'This QR code is not recognised',
    body: 'The code may be damaged, mistyped or replaced by a newer one. Treat the person using standard emergency procedures.',
    retry: false,
  },
  deactivated: {
    title: 'This QR code has been replaced',
    body: 'The owner has issued a new code, so this one no longer shows medical information.',
    retry: false,
  },
  'not-found': {
    title: 'No medical profile found',
    body: 'This code is valid but has no medical information attached.',
    retry: false,
  },
  'rate-limited': {
    title: 'Too many scans from this network',
    body: 'For the owner\'s privacy, scans are limited. Wait about a minute, then try again.',
    retry: true,
  },
  offline: {
    title: 'No internet connection',
    body: 'Medical information can only be loaded online. Reconnect, then try again.',
    retry: true,
  },
  unavailable: {
    title: 'Medical information is temporarily unavailable',
    body: 'UhaiLink could not be reached. Try again in a moment.',
    retry: true,
  },
};

const PublicProfileView = () => {
  const { token } = useParams<{ token: string }>();
  const scan = useQuery({
    queryKey: ['responder-scan', token],
    queryFn: () => scanProfile(token as string),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  if (scan.isLoading) {
    return (
      <ResponderLayout>
        {/* Full-height so the footer starts below the fold and doesn't jump when the profile arrives. */}
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-3 text-center" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-muted-foreground">Loading emergency medical information…</p>
        </div>
      </ResponderLayout>
    );
  }

  if (scan.data) {
    return (
      <ResponderLayout>
        <ResponderProfile profile={scan.data} />
      </ResponderLayout>
    );
  }

  const kind: ScanFailure = !token ? 'invalid' : scan.error instanceof ScanError ? scan.error.kind : 'unavailable';
  const copy = FAILURE_COPY[kind];
  const Icon = kind === 'offline' ? WifiOff : AlertCircle;

  return (
    <ResponderLayout>
      <div className="space-y-6" role="alert">
        <div className="space-y-3">
          <Icon className="h-10 w-10 text-destructive" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
          <p className="text-muted-foreground">{copy.body}</p>
          {copy.retry && (
            <Button onClick={() => scan.refetch()} disabled={scan.isFetching} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          )}
        </div>
        <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
          <p className="mb-3 font-semibold">If this is an emergency, call now</p>
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
        </div>
      </div>
    </ResponderLayout>
  );
};

export default PublicProfileView;
