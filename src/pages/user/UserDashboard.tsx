import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Bot, Building2, CheckCircle2, Circle, IdCard, Phone, ShieldAlert, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useEmergencyContacts } from '@/hooks/use-emergency-contacts';
import { telHref } from '@/lib/emergency-numbers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import EmptyState from '@/components/common/EmptyState';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardSkeleton from '@/components/DashboardSkeleton';

type CheckState = 'done' | 'attention' | 'todo';

interface ReadinessItem {
  label: string;
  detail: string;
  state: CheckState;
  to: string;
  action: string;
}

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

const StateIcon = ({ state }: { state: CheckState }) =>
  state === 'done' ? <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
    : state === 'attention' ? <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
      : <Circle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />;

const STATE_LABEL: Record<CheckState, string> = { done: 'Done', attention: 'Needs attention', todo: 'To do' };

const UserDashboard = () => {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const contacts = useEmergencyContacts(user?.id);

  // Read-only status check (the Medical ID page is what issues a code).
  const qrStatus = useQuery({
    queryKey: ['qr-status', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_access_tokens')
        .select('is_active')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return !!data?.is_active;
    },
  });

  const organizations = useQuery({
    queryKey: ['emergency-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_organizations')
        .select('id, name, type, phone')
        .order('name')
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 60 * 1000,
  });

  if (authLoading || contacts.isLoading || qrStatus.isLoading) {
    return (
      <DashboardLayout user={profile} isAdmin={isAdmin}>
        <DashboardSkeleton cards={3} rows={3} />
      </DashboardLayout>
    );
  }

  const contactCount = contacts.data?.length ?? 0;
  const items: ReadinessItem[] = [
    {
      label: 'Blood type',
      detail: !profile?.blood_type ? 'Not recorded yet' : profile.blood_type === 'Unknown' ? 'Marked as unknown — add it if you find out' : `Recorded as ${profile.blood_type}`,
      state: !profile?.blood_type ? 'todo' : profile.blood_type === 'Unknown' ? 'attention' : 'done',
      to: '/dashboard/profile',
      action: 'Update',
    },
    {
      label: 'Emergency contacts',
      detail: contacts.isError ? "Couldn't be checked" : contactCount === 0 ? 'Nobody will be texted if you send an SOS' : `${contactCount} contact${contactCount === 1 ? '' : 's'} will be alerted`,
      state: contacts.isError ? 'attention' : contactCount === 0 ? 'todo' : 'done',
      to: '/dashboard/profile',
      action: contactCount === 0 ? 'Add a contact' : 'Manage',
    },
    {
      label: 'QR medical ID',
      detail: qrStatus.isError ? "Couldn't be checked" : qrStatus.data ? 'Active — responders can scan it' : 'Not issued yet',
      state: qrStatus.isError ? 'attention' : qrStatus.data ? 'done' : 'todo',
      to: '/dashboard/qr',
      action: qrStatus.data ? 'View' : 'Get my code',
    },
    {
      label: 'Your phone number',
      detail: profile?.phone ? 'Shown to responders' : 'Lets responders call you or your phone',
      state: profile?.phone ? 'done' : 'todo',
      to: '/dashboard/profile',
      action: 'Update',
    },
  ];
  const doneCount = items.filter((i) => i.state === 'done').length;
  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <DashboardLayout user={profile} isAdmin={isAdmin}>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-muted-foreground">Here's how ready your emergency information is.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <Link
            to="/dashboard/emergency"
            className="group flex items-center justify-between gap-4 rounded-2xl bg-destructive p-6 text-destructive-foreground shadow-elevation-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xl font-bold">
                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                Emergency SOS
              </p>
              <p className="text-sm opacity-90">Alert your emergency contacts by SMS</p>
            </div>
            <ArrowRight className="h-6 w-6 shrink-0 transition-transform duration-base group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link
            to="/dashboard/qr"
            className="group flex items-center justify-between gap-4 rounded-2xl border bg-card p-6 shadow-elevation-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xl font-bold">
                <IdCard className="h-6 w-6 text-primary" aria-hidden="true" />
                My Medical ID
              </p>
              <p className="text-sm text-muted-foreground">Show, download or print your QR code</p>
            </div>
            <ArrowRight className="h-6 w-6 shrink-0 text-muted-foreground transition-transform duration-base group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <section aria-labelledby="readiness-heading" className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="readiness-heading" className="font-sans text-lg font-semibold">Emergency readiness</h2>
            <p className="text-sm text-muted-foreground tabular-nums">{doneCount} of {items.length} done</p>
          </div>
          <Progress value={(doneCount / items.length) * 100} aria-label={`${doneCount} of ${items.length} readiness steps done`} className="mb-5" />
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.label} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-start gap-3">
                  <StateIcon state={item.state} />
                  <div>
                    <p className="font-medium">
                      {item.label}
                      <span className="sr-only">: {STATE_LABEL[item.state]}</span>
                    </p>
                    <p className={cn('text-sm', item.state === 'done' ? 'text-muted-foreground' : 'text-foreground')}>{item.detail}</p>
                  </div>
                </div>
                {item.state !== 'done' || item.action === 'Manage' || item.action === 'View' ? (
                  <Button asChild size="sm" variant={item.state === 'done' ? 'ghost' : 'outline'}>
                    <Link to={item.to}>
                      {item.action}<span className="sr-only"> {item.label.toLowerCase()}</span>
                    </Link>
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="directory-heading" className="rounded-2xl border bg-card p-6">
            <h2 id="directory-heading" className="mb-1 flex items-center gap-2 font-sans text-lg font-semibold">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
              Emergency services
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">Tap a number to call.</p>
            {organizations.isError ? (
              <p className="text-sm text-destructive">The directory couldn't be loaded.</p>
            ) : (organizations.data?.length ?? 0) === 0 ? (
              <EmptyState icon={Building2} title="No organisations listed yet" description="Call 999 or 112 for any emergency." className="py-6" />
            ) : (
              <ul className="divide-y">
                {organizations.data!.map((org) => (
                  <li key={org.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{org.name}</p>
                      {org.type && <p className="text-sm text-muted-foreground">{org.type}</p>}
                    </div>
                    {org.phone && (
                      <Button asChild size="sm" variant="outline" className="shrink-0">
                        <a href={telHref(org.phone)} aria-label={`Call ${org.name}, ${org.phone}`}>
                          <Phone className="mr-1.5 h-4 w-4" aria-hidden="true" />
                          <span className="tabular-nums">{org.phone}</span>
                        </a>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="more-heading" className="grid gap-4 content-start">
            <h2 id="more-heading" className="sr-only">More</h2>
            {[
              { to: '/dashboard/profile', icon: UserRound, title: 'Medical profile', text: 'Allergies, medications, conditions and contacts' },
              { to: '/dashboard/assistant', icon: Bot, title: 'AI first-aid assistant', text: 'Step-by-step guidance in plain language' },
            ].map(({ to, icon: Icon, title, text }) => (
              <Link key={to} to={to} className="group flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-base group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
