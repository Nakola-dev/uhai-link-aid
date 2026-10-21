import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  ShieldAlert,
  UserPlus,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEmergencyContacts } from '@/hooks/use-emergency-contacts';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { LocationState, SmsOutcome, useSosAlert } from '@/hooks/use-sos-alert';
import { EMERGENCY_NUMBERS, telHref } from '@/lib/emergency-numbers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from '@/components/DashboardSkeleton';

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown time';

function LocationStatus({ location }: { location: LocationState }) {
  switch (location.status) {
    case 'acquired':
      return (
        <span className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Location found (accurate to about {Math.round(location.accuracy)} m)
        </span>
      );
    case 'locating':
      return (
        <span className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          Finding your location… You can send now; it will be added if found.
        </span>
      );
    case 'denied':
      return (
        <span className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Location permission is off. The alert will be sent without your location.
        </span>
      );
    case 'unavailable':
      return (
        <span className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {location.reason} The alert will be sent without your location.
        </span>
      );
    default:
      return <span className="text-muted-foreground">Location not requested yet.</span>;
  }
}

function StatusRow({ icon: Icon, tone, children }: { icon: typeof CheckCircle2; tone: 'ok' | 'warn' | 'bad' | 'busy'; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon
        className={cn(
          'h-5 w-5 mt-0.5 shrink-0',
          tone === 'ok' && 'text-success',
          tone === 'warn' && 'text-warning',
          tone === 'bad' && 'text-destructive',
          tone === 'busy' && 'animate-spin text-muted-foreground'
        )}
        aria-hidden="true"
      />
      <div className="space-y-1">{children}</div>
    </li>
  );
}

function SmsStatus({ sms }: { sms: SmsOutcome }) {
  switch (sms.kind) {
    case 'sending':
      return <StatusRow icon={Loader2} tone="busy"><p>Sending SMS to your emergency contacts…</p></StatusRow>;
    case 'sent':
      return <StatusRow icon={CheckCircle2} tone="ok"><p className="font-medium">SMS sent to all {sms.total} of your contacts.</p></StatusRow>;
    case 'partial':
      return (
        <StatusRow icon={AlertTriangle} tone="warn">
          <p className="font-medium">SMS sent to {sms.sent} of {sms.total} contacts.</p>
          <p className="text-sm text-muted-foreground">Call the others directly if you can.</p>
        </StatusRow>
      );
    case 'failed':
      return (
        <StatusRow icon={XCircle} tone="bad">
          <p className="font-medium">SMS alerts could not be sent.</p>
          <p className="text-sm text-muted-foreground">Call your contacts or an emergency line directly.</p>
        </StatusRow>
      );
    case 'no-contacts':
      return (
        <StatusRow icon={AlertTriangle} tone="warn">
          <p className="font-medium">Nobody was texted — you have no emergency contacts.</p>
          <p className="text-sm text-muted-foreground">Call an emergency line directly.</p>
        </StatusRow>
      );
    default:
      return null;
  }
}

const UserEmergency = () => {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const contacts = useEmergencyContacts(user?.id);
  const { isOnline } = useOnlineStatus();
  const sos = useSosAlert(user, profile);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resolving, setResolving] = useState(false);

  const contactList = contacts.data ?? [];
  const isSending = sos.record.kind === 'recording' || sos.sms.kind === 'sending';
  const showOutcome = sos.record.kind !== 'idle';

  const openConfirm = () => {
    if (sos.location.status !== 'acquired') sos.requestLocation();
    setConfirmOpen(true);
  };

  const send = async () => {
    setConfirmOpen(false);
    await sos.trigger();
  };

  const handleResolve = async (incidentId: string) => {
    setResolving(true);
    try {
      await sos.resolve(incidentId);
      toast.success('Marked as resolved. We are glad you are safe.');
    } catch {
      toast.error('Could not mark the alert as resolved. Please try again.');
    } finally {
      setResolving(false);
    }
  };

  if (authLoading || sos.incidents.isLoading) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton cards={0} rows={4} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Emergency SOS</h1>
          <p className="text-muted-foreground">
            Alert your emergency contacts by SMS. This does not call emergency services — call them directly below.
          </p>
        </div>

        {/* Direct calls never depend on UhaiLink, the network to Supabase, or SMS delivery. */}
        <section aria-labelledby="call-heading" className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4">
          <h2 id="call-heading" className="font-semibold mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-destructive" aria-hidden="true" />
            Call for help now
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {EMERGENCY_NUMBERS.map((line) => (
              <a
                key={line.number}
                href={telHref(line.number)}
                className="flex flex-col items-center justify-center rounded-lg bg-card border min-h-16 px-2 py-3 text-center hover:border-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-2xl font-bold tabular-nums text-destructive">{line.number}</span>
                <span className="text-xs text-muted-foreground">{line.label}</span>
              </a>
            ))}
          </div>
        </section>

        {!isOnline && (
          <div role="alert" className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <WifiOff className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">You're offline</p>
              <p className="text-sm text-muted-foreground">
                SOS alerts and SMS need an internet connection. Use the call buttons above.
              </p>
            </div>
          </div>
        )}

        {showOutcome && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert status</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4" aria-live="polite">
                {sos.record.kind === 'recording' && (
                  <StatusRow icon={Loader2} tone="busy"><p>Recording your emergency…</p></StatusRow>
                )}
                {sos.record.kind === 'failed' && (
                  <StatusRow icon={XCircle} tone="bad">
                    <p className="font-medium" role="alert">
                      {sos.record.offline
                        ? 'Your alert was not sent — you appear to be offline.'
                        : 'Your alert was not sent. Something went wrong.'}
                    </p>
                    <p className="text-sm text-muted-foreground">Call an emergency line now, then try again when you can.</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={openConfirm}>Try again</Button>
                  </StatusRow>
                )}
                {sos.record.kind === 'recorded' && (
                  <StatusRow icon={CheckCircle2} tone="ok">
                    <p className="font-medium">Emergency recorded at {formatTime(sos.record.incident.triggered_at)}.</p>
                    <p className="text-sm text-muted-foreground">
                      {sos.record.incident.location_lat != null
                        ? 'Your location was included.'
                        : sos.locationAddedLater
                          ? 'Your location was added to the record after the SMS was sent.'
                          : 'Your location was not included.'}
                    </p>
                  </StatusRow>
                )}
                <SmsStatus sms={sos.sms} />
              </ul>

              {(sos.sms.kind === 'failed' || sos.sms.kind === 'partial') && contactList.length > 0 && (
                <div className="mt-5 space-y-2">
                  <p className="text-sm font-medium">Call your contacts directly</p>
                  {contactList.map((c) => (
                    <a key={c.id} href={telHref(c.phone)}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border p-3 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span>
                        <span className="font-medium">{c.name}</span>
                        {c.relationship && <span className="text-muted-foreground"> · {c.relationship}</span>}
                      </span>
                      <span className="flex items-center gap-2 text-primary font-medium tabular-nums">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {c.phone}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {sos.activeIncident ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                SOS alert active
              </CardTitle>
              <CardDescription>Sent {formatTime(sos.activeIncident.triggered_at)}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => sos.resendSms(sos.activeIncident!.id)}
                disabled={!isOnline || sos.sms.kind === 'sending'}
              >
                <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                Text my contacts again
              </Button>
              <Button onClick={() => handleResolve(sos.activeIncident!.id)} disabled={resolving}>
                {resolving && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
                I'm safe — mark as resolved
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-5 pt-8 pb-8">
              <button
                type="button"
                onClick={openConfirm}
                disabled={isSending}
                className="h-44 w-44 rounded-full bg-destructive text-destructive-foreground shadow-lg ring-8 ring-destructive/15 flex flex-col items-center justify-center gap-1 font-bold transition-transform active:scale-[0.97] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4"
              >
                <span className="text-4xl tracking-wide">SOS</span>
                <span className="text-sm font-semibold">Send alert</span>
              </button>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                You'll be asked to confirm before anything is sent.
              </p>
            </CardContent>
          </Card>
        )}


        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Who will be alerted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {contacts.isError ? (
              <p className="text-destructive">Your contacts couldn't be loaded.</p>
            ) : contactList.length > 0 ? (
              <ol className="space-y-1">
                {contactList.map((c, i) => (
                  <li key={c.id}>
                    {i + 1}. <span className="font-medium">{c.name}</span>
                    {c.relationship && <span className="text-muted-foreground"> ({c.relationship})</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-warning font-medium">
                You have no emergency contacts, so an SOS will be recorded but nobody will be texted.
              </p>
            )}
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/profile">
                <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                Manage contacts
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What an SOS does</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>• Records an emergency with the time, and your location if you allow it.</p>
            <p>• Texts your emergency contacts your name, blood type and location (needs signal and SMS service).</p>
            <p>• Adds the alert to your emergency history, visible to UhaiLink administrators.</p>
            <p className="text-foreground font-medium">• It does not contact emergency services — call 999 or 112 yourself.</p>
          </CardContent>
        </Card>

        {sos.incidents.data && sos.incidents.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" aria-hidden="true" />
                Recent alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {sos.incidents.data.map((incident) => (
                  <li key={incident.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{formatTime(incident.triggered_at)}</p>
                      {incident.location_lat != null && incident.location_lng != null && (
                        <p className="text-muted-foreground flex items-center gap-1 tabular-nums">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {incident.location_lat.toFixed(4)}, {incident.location_lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <span className={cn('text-sm font-medium flex items-center gap-1.5',
                      incident.status === 'active' ? 'text-destructive' : 'text-muted-foreground')}>
                      {incident.status === 'active'
                        ? <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                        : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                      {incident.status === 'active' ? 'Active' : 'Resolved'}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send an SOS alert?</DialogTitle>
            <DialogDescription>
              {contactList.length > 0
                ? `We'll record an emergency and text ${contactList.length === 1 ? 'your emergency contact' : `your ${contactList.length} emergency contacts`}.`
                : "We'll record an emergency. You have no contacts, so nobody will be texted."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm" aria-live="polite">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <LocationStatus location={sos.location} />
            </div>
            <div className="rounded-md bg-muted p-3 space-y-1">
              <p className="font-medium">Shared in the SMS</p>
              <p className="text-muted-foreground">Name: {profile?.full_name || 'Not set'}</p>
              <p className="text-muted-foreground">Blood type: {profile?.blood_type || 'Not recorded'}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={send} className="font-semibold">
              Send SOS now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserEmergency;
